const express = require("express");
const router = express.Router();

const db = require('../config/database');


const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const path = require('path');
const { log } = require("console");
require('dotenv').config({ path: path.join(__dirname, '../process.env') });

const SECRET_KEY = process.env.SECRET_KEY;
console.log(SECRET_KEY);

// const adminTokens = new Set(); // לשמירת הטוקנים של מנהלים מחוברים



// const pool = require('./db'); // חיבור למסד הנתונים






// כניסת מנהל ויצירת טוקן
router.post("/login", (req, res) => {
  // const { username, password } = req.body;

  // בדיקת זהות המנהל (החלף את הלוגיקה הזאת בבדיקת מסד נתונים)
  // if (username === "admin" && password === "admin123") {
    const token = jwt.sign({ role: "admin" }, SECRET_KEY, { expiresIn: "1h" });
    // adminTokens.add(token); // שמירת הטוקן בזיכרון
    return res.json({ token });
  // }

  // return res.status(401).json({ error: "Invalid credentials" });
});



const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
      return res.status(403).json({ error: "Token is missing" });
  }

  try {
      const decoded = jwt.verify(token, SECRET_KEY);
      if (decoded.role !== "admin") {
          return res.status(403).json({ error: "Access denied" });
      }
      next();
  } catch (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
  }
};



// מחיקת טוקן של מנהל
router.post("/logout", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    // adminTokens.delete(token);
  }
  res.json({ message: "Logged out successfully" });
});



// קבלת רשימת לקוחות
router.get('/customers', authenticateAdmin , async (req, res) => {
  try {    
    const [rows] = await db.promise().query('SELECT * FROM customers');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers', error });
  }
});

// הוספת לקוח חדש
router.post('/customers', authenticateAdmin , async (req, res) => {
  const { first_name, last_name, identity_number, address, phone, email, shipping_address } = req.body;
  try {
    await db.promise().query(
      `INSERT INTO customers (first_name, last_name, identity_number, address, phone, email, shipping_address) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, identity_number, address, phone, email, shipping_address]
    );
    res.status(201).json({ message: 'Customer added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding customer', error });
  }
});

// עדכון פרטי לקוח
router.put('/customers/:id', authenticateAdmin, async (req, res) => {
  const customerId = req.params.id;
  const { first_name, last_name, identity_number, address, phone, email, shipping_address } = req.body;
  try {
    await db.promise().query(
      `UPDATE Customers 
      SET first_name = ?, last_name = ?, identity_number = ?, address = ?, phone = ?, email = ?, shipping_address = ? 
      WHERE customer_id = ?`,
      [first_name, last_name, identity_number, address, phone, email, shipping_address, customerId]
    );
    res.json({ message: 'Customer updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating customer', error });
  }
});

// מחיקת לקוח
router.delete('/customers/:id', authenticateAdmin, async (req, res) => {
  const customerId = req.params.id;
  try {
    await db.promise().query('DELETE FROM Customers WHERE customer_id = ?', [customerId]);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting customer', error });
  }
});






module.exports = router;
