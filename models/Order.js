// models/Order.js
// Esquema de Orden (compra). Se relaciona con User y Product mediante ObjectId.
const mongoose = require('mongoose');

// Cada elemento de la orden: qué producto, cuántas unidades y a qué precio
const itemSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Referencia a la colección de productos
      required: [true, 'El producto es obligatorio'],
    },
    cantidad: {
      type: Number,
      required: [true, 'La cantidad es obligatoria'],
      min: [1, 'La cantidad mínima es 1'],
      validate: {
        validator: Number.isInteger,
        message: 'La cantidad debe ser un número entero',
      },
    },
    precioUnitario: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Referencia al usuario que compra
      required: [true, 'El usuario es obligatorio'],
    },
    items: {
      type: [itemSchema],
      validate: {
        validator: (items) => items.length > 0,
        message: 'La orden debe tener al menos un producto',
      },
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    estado: {
      type: String,
      enum: {
        values: ['completada', 'devuelta'],
        message: 'Estado no válido',
      },
      default: 'completada',
    },
    fechaDevolucion: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
