// models/User.js
// Esquema de Usuario
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true, // No se permiten dos usuarios con el mismo email
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'El email no tiene un formato válido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      select: false, // No se devuelve en las consultas por defecto
    },
  },
  { timestamps: true } // Agrega createdAt y updatedAt
);

module.exports = mongoose.model('User', userSchema);
