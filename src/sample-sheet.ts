import { listSheetsAndFetchData } from "./fetchSheet";
import { updateSheetRow } from './updateSheetRow';

const SAMPLE_SHEET_ID = '1VwYU7nTSlwhi2iBSFvYBnuhxPUJdIYwE9qbKuVwDk04';



// Run the function
const data = await listSheetsAndFetchData(SAMPLE_SHEET_ID, (row) => {
  return row.sheet === 'Sheet1' && row.Name === "Jack";
});

if (data) {
  console.log("Fetch result:\n", data);
  data["Sheet1"].forEach((row) => {
    row["Test date"] = new Date().toString();
  });

  const response = await updateSheetRow(SAMPLE_SHEET_ID, data["Sheet1"]);
  console.log("Update result:\n", response);
}
