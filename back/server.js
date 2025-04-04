import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";

// Importing other modules (convert require to import)
import { register, login } from "./controllers/auth.js";
import { user } from "./controllers/user.js";
import sheet from "./controllers/google-sheet.js";
import { extrasheets } from "./controllers/extrasheet.js";
import { clientSecret } from "./controllers/clientsecret.js";
import { createCheckout } from "./createCheckout.js";
import { webhook } from "./webhook.js";
import {
  addInstagram,
  getInstagram,
  editInstagram,
  deleteInstagram,
} from "./controllers/addInstagram.js";

// Fix for __dirname in ES Modules
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.raw({ type: "application/json" }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Webhook
app.post("/webhook", webhook);

// Payment & Sheets API
app.post("/api/create-checkout-session", createCheckout);
app.post("/api/update-sheets", extrasheets);
app.post("/api/create-payment-intent", clientSecret);

// Auth API
app.post("/api/register", register);
app.post("/api/login", login);

// Users & Google Sheets API
app.get("/api/users", user);
app.get("/api/google-sheet", sheet);

// Instagram API
app.post("/api/save-instagram-id", addInstagram);
app.get("/api/instagram-id/:sheetId", getInstagram);
app.post("/api/delete-instagram-id", deleteInstagram);
app.post("/api/edit-instagram-id", editInstagram);

// Static File Routes
app.get("/api/success", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "success.html"));
});

app.get("/api/cancel", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "cancel.html"));
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
