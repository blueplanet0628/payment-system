const { google } = require("googleapis");
const path = require("path");
const {revokeSheetAccess} = require('./removeSheet')
const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(__dirname, "./controllers/warm-tangent-455218-a4-f4a8f14e04e5.json"), // Ensure correct path
    scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
    ]
});

/**
 * Grants access to a Google Sheet for a given email.
 * @param {string} email - The email to grant access to.
 * @param {string} sheetId - The Google Sheet ID.
 * @param {string} role - "reader" (view only) or "writer" (edit).
 */
async function grantSheetAccess(email, sheetId, role) {  // Make sure to include the 'role' as a parameter.
    try {
        const authClient = await auth.getClient();
        const drive = google.drive({ version: "v3", auth: authClient });

        await drive.permissions.create({
            fileId: sheetId,
            requestBody: {
                role,  
                type: "user",
                emailAddress: email,
            },
            fields: "id",
        });

        console.log(`✅ Access granted to ${email} for Sheet ID: ${sheetId} as ${role}`); // Now logging the role.
        
        setTimeout(async () => {
            await revokeSheetAccess(email, sheetId);
        }, 60000*60*24*30);

        return sheetId;
    } catch (error) {
        console.error(`🚨 Error granting access to ${email}:`, error.message);
    }
}


module.exports = { grantSheetAccess };
