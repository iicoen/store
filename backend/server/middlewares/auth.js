const jwt = require("jsonwebtoken");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../process.env') });

const SECRET_KEY = process.env.SECRET_KEY;

function authenticateToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
            console.log("Token is missing");
            return res.status(401).json({ message: "Unauthorized" });
          }

  jwt.verify(token, SECRET_KEY, (err, user) => {
     if (err) {
      console.log("Token verification failed:", err);
      return res.status(403).json({ message: "Forbidden" });
    }

    console.log("User from token:", user); // לוג לבדיקה
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
