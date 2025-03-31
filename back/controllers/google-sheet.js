import { google } from 'googleapis';  
import path from 'path';   
import fs from 'fs';

const credentialsPath = path.resolve('./controllers/warm-tangent-455218-a4-f4a8f14e04e5.json');
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
const auth = new google.auth.GoogleAuth({
  credentials,  
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],  
});

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;  
const SHEET_NAME = "Sheet1";  

export default async function handler(req, res) {
  try {
    const sheets = google.sheets({ version: "v4", auth });

    const RANGE = `${SHEET_NAME}!A:Z`;  
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const data = response.data;
    if (!data.values || data.values.length === 0) {
      return res.status(400).json({ message: "データが見つかりません" });
    }

    const headers = data.values[0];  
    const rows = data.values.slice(1);  
    const users = rows.map((row, index) => {
      const user = {};
      headers.forEach((header, i) => {
        user[header] = row[i] || "N/A";  
      });
      return user;
    });

    res.status(200).send(users);

  } catch (error) {
    res.status(500).json({ message: "内部サーバーエラー" });
  }
}
