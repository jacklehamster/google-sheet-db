# google-sheet-db

[![npm version](https://badge.fury.io/js/@dobuki%20google-sheet-db.svg)](https://www.npmjs.com/package/@dobuki/google-sheet-db)

For now, this is just some wrapper around Google Sheet for fetching and writing back data.

This is for use on Node.js server.

![icon](icon.png)

## Setup

### Install the Package

Install the package via npm:

```bash
npm install @dobuki/google-sheet-db
```

### Configure Environment Variables

Make sure to specify the SHEETS_SERVICE_KEY_FILE environment variable in your shell profile (e.g., .bashrc, .zshrc, or equivalent) to point to your service account credentials file.

```bash
export SHEETS_SERVICE_KEY_FILE="/path/to/sheets-service.json"
```

Replace /path/to/sheets-service.json with the actual path where you store your credentials file.
After editing your profile, run source ~/.bashrc (or equivalent) to apply the changes, or restart your terminal.
Alternatively, for local development, you can create a .env file in your project root:

```text
SHEETS_SERVICE_KEY_FILE=/path/to/sheets-service.json
SPREADSHEET_ID=your-spreadsheet-id
```

Then, ensure your code loads it with dotenv (if not already included in the package):

```bash
npm install dotenv
```

```javascript
require('dotenv').config();
```

### Get sheets-service.json from Google Cloud API

Create a Google Cloud Project:

- Go to console.cloud.google.com.
- Click the project dropdown and select "New Project."
- Name it (e.g., "GoogleSheetDB") and click "Create."
- Enable the Google Sheets API:
- Navigate to "APIs & Services" > "Library."
- Search for "Google Sheets API" and click "Enable."
- Create a Service Account:
- Go to "APIs & Services" > "Credentials."
- Click "Create Credentials" > "Service Account."
- Enter a name (e.g., "sheets-service"), skip optional steps, and click "Done."

Generate the JSON Key:

- Under "Service Accounts," click the new service account email.
- Go to the "Keys" tab, click "Add Key" > "Create new key," select "JSON," and click "Create."
- The sheets-service.json file will download automatically.

Secure the File:

- Move it to a secure location (e.g., /secure/path/sheets-service.json).
- Update your environment variable or .env file with this path.
- Add to .gitignore to prevent accidental commits:

```text
sheets-service.json
.env
```

### For Updates, Grant Access to the Sheet

To allow the package to update your Google Sheet (not just read it):

Find the Service Account Email:

- Open sheets-service.json and copy the client_email (e.g., <sheets-service@your-project.iam.gserviceaccount.com>).

Share the Spreadsheet:

- Open your Google Sheet in Google Drive.
Click "Share" (top right).
- Paste the client_email into the "Add people and groups" field.
- Set the permission to "Editor" (required for writing data).
- Click "Send" or "Share" (no notification needed).

Verify Scope:

The package uses the <https://www.googleapis.com/auth/spreadsheets> scope by default, which supports both reading and writing. No additional scope changes are needed unless customized.

## Usage

### Fetch Data

```javascript
const { listSheetsAndFetchData } = require('@dobuki/google-sheet-db');

async function fetchData() {
  const spreadsheetId = process.env.SPREADSHEET_ID || 'your-spreadsheet-id';
  const data = await listSheetsAndFetchData(spreadsheetId);
  console.log(data);
}

fetchData();
```

Returns an object mapping sheet titles to arrays of Row objects with typed values and formula info.

### Update Data

```javascript
const { listSheetsAndFetchData } = require('@dobuki/google-sheet-db');

async function updateData() {
  const spreadsheetId = process.env.SPREADSHEET_ID || 'your-spreadsheet-id';
  const data = await listSheetsAndFetchData(spreadsheetId);
  
  if (data && data['Sheet1']) {
    const row = data['Sheet1'][0];
    row['UpdatedField'] = 'Updated'; // Modify value
    
    const result = await updateSheetRow(spreadsheetId, rows);
    return result;
  }
}

updateData();
```

Github Source
<https://github.com/jacklehamster/google-sheet-db>
