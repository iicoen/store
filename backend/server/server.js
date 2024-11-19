const express = require("express");
const mysql = require("mysql2");
const app = express();
const port = 3001;
const cors = require("cors");
// לצורך פונקצית אימות

const bodyParser = require("body-parser");
const checkoutRouter = require("./routes/checkout"); // נתיב לקובץ שבו נמצא הקוד שלך

const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key";
// const bcrypt = require("bcryptjs");
const bcrypt = require("bcrypt");
const path = require('path');
const { log } = require("console");
require('dotenv').config({ path: path.join(__dirname, 'process.env') });

// require('dotenv').config();
// console.log('dotenv loaded:', process.env.DB_HOST !== undefined);

// לצורך תשלומים
const router = express.Router();
const paypal = require("@paypal/checkout-server-sdk");
const nodemailer = require("nodemailer");


// מאשר לכל הדומיינים
app.use(cors());
app.use(express.json());


app.use(bodyParser.json()); // תמיכה ב-JSON בבקשות
app.use("/api", checkoutRouter); // חיבור הראוטר עם prefix של "/api"

// חיבור למסד הנתונים
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});


// const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });




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
    return res.status(401).json({ valid: false });
  }

  jwt.verify(token, SECRET_KEY, async (err, user) => {
    if (err) return res.status(403).json({ valid: false });

    try {
      
      
      const fullNameQuery = `SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM customers WHERE identity_number = ?;`;
      const [results] = await db.promise().query(fullNameQuery, [user.identity]); // מחכים לתוצאה של השאילתא

      const fullName = results.length > 0 ? results[0].full_name : null; // מחלצים את השם המלא // מדפיסים את השם המלא // 
      res.status(200).json({ valid: true, userId: fullName }); // מחזירים את השם המלא
    } catch (queryError) {
      console.error("Query Error:", queryError);
      res.status(500).json({ valid: false, error: "Database query failed" });
    }
  });
});


// app.post("/updateCart", (req, res) => {
//   const token = req.headers["authorization"]?.split(" ")[1];
//   if (!token) {
//     return res.status(401).json({ valid: false });
//   }

//   jwt.verify(token, SECRET_KEY, async (err, user) => {
//     if (err) return res.status(403).json({ valid: false });

//     try {
// const userId=user.userId;
// const { product_id, quantity } = req.body; 

// console.log(userId, product_id, quantity);

// const newProductCartQuery=`INSERT INTO cartitems (customer_id, product_id, quantity) VALUES (?,?,?)`;
// db.query(newProductCartQuery, [userId, product_id, quantity]);
// // connection.release(); // שחרור החיבור למאגר


//       res.status(200).json({ valid: true }); 
//     } catch (queryError) {
//       console.error("Query Error:", queryError);
//       res.status(500).json({ valid: false, error: "" });
//     }
//   });
// });


app.post("/updateCart", (req, res) => {
  
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ valid: false });
  }

  jwt.verify(token, SECRET_KEY, async (err, user) => {
    if (err) return res.status(403).json({ valid: false });

    try {
      const userId = user.userId;
      const { product_id, quantity } = req.body; 
       // זה יעבוד טוב גם בלי התוספת הזאת כי הדאטה בייס מוגדר עם מפחות נכונים שלא יכול להוסיף לעגלה מוצר שלא קיים במוצרים
      // if(!(await  db.query(`SELECT EXISTS(SELECT 1 FROM Products WHERE product_id = product_id)`))[0].exists)
        if (!(await db.promise().query('SELECT EXISTS(SELECT 1 FROM Products WHERE product_id = ?) AS `exists`', [product_id]))[0][0].exists)

        {
         console.log(666666666666666666);
          
          return res.status(500).json({ valid: false, error: "The product is no longer in stock.", code: "OUT_OF_STOCK" })}
          else console.log(777777777777777); 
    
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
});


// מסלול להחזרת פרטי העגלה עבור המשתמש
app.get("/api/cart", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ valid: false });
  }

  jwt.verify(token, SECRET_KEY, async (err, user) => {
    if (err) return res.status(403).json({ valid: false });
    try {
      const userId = user.userId;
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
           const customerQuery = "SELECT customer_id FROM customers WHERE identity_number = ?";
           db.query(customerQuery, [identity_number], (err, customerResults) => {
             if (err) return res.status(500).json({ error: "שגיאת מסד נתונים" });
             if (customerResults.length === 0) {
               return res.status(400).json({ message: "הלקוח לא נמצא" });
             }
     
             const userId = customerResults[0].customer_id;


      // יצירת טוקן
      const token = jwt.sign(
        { userId: userId, identity: user.identity_number },
        SECRET_KEY,
        { expiresIn: "1h" }
      ); // החזרת הטוקן ללקוח

      res.status(200).json({ message: "התחברות הצליחה", token });
    });
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



// ממשק ניהול
app.get("/api/products", (req, res) => {
  db.query("SELECT * FROM Products", (error, results) => {
      if (error) {
          res.status(500).send(error);
      } else {
          res.json(results);
      }
  });
});

app.post("/api/products", (req, res) => {
  const { name, price, description, quantity,category_id } = req.body;
  const sql = "INSERT INTO Products (product_name, price, description, quantity_in_stock, category_id) VALUES (?, ?, ?, ?,?)";
  db.query(sql, [name, price, description, quantity,category_id], (error, results) => {
      if (error) {
          res.status(500).send(error);
      } else {
          res.status(201).send("Product added");
      }
  });
});



app.delete("/api/products/:id", (req, res) => {
  const productId = req.params.id;
  db.query("DELETE FROM Products WHERE product_id = ?", [productId], (error) => {
      if (error) {
          res.status(500).send(error);
      } else {
          res.send("Product deleted");
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

// הוספת קטגוריה חדשה
app.post('/api/categories', async (req, res) => {
    const { category_name } = req.body;
    try {
        await db.promise().query('INSERT INTO Categories (category_name) VALUES (?)', [category_name]);
        res.status(201).json({ message: 'קטגוריה נוספה בהצלחה' });
    } catch (error) {
        res.status(500).json({ error: 'שגיאה בהוספת קטגוריה' });
    }
});



// עדכון כמות בתוך העגלה
app.put(`/api/updateCartItem`, (req, res)=>{
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ valid: false });
  }
  jwt.verify(token, SECRET_KEY, async (err, user) => {
    if (err) return res.status(403).json({ valid: false });

    try {
      const userId = user.userId;
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
});
// מחיקת מוצר מתוך העגלה
app.delete(`/api/removeCartItem`, (req, res)=>{
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ valid: false });
  }
  jwt.verify(token, SECRET_KEY, async (err, user) => {
    if (err) return res.status(403).json({ valid: false });

    try {
      const userId = user.userId;
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

// module.exports = router;





// הפעלת השרת
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
