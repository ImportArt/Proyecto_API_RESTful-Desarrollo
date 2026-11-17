// config/db.js
// Conexión a MongoDB usando Mongoose. La URI se lee del archivo .env
const mongoose = require('mongoose');

const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB conectado correctamente');
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error.message);
    process.exit(1); // Detiene el servidor si no hay base de datos
  }
};

module.exports = conectarDB;
