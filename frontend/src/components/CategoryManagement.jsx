import React, { useState } from 'react';
import axios from 'axios';
import apiUrl from '../config.js';
const CategoryManagement = () => {
    const [categoryName, setCategoryName] = useState('');

    const handleAddCategory = async () => {
        try {
            await axios.post(`${apiUrl}/api/categories`, { category_name: categoryName });
            alert('קטגוריה נוספה בהצלחה!');
            setCategoryName('');
        } catch (error) {
            console.error('שגיאה בהוספת קטגוריה:', error);
            alert('שגיאה בהוספת קטגוריה.');
        }
    };

    return (
        <div>
            <h2>הוספת קטגוריה חדשה</h2>
            <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="שם קטגוריה"
            />
            <button onClick={handleAddCategory}>הוסף קטגוריה</button>
        </div>
    );
};

export default CategoryManagement;
