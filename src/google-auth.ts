import { google, Auth } from 'googleapis';
import { config } from 'dotenv';

config();

let googleAuth: Auth.GoogleAuth | undefined;
let googleAuthReadWrite: Auth.GoogleAuth | undefined;
export function getGoogleAuth(readonly: boolean, credentials?: string) {
  if (!readonly) {
    return (googleAuthReadWrite ?? (googleAuthReadWrite = new google.auth.GoogleAuth({
      ...getCredentialsConfig(credentials),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })));
  } else {
    return (googleAuth ?? (googleAuth = new google.auth.GoogleAuth({
      ...getCredentialsConfig(credentials),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    })));
  }
}

function getCredentialsConfig(cred?: string) {
  if (cred) {
    return {
      credentials: JSON.parse(cred),
    };
  }
  const keyFile = process.env.SHEETS_SERVICE_KEY_FILE;
  const credentials = process.env.SHEETS_SERVICE_KEY_JSON;

  if (!keyFile && !credentials) {
    console.log("You need to set the SHEETS_SERVICE_KEY_FILE environment variable to the location of the sheets-services.json file.");
    throw new Error('Service account key file not found.');
  }

  return credentials ? {
    credentials: JSON.parse(credentials),
  } : {
    keyFile
  };
}
