import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useTokenExpirationWatcher = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));
    const timeUntilExpiration = payload.exp * 1000 - Date.now();

    if (timeUntilExpiration <= 0) {
      navigate("/login");
    } else {
      const timeoutId = setTimeout(() => navigate("/login"), timeUntilExpiration);

      return () => clearTimeout(timeoutId);
    }
  }, [token, navigate]);

  return null;
};

export default useTokenExpirationWatcher;
