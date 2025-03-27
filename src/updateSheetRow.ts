import { google } from 'googleapis';
import { Row } from './Row';
import { googleAuthReadWrite } from './google-auth';


const sheets = google.sheets({ version: 'v4', auth: googleAuthReadWrite });
export async function updateSheetRow(
  spreadsheetId: string,
  rows: Row[]) {

  const sheetNames = new Set(rows.map(row => row.sheet));
  const fieldsPerSheet: Record<string, string[]> = {};
  for (const sheetName of sheetNames) {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: `${sheetName}!1:1`,
    });
    const fields = response.data.values?.[0];
    if (!fields) {
      console.log('No fields found in the first row.');
      return;
    }
    fieldsPerSheet[sheetName] = fields;
  }

  return await Promise.all(rows.map(async (row) => {
    const fields = fieldsPerSheet[row.sheet];
    const valueArray: any[] = [];
    for (const field of fields) {
      valueArray.push(row[field] ?? '');
    }
    try {
      const response = await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: `${row.sheet}!A${row.row}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [valueArray],
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error:', error);
    }
  }));
}
