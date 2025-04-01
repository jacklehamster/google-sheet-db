import express, { Request, Response } from "express";
import { listSheetsAndFetchData, updateSheetRow } from "@dobuki/google-sheet-db";
import path from "path";

const app = express();
const port = 3000;

app.use(express.json());


// Serve static files
// app.use(express.static("/"));
app.use(express.static(path.join(__dirname, ".")));

// Endpoint to fetch sheet data
app.get("/sheet", async (req: Request, res: Response) => {
  try {
    const data = await listSheetsAndFetchData("1VwYU7nTSlwhi2iBSFvYBnuhxPUJdIYwE9qbKuVwDk04");
    if (data) {
      res.json(data);
    } else {
      res.status(404).send("No data found.");
    }
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/update-sheet", async (req: Request, res: Response) => {
  try {
    const rows = req.body;
    if (!Array.isArray(rows)) {
      res.status(400).send("Invalid request body.");
      return;
    }

    const result = await updateSheetRow("1VwYU7nTSlwhi2iBSFvYBnuhxPUJdIYwE9qbKuVwDk04", rows);
    res.json(result);
  } catch (error) {
    console.error("Error updating sheet data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
