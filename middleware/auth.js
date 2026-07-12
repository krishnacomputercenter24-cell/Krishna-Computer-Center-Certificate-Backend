const jwt   = require('jsonwebtoken');
const Admin = require('../models/Admin');

module.exports = async (req, res, next) => {
  try {
    const h = req.headers.authorization;
    if (!h?.startsWith('Bearer ')) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET);
    const admin   = await Admin.findById(decoded.id).select('-password');
    if (!admin) return res.status(401).json({ message: 'Invalid token' });
    req.admin = admin;
    next();
  } catch {
    res.status(401).json({ message: 'Token expired or invalid' });
  }
};
