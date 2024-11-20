import React, { useState, useEffect } from "react";
import axios from "axios";
import apiUrl from "../config.js";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // מצב לאחסון הקטגוריות
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    quantity: "",
    category_id: "", // מזהה קטגוריה שנבחרה
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories(); // שליפת קטגוריות
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

  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`${apiUrl}/api/products/${productId}`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product", error);
    }
  };

  return (
    <div>
                  <h2>הוספת מוצר</h2>
                 {" "}
      <input
        type="text"
        placeholder="שם מוצר"
        value={newProduct.name}
        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
      />
                 {" "}
      <input
        type="number"
        placeholder="מחיר"
        value={newProduct.price}
        onChange={(e) =>
          setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })
        }
      />
                 {" "}
      <input
        type="text"
        placeholder="תיאור"
        value={newProduct.description}
        onChange={(e) =>
          setNewProduct({ ...newProduct, description: e.target.value })
        }
      />
                 {" "}
      <input
        type="number"
        placeholder="כמות במלאי"
        value={newProduct.quantity}
        onChange={(e) =>
          setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) })
        }
      />
                  {/* שדה בחירת קטגוריה */}           {" "}
      <select
        value={newProduct.category_id}
        onChange={(e) =>
          setNewProduct({ ...newProduct, category_id: e.target.value })
        }
      >
                        <option value="">בחר קטגוריה</option>               {" "}
        {categories.map((category) => (
          <option key={category.category_id} value={category.category_id}>
                                    {category.category_name}                   {" "}
          </option>
        ))}
                   {" "}
      </select>
                  <button onClick={addProduct}>הוסף מוצר</button>           {" "}
      <h3>עריכה למוצרים קיימים:</h3>           {" "}
      <ul>
                       {" "}
        {products.map((product) => (
          <li key={product.product_id}>
                                    {product.product_name} - {product.price} ₪  
                                 {" "}
            <button onClick={() => deleteProduct(product.product_id)}>
              מחק
            </button>
                               {" "}
          </li>
        ))}
                   {" "}
      </ul>
             {" "}
    </div>
  );
};

export default ProductManagement;
