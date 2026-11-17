// controllers/authController.js
// Registro e inicio de sesión de usuarios.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Crea un token JWT firmado con el id del usuario
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
};

// POST /api/auth/register
const registrar = async (req, res) => {
  try {
    const { nombre, email, password } = req.body || {};

    // Validación de datos de entrada
    if (typeof nombre !== 'string' || typeof email !== 'string' || typeof password !== 'string'
      || !nombre.trim() || !email.trim() || !password) {
      return res.status(400).json({ mensaje: 'nombre, email y password son obligatorios' });
    }
    if (password.length < 6) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // El email no puede estar repetido
    const existe = await User.findOne({ email: email.toLowerCase().trim() });
    if (existe) {
      return res.status(409).json({ mensaje: 'El email ya está registrado' });
    }

    // Hash de la contraseña con bcrypt (10 rondas de sal)
    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await User.create({ nombre, email, password: passwordHash });

    return res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email },
      token: generarToken(usuario._id),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ mensaje: 'El email ya está registrado' });
    }
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ mensaje: 'Datos no válidos', errores });
    }
    return res.status(500).json({ mensaje: 'Error al registrar el usuario' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({ mensaje: 'email y password son obligatorios' });
    }

    // Se pide el campo password explícitamente porque en el esquema tiene select: false
    const usuario = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    // Compara la contraseña escrita con el hash guardado
    const coincide = usuario ? await bcrypt.compare(password, usuario.password) : false;
    if (!coincide) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    return res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email },
      token: generarToken(usuario._id),
    });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al iniciar sesión' });
  }
};

module.exports = { registrar, login };
