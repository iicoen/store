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
  Tabs,
  Tab,
  Autocomplete,
} from "@mui/material";


const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    quantity: "",
    category_id: "",
  });
  const [editProduct, setEditProduct] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);

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
    setOpenModal(true);
  };

  const saveProduct = async () => {
    try {
      await axios.put(
        `${apiUrl}/api/products/${editProduct.product_id}`,
        editProduct
      );
      fetchProducts();
      setOpenModal(false);
    } catch (error) {
      console.error("Error updating product", error);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`${apiUrl}/api/products/${productId}`);
      fetchProducts();
      setOpenModal(false);
    } catch (error) {
      console.error("Error deleting product", error);
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
      setOpenAddModal(false);
    } catch (error) {
      console.error("Error adding product", error);
    }
  };

  const filterProductsByCategory = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category_id === selectedCategory)
    : products;

  return (
    <div style={{ padding: "10px", fontSize: "0.9rem" }}>
      <Typography variant="h5" gutterBottom>
        ניהול מוצרים
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenAddModal(true)}
        style={{ marginBottom: "20px" }}
      >
        הוספת מוצר חדש
      </Button>

      <Tabs
        value={selectedCategory}
        onChange={(e, newValue) => filterProductsByCategory(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="כל המוצרים" value="" />
        {categories.map((category) => (
          <Tab
            key={category.category_id}
            label={category.category_name}
            value={category.category_id}
          />
        ))}
      </Tabs>

      <Grid container spacing={2} style={{ marginTop: "20px" }}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.product_id}>
            <Card>
            {/* <Card style={{ width: "200px", height: "150px" }}> */}
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

      {/* חלון הוספת מוצר */}
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
          <Typography variant="h5">הוספת מוצר חדש</Typography>
          <Grid container spacing={0.5}>
            <Grid item xs={12}>
              <TextField
                label="שם מוצר"
                fullWidth
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="מחיר"
                type="number"
                fullWidth
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
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
            <Grid item xs={12}>
              <TextField
                label="כמות במלאי"
                type="number"
                fullWidth
                value={newProduct.quantity}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, quantity: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              {/* <TextField
                select
                fullWidth
                label="קטגוריה"
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
              </TextField> */}

              <Autocomplete
  options={categories}
  getOptionLabel={(option) => option.category_name}
  onChange={(event, newValue) =>{
    setNewProduct({ ...newProduct, category_id: newValue?.category_id || "" })
  }
  
  }
  renderInput={(params) => <TextField {...params} label="קטגוריה" fullWidth />}
/>

            </Grid>
          </Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={addProduct}
            style={{ marginTop: "20px" }}
          >
            שמור
          </Button>
        </Box>
      </Modal>

      {/* חלון עריכה */}
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
          <Typography variant="h5">עריכת מוצר</Typography>
          {editProduct && (
            <>
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
                    label="מחיר"
                    type="number"
                    fullWidth
                    value={editProduct.price}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        price: e.target.value,
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
                שמור
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => deleteProduct(editProduct.product_id)}
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

export default ProductManagement;
