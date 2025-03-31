const { google } = require("googleapis");
const path = require("path");

const addInstagram = async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.resolve(__dirname, "./warm-tangent-455218-a4-f4a8f14e04e5.json"),
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
      ],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    const data = JSON.parse(req.body);
    const sheetId = data.sheet;
    const instagramId = data.id;

    if (!sheetId || !instagramId) {
      return res.status(400).json({ error: "Missing sheetId or instagramId" });
    }

    const range = "A2:A"; // Define the target range

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[instagramId]],
      },
    });

    res.status(200).json({ message: "Instagram ID added successfully" });
  } catch (error) {
    console.error("Error adding Instagram ID:", error);
    res.status(500).json({ error: "Failed to add Instagram ID" });
  }
};

const getInstagram = async (req, res) => {
  try {
    const sheetId = req.params.sheetId;
    if (!sheetId) {
      return res.status(400).json({ error: "Missing sheetId" });
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: path.resolve(__dirname, "./warm-tangent-455218-a4-f4a8f14e04e5.json"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    const range = "A2:A"; // Define the range where Instagram IDs are stored

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No Instagram IDs found" });
    }

    res.status(200).json({ instagramIds: rows.flat() });
  } catch (error) {
    console.error("Error fetching Instagram ID:", error);
    res.status(500).json({ error: "Failed to fetch Instagram ID" });
  }
};

const editInstagram = async (req, res) => {
  try {
    const { sheet, oldId, newId } = JSON.parse(req.body);
    if (!sheet || !oldId || !newId) {
      return res.status(400).json({ error: "Missing sheetId, oldInstagramId, or newInstagramId" });
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: path.resolve(__dirname, "./warm-tangent-455218-a4-f4a8f14e04e5.json"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    // Get all Instagram IDs
    const range = "A2:A"; // Adjust the range based on where your data is stored
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheet,
      range: range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No Instagram IDs found" });
    }

    // Find the index of the Instagram ID to edit
    const index = rows.findIndex((row) => row[0] === oldId);
    if (index === -1) {
      return res.status(404).json({ error: "Instagram ID not found" });
    }

    // Update the Instagram ID at the found index
    const updateRange = `A${index + 2}:A${index + 2}`; // Adjusting for 0-based index and row offset
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheet,
      range: updateRange,
      valueInputOption: "RAW",
      requestBody: {
        values: [[newId]],
      },
    });

    res.status(200).json({ message: "Instagram ID updated successfully" });
  } catch (error) {
    console.error("Error updating Instagram ID:", error);
    res.status(500).json({ error: "Failed to update Instagram ID" });
  }
};

const deleteInstagram = async (req, res) => {
  try {
    const { sheet, id } = JSON.parse(req.body);
    if (!sheet || !id) {
      return res.status(400).json({ error: "Missing sheetId or instagramId" });
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: path.resolve(__dirname, "./warm-tangent-455218-a4-f4a8f14e04e5.json"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    // Get all Instagram IDs
    const range = "A2:A"; // Adjust the range based on where your data is stored
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheet,
      range: range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No Instagram IDs found" });
    }

    // Find the index of the Instagram ID to delete
    const index = rows.findIndex((row) => row[0] === id);
    if (index === -1) {
      return res.status(404).json({ error: "Instagram ID not found" });
    }

    // Define the range to delete the row
    const deleteRange = `A${index + 2}:A${index + 2}`; // Adjusting for 0-based index and row offset

    // Use the "clear" method to remove the row's content (optional - you can use batchUpdate to remove a row)
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheet,
      range: deleteRange,
    });

    res.status(200).json({ message: "Instagram ID deleted successfully" });
  } catch (error) {
    console.error("Error deleting Instagram ID:", error);
    res.status(500).json({ error: "Failed to delete Instagram ID" });
  }
};


module.exports = { addInstagram, getInstagram, editInstagram, deleteInstagram };
