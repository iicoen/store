import React, { useState } from "react";
import { motion } from "framer-motion";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../css/LoginPage.css";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const toggleForm = () => setIsLogin((prev) => !prev);

  return (
    <Box className="login-page-container">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="login-box"
      >
        <Typography variant="h5" gutterBottom className="login-title">
          {isLogin ? "התחברות" : "רישום משתמש חדש"}
        </Typography>
        {isLogin ? (
          <LoginForm navigate={navigate} />
        ) : (
          <RegisterForm setIsLogin={setIsLogin} />
        )}
        <Button onClick={toggleForm} color="primary" variant="text">
          {isLogin ? "אין לך חשבון? הרשם כאן" : "כבר יש לך חשבון? התחבר"}
        </Button>
      </motion.div>
      <motion.div
        initial={{ x: "-100vw" }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 50 }}
        className="admin-button-container"
      >
        <Button variant="contained" color="secondary"  onClick={()=>{navigate("/adminPanel")}}>
          כניסת מנהלים
        </Button>
      </motion.div>
    </Box>
  );
};

const LoginForm = ({ navigate }) => {
  const [identityNumber, setIdentityNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity_number: identityNumber, password }),
      });

      const data = await response.json();
      if (!response.ok){

        throw new Error(data.message || "שגיאה בהתחברות");
      }

      // שמירת הטוקן ב-Local Storage אם ההתחברות הצליחה
      localStorage.setItem("token", data.token);
      navigate("/online");
    } catch (err) {

      setError(err.message);


    }
  };

  return (
    <Box component="form" mt={2}>
      <TextField
        label="תעודת זהות"
        variant="outlined"
        fullWidth
        margin="normal"
        required
        value={identityNumber}
        onChange={(e) => setIdentityNumber(e.target.value)}
      />
      <TextField
        label="סיסמה"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button variant="contained" color="primary" fullWidth onClick={handleLogin}>
        התחבר
      </Button>
      {error && (
        <Typography color="error" mt={2}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

const RegisterForm = ({ setIsLogin }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    identity_number: "",
    address: "",
    phone: "",
    email: "",
    shipping_address: "",
    password: "",
    confirm_password: ""
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData((prevData) => ({ ...prevData, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch("http://localhost:3001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.status === 201) {
        setMessageType("success");
        setMessage("המשתמש נוצר בהצלחה");
        setTimeout(() => setIsLogin(true), 2000); // חזרה למסך התחברות
      } else {
        handleErrorResponse(response, data);
      }
    } catch {
      setMessageType("error");
      setMessage("שגיאת שרת");
    }
  };

  const validateForm = () => {
    if (!formData.first_name || !formData.last_name || !formData.identity_number || !formData.password || !formData.confirm_password) {
      setMessageType("error");
      setMessage("לא מילאת את כל שדות החובה");
      return false;
    }
    if (formData.password !== formData.confirm_password) {
      setMessageType("error");
      setMessage("הסיסמאות אינן תואמות");
      return false;
    }
    return true;
  };

  const handleErrorResponse = (response, data) => {
    if (response.status === 400 && data.message === "User already exists") {
      setMessageType("warning");
      setMessage("המשתמש כבר קיים.");
    } else {
      setMessageType("error");
      setMessage(data.message || "אירעה שגיאה ברישום");
    }
  };

  return (
    <Box component="form" mt={2}>
      <TextField label="שם פרטי" name="first_name" variant="outlined" fullWidth margin="normal" required onChange={handleChange} />
      <TextField label="שם משפחה" name="last_name" variant="outlined" fullWidth margin="normal" required onChange={handleChange} />
      <TextField label="מספר זהות" name="identity_number" variant="outlined" fullWidth margin="normal" required onChange={handleChange} />
      <TextField label="כתובת מגורים" name="address" variant="outlined" fullWidth margin="normal" onChange={handleChange} />
      <TextField label="טלפון" name="phone" variant="outlined" fullWidth margin="normal" onChange={handleChange} />
      <TextField label="אימייל" name="email" type="email" variant="outlined" fullWidth margin="normal" onChange={handleChange} />
      <TextField label="כתובת למשלוח מוצרים" name="shipping_address" variant="outlined" fullWidth margin="normal" onChange={handleChange} />
      <TextField label="בחר סיסמה" name="password" type="password" variant="outlined" fullWidth margin="normal" required onChange={handleChange} />
      <TextField label="אמת סיסמה" name="confirm_password" type="password" variant="outlined" fullWidth margin="normal" required onChange={handleChange} />

      <Button variant="contained" color="primary" fullWidth onClick={handleSubmit}>
        הירשם
      </Button>

      {message && (
        <Typography variant="body1" color={getColor(messageType)} mt={2}>
          {message} 
          {messageType === "warning" && (
            <Button onClick={() => setIsLogin(true)} color="primary" variant="text">
              התחבר
            </Button>
          )}
        </Typography>
      )}
    </Box>
  );
};

const getColor = (type) => {
  switch (type) {
    case "success":
      return "green";
    case "warning":
      return "orange";
    case "error":
      return "red";
    default:
      return "black";
  }
};

export default LoginPage;
