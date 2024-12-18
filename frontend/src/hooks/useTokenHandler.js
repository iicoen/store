import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiUrl from "../config.js";

const useTokenHandler = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const isTokenExpired = (token) => {
    if (!token) return true;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  };

  const refreshAccessToken = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/refresh-token`, {
        method: "POST",
        credentials: "include", // שולח Cookies כמו ה-Refresh Token
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.newAccessToken);
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      navigate("/login");
    }
  };

  const handleUserActivity = () => {
    if (isTokenExpired(token)) {
      refreshAccessToken();
    }
  };

  useEffect(() => {
    // מאזינים לפעילות המשתמש
    window.addEventListener("click", handleUserActivity);
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);

    return () => {
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
    };
  }, [token]);

  return null;
};

export default useTokenHandler;
