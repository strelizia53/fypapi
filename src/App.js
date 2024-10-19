// src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./login";
import Register from "./register";
import Home from "./home";
import History from "./history";

function App() {
  return (
    <Routes>
      {/* Redirect from '/' to 'login' */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Define your routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/history" element={<History />} />

      {/* Handle non-existent routes */}
      <Route path="*" element={<div>404: Page Not Found</div>} />
    </Routes>
  );
}

export default App;
