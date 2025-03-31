const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const credentialsPath = path.resolve('./controllers/warm-tangent-455218-a4-f4a8f14e04e5.json');

const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,  
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],  
});

const SPREADSHEET_ID = "1bOLcrutzpPV24oy7yFVMoA1G7QMnHjrK-fbNYRULscE";  
const SHEET_NAME = "Sheet1"; 

 async function extrasheets(req, res) {
  try {
    const sheets = google.sheets({ version: "v4", auth });

    const RANGE = `${SHEET_NAME}!A:Z`;  

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    if (!response.data.values || response.data.values.length === 0) {
      console.log("No data found");
      return res.status(404).json({ error  });
    }

    const headers = response.data.values[0];  
    const rows = response.data.values.slice(1);  

    const { email, extraSheets } = JSON.parse(req.body);  
    console.log(`Updating extraSheets for: ${email}, Adding: ${extraSheets}`);

    const emailColumnIndex = headers.indexOf("email"); 
    const extraSheetsColumnIndex = headers.indexOf("extraSheets");  

    if (emailColumnIndex === -1 || extraSheetsColumnIndex === -1) {
      throw new Error("スプレッドシートの形式が無効です: 必要な列がありません");
    }

    let userRowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][emailColumnIndex] === email) {
        userRowIndex = i + 2;  
        break;
      }
    }

    if (userRowIndex === -1) {
      return res.status(404).json({ error  });
    }

    let currentExtraSheets = rows[userRowIndex - 2][extraSheetsColumnIndex] || "0";
    let updatedExtraSheets = parseInt(currentExtraSheets) + extraSheets;

    console.log(`Current extraSheets: ${currentExtraSheets}, Updated: ${updatedExtraSheets}`);

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!${String.fromCharCode(65 + extraSheetsColumnIndex)}${userRowIndex}`, 
      valueInputOption: "RAW",
      requestBody: {
        values: [[updatedExtraSheets.toString()]], 
      },
    });

    res.status(200).json({ message: "使用状況が更新され、シートが正常に更新されました" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { extrasheets };
