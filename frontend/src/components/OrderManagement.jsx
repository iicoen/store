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

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    quantity: "",
    category_id: "",
  });
  const [editProduct, setEditProduct] = useState(null); // למוצר שעובר עריכה
  const [open, setOpen] = useState(false); // שליטה על המודל

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const handleEditProduct = (product) => {
    setEditProduct(product);
    setOpen(true);
  };

  const saveProduct = async () => {
    try {
      await axios.put(
        `${apiUrl}/api/products/${editProduct.product_id}`,
        editProduct
      );
      fetchProducts();
      setOpen(false);
    } catch (error) {
      console.error("Error updating product", error);
    }
  };

  const addProduct = async () => {
    try {
      await axios.post(`${apiUrl}/api/products`, newProduct);
      fetchProducts();
      setNewProduct({
        name: "",
        price: "",
        description: "",
        quantity: "",
        category_id: "",
      });
    } catch (error) {
      console.error("Error adding product", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        ניהול מוצרים
      </Typography>

      {/* טופס הוספת מוצר */}
      <Card style={{ marginBottom: "20px", padding: "20px" }}>
        <Typography variant="h5">הוספת מוצר חדש</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="שם מוצר"
              fullWidth
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="מחיר"
              type="number"
              fullWidth
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  price: parseFloat(e.target.value),
                })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="תיאור"
              fullWidth
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="כמות במלאי"
              type="number"
              fullWidth
              value={newProduct.quantity}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  quantity: parseInt(e.target.value),
                })
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="קטגוריה"
              SelectProps={{ native: true }}
              value={newProduct.category_id}
              onChange={(e) =>
                setNewProduct({ ...newProduct, category_id: e.target.value })
              }
            >
              <option value="">בחר קטגוריה</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <Button
          variant="contained"
          color="primary"
          onClick={addProduct}
          style={{ marginTop: "20px" }}
        >
          הוסף מוצר
        </Button>
      </Card>

      {/* רשימת מוצרים */}
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} md={4} key={product.product_id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{product.product_name}</Typography>
                <Typography>מחיר: {product.price} ₪</Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="outlined"
                  onClick={() => handleEditProduct(product)}
                >
                  ערוך
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* חלון עריכה */}
      {editProduct && (
        <Modal open={open} onClose={() => setOpen(false)}>
          <Box
            style={{
              background: "white",
              padding: "20px",
              margin: "auto",
              marginTop: "10%",
              width: "50%",
              borderRadius: "8px",
            }}
          >
            <Typography variant="h5">עריכת מוצר</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="שם מוצר"
                  fullWidth
                  value={editProduct.product_name}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      product_name: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="תיאור"
                  fullWidth
                  value={editProduct.description}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      description: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="מחיר"
                  type="number"
                  fullWidth
                  value={editProduct.price}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      price: parseFloat(e.target.value),
                    })
                  }
                />
              </Grid>
            </Grid>
            <Button
              variant="contained"
              color="primary"
              onClick={saveProduct}
              style={{ marginTop: "20px" }}
            >
              שמור שינויים
            </Button>
          </Box>
        </Modal>
      )}
    </div>
  );
};

export default ProductManagement;