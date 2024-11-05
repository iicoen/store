const express = require("express");
const mysql = require("mysql2");
const app = express();
const port = 3001;
const cors = require("cors");
// לצורך פונקצית אימות
const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key";
// const bcrypt = require("bcryptjs");
const bcrypt = require("bcrypt");

// מאשר לכל הדומיינים
app.use(cors());
app.use(express.json());

// חיבור למסד הנתונים
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "store",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to database");
});

// פונקציית אימות
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = user; // מזהה את המשתמש על בסיס ה-JWT
    next();
  });
}

// דוגמה לשימוש במסלול שמוגן
app.get("/user-orders", authenticateToken, (req, res) => {
  const userId = req.user.id; // מזהה המשתמש מה-JWT // ביצוע שאילתה על בסיס userId וכו'
});

// app.post("/verify-token", (req, res) => {
//   const token = req.headers["authorization"]?.split(" ")[1];
//   // const token = req.headers["authorization"];
//   if (!token) return res.status(401).json({ valid: false });
//   jwt.verify(token, SECRET_KEY, (err, user) => {
//     if (err) return res.status(403).json({ valid: false });
//     let fullName="";
//     const fullNameQuery = `SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM customers WHERE identity_number = ?;`;
// console.log(`1 ${fullName}`);
//   db.query(fullNameQuery, [user.identity], async (err, results) => {
//      fullName=results[0];
//      console.log(`2 ${fullName}`);
//     // אולי ככה
//     //  fullName=results[0];
//   });
//   console.log(`3 ${fullName}`);

//     res.status(200).json({ valid: true, userId: fullName });
//     // res.status(200).json({ valid: true, userId: user.userId });
//   });
// });

app.post("/verify-token", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    console.log(222);
    return res.status(401).json({ valid: false });
  }

  jwt.verify(token, SECRET_KEY, async (err, user) => {
    if (err) return res.status(403).json({ valid: false });

    try {
      const fullNameQuery = `SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM customers WHERE identity_number = ?;`;
      const [results] = await db.promise().query(fullNameQuery, [user.identity]); // מחכים לתוצאה של השאילתא

      const fullName = results.length > 0 ? results[0].full_name : null; // מחלצים את השם המלא // מדפיסים את השם המלא // console.log(`Full Name: ${fullName}`);
      res.status(200).json({ valid: true, userId: fullName }); // מחזירים את השם המלא
    } catch (queryError) {
      console.error("Query Error:", queryError);
      res.status(500).json({ valid: false, error: "Database query failed" });
    }
  });
});

app.post("/login", async (req, res) => {
  const { identity_number, password } = req.body;

  try {
    // בדיקת המשתמש במסד הנתונים
    const userQuery = "SELECT * FROM users WHERE identity_number = ?";
    db.query(userQuery, [identity_number], async (err, results) => {
      if (err) return res.status(500).json({ error: "שגיאת מסד נתונים" });
      if (results.length === 0) {
        return res.status(400).json({ message: "תעודת זהות או סיסמה שגויים" });
      }

      const user = results[0]; // בדיקת התאמה של הסיסמה המוצפנת
      const isPasswordMatch = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isPasswordMatch) {
        return res.status(400).json({ message: "תעודת זהות או סיסמה שגויים" });
      }
      console.log(user.user_id); // יצירת טוקן
      const token = jwt.sign(
        { userId: user.user_id, identity: user.identity_number },
        SECRET_KEY,
        { expiresIn: "1h" }
      ); // החזרת הטוקן ללקוח

      res.status(200).json({ message: "התחברות הצליחה", token });
    });
  } catch (error) {
    res.status(500).json({ error: "שגיאת שרת" });
  }
});



app.post("/register", async (req, res) => {
  const {
    first_name,
    last_name,
    identity_number,
    address,
    phone,
    email,
    shipping_address,
    password,
  } = req.body;

  try {
    // בדיקה אם המשתמש כבר קיים על פי מספר זהות
    const checkUserQuery = "SELECT * FROM customers WHERE identity_number = ?";
    db.query(checkUserQuery, [identity_number], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length > 0) {
        // המשתמש כבר קיים
        return res.status(400).json({ message: "User already exists" });
      } // הצפנת הסיסמה

      const saltRounds = 10; // מספר הסבבים בהצפנה
      const passwordHash = await bcrypt.hash(password, saltRounds); // הוספת המשתמש לטבלת הלקוחות

      const insertCustomerQuery = `INSERT INTO customers (first_name, last_name, identity_number, address, phone, email, shipping_address) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.query(
        insertCustomerQuery,
        [
          first_name,
          last_name,
          identity_number,
          address,
          phone,
          email,
          shipping_address,
        ],
        (err, customerResult) => {
          if (err) {
            return res.status(500).json({ error: "Database error" });
          } // הוספת המשתמש לטבלת המשתמשים עם הסיסמה המוצפנת

          const insertUserQuery = `INSERT INTO users (identity_number, password_hash) VALUES (?, ?)`;
          db.query(insertUserQuery, [identity_number, passwordHash], (err) => {
            if (err) {
              return res.status(500).json({ error: "Database error" });
            }

            res.status(201).json({ message: "User registered successfully" });
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// הפעלת השרת
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
