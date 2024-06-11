const jwt = require("jsonwebtoken");
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.SK, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token." });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.userJabatan = decoded.jabatan;
    req.userDivisi = decoded.divisi;
    req.userOperation = decoded.operation;
    req.userLevel = decoded.level;

    // Optionally, you can include user role in the request object
    next();
  });
};

module.exports = verifyToken;
