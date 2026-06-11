const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'codeburger-dev-secret-change-in-prod';

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação necessário.' });
  }
  try {
    req.user = jwt.verify(authHeader.slice(7), SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

module.exports = { requireAuth };
