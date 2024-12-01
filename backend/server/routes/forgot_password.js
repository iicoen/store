const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const db = require('../config/database');

const router = express.Router();

router.post("/", async (req, res) => {
  const { email } = req.body;
  try {
    const [rows] = await db.promise().query("SELECT * FROM customers WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    const token = crypto.randomBytes(32).toString("hex");
    const resetLink = `http://localhost:3000/reset-password/${token}`;
    await db.promise().query("INSERT INTO PasswordResets (email, token) VALUES (?, ?)", [email, token]);
  

    const transporter = nodemailer.createTransport({
      service: "gmail", // או השירות שאתה משתמש בו
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      text: `לחץ על הקישור הבא כדי לאפס את הסיסמה שלך:
       ${resetLink}`,
    });

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending email" });
  }
});







router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const resetEntry = await db.promise().query("SELECT * FROM PasswordResets WHERE token = ?", [token]);
    if (resetEntry.length === 0) return res.status(400).json({ message: "Invalid or expired token" });

    const email = resetEntry[0].email;
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
    const identity_number = await db.promise().query("SELECT identity_number FROM customers WHERE email = ?", [email]);

    await db.promise().query("UPDATE Users SET password = ? WHERE email = ?", [hashedPassword, identity_number]);
    await db.promise().query("DELETE FROM PasswordResets WHERE token = ?", [token]);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error resetting password" });
  }
});






module.exports = router;
