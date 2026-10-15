const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'diafit-ai-dev-secret-key-2024-change-in-production';
    const decoded = jwt.verify(token, jwtSecret);
    let user = null;
    try {
      user = await User.findById(decoded.id).select('-password');
    } catch (e) {}

    // Stateless serverless resilience: recover authenticated user directly from verified token
    if (!user && decoded.email) {
      const { makeDocInstance, users } = require('../config/memoryStore');
      user = makeDocInstance({
        _id: decoded.id || decoded._id,
        email: decoded.email,
        firstName: decoded.firstName || 'Patient',
        lastName: decoded.lastName || '',
        role: decoded.role || 'patient',
        phone: decoded.phone || '',
        profile: decoded.profile || {},
        patientInfo: decoded.patientInfo || {}
      });
      if (!users.some(u => u.email === user.email)) {
        users.push(user);
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      const jwtSecret = process.env.JWT_SECRET || 'diafit-ai-dev-secret-key-2024-change-in-production';
      const decoded = jwt.verify(token, jwtSecret);
      let user = null;
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (e) {}

      if (!user && decoded.email) {
        const { makeDocInstance } = require('../config/memoryStore');
        user = makeDocInstance({
          _id: decoded.id || decoded._id,
          email: decoded.email,
          firstName: decoded.firstName || 'Patient',
          lastName: decoded.lastName || '',
          role: decoded.role || 'patient',
          phone: decoded.phone || '',
          profile: decoded.profile || {},
          patientInfo: decoded.patientInfo || {}
        });
      }
      req.user = user;
    }
  } catch (error) {
    req.user = null;
  }
  next();
};

module.exports = { protect, optionalAuth };

