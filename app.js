// app.js
// Configuración de Express: middlewares globales, rutas y manejo de errores.
const express = require('express');

const app = express();

// Permite leer cuerpos de petición en formato JSON

app.use(express.json());

// Rutas de la API

app.use('/api/auth', require('./routes/authRoutes'));

// Ruta no encontrada (404)
app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Manejador general de errores
app.use((err, req, res, next) => {
  // JSON mal escrito en el cuerpo de la petición
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la petición no es un JSON válido' });
  }
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

module.exports = app;
