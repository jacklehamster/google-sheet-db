import { google } from 'googleapis';
import { Row } from './Row';
import { Options } from './Options';
import { getGoogleAuth } from './google-auth';

export async function listSheetsAndFetchData<T extends Row>(
  spreadsheetId: string,
  options: Options = {},
): Promise<void | Record<string, Row[]>> {
  try {
    const sheets = google.sheets({ version: 'v4', auth: getGoogleAuth(true, options?.credentials) });
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });

    if (!spreadsheet.data.sheets?.length) {
      console.log('No sheets found in the spreadsheet.');
      return;
    }

    const sheetsData: Record<string, T[]> = {};
    for (const sheet of spreadsheet.data.sheets) {
      const sheetTitle = sheet.properties?.title;
      if (options.sheet && sheetTitle !== options.sheet) {
        continue;
      }
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

        let hasData = false;
        row.values?.forEach((cell, index) => {
          const fieldName = fields[index];
          if (cell.userEnteredFormat?.numberFormat?.type === "DATE" || cell.userEnteredValue?.formulaValue) {
            obj[fieldName] = cell.formattedValue;
          } else {
            obj[fieldName] = cell.effectiveValue?.stringValue || cell.effectiveValue?.numberValue || cell.effectiveValue?.boolValue || cell.effectiveValue?.formulaValue;
          }
          if (obj[fieldName] !== undefined) {
            hasData = true;
          }
        });
        if (options.condition && !options.condition(obj)) {
          return null;
        }
        if (!hasData) {
          return null;
        }
        return obj;
      }).filter(Boolean) as T[];

      sheetsData[sheetTitle] = data;
    }
    return sheetsData;
  } catch (error) {
    console.error('Error:', error);
  }
}
