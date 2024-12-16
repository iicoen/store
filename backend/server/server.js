const express = require("express");
const mysql = require("mysql2");
const app = express();
const port = 3001;
const cors = require("cors");

// לצורך פונקצית אימות
const bodyParser = require("body-parser");

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'process.env') });
// require('dotenv').config();

const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;
// const bcrypt = require("bcryptjs");
const bcrypt = require("bcrypt");
const { log } = require("console");

// require('dotenv').config();

// לצורך תשלומים
const router = express.Router();
const paypal = require("@paypal/checkout-server-sdk");
const nodemailer = require("nodemailer");


// מאשר לכל הדומיינים
app.use(cors());
app.use(express.json());


app.use(bodyParser.json()); // תמיכה ב-JSON בבקשות

const checkoutRouter = require("./routes/checkout"); 
const managementRouter = require("./routes/management");
const forgot_password = require("./routes/forgot_password"); 

app.use("/api", checkoutRouter); 
app.use("/api/admin", managementRouter); 
app.use("/api/forgot-password", forgot_password); 
app.use("/api/reset-password", require("./routes/resetPassword"));


// חיבור למסד הנתונים

const db = require('./config/database');

const { authenticateToken } = require("./middlewares/auth");


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

        // המשתמש כבר קיים
      if (results.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

       // הצפנת הסיסמה
      const saltRounds = 10; // מספר הסבבים בהצפנה
      const passwordHash = await bcrypt.hash(password, saltRounds);

       // הוספת המשתמש לטבלת הלקוחות
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
          }

           // הוספת המשתמש לטבלת המשתמשים עם הסיסמה המוצפנת
          const insertUserQuery = `INSERT INTO users (customer_id, identity_number, password_hash) VALUES (?, ?, ?)`;
          db.query(insertUserQuery, [customerResult.insertId, identity_number, passwordHash], (err) => {
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

     
           // שאילתת שאיבה של userId מטבלת customers לפי מספר הזהות
           const customerQuery = "SELECT * FROM customers WHERE identity_number = ?";
           db.query(customerQuery, [identity_number], (err, customerResults) => {
             if (err) return res.status(500).json({ error: "שגיאת מסד נתונים" });
             if (customerResults.length === 0) {
               return res.status(400).json({ message: "הלקוח לא נמצא" });
             }
             const customerData = {
              userId: customerResults[0].customer_id,
              identity: customerResults[0].identity_number,
              email: customerResults[0].email,
              full_name: `${customerResults[0].first_name} ${customerResults[0].last_name}`
            };
            
    // יצירת טוקן
      const token = jwt.sign(customerData, SECRET_KEY,{expiresIn:"1h"});

      res.status(200).json({ message: "התחברות הצליחה", token });
    });
  });
  } catch (error) {
    res.status(500).json({ error: "שגיאת שרת" });
  }
});



app.post("/verify-token", authenticateToken, async (req, res) => {

    try {
      // שים לב שהתהליך הזה מיותר אחרי ששידרגתי את הטוקן אפשר לשלוף את זה בצד שרת מהטוקן
      const fullNameQuery = `SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM customers WHERE identity_number = ?;`;
      const [results] = await db.promise().query(fullNameQuery, [req.user.identity]); // מחכים לתוצאה של השאילתא
      const fullName = results.length > 0 ? results[0].full_name : null; // מחלצים את השם המלא // מדפיסים את השם המלא // 
      res.status(200).json({ valid: true, userName: fullName }); // מחזירים את השם המלא
    } catch (queryError) {
      console.error("Query Error:", queryError);
      res.status(500).json({ valid: false, error: "Database query failed" });
    }
});

app.post("/updateCart", authenticateToken, async(req, res) => {
    try {
      const userId = req.user.userId;
      const { product_id, quantity } = req.body; 
       // זה יעבוד טוב גם בלי התוספת הזאת כי הדאטה בייס מוגדר עם מפחות נכונים שלא יכול להוסיף לעגלה מוצר שלא קיים במוצרים
      // if(!(await  db.query(`SELECT EXISTS(SELECT 1 FROM Products WHERE product_id = product_id)`))[0].exists)
        if (!(await db.promise().query('SELECT EXISTS(SELECT 1 FROM Products WHERE product_id = ?) AS `exists`', [product_id]))[0][0].exists)
        {          
          return res.status(500).json({ valid: false, error: "The product is no longer in stock.", code: "OUT_OF_STOCK" })}
    
      const upsertCartItemQuery = `INSERT INTO CartItems (customer_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), updated_at = CURRENT_TIMESTAMP`;

      db.query(upsertCartItemQuery, [userId, product_id, quantity], (error, results) => {
        if (error) {
          console.error("Query Error:", error);
          return res.status(500).json({ valid: false, error: "Database error" });
        }
        res.status(200).json({ valid: true });
      });
    } catch (queryError) {
      console.error("Query Error:", queryError);
      res.status(500).json({ valid: false, error: "Internal server error" });
    }
  });


// מסלול להחזרת פרטי העגלה עבור המשתמש
app.get("/api/cart", authenticateToken, (req, res) => {
    try {
      const userId = req.user.userId;
      const getCartItemsQuery = `SELECT p.product_id, p.product_name, p.price, ci.quantity FROM CartItems ci JOIN Products p ON ci.product_id = p.product_id WHERE ci.customer_id = ?`;
      db.query(getCartItemsQuery, [userId], (error, results) => {
        
        if (error) {
          console.error("Query Error:", error);
          return res.status(500).json({ valid: false, error: "Database error" });
        }
        res.status(200).json({ valid: true, cartItems: results });
      });
    } catch (queryError) {
      console.error("Query Error:", queryError);
      res.status(500).json({ valid: false, error: "Internal server error" });
    }
  });


//שאיבת כל המוצרים לכאורה אין תור בהרשאה
//אם יש צורך בהרשאה לחשוב אם יש הבדל בין מנהל ללקוח
app.get("/api/products", (req, res) => {
  db.query("SELECT * FROM Products", (error, results) => {
      if (error) {
          res.status(500).send(error);
      } else {
          res.json(results);
      }
  });
});


// שליפת כל הקטגוריות
app.get('/api/categories', async (req, res) => {
    try {
        const [categories] = await db.promise().query('SELECT * FROM Categories');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'שגיאה בשליפת קטגוריות' });
    }
});





// עדכון כמות בתוך העגלה
app.put(`/api/updateCartItem`, authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId; 
    const { product_id, quantity } = req.body;
    const query = `UPDATE CartItems SET quantity = ? WHERE customer_id = ? AND product_id = ?`;
    db.query(query, [quantity, userId, product_id], (error, results) => {
      if (error) {
        console.error("Query Error:", error);
        return res.status(500).json({ valid: false, error: "Database error" });
      }
      res.status(200).json({ valid: true });
    });
  } catch (queryError) {
    console.error("Query Error:", queryError);
    res.status(500).json({ valid: false, error: "Internal server error" });
  }
});




// מחיקת מוצר מתוך העגלה
app.delete(`/api/removeCartItem`, authenticateToken, (req, res)=>{
    try {
      const userId = req.user.userId;
      const productId = req.query.productId;
      const query = `DELETE FROM CartItems WHERE customer_id = ? AND product_id = ?`;
     
      db.query(query, [userId, productId], (error, results) => {
        if (error) {
          console.error("Query Error:", error);
          return res.status(500).json({ valid: false, error: "Database error" });
        }
        res.status(200).json({ valid: true });
      });
    } catch (queryError) {
      console.error("Query Error:", queryError);
      res.status(500).json({ valid: false, error: "Internal server error" });
    }
});





// PayPal configuration
const payPalClient = new paypal.core.PayPalHttpClient(
  new paypal.core.SandboxEnvironment("PAYPAL_CLIENT_ID", "PAYPAL_SECRET")
);

// Route: Handle Checkout
router.post("/checkout", async (req, res) => {
  const { cartItems, paymentMethod } = req.body;

  try {
      if (paymentMethod === "paypal") {
          // Create PayPal order
          const request = new paypal.orders.OrdersCreateRequest();
          request.requestBody({
              intent: "CAPTURE",
              purchase_units: [
                  {
                      amount: {
                          currency_code: "USD",
                          value: calculateTotal(cartItems),
                      },
                  },
              ],
          });

          const order = await payPalClient.execute(request);
          return res.json({ success: true, orderId: order.result.id });
      } else {
          // Handle other payment methods
          sendInvoice(cartItems, "customer@example.com"); // Replace with dynamic email
          res.json({ success: true, message: "הזמנה בוצעה בהצלחה!" });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "שגיאה בעיבוד התשלום" });
  }
});



// לצורך תשלומים
// Function to calculate total
function calculateTotal(cartItems) {
  return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
}

// Function to send an invoice email
function sendInvoice(cartItems, email) {
  const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
          user: "your-email@gmail.com",
          pass: "your-email-password",
      },
  });

  const emailBody = `
      <h2>חשבונית רכישה</h2>
      <p>תודה על ההזמנה!</p>
      <ul>
          ${cartItems.map(
              (item) => `<li>${item.name} - ${item.quantity} יחידות</li>`
          ).join("")}
      </ul>
      <p>סכום כולל: ${calculateTotal(cartItems)} USD</p>
  `;

  transporter.sendMail({
      from: "your-email@gmail.com",
      to: email,
      subject: "חשבונית הזמנה",
      html: emailBody,
  });
}





// הפעלת השרת
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
