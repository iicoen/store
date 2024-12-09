const express = require("express");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

const db = require('../config/database');

const router = express.Router();



router.post("/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  
  try {
    const resetEntry = await db.promise().query("SELECT * FROM PasswordResets WHERE token = ?", [token]);
    if (resetEntry[0].length === 0) return res.status(400).json({ message: "Invalid or expired token" });
    const email = resetEntry[0][0].email;


       // הצפנת הסיסמה
       const saltRounds = 10; // מספר הסבבים בהצפנה
       const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [rows] = await db.promise().query("SELECT identity_number FROM customers WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "No customer found with this email" });
    }
    const identity_number = rows[0].identity_number;  

    await db.promise().query("UPDATE Users SET password_hash = ? WHERE identity_number = ?", [hashedPassword, identity_number]);


    await db.promise().query("DELETE FROM PasswordResets WHERE token = ?", [token]);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error resetting password" });
  }
});



module.exports = router;
