import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  Button,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../css/Online.css";
import apiUrl from "../config.js";
import HostagesTicker from "./HostagesTicker";
import MessagePopup from "./MessagePopup";

const Online = ({ user }) => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [fuulProducts, setFuulProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const navigate = useNavigate();
  const [userName, setUserName] = useState(null);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");
  const [showCart, setShowCart] = useState(false);
  const [categories, setCategories] = useState([]);
  // state לניהול מצב טעינה
  const [isLoading, setIsLoading] = useState(false);
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
            setUserName(data.userName);
            fetchCart(); // טוען את העגלה מהשרת
          } else {

            navigate("/login");
          }
        })
        .catch(() => navigate("/login"));
    }
  }, [navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true); // התחלת טעינה
      try{
        const response = await fetch(`${apiUrl}/api/products`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setFuulProducts(data);
        setProducts(data);
      }
      finally {
        setIsLoading(false); // סיום טעינה
      }

    //   console.log(data.map(d)=>{
    //     return
    //     "product_id:",d.product_id,  "שם המוצר ותיאור:",d.product_id} );
      
    // };
    //  console.log(data.map((d)=>`product_id:${d.product_id}, product_name:${d.product_name}, description:${d.description}`))
};
      




    const fetchcategories = async () => {
      const response = await fetch(`${apiUrl}/api/categories`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setCategories(data);
    };

    fetchProducts();
    fetchcategories();
  }, []);

  // פונקציה לטעינת נתוני העגלה מהשרת
  const fetchCart = async () => {
    const response = await fetch(`${apiUrl}/api/cart`, {
      method: "GET",
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
    try {
      const res = await fetch(`${apiUrl}/updateCart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.product_id,
          quantity: quantity,
        }),
      });

      if (!res.ok) throw res;
      const data = await res.json();
    } catch (err) {
      await handleResponseError(err);
    }

    fetchCart(); // טוען מחדש את העגלה לאחר עדכון
  };

  const handleResponseError = async (err) => {
    if (err instanceof Response) {
      const errorData = await err.json();
      switch (errorData.code) {
        case "OUT_OF_STOCK":
          setMessage("המוצר כבר לא קיים במלאי");
          setTimeout(() => setMessage(""), 3000);
          break;
        case "DB_ERROR":
          setMessage("שגיאת בסיס נתונים. אנא נסה שוב.");
          setTimeout(() => setMessage(""), 3000);
          break;
        case "UNKNOWN_ERROR":
          setMessage("שגיאה לא ידועה. אנא נסה שוב.");
          setTimeout(() => setMessage(""), 3000);
          break;
        default:
          setMessage("שגיאה בלתי צפויה.");
          setTimeout(() => setMessage(""), 3000);
          break;
      }
    } else {
      console.error("Unexpected error:", err);
      setMessage("שגיאה בלתי צפויה.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // פונקציה לעדכון כמות מוצר בעגלה
  const updateCartItem = async (productId, newQuantity) => {
    await fetch(`${apiUrl}/api/updateCartItem`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: newQuantity,
      }),
    });
    fetchCart();
  };

  // פונקציה למחיקת מוצר מהעגלה
  const removeCartItem = async (productId) => {
    await fetch(`${apiUrl}/api/removeCartItem?productId=${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    fetchCart();
  };

  const calculateTotal = () => {
    return cart
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  // פונקציה לביצוע הזמנה
  const handleOrderSubmit = () => {
    navigate("/orderPage");
  };
  // פונקציה לפלטר רשימת קטגוריות
  const filterByCategory = (categoryId) => {
    const filteredProducts = fuulProducts.filter(
      (product) => product.category_id === categoryId
    );
    setProducts(filteredProducts);
  };

  return (
    <div className="shopping-page">
      <Typography variant="h4" className="page-title">
        ברוכים הבאים לחנות שלנו!
      </Typography>
      <div>
        <h2>ברוך הבא, {userName}</h2>
      </div>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}
      >
        יציאה
      </Button>


      <div className="shopping-page-container">
      <div className="main-content">
      <div className="categories-list">
  <Button
    variant="outlined"
    color="primary"
    onClick={() => setProducts(fuulProducts)}
  >
    כל המוצרים
  </Button>
  {categories.map((category) => (
    <Button
      key={category.category_id}
      variant="outlined"
      color="secondary"
      onClick={() => filterByCategory(category.category_id)}
    >
      {category.category_name}
    </Button>
  ))}
</div>

      <div className="products-list">
      {isLoading ? (
            <p>טוען נתונים...</p> // חיווי למשתמש
        ) : (
     
        products.map((product) => (
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
              onChange={(e) => {
                handleQuantityChange(e, product.product_id);
              }}
              inputProps={{
                min: 1, // הגדרת מינימום
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={(e) => {
                addToCart(e, product);
              }}
            >
              הוסף לסל
            </Button>
          </motion.div>
        ))
       
      )}
      </div>

      <div className="shopping-page">
        <MessagePopup message={message} />
        {/* שאר התוכן */}
      </div>
      </div>
      
      <Box className="cart-section">

      <Button
        variant="outlined"
        color="primary"
        onClick={() => navigate("/orders")}
        className="view-orders-button"
      >
        הזמנות קודמות
      </Button>

        <Typography variant="h5">סל הקניות</Typography>
        {cart.map((item, index) => (
          <div key={index}>
            <Typography>
              {item.product_name} - ({item.quantity} יחי') ₪
              {(item.price * item.quantity).toFixed(2)}
            </Typography>
            <TextField
              type="number"
              value={item.quantity}
              label="עדכן כמות"
              // onChange={(e) => updateCartItem(item.product_id, e.target.value)}
              onChange={(e) =>
                handleQuantityChange2(item.product_id, e.target.value)
              }
              inputProps={{
                min: 1, // הגדרת מינימום
              }}
              onBlur={(e) => updateCartItem(item.product_id, e.target.value)}
            />
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => removeCartItem(item.product_id)}
          
            >
              מחק
            </Button>
          </div>
        ))}
        <Typography variant="h6">סה"כ: ₪{calculateTotal()}</Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleOrderSubmit}
        >
          בצע הזמנה
        </Button>
      </Box>

      </div>

      <HostagesTicker />
    </div>
  );
};

export default Online;
