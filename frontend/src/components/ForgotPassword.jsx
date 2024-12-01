import React, { useState } from "react";
import axios from "axios";
import apiUrl from "../config.js";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleForgotPassword = async () => {
    try {
      const response = await axios.post(`${apiUrl}/api/forgot-password`, { email });

      setMessage(response.data.message);
      if(response.data.message==="Password reset email sent")
        {setMessage(`דוא"ל איפוס סיסמה נשלח`);} 
      
    } catch (error) {
      setMessage("שגיאה: לא ניתן לשלוח מייל לאיפוס סיסמה");
    }
  };

  return (
    <div style={{ textAlign: "center", direction: "rtl" }}>
      <h2>שכחת סיסמה</h2>
      <input
        type="email"
        placeholder="הכנס את כתובת האימייל שלך"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: "10px",
          fontSize: "16px",
          margin: "10px 0",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      <br />
      <button
        onClick={handleForgotPassword}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        שלח קישור לאיפוס סיסמה
      </button>
      {message && <p style={{ marginTop: "10px", color: "green" }}>{message}</p>}
    </div>
  );
};

export default ForgotPassword;
