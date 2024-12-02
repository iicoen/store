import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import apiUrl from "../config.js";

const ResetPassword = () => {
  const { token } = useParams(); // שליפת הטוקן מהנתיב
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("הסיסמאות אינן תואמות");
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/api/reset-password/${token}`, {
        password,
      });
if(response.data.message===`Password updated successfully`){setMessage(`הסיסמה עודכנה בהצלחה`)}
else{setMessage(response.data.message);}
    } catch (error) {
      setMessage("שגיאה במהלך איפוס הסיסמה");
    }
  };

  return (
    <div style={{ textAlign: "center", direction: "rtl" }}>
      <h1>איפוס סיסמה</h1>
      <form onSubmit={handleResetPassword}>
        <input
          type="password"
          placeholder="סיסמה חדשה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "16px",
            margin: "10px 0",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <br />
        <input
          type="password"
          placeholder="אשר סיסמה חדשה"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          אפס סיסמה
        </button>
      </form>
      {message && <p style={{ marginTop: "10px", color: "green" }}>{message}</p>}
    </div>
  );
};

export default ResetPassword;
