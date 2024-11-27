const mysql = require("mysql2");
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../process.env') });

// יצירת חיבור למסד הנתונים
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});



// יצירת Pool
// const db = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "your_password",
//   database: "your_database",
//   waitForConnections: true,
//   connectionLimit: 10, // מספר החיבורים המקסימלי ב-Pool
//   queueLimit: 0, // מספר החיבורים שניתן להמתין להם בתור (0 = ללא מגבלה)
// });


db.connect((err) => {
  if (err) throw err;
  console.log("Connected to database");
});

module.exports = db;
