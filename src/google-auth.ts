import { google } from 'googleapis';
import { config } from 'dotenv';

config();

const keyFile = process.env.SHEETS_SERVICE_KEY_FILE;
const credentials = process.env.SHEETS_SERVICE_KEY_JSON;

if (!keyFile || !credentials) {
  console.log("You need to set the SHEETS_SERVICE_KEY_FILE environment variable to the location of the sheets-services.json file.");
  throw new Error('Service account key file not found.');
}

// Authenticate using the service account
export const googleAuth = new google.auth.GoogleAuth({
  keyFile: credentials ? undefined : keyFile,
  credentials: credentials ? JSON.parse(credentials) : undefined,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

export const googleAuthReadWrite = new google.auth.GoogleAuth({
  keyFile: credentials ? undefined : keyFile,
  credentials: credentials ? JSON.parse(credentials) : undefined,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
