const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const db = require('../config/database');

const router = express.Router();








router.post("/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const resetEntry = await db.promise().query("SELECT * FROM PasswordResets WHERE token = ?", [token]);
    if (resetEntry.length === 0) return res.status(400).json({ message: "Invalid or expired token" });

    const email = resetEntry[0].email;
    console.log(email);
    
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
    console.log(22222);

    // const identity_number = await db.promise().query("SELECT identity_number FROM customers WHERE email = ?", [email]);


    const [rows] = await db.promise().query("SELECT identity_number FROM customers WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "No customer found with this email" });
    }
    const identity_number = rows[0].identity_number;  



    await db.promise().query("UPDATE Users SET password = ? WHERE email = ?", [hashedPassword, identity_number]);
    console.log(22222);

    await db.promise().query("DELETE FROM PasswordResets WHERE token = ?", [token]);
    console.log(3333333);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error resetting password" });
  }
});






module.exports = router;
