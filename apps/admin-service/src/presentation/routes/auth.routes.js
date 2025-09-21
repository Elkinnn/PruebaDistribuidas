const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { sign } = require('../../infrastructure/auth/jwt');
const users = require('../../infrastructure/persistence/usuario.repo');

const router = Router();

/* POST /auth/login  { email, password } */
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'email y password son requeridos' });
  }
  const user = await users.findByEmail(email);
  if (!user) return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Credenciales inválidas' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Credenciales inválidas' });

  const token = sign({ id: user.id, email: user.email, rol: user.rol });
  res.json({ token, user: { id: user.id, email: user.email, rol: user.rol } });
});

module.exports = router;
