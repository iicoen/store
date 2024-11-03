import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import Online from './components/Online';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/online" element={<Online />} />
      </Routes>
    </Router>
  );
}

export default App;
