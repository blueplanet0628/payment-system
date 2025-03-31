const { google } = require('googleapis');
const path = require('path');

async function revokeSheetAccess(email, sheetId) {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.resolve(__dirname, './controllers/warm-tangent-455218-a4-f4a8f14e04e5.json'),
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive'
            ]
        });
        
        const authClient = await auth.getClient();
        const drive = google.drive({ version: 'v3', auth: authClient });

        const { data } = await drive.permissions.list({ fileId: sheetId, fields: 'permissions(id, emailAddress)' });
        
        if (!data.permissions) {
            return;
        }

        for (const perm of data.permissions) {
            if (perm.emailAddress === email) {
                await drive.permissions.delete({
                    fileId: sheetId,
                    permissionId: perm.id,
                });
                return;
            }
        }

    } catch (error) {
    }
}

module.exports = { revokeSheetAccess };