import React, {useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {Card, CardContent, Button, TextField, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../css/Online.css";
import apiUrl from '../config.js';
const Online = ({ user }) => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!token) {
      navigate("/login"); 
    } else {
      fetch(`${apiUrl}/verify-token`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setUserId(data.userId);
            fetchCart(data.userId); // טוען את העגלה מהשרת
          } else {
            navigate("/login");
          }
        })
        .catch(() => navigate("/login"));
    }
  }, [navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch(`${apiUrl}/api/products`, 
        {method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();      
      setProducts(data);
    };
    fetchProducts();
  }, []);


  // פונקציה לטעינת נתוני העגלה מהשרת
  const fetchCart = async () => {
    const response = await fetch(`${apiUrl}/api/cart`, 
      {method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
  
    if (Array.isArray(data.cartItems)) {
      setCart(data.cartItems);
    }
  };

  const handleQuantityChange = async (e, productId) => {
    const quantity = parseInt(e.target.value) || 1;
     setQuantities((prev) => ({ ...prev, [productId]: quantity }));

  };
  const handleQuantityChange2 = (productId, newQuantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: parseInt(newQuantity) }
          : item
      )
    );
  };

  const addToCart = async (e, product) => {
    const quantity = quantities[product.product_id] || 1; // משתמש בכמות עבור כל מוצר מהמצב
    await fetch(`${apiUrl}/updateCart`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        product_id: product.product_id,
        quantity: quantity
      }),
    });
    fetchCart(userId); // טוען מחדש את העגלה לאחר עדכון
  };

  // פונקציה לעדכון כמות מוצר בעגלה
  const updateCartItem = async (productId, newQuantity) => {
    await fetch(`${apiUrl}/api/updateCartItem`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: newQuantity
      })
    });
    fetchCart(userId);
  };


  // פונקציה למחיקת מוצר מהעגלה
  const removeCartItem = async (productId) => {
    await fetch(`${apiUrl}/api/removeCartItem?productId=${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    fetchCart(userId);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

 

  // פונקציה לביצוע הזמנה
  const handleOrderSubmit=()=>{};


  return (
    <div className="shopping-page">
      <Typography variant="h4" className="page-title">
        ברוכים הבאים לחנות שלנו!
      </Typography>
      <div>
        <h2>ברוך הבא, {userId}</h2>
      </div>
      <Button variant="contained" color="secondary" onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>
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
              onChange={(e) =>{
                handleQuantityChange(e, product.product_id)
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={(e) =>{
                addToCart(e, product)
              }}
            >
              הוסף לסל
            </Button>
          </motion.div>
        ))}
      </div>

      <Box className="cart-section">
        <Typography variant="h5">סל הקניות</Typography>
        {cart.map((item, index) => (
          <div key={index}>
            <Typography>
              {item.product_name} - ({item.quantity} יחי') ₪{(item.price * item.quantity).toFixed(2)}
            </Typography>
            <TextField
              type="number"
              value={item.quantity}
              label="עדכן כמות"
              // onChange={(e) => updateCartItem(item.product_id, e.target.value)}
              onChange={(e) => handleQuantityChange2(item.product_id, e.target.value)}
              onBlur={(e) => updateCartItem(item.product_id, e.target.value)}

            />
            <Button variant="outlined" color="secondary" onClick={() => removeCartItem(item.product_id)}>
              מחק
            </Button>
          </div>
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
