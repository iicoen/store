import React, { useState } from "react";
import { motion } from "framer-motion";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../css/LoginPage.css"; 

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const toggleForm = () => setIsLogin(!isLogin);

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
        {isLogin ? <LoginForm navigate={navigate} /> : <RegisterForm />}
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
        <Button variant="contained" color="secondary">
          כניסת מנהלים
        </Button>
      </motion.div>
    </Box>
  );
};

const LoginForm = ({ navigate }) => (
  <Box component="form" mt={2}>
    <TextField label="תעודת זהות" variant="outlined" fullWidth margin="normal" required />
    <TextField label="סיסמה" type="password" variant="outlined" fullWidth margin="normal" required />
    <Button
      variant="contained"
      color="primary"
      fullWidth
      onClick={() => navigate("/home")} // דוגמה לניווט לאחר התחברות
      className="form-button"
    >
      התחבר
    </Button>
  </Box>
);

const RegisterForm = () => (
  <Box component="form" mt={2}>
    <TextField label="שם פרטי" variant="outlined" fullWidth margin="normal" required />
    <TextField label="שם משפחה" variant="outlined" fullWidth margin="normal" required />
    <TextField label="מספר זהות" variant="outlined" fullWidth margin="normal" required />
    <TextField label="כתובת מגורים" variant="outlined" fullWidth margin="normal" required />
    <TextField label="טלפון" variant="outlined" fullWidth margin="normal" required />
    <TextField label="אימייל" type="email" variant="outlined" fullWidth margin="normal" required />
    <TextField label="כתובת למשלוח מוצרים" variant="outlined" fullWidth margin="normal" required />
    <TextField label="בחר סיסמה" type="password" variant="outlined" fullWidth margin="normal" required />
    <TextField label="אמת סיסמה" type="password" variant="outlined" fullWidth margin="normal" required />
    <Button variant="contained" color="primary" fullWidth className="form-button">
      הירשם
    </Button>
  </Box>
);

export default LoginPage;
