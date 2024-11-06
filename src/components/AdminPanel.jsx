import React, { useState } from "react";
import ProductManagement from "./ProductManagement";
import CustomerManagement from "./CustomerManagement";
import OrderManagement from "./OrderManagement";
import Reports from "./Reports";
import CategoryManagement from "./CategoryManagement"; // ייבוא רכיב ניהול קטגוריות

const AdminPanel = () => {
    const [selectedSection, setSelectedSection] = useState("products");

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
                case "categories": // הוספת מקרה לניהול קטגוריות
                return <CategoryManagement />;
            default:
                return <ProductManagement />;
        }
    };

    return (
        <div>
            <h1>ברוכים הבאים לממשק מנהל</h1>
            <nav>
                <button onClick={() => setSelectedSection("products")}>ניהול מוצרים</button>
                <button onClick={() => setSelectedSection("customers")}>ניהול לקוחות</button>
                <button onClick={() => setSelectedSection("orders")}>ניהול הזמנות</button>
                <button onClick={() => setSelectedSection("reports")}>דוחות</button>
                <button onClick={() => setSelectedSection("categories")}>ניהול קטגוריות</button> {/* כפתור לניהול קטגוריות */}

            </nav>
            <div>{renderSection()}</div>
        </div>
    );
};

export default AdminPanel;
