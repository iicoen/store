import React, {useEffect, useState } from "react";
import "../css/OrderPage.css";
import apiUrl from '../config.js';

import { useNavigate } from "react-router-dom";

export default function OrderPage(
    // {cartItems, onOrderComplete}
    {  onOrderComplete }
) {
    const [paymentMethod, setPaymentMethod] = useState("paypal");
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(()=>{
        if(!token){navigate("/login")}
    });

    const handleOrder = async () => {
    let cartItems="d";
        setIsProcessing(true);
        console.log("11111111" ,cartItems);
        try {
            const response = await fetch(`${apiUrl}/api/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` },
                body: JSON.stringify(
                    { cartItems, paymentMethod }


                ),
            });
            const result = await response.json();
            if (result.success) {
                // onOrderComplete();
                alert("ההזמנה בוצעה בהצלחה!");
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
            <button onClick={handleOrder} disabled={isProcessing}>
                {isProcessing ? "מעבד..." : "בצע הזמנה"}
            </button>
        </div>
    );
}

