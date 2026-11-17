// middleware/authMiddleware.js
// Protege rutas privadas: exige un token JWT válido en el header Authorization.
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const proteger = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. El header debe existir y tener el formato "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Acceso denegado: token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  // 2. Verifica la firma y la expiración del token con la clave secreta
  let decodificado;
  try {
    decodificado = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }

  // 3. Comprueba que el usuario del token todavía exista
  try {
    const usuario = await User.findById(decodificado.id);
    if (!usuario) {
      return res.status(401).json({ mensaje: 'El usuario del token ya no existe' });
    }
    req.usuario = usuario; // Queda disponible para el controlador
    next();
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al verificar el usuario' });
  }
};

module.exports = { proteger };
