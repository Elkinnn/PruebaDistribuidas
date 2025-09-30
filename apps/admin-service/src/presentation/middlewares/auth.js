const { verify } = require('../../infrastructure/auth/jwt');

function auth(req, res, next) {
  const hdr = req.header('Authorization') || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Falta token' });
  try {
    req.user = verify(token);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token inválido' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Permisos insuficientes' });
    }
    next();
  };
}

module.exports = { auth, requireRole };
