import React, { useState, useEffect } from "react";
import ProductManagement from "./ProductManagement";
import CustomerManagement from "./CustomerManagement";
import OrderManagement from "./OrderManagement";
import Reports from "./Reports";
import CategoryManagement from "./CategoryManagement";
import { Box, Button, ButtonGroup, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiUrl from '../config.js';
import axios from "axios";

const AdminPanel = () => {
  const [selectedSection, setSelectedSection] = useState("products");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        await axios.get(`${apiUrl}/api/admin/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error("Token verification failed:", error.response?.data);
        localStorage.removeItem("adminToken");
        navigate("/login");
      }
    };

    verifyToken();
  }, [navigate]);

  const logoutAdmin = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      await axios.post(
        `${apiUrl}/api/admin/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.removeItem("adminToken"); // מחיקת הטוקן מקומית
      console.log("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error.response?.data);
    }
  };

  const renderSection = () => {
    switch (selectedSection) {
      case "products":
        return <ProductManagement />;
      case "customers":
        return <CustomerManagement />;
      case "orders":
        return <OrderManagement />;
      case "reports":
        return <Reports />;
      case "categories":
        return <CategoryManagement />;
      default:
        return <ProductManagement />;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "20px",
      }}
    >
      {/* כותרת */}
      <Typography
        variant="h4"
        align="center"
        sx={{
          color: "#333",
          fontWeight: "bold",
          marginBottom: "20px",
        }}
      >
        ברוכים הבאים לממשק מנהל
      </Typography>

      {/* כפתור יציאה */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px", // מרווח אחרי הכפתור
        }}
      >
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#ff5722", // כתום מותאם אישית
            color: "#fff", // צבע הטקסט
            "&:hover": {
              backgroundColor: "#e64a19", // צבע בעת ריחוף
            },
            fontWeight: "bold",
            padding: "10px 20px",
            fontSize: "16px",
          }}
          onClick={logoutAdmin}
        >
          יציאה
        </Button>
      </Box>

      {/* תפריט ניווט */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <ButtonGroup
          variant="contained"
          aria-label="Admin Panel Navigation"
          sx={{ boxShadow: "0px 2px 4px rgba(0,0,0,0.2)" }}
        >
          <Button
            color={selectedSection === "products" ? "primary" : "secondary"}
            onClick={() => setSelectedSection("products")}
          >
            ניהול מוצרים
          </Button>
          <Button
            color={selectedSection === "customers" ? "primary" : "secondary"}
            onClick={() => setSelectedSection("customers")}
          >
            ניהול לקוחות
          </Button>
          <Button
            color={selectedSection === "orders" ? "primary" : "secondary"}
            onClick={() => setSelectedSection("orders")}
          >
            ניהול הזמנות
          </Button>
          <Button
            color={selectedSection === "reports" ? "primary" : "secondary"}
            onClick={() => setSelectedSection("reports")}
          >
            דוחות
          </Button>
          <Button
            color={selectedSection === "categories" ? "primary" : "secondary"}
            onClick={() => setSelectedSection("categories")}
          >
            ניהול קטגוריות
          </Button>
        </ButtonGroup>
      </Box>

      {/* תוכן */}
      <Paper
        elevation={3}
        sx={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px",
          backgroundColor: "#fff",
        }}
      >
        {renderSection()}
      </Paper>
    </Box>
  );
};

export default AdminPanel;
