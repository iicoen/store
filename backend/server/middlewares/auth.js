const jwt = require("jsonwebtoken");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../process.env') });

const SECRET_KEY = process.env.SECRET_KEY;
// let num = 0;
function authenticateToken(req, res, next) {
  // num++;
  // console.log(num);

  const token = req.headers["authorization"]?.split(" ")[1];

  
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
     if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
