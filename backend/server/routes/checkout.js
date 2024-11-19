const express = require("express");
const router = express.Router();
const paypal = require("@paypal/checkout-server-sdk");
const nodemailer = require("nodemailer");

// PayPal configuration
const payPalClient = new paypal.core.PayPalHttpClient(
  new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET)
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
              value:
                //  calculateTotal(cartItems)
                89,
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

// Function to calculate total
function calculateTotal(cartItems) {
  return cartItems
    .reduce((total, item) => total + item.price * item.quantity, 0)
    .toFixed(2);
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
            ${cartItems
              .map((item) => `<li>${item.name} - ${item.quantity} יחידות</li>`)
              .join("")}
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

module.exports = router;
