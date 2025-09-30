const jwt = require('jsonwebtoken');

function sign(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev', {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
}

function verify(token) {
  return jwt.verify(token, process.env.JWT_SECRET || 'dev');
}

module.exports = { sign, verify };
