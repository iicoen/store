const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const db = require('../config/database');

const router = express.Router();

router.post("/", async (req, res) => {
  const { email } = req.body;
  
  try {
    const [rows] = await db.promise().query("SELECT * FROM customers WHERE email = ?", [email]);
    const name = `${rows[0].first_name} ${rows[0].last_name}`;
    // console.log(rows);
    // console.log(name);
    
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

    const emailHtml = `
  <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
    <h2 style="color: #333;">איפוס סיסמה</h2>
    <p style="font-size: 16px; color: #555;">
      שלום ${name},
    </p>
    <p style="font-size: 16px; color: #555;">
      לחץ על הקישור הבא כדי לאפס את הסיסמה שלך:
    </p>
    <a href="${resetLink}" style="display: inline-block; background-color: #007BFF; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">
      אפס סיסמה
    </a>
    <p style="font-size: 14px; color: #aaa; margin-top: 20px;">
      אם לא ביקשת לאפס את הסיסמה שלך, התעלם ממייל זה.
    </p>
  </div>
`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      html: emailHtml, // HTML תוכן
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
