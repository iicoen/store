import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button, TextField, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../css/Online.css";

const Online = ({ user }) => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      fetch("http://localhost:3001/verify-token", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setUserId(data.userId);
          } else {
            navigate("/login");
          }
        })
        .catch(() => navigate("/login"));
    }
  }, [navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch("http://localhost:3001/api/products");
      const data = await response.json();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  // עדכון כמות המוצרים בשדה הקלט לפי מוצר
  const handleQuantityChange = (e, productId) => {
    const quantity = parseInt(e.target.value) || 1;
    setQuantities((prev) => ({ ...prev, [productId]: quantity }));
  };

  // הוספה לסל עם כמות
  const addToCart = (product) => {
    const quantity = quantities[product.id] || 1;
    const existingProductIndex = cart.findIndex((item) => item.id === product.id);
    // if (existingProductIndex >= 0) {
    //   const updatedCart = [...cart];
    //   updatedCart[existingProductIndex].quantity += quantity;
    //   setCart(updatedCart);
    // } else {
      setCart((prev) => [...prev, { ...product, quantity }]);
    // }
// קריאה לשרת עם ה ID של המוצר ועם הכמות

console.log("Product ID:", product.product_id);
console.log("Quantity:", quantity);

fetch("http://localhost:3001/updateCart", {
  method: "POST",
  // headers: { Authorization: `Bearer ${token}`},
  headers: { 
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    product_id: product.product_id,
    quantity: quantity
  }),
})

  };

  const handleOrderSubmit = async () => {
    await fetch("http://localhost:3001/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, items: cart }),
    });
    setCart([]);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // חישוב הסכום הכולל של הסל
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  return (
    <div className="shopping-page">
      <Typography variant="h4" className="page-title">
        ברוכים הבאים לחנות שלנו!
      </Typography>
      <div>
        <h2>ברוך הבא, {userId}</h2>
      </div>
      <Button variant="contained" color="secondary" onClick={handleLogout}>
        יציאה
      </Button>
      <div className="products-list">
        {products.map((product) => (
          <motion.div
            className="product-card"
            key={product.id}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Typography variant="h6">{product.product_name}</Typography>
            <Typography variant="body2">{product.description}</Typography>
            <Typography variant="body1">₪{product.price}</Typography>
            <TextField
              type="number"
              defaultValue={1}
              className="quantity-input"
              label="כמות"
              onChange={(e) => handleQuantityChange(e, product.id)}
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

      <Box className="cart-section">
        <Typography variant="h5">סל הקניות</Typography>
        {cart.map((item, index) => (
          <Typography key={index}>
            {item.product_name} - ({item.quantity} יחי') ₪{(item.price * item.quantity).toFixed(2)}
          </Typography>
        ))}
        <Typography variant="h6">סה"כ: ₪{calculateTotal()}</Typography>
        <Button variant="contained" color="secondary" onClick={handleOrderSubmit}>
          בצע הזמנה
        </Button>
      </Box>

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
