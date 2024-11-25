import React, { useState, useEffect } from "react";
import axios from "axios";
import apiUrl from "../config.js";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Typography,
  Modal,
  Box,
  Grid,
} from "@mui/material";

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    first_name: "",
    last_name: "",
    identity_number: "",
    address: "",
    phone: "",
    email: "",
    shipping_address: "",
  });
  const [editCustomer, setEditCustomer] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);

  // מיפוי של תוויות לשדות בעברית
  const fieldLabels = {
    first_name: "שם פרטי",
    last_name: "שם משפחה",
    identity_number: "תעודת זהות",
    address: "כתובת",
    phone: "טלפון",
    email: "אימייל",
    shipping_address: "כתובת למשלוח",
  };


  const fetchCustomerData = async () => {
    const token = localStorage.getItem("adminToken");
  
    try {
      const response = await axios.get(`${apiUrl}/api/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log("Protected data:", response.data);
      setCustomers(response.data);

    } catch (error) {
      console.error("Access denied:", error.response?.data);
    }
  };
  
  

  useEffect(() => {
    // fetchCustomers - אולי לשנות שם

    fetchCustomerData();

  }, []);



  const handleEditCustomer = (customer) => {
    setEditCustomer(customer);
    setOpenModal(true);
  };

  const saveCustomer = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      await axios.put(
        `${apiUrl}/api/admin/customers/${editCustomer.customer_id}`,
        editCustomer , {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchCustomerData();
      setOpenModal(false);
    } catch (error) {
      console.error("Error updating customer", error);
    }
  };

  const deleteCustomer = async (customerId) => {
    const token = localStorage.getItem("adminToken");
    try {
      await axios.delete(`${apiUrl}/api/admin/customers/${customerId}`, 
        {headers: { Authorization: `Bearer ${token}`}});
      fetchCustomerData();
      setOpenModal(false);
    } catch (error) {
      console.error("Error deleting customer", error);
    }
  };

  const addCustomer = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      await axios.post(`${apiUrl}/api/admin/customers`, newCustomer,
        {headers: {Authorization: `Bearer ${token}`}}
      );
      fetchCustomerData();
      setNewCustomer({
        first_name: "",
        last_name: "",
        identity_number: "",
        address: "",
        phone: "",
        email: "",
        shipping_address: "",
      });
      setOpenAddModal(false);
    } catch (error) {
      console.error("Error adding customer", error);
    }
  };
  const hiddenFields = ["customer_id", "created_at", "updated_at"]; // שדות להסתרה


  return (
    <div style={{ padding: "10px", fontSize: "0.9rem" }}>
      <Typography variant="h5" gutterBottom>
        ניהול לקוחות
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenAddModal(true)}
        style={{ marginBottom: "20px" }}
      >
        הוספת לקוח חדש
      </Button>

      <Grid container spacing={2} style={{ marginTop: "20px" }}>
        {customers.map((customer) => (
          <Grid item xs={12} sm={6} md={4} key={customer.customer_id}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  {customer.first_name} {customer.last_name}
                </Typography>
                <Typography>טלפון: {customer.phone}</Typography>
                <Typography>אימייל: {customer.email}</Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="outlined"
                  onClick={() => handleEditCustomer(customer)}
                >
                  ערוך
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* חלון הוספת לקוח */}
      <Modal open={openAddModal} onClose={() => setOpenAddModal(false)}>
        <Box
          style={{
            background: "white",
            padding: "20px",
            margin: "auto",
            marginTop: "10%",
            width: "40%",
            borderRadius: "8px",
          }}
        >
          <Typography variant="h5">הוספת לקוח חדש</Typography>
          <Grid container spacing={2}>
            {Object.keys(newCustomer).map((field) => (
              <Grid item xs={12} key={field}>
                <TextField
                  label={fieldLabels[field] || field.replace("_", " ")}
                  fullWidth
                  value={newCustomer[field]}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, [field]: e.target.value })
                  }
                />
              </Grid>
            ))}
          </Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={addCustomer}
            style={{ marginTop: "20px" }}
          >
            שמור
          </Button>
        </Box>
      </Modal>

      {/* חלון עריכת לקוח */}
<Modal open={openModal} onClose={() => setOpenModal(false)}>
  <Box
    style={{
      background: "white",
      padding: "20px",
      margin: "auto",
      marginTop: "10%",
      width: "40%",
      borderRadius: "8px",
    }}
  >
    <Typography variant="h5">עריכת לקוח</Typography>
    {editCustomer && (
      <>
        <Grid container spacing={2}>
          {Object.keys(editCustomer)
            .filter((field) => !hiddenFields.includes(field)) // הסרת שדות מוסתרים
            .map((field) => (
              <Grid item xs={12} key={field}>
                <TextField
                  label={fieldLabels[field] || field.replace("_", " ")}
                  fullWidth
                  value={editCustomer[field]}
                  onChange={(e) =>
                    setEditCustomer({
                      ...editCustomer,
                      [field]: e.target.value,
                    })
                  }
                />
              </Grid>
            ))}
        </Grid>
        <Button
          variant="contained"
          color="primary"
          onClick={saveCustomer}
          style={{ marginTop: "20px" }}
        >
          שמור
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => deleteCustomer(editCustomer.customer_id)}
          style={{ marginTop: "10px", marginLeft: "10px" }}
        >
          מחק
        </Button>
      </>
    )}
  </Box>
</Modal>
    </div>
  );
};

export default CustomerManagement;
