const { google } = require("googleapis");
const path = require("path");

const SHEET_ID = process.env.SPREADSHEET_ID;  
const SHEET_NAME = "Sheet1";  

async function getUserSheetId(email) {  
    try {
        const auth = new google.auth.GoogleAuth({ 
            keyFile: path.resolve(__dirname, "./controllers/warm-tangent-455218-a4-f4a8f14e04e5.json"),  
            scopes: [
                "https://www.googleapis.com/auth/spreadsheets.readonly",
                "https://www.googleapis.com/auth/drive.metadata.readonly"
            ] 
        });

        const sheets = google.sheets({ version: "v4", auth });

        const response = await sheets.spreadsheets.values.get({ 
            spreadsheetId: SHEET_ID,
            range: `${SHEET_NAME}!A:G`,  
        });

        const rows = response.data.values;

        if (!rows || rows.length < 2) {  
            return null;
        }

        const foundUser = rows.find((row) => row[1]?.trim() === email.trim());  

        if (foundUser) {
            const userSheetId = foundUser[6];  
            return userSheetId;  
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

module.exports = { getUserSheetId };
