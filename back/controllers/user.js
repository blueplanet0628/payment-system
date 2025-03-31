
const mysql = require("mysql2/promise"); // ✅ Use 'promise' version

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "payment-system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const user = async (req, res) => {
  
  try {
    const [rows] = await db.query("SELECT name, email FROM user"); // ✅ Correct usage
    
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "内部サーバーエラー" });
  }
};

module.exports = { user };