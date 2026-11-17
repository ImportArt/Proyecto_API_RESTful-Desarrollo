// routes/orderRoutes.js
// Rutas de órdenes: todas están protegidas con el middleware JWT
const express = require('express');
const { proteger } = require('../middleware/authMiddleware');
const { crearOrden, devolverOrden } = require('../controllers/orderController');

const router = express.Router();

router.post('/', proteger, crearOrden);
router.put('/:id/return', proteger, devolverOrden);

module.exports = router;
