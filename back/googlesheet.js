const { google } = require("googleapis");
const credentials = require("./controllers/warm-tangent-455218-a4-f4a8f14e04e5.json");
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;   
const SHEET_NAME = "Sheet1";  
async function addUserToSheet(email, name, card, date, baseLimit, extraSheets, sheet) {
    
    
    try {
        const authClient = await auth.getClient();
        const sheets = google.sheets({ version: "v4", auth: authClient });  
        const request = {
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A2`,  
            valueInputOption: 'RAW',
            insertDataOption: "INSERT_ROWS", 
            resource: {
              values: [
                [name, email, `Plan ${card}`, date, baseLimit, extraSheets, sheet],  
              ],
            },
        };
        const response = await sheets.spreadsheets.values.append(request);
    } catch (err) {
    }
}
module.exports = { addUserToSheet };