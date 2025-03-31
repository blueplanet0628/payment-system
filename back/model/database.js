
const mysql = require("mysql2"); // ✅ Use 'promise' version

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "payment-system",

});


module.exports = db;