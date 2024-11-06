import React, { useState } from "react";
import ProductManagement from "./ProductManagement";
import CustomerManagement from "./CustomerManagement";
import OrderManagement from "./OrderManagement";
import Reports from "./Reports";

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
            </nav>
            <div>{renderSection()}</div>
        </div>
    );
};

export default AdminPanel;
