const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'codeburger-dev-secret-change-in-prod';

function verifyToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.slice(7), SECRET);
  } catch {
    return null;
  }
}

module.exports = { verifyToken };
