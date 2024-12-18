import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import Online from './components/Online';
import AdminPanel from './components/AdminPanel';
import OrderPage from './components/OrderPage';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import PreviousInvoices from './components/PreviousInvoices';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/online" element={<Online />} />
        <Route path="/adminPanel" element={<AdminPanel />} />
        <Route path="/orderPage" element={<OrderPage />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        {/* <Route path="/reset-password" element={<ResetPassword />} /> */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/previousInvoices" element={<PreviousInvoices />} />

      </Routes>
    </Router>
  );
}

export default App;
