const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  console.log('Auth Headers:', req.headers);
  const authHeader = req.headers['authorization'];
  console.log('Auth Header:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Token:', token);

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(403).json({ error: 'Invalid token' });
    }

    console.log('Decoded user:', user);
    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken
}; 