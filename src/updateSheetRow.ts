import { google } from 'googleapis';
import { Row } from './Row';
import { Options } from './Options';
import { getGoogleAuth } from './google-auth';

interface RangeUpdate {
  sheet: string;
  colRange: [number, number];
  row: number;
  values: any[];
}

export async function updateSheetRow<T extends Row>(
  spreadsheetId: string,
  rows: T[],
  options: Options = {}) {

  let previousValues;
  {
    const sheets = google.sheets({ version: 'v4', auth: getGoogleAuth(true, options.credentials) });
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      valueRenderOption: 'UNFORMATTED_VALUE',
      ranges: rows.map(row => `${row.sheet}!${row.row}:${row.row}`),
    }).catch(err => console.error('Error fetching ranges:', err));
    previousValues = response?.data?.valueRanges?.map(v => v.values?.[0]);
  }

  const sheets = google.sheets({ version: 'v4', auth: getGoogleAuth(false, options.credentials) });
  const sheetNames = new Set(rows.map(row => row.sheet));
  const fieldsPerSheet: Record<string, string[]> = {};
  for (const sheetName of sheetNames) {
    if (options.sheet && sheetName !== options.sheet) {
      continue;
    }
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

  const updates: RangeUpdate[] = [];
  let pendingUpdate: RangeUpdate | null = null;
  rows.forEach((row, index) => {
    if (options.sheet && row.sheet !== options.sheet) {
      return;
    }
    const fields = fieldsPerSheet[row.sheet] ?? [];
    if (!fields.length) {
      return;
    }
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const value = row[field];
      const fieldChanged = previousValues?.[index]?.[i] !== value;

      if (fieldChanged) {
        if (!pendingUpdate) {
          pendingUpdate = {
            sheet: row.sheet,
            colRange: [i, i],
            row: row.row,
            values: []
          }
          updates.push(pendingUpdate);
        }
        pendingUpdate.colRange[1] = i;
        pendingUpdate.values.push(row[field])
      } else {
        pendingUpdate = null;
      }
    }
  });
  try {
    const data = updates.map(update => ({
      range: `${update.sheet}!${update.colRange.map(r => String.fromCharCode('A'.charCodeAt(0) + r) + update.row).join(":")}`,
      values: [update.values],
    }));
    const response = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
}
