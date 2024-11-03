import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button, TextField, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../css/Online.css";

const Online = ({ user }) => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token"); // מבדוק אם יש אסימון שמור

    if (!token) {
      navigate("/login");
    } else {
      // אימות האסימון ולקיחת מזהה משתמש
      fetch("http://localhost:3001/verify-token", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setUserId(data.userId); // שמירת מזהה המשתמש לשימוש בדף
          } else {
            navigate("/login"); // אם האסימון אינו תקף, חזרה לדף התחברות
          }
        })
        .catch(() => navigate("/login"));
    }
  }, [navigate]);

  // טוען מוצרים מהדאטה בייס
  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch("http://localhost:3001/products");
      const data = await response.json();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  // הוספה לסל
  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  // פונקציה לטיפול בהזמנה
  const handleOrderSubmit = async () => {
    await fetch("http://localhost:3001/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, items: cart }),
    });
    setCart([]);
  };

  return (
    <div className="shopping-page">
      {/* כותרת */}
      <Typography variant="h4" className="page-title">
        ברוכים הבאים לחנות שלנו!
      </Typography>
      <div>
        <h2>ברוך הבא, מזהה המשתמש שלך הוא: {userId}</h2>
      </div>

      {/* רשימת מוצרים */}
      <div className="products-list">
        {products.map((product) => (
          <motion.div
            className="product-card"
            key={product.id}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Typography variant="h6">{product.name}</Typography>
            <Typography variant="body2">{product.description}</Typography>
            <Typography variant="body1">₪{product.price}</Typography>
            <TextField
              type="number"
              defaultValue={1}
              className="quantity-input"
              label="כמות"
              InputProps={{ inputProps: { min: 1 } }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => addToCart(product)}
            >
              הוסף לסל
            </Button>
          </motion.div>
        ))}
      </div>

      {/* סל קניות */}
      <Box className="cart-section">
        <Typography variant="h5">סל הקניות</Typography>
        {cart.map((item, index) => (
          <Typography key={index}>
            {item.name} - ₪{item.price} ({item.quantity})
          </Typography>
        ))}
        <Button
          variant="contained"
          color="secondary"
          onClick={handleOrderSubmit}
        >
          בצע הזמנה
        </Button>
      </Box>

      {/* צפייה בהזמנות קודמות */}
      <Button
        variant="outlined"
        color="primary"
        onClick={() => navigate("/orders")}
        className="view-orders-button"
      >
        הזמנות קודמות
      </Button>
    </div>
  );
};

export default Online;
