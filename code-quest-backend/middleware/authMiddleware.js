const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Load environment variables
require('dotenv').config(); // Make sure this is at the top if not already in server.js

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ Now using env secret
    const user = await User.findById(decoded.id).select('-password');
    if (!user) throw new Error();

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
