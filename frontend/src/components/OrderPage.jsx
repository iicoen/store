import React, { useEffect, useState } from "react";
import "../css/OrderPage.css";
import apiUrl from "../config.js";

import { useNavigate } from "react-router-dom";
import useTokenExpirationWatcher from "../hooks/useTokenExpirationWatcher";

export default function OrderPage(
  // {cartItems, onOrderComplete}
  { onOrderComplete }
) {
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [isProcessing, setIsProcessing] = useState(false);
  const [creditCardNumber, setCreditCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cardOwnerId, setCardOwnerId] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  // קריאה ל-Hook
  useTokenExpirationWatcher();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  });

  function isValidIsraeliId(id) {
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let num = Number(id[i]) * ((i % 2) + 1); // כפל בסדר לסירוגין: 1 ו-2
      if (num > 9) {
        num -= 9; // אם התוצאה היא יותר מ-9, מחסרים 9
      }
      sum += num;
    }

    // המספר תקין אם סכום הספרות מתחלק ב-10
    return sum % 10 === 0;
  }

  const validatePaymentDetails = (
    creditCardNumber,
    expiryDate,
    cardOwnerId
  ) => {
    // בדיקת תקינות תעודת זהות
    if (!isValidIsraeliId(cardOwnerId)) {
      console.error("תעודת הזהות אינה תקינה");
      return false;
    }

    const isValidCreditCard = /^[0-9]{16}$/.test(creditCardNumber);
    const isValidId = /^[0-9]{9}$/.test(cardOwnerId);
    const [month, year] = expiryDate.split("/").map(Number);
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const isValidExpiry =
      year > currentYear || (year === currentYear && month >= currentMonth);

    return isValidCreditCard && isValidId && isValidExpiry && month <= 12;
  };

  const handleOrder = async () => {
    setIsProcessing(true);

    const cartResponse = await fetch(`${apiUrl}/api/cart`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const { cartItems } = await cartResponse.json();
    if (!cartResponse.ok) {
      alert("שגיאה בשליפת פרטי העגלה");
      return;
    }

    // אם העגלה ריקה, אבל לא אמורים להגיע לכאן אמורים לרפרש קודם
    if (cartItems.length < 1) {
      alert("העגלה ריקה.");
      navigate("/online");
      return;
    }

    try {
      if (
        paymentMethod === "saved" &&
        !validatePaymentDetails(creditCardNumber, expiryDate, cardOwnerId)
      ) {
        alert(
          "פרטי התשלום אינם תקינים. בדוק את מספר הכרטיס, התוקף או מספר הזהות."
        );
        return;
      }

      if (paymentMethod === "saved") {
        try {
          const paymentResponse = await fetch(`${apiUrl}/api/validatePayment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              creditCardNumber,
              expiryDate,
              cardOwnerId,
            }),
          });

          const validationResult = await paymentResponse.json();

          if (!validationResult.success) {
            alert("פרטי התשלום אינם תקינים: " + validationResult.message);
            return;
          }
        } catch (error) {
          console.error("Error validating payment details:", error);
          alert("שגיאה באימות פרטי התשלום. נסה שוב.");
          return;
        }
      }

      const response = await fetch(`${apiUrl}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cartItems, paymentMethod }),
      });
      const result = await response.json();
      if (result.success) {
        // onOrderComplete();
        alert("ההזמנה בוצעה בהצלחה!");
        navigate("/online");
      } else {
        alert("אירעה שגיאה: " + result.message);
      }
    } catch (error) {
      console.error("Error processing order:", error);
      alert("שגיאה בביצוע ההזמנה");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="order-page">
      <h2>ביצוע הזמנה</h2>
      <div>
        <label>
          <input
            type="radio"
            value="saved"
            checked={paymentMethod === "saved"}
            onChange={() => setPaymentMethod("saved")}
          />
          שימוש בפרטי תשלום שמורים
        </label>
        <label>
          <input
            type="radio"
            value="paypal"
            checked={paymentMethod === "paypal"}
            onChange={() => setPaymentMethod("paypal")}
          />
          תשלום באמצעות PayPal
        </label>
      </div>
      <div>
        {paymentMethod === "saved" && (
          <div className="credit-card-form">
            <h3>פרטי כרטיס אשראי</h3>
            <label>
              מספר כרטיס אשראי:
              <input
                type="text"
                maxLength="16"
                placeholder="1234 1234 1234 1234"
                onChange={(e) => setCreditCardNumber(e.target.value)}
              />
            </label>
            <label>
              תוקף (MM/YY):
              <input
                type="text"
                maxLength="5"
                placeholder="MM/YY"
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </label>
            <label>
              מספר זהות בעל הכרטיס:
              <input
                type="text"
                maxLength="9"
                placeholder="123456789"
                onChange={(e) => setCardOwnerId(e.target.value)}
              />
            </label>
          </div>
        )}
      </div>
      <button onClick={handleOrder} disabled={isProcessing}>
        {isProcessing ? "מעבד..." : "בצע הזמנה"}
      </button>
    </div>
  );
}
