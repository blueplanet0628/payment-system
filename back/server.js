require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
// const { handleWebhook } = require("./webhook");
const app = express();
app.use(express.raw({ type: "application/json" }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
// app.use(cors());
app.use(
    cors()
);
app.use(bodyParser.json());
const { register, login } = require("./controllers/auth");
const { user } = require("./controllers/user");
const { default: sheet } = require("./controllers/google-sheet");
const { extrasheets } = require("./controllers/extrasheet");
const { clientSecret } = require("./controllers/clientsecret");
const {createCheckout} =  require('./createCheckout')
const { webhook } = require('./webhook')
const fs = require('fs');
const {addInstagram, getInstagram, editInstagram, deleteInstagram} = require('./controllers/addInstagram')
app.post('/webhook', webhook)

app.use(express.json());

app.post('/api/create-checkout-session', createCheckout)


app.post('/api/update-sheets', extrasheets)
app.post('/api/create-payment-intent', clientSecret)
app.post('/api/register', register)
app.post('/api/login', login)

app.get('/api/users', user)
app.get('/google-sheet', sheet)

app.post('/api/save-instagram-id', addInstagram)
app.get('/api/instagram-id/:sheetId', getInstagram)
app.post('/api/delete-instagram-id', deleteInstagram)
app.post('/api/edit-instagram-id', editInstagram)

app.get("/api/success", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "success.html"));
});

app.get("/api/cancel", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "cancel.html"));
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
