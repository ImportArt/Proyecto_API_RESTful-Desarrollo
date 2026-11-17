// seed.js
// Carga productos de prueba en la base de datos para poder crear órdenes.
// Uso: npm run seed
require('dotenv').config({ quiet: true });

const mongoose = require('mongoose');
const Product = require('./models/Product');

const productos = [
  { nombre: 'Teclado mecánico', descripcion: 'Teclado mecánico con switches azules', precio: 150, stock: 10 },
  { nombre: 'Mouse inalámbrico', descripcion: 'Mouse óptico inalámbrico 1600 DPI', precio: 60, stock: 25 },
  { nombre: 'Monitor 24 pulgadas', descripcion: 'Monitor Full HD de 24 pulgadas', precio: 650, stock: 5 },
];

const cargarProductos = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany(); // Limpia productos anteriores
    const creados = await Product.insertMany(productos);

    console.log('Productos cargados. Usa estos _id para crear órdenes:');
    creados.forEach((p) => {
      console.log(`- ${p._id}  ${p.nombre}  (precio: ${p.precio}, stock: ${p.stock})`);
    });
  } catch (error) {
    console.error('Error al cargar productos:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

cargarProductos();
