import React, { useState, useEffect } from "react";
import axios from "axios";

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: "", price: 0, description: "", quantity: 0 });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get("/api/products");
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products", error);
        }
    };

    const addProduct = async () => {
        try {
            await axios.post("/api/products", newProduct);
            fetchProducts();
            setNewProduct({ name: "", price: 0, description: "", quantity: 0 });
        } catch (error) {
            console.error("Error adding product", error);
        }
    };

    const deleteProduct = async (productId) => {
        try {
            await axios.delete(`/api/products/${productId}`);
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product", error);
        }
    };

    return (
        <div>
            <h2>ניהול מוצרים</h2>
            <input
                type="text"
                placeholder="שם מוצר"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <input
                type="number"
                placeholder="מחיר"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
            />
            <input
                type="text"
                placeholder="תיאור"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            />
            <input
                type="number"
                placeholder="כמות במלאי"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) })}
            />
            <button onClick={addProduct}>הוסף מוצר</button>

            <h3>רשימת מוצרים</h3>
            <ul>
                {products.map((product) => (
                    <li key={product.product_id}>
                        {product.name} - {product.price} ₪
                        <button onClick={() => deleteProduct(product.product_id)}>מחק</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductManagement;