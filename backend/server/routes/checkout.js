const express = require("express");
const router = express.Router();
const paypal = require("@paypal/checkout-server-sdk");
const nodemailer = require("nodemailer");
const { authenticateToken } = require("../middlewares/auth");
const { isValidIsraeliId } = require("../middlewares/isValidIsraeliId");


const db = require('../config/database');

const mysql = require('mysql2/promise');


router.post("/checkout", authenticateToken, async (req, res) => {
  const { cartItems, paymentMethod } = req.body;

const customerId = req.user.userId;

// קריאה לפונקציה ליצירת חשבונית ושליחתה למייל
generateInvoice(cartItems, req.user.email).catch(console.error);


//קריאה לפונקציה הכנסה לטבלאות חשבונות ישנים
  saveInvoiceToDatabase(customerId, cartItems)
///קריאה לפונקציה מחיקה מטבלת עגלת קניות
deletingCartAfterPurchase(customerId);



//קריאה לפונקציה  מחיקה מהמלאי אולי בתוך הקודם

res.json({ success: true, message: "הזמנה בוצעה בהצלחה!" });

});


//פונקציה הכנסה לטבלאות חשבונות ישנים
const deletingCartAfterPurchase = async (userId)=>{

  // const userId = req.user.userId; 

  try {
    await db.promise().query('DELETE FROM cartitems WHERE customer_id = ?', [userId]);
    // res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (err) {
    console.error('Error clearing cart:', err);
    // res.status(500).json({ message: 'Failed to clear cart' });
  }
};


// פונקציה להוספת חשבונית והפריטים שלה
const saveInvoiceToDatabase = async (customerId, products) => {
  const totalAmount = fanctotalAmount(products);
  try {
    // 1. הוספת רשומה לטבלת Invoices
    const [invoiceResult] = await db.promise().query(
      `INSERT INTO invoices (customer_id, total_amount, payment_status) VALUES (?, ?, 'Pending')`,
      [customerId, totalAmount]
    );
  // console.log(invoiceResult);

    const invoiceId = invoiceResult.insertId; // קבלת ה-invoice_id שנוצר
    // console.log(invoiceId);

    // 2. הוספת פריטים לטבלת InvoiceItems
    const  invoiceItemsQueries  =  products.map((product) =>
       db.promise().query(
        `INSERT INTO invoiceItems (invoice_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)`,
        [invoiceId, product.product_id, product.quantity, product.price]
      )
    );

    await Promise.all(invoiceItemsQueries);

    // השלמת הטרנזקציה
    // await connection.commit();

    // console.log(`Invoice #${invoiceId} and its items saved successfully.`);
    return invoiceId;
  } catch (error) {
    // ביטול הטרנזקציה במקרה של שגיאה
    // await connection.rollback();
    // console.error("Error saving invoice:", error.message);
    // throw error;
  } finally {
    // await connection.end();
  }
};


//פונקציה לסדר להפוך את המילים לא ממש הצליח
const fixRTL = (text) => {
  return text.split(" ").reverse().join(" ");
};


const generateInvoice = async (products, customerEmail) => {
  const fs = require("fs");
  const pdf = require("pdfkit");
  const moment = require("moment");

  // גופן עברי
  // const hebrewFontPath = "../fonts/OpenSansHebrew-Regular.ttf"; 
  const hebrewFontPath = "./fonts/Rubik-Italic-VariableFont_wght.ttf";

  // יצירת מספר סידורי לחשבונית
  const invoiceNumber = Date.now();

  // חישוב סיכום כולל
  const totalAmount = products.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );

  // יצירת תאריך ושעה נוכחיים
  const invoiceDate = moment().format("YYYY-MM-DD HH:mm:ss");

  // יצירת חשבונית PDF
  const doc = new pdf();
  const invoicePath = `חשבונית_${invoiceNumber}.pdf`;
  const writeStream = fs.createWriteStream(invoicePath);
  doc.pipe(writeStream);

  // שימוש בגופן עברי
  doc.registerFont("hebrew", hebrewFontPath);

  // כותרת החשבונית
  doc.font("hebrew").fontSize(20).text("חשבונית מס", { align: "center" });
  doc.moveDown();

  // פרטי החשבונית
  doc
    .font("hebrew")
    .fontSize(12)
    .text(`מספר חשבונית: ${invoiceNumber}`, { align: "right" });
  doc.text(`תאריך: ${invoiceDate}`, { align: "right" });
  doc.moveDown();

  // טבלת מוצרים
  doc.fontSize(14).text("מוצרים", { align: "center", underline: true });
  doc.moveDown();


  
  products.forEach((product, index) => {
    const line = `${index + 1}. ${product.product_name} - ${product.price} ש"ח x ${product.quantity} = ${product.price * product.quantity} ש"ח`;
    const fixedLine = fixRTL(line); // הפיכת סדר המילים בלבד
    doc.text(fixedLine, { align: "right" });
  });

  const totalLine = `סך הכל לתשלום: ${totalAmount} ש"ח`;
  const fixedTotalLine = fixRTL(totalLine);
  doc.font("hebrew").fontSize(16).text(fixedTotalLine, { align: "right" });
  


  doc.end();

  // המתנה לסיום כתיבת ה-PDF
  await new Promise((resolve) => writeStream.on("finish", resolve));

  // שליחת החשבונית במייל
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `חשבונית מס #${invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; text-align: right; direction: rtl;">
        <h1>חשבונית מס</h1>
        <p>שלום,</p>
        <p>מצורפת חשבונית מס עבור הרכישה שלך.</p>
        <p><strong>מספר חשבונית:</strong> ${invoiceNumber}</p>
        <p><strong>תאריך:</strong> ${invoiceDate}</p>
        <p>סך הכל לתשלום: <strong>${totalAmount} ש"ח</strong></p>
        <p>תודה על הקנייה! נשמח לראותך שוב באתרנו.</p>
        <a href="http://localhost:3000" style="display: inline-block; margin-top: 10px; padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">לחץ כאן לקנייה נוספת</a>
      </div>
    `,
    attachments: [
      {
        filename: `חשבונית_${invoiceNumber}.pdf`,
        path: invoicePath,
      },
    ],
  };

  await transporter.sendMail(mailOptions);


  // console.log(`חשבונית נשלחה ל-${customerEmail}`);

  // מחיקת קובץ החשבונית לאחר שליחה
  fs.unlinkSync(invoicePath);

};






// // דוגמה לקריאה לפונקציה
// const customerId = 1; // מזהה לקוח
// const products = [
//   { product_id: 101, quantity: 2, price: 50 },
//   { product_id: 102, quantity: 1, price: 30 },
// ];
// const totalAmount = products.reduce((sum, product) => sum + product.quantity * product.price, 0);

// saveInvoiceToDatabase(customerId, products, totalAmount)
//   .then((invoiceId) => console.log(`Invoice ID: ${invoiceId} created successfully.`))
//   .catch((err) => console.error("Error:", err));


  // פונקצייה לחישוב סיכום כולל

const fanctotalAmount = (products)=>{
  const totalAmount = products.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );
  return totalAmount;

}





router.post('/validatePayment', (req, res) => {
  const { creditCardNumber, expiryDate, cardOwnerId } = req.body;
    if (!isValidIsraeliId(cardOwnerId)) {
      return res.status(400).json({ success: false, message: "תעודת הזהות אינה תקינה" });
  }


  // בדיקת תקינות מספר כרטיס אשראי
  const isValidCreditCard = /^[0-9]{16}$/.test(creditCardNumber);
  // בדיקת תקינות מספר זהות ישראלי
  const isValidId = /^[0-9]{9}$/.test(cardOwnerId); 
  // בדיקת תוקף שלא עבר
  const [month, year] = expiryDate.split('/').map(Number);
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  const isValidExpiry = year > currentYear || (year === currentYear && month >= currentMonth);

  if (!isValidCreditCard || !isValidId || !isValidExpiry|| month>12) {
      return res.status(400).json({ success: false, message: "פרטי התשלום אינם תקינים" });
  }

  res.status(200).json({ success: true, message: "פרטי התשלום תקינים" });
});



module.exports = router;
