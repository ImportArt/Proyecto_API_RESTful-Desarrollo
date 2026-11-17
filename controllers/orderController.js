// controllers/orderController.js
// Lógica transaccional: crear una orden (descuenta stock) y devolverla (restaura stock).
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Error con código HTTP para responder al cliente
const crearError = (status, mensaje) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

// POST /api/orders
const crearOrden = async (req, res) => {
  const { items } = req.body || {};

  // 1. Validación de la petición
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ mensaje: 'Debes enviar "items" con al menos un producto' });
  }

  // Agrupa productos repetidos sumando sus cantidades
  const cantidades = new Map();
  for (const item of items) {
    if (!item || !mongoose.isValidObjectId(item.producto)) {
      return res.status(400).json({ mensaje: 'Cada item debe tener un "producto" con un ID válido' });
    }
    if (!Number.isInteger(item.cantidad) || item.cantidad < 1) {
      return res.status(400).json({ mensaje: 'Cada item debe tener una "cantidad" entera mayor que 0' });
    }
    const id = String(item.producto);
    cantidades.set(id, (cantidades.get(id) || 0) + item.cantidad);
  }

  // Productos a los que ya se les descontó stock (para revertir si algo falla)
  const descontados = [];

  try {
    // 2. Descuenta el stock de cada producto de forma atómica:
    //    solo se actualiza si el stock actual alcanza la cantidad pedida.
    for (const [productoId, cantidad] of cantidades) {
      const producto = await Product.findOneAndUpdate(
        { _id: productoId, stock: { $gte: cantidad } },
        { $inc: { stock: -cantidad } },
        { new: true }
      );

      if (!producto) {
        const existe = await Product.findById(productoId);
        if (!existe) {
          throw crearError(404, `Producto no encontrado: ${productoId}`);
        }
        throw crearError(
          400,
          `Stock insuficiente para "${existe.nombre}". Disponible: ${existe.stock}, solicitado: ${cantidad}`
        );
      }

      descontados.push({ producto: producto._id, cantidad, precioUnitario: producto.precio });
    }

    // 3. Calcula el total y registra la orden
    const total = descontados.reduce((suma, i) => suma + i.cantidad * i.precioUnitario, 0);

    const orden = await Order.create({
      usuario: req.usuario._id,
      items: descontados,
      total: Math.round(total * 100) / 100,
      estado: 'completada',
    });

    await orden.populate('items.producto', 'nombre precio stock');

    return res.status(201).json({ mensaje: 'Orden creada correctamente', orden });
  } catch (error) {
    // 4. Si algo falló, devuelve el stock que ya se había descontado
    for (const item of descontados) {
      await Product.updateOne({ _id: item.producto }, { $inc: { stock: item.cantidad } });
    }
    if (error.status) {
      return res.status(error.status).json({ mensaje: error.message });
    }
    return res.status(500).json({ mensaje: 'Error al crear la orden' });
  }
};

// PUT /api/orders/:id/return
const devolverOrden = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ mensaje: 'ID de orden no válido' });
  }

  // Productos a los que ya se les devolvió stock (para revertir si algo falla)
  const restaurados = [];
  let orden;

  try {
    // 1. Cambia el estado a "devuelta" solo si la orden es del usuario y sigue "completada".
    //    Al hacerlo en una sola operación se evita devolver dos veces la misma orden.
    orden = await Order.findOneAndUpdate(
      { _id: id, usuario: req.usuario._id, estado: 'completada' },
      { estado: 'devuelta', fechaDevolucion: new Date() },
      { new: true }
    );

    if (!orden) {
      const existe = await Order.findOne({ _id: id, usuario: req.usuario._id });
      if (!existe) {
        return res.status(404).json({ mensaje: 'Orden no encontrada' });
      }
      return res.status(400).json({ mensaje: 'La orden ya fue devuelta' });
    }

    // 2. Restaura el stock de cada producto de la orden
    for (const item of orden.items) {
      await Product.updateOne({ _id: item.producto }, { $inc: { stock: item.cantidad } });
      restaurados.push(item);
    }

    await orden.populate('items.producto', 'nombre precio stock');

    return res.status(200).json({ mensaje: 'Orden devuelta correctamente. Stock restaurado', orden });
  } catch (error) {
    // 3. Si algo falló, deja todo como estaba
    if (orden) {
      for (const item of restaurados) {
        await Product.updateOne({ _id: item.producto }, { $inc: { stock: -item.cantidad } });
      }
      await Order.updateOne({ _id: orden._id }, { estado: 'completada', $unset: { fechaDevolucion: 1 } });
    }
    return res.status(500).json({ mensaje: 'Error al devolver la orden' });
  }
};

module.exports = { crearOrden, devolverOrden };
