const { google } = require('googleapis');
const path = require('path');
const {revokeSheetAccess} = require('./removeSheet')

async function createUserSheet(name, email) {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.resolve(__dirname, './controllers/warm-tangent-455218-a4-f4a8f14e04e5.json'), // Ensure correct path
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive'
            ]
        });

        const authClient = await auth.getClient(); // Ensure authentication works

        const sheets = google.sheets({ version: 'v4', auth: authClient });
        const drive = google.drive({ version: 'v3', auth: authClient });

        const response = await sheets.spreadsheets.create({
            resource: {
                properties: { title: "Instagram Data Sheet" },
                sheets: [
                    { properties: { title: "アカウント登録" } },
                    { properties: { title: "フィード" } },
                    { properties: { title: "リール" } },
                    { properties: { title: "ストーリー" } }
                ]
            }
        });

        const sheetId = response.data.spreadsheetId;
        console.log(`✅ Sheet created: https://docs.google.com/spreadsheets/d/${sheetId}`);

        // Step 2: Set headers in "アカウント登録" sheet
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: "アカウント登録!A1:D1",
            valueInputOption: "RAW",
            resource: {
                values: [["Instagramユーザー名", "画像リンク", "動画リンク", "備考"]],
            },
        });

        // Step 3: Get the sheet ID of "アカウント登録"
        const sheetMetadata = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
        const accountSheet = sheetMetadata.data.sheets.find(s => s.properties.title === "アカウント登録");
        const accountSheetId = accountSheet.properties.sheetId;

        // Step 4: Apply formatting (bold header, background color)
        const requests = [
            {
                repeatCell: {
                    range: {
                        sheetId: accountSheetId,
                        startRowIndex: 0,
                        endRowIndex: 1,
                        startColumnIndex: 0,
                        endColumnIndex: 4
                    },
                    cell: {
                        userEnteredFormat: {
                            textFormat: { bold: true },
                            backgroundColor: { red: 0.8, green: 0.4, blue: 0.4 },
                        },
                    },
                    fields: "userEnteredFormat(textFormat, backgroundColor)",
                },
            },
        ];

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            resource: { requests },
        });

        // Step 5: Grant Viewer permission to the user
        await drive.permissions.create({
            fileId: sheetId,
            requestBody: {
                role: 'reader',
                type: 'user',
                emailAddress: email
            }
        });

        console.log(`✅ Viewer access granted to: ${email}`);

        setTimeout(async () => {
            await revokeSheetAccess(email, sheetId);
        }, 60000);
        return sheetId;

    } catch (error) {
        console.error('❌ Error creating user sheet:', error.message);
        throw error;
    }
}

module.exports = { createUserSheet };
