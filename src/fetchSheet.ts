import { google } from 'googleapis';
import { Row } from './Row';
import { googleAuth } from './google-auth';

const sheets = google.sheets({ version: 'v4', auth: googleAuth });

export async function listSheetsAndFetchData(
  spreadsheetId: string,
  condition?: (row: any) => boolean
): Promise<void | Record<string, Row[]>> {
  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
      includeGridData: false,
    });

    if (!spreadsheet.data.sheets) {
      console.log('No sheets found in the spreadsheet.');
      return;
    }

    const sheetList = spreadsheet.data.sheets.map(sheet => ({
      title: sheet.properties?.title,
      sheetId: sheet.properties?.sheetId,
    }));

    const sheetsData: Record<string, Row[]> = {};
    for (const sheet of sheetList) {
      const sheetTitle = sheet.title;
      if (!sheetTitle) {
        console.log('Sheet title not found.');
        continue;
      }

      const sheetData = spreadsheet.data.sheets.find(s => s.properties?.title === sheetTitle);
      const columnCount = sheetData?.properties?.gridProperties?.columnCount ?? 26;
      const lastColumnLetter = String.fromCharCode(64 + Math.min(columnCount, 26));

      const response = await sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId,
        ranges: [`${sheetTitle}!A1:${lastColumnLetter}`],
        includeGridData: true,
      });

      const gridData = response.data.sheets?.[0]?.data?.[0];
      const rows = gridData?.rowData;
      if (!rows || rows.length === 0) {
        console.log(`No data found in ${sheetTitle}.`);
        continue;
      }

      const fields = rows[0]?.values?.map((cell, i) => cell.effectiveValue?.stringValue || `col${i + 1}`) || [];
      const data = rows.slice(1).map((row, r) => {
        const obj: Row = {
          sheet: sheetTitle,
          row: r + 2,
        };

        row.values?.forEach((cell, index) => {
          const fieldName = fields[index];
          if (cell.userEnteredFormat?.numberFormat?.type === "DATE") {
            obj[fieldName] = cell.formattedValue;
          } else {
            obj[fieldName] = cell.userEnteredValue?.stringValue || cell.userEnteredValue?.numberValue || cell.userEnteredValue?.boolValue || cell.userEnteredValue?.formulaValue;
          }
        });

        if (condition && !condition(obj)) {
          return null;
        }
        return obj;
      }).filter(Boolean) as Row[];

      sheetsData[sheetTitle] = data;
    }
    return sheetsData;
  } catch (error) {
    console.error('Error:', error);
  }
}
