import React, { useEffect, useState } from "react";
import { Button, Typography, List, ListItem, ListItemText, Divider } from "@mui/material";
import apiUrl from "../config.js";
import "../css/PreviousInvoices.css";
import { useNavigate } from "react-router-dom";
import useTokenExpirationWatcher from "../hooks/useTokenExpirationWatcher";

const PreviousInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoiceItems, setSelectedInvoiceItems] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // קריאה ל-Hook
  useTokenExpirationWatcher(); 
  

  const isTokenExpired = (token) => {
    if (!token) return true; // אין טוקן
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now(); // בדיקת פקיעה
  };
  
  const handleTokenExpiration = () => {
    if (isTokenExpired(token)) {
      navigate("/login");
      return true;} return false;
  };
  

  // טעינת החשבוניות
  const fetchInvoices = async () => {
    if (handleTokenExpiration()) return;
    try {
      const response = await fetch(`${apiUrl}/api/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setInvoices(data.invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  // טעינת פרטי חשבונית
  const fetchInvoiceItems = async (invoiceId) => {
    if (handleTokenExpiration()) return;
    try {
        
      const response = await fetch(`${apiUrl}/api/invoice/${invoiceId}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setSelectedInvoiceItems(data.items);
      setSelectedInvoiceId(invoiceId);
    } catch (error) {
      console.error("Error fetching invoice items:", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

    useEffect(() => {
  if (handleTokenExpiration()) return;
    },[navigate]);



  return (
    <div>

<Typography
    variant="h5"
    gutterBottom
    className="invoice-header"
    sx={{
        direction: "rtl",
        textAlign: "center",
        margin: "20px 0",
        padding: "10px",
        fontFamily: "serif",
        fontWeight: "bold",
        color: "#333",
        backgroundColor: "#f5f5f5",
        borderRadius: "5px",
        border: "1px solid #ddd",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)"
    }}
>
הזמנות קודמות
</Typography>

        {/* <Typography variant="h5" gutterBottom className="invoice-header"
                  sx={{ direction: "rtl", textAlign: "center" }}
        >
        הזמנות קודמות
      </Typography> */}
    <div className="invoice-container">

      <List className="invoice-list"
          sx={{ direction: "rtl", textAlign: "right" }}
      >
        {invoices.map((invoice) => (
          <React.Fragment key={invoice.invoice_id}>
            <ListItem className="invoice-item"
                      sx={{ direction: "rtl", textAlign: "right" }}
>
              <ListItemText
                primary={`חשבונית #${invoice.invoice_id} - ₪${invoice.total_amount}`}
               
                // secondary={`תאריך: ${new Date(invoice.created_at).toLocaleDateString()} | סטטוס: ${invoice.payment_status}`}
                secondary={`תאריך: ${new Date(invoice.created_at).toLocaleString()} `}
   
                  

              />
              <Button
                variant="outlined"
                onClick={() => fetchInvoiceItems(invoice.invoice_id)}
                className="invoice-button"
              >
                הצג פרטים
              </Button>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      {/* הצגת פרטי החשבונית */}
      {selectedInvoiceId && (
        <div className="invoice-details-container">
          <Typography variant="h6" gutterBottom className="invoice-details-header">
            פרטי חשבונית #{selectedInvoiceId}
          </Typography>
          <List className="invoice-details-list">
            {selectedInvoiceItems.map((item, index) => (
              <ListItem key={index} className="invoice-details-item">
                <ListItemText
                  primary={`${item.product_name} - ${item.quantity} יחידות`}
                  secondary={`מחיר יחידה: ₪${Number(item.unit_price).toFixed(2)} | סה"כ: ₪${(Number(item.unit_price) * Number(item.quantity)).toFixed(2)}`}
                />
              </ListItem>
            ))}
          </List>
        </div>
      )}
    </div></div>
  );
};

export default PreviousInvoices;
