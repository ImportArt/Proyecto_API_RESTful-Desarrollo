// server.js
// Punto de entrada: carga las variables de entorno, conecta la base de datos
// y levanta el servidor Express.
require('dotenv').config({ quiet: true });

const app = require('./app');
const conectarDB = require('./config/db');

// Verifica que existan las variables obligatorias del archivo .env
const variablesObligatorias = ['MONGO_URI', 'JWT_SECRET'];
const faltantes = variablesObligatorias.filter((nombre) => !process.env[nombre]);
if (faltantes.length > 0) {
  console.error(`Faltan variables en el archivo .env: ${faltantes.join(', ')}`);
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

conectarDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
});
