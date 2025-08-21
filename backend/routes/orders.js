const express = require('express');
const router = express.Router();
const OrderController = require('../controller/OrderController');
const authMiddleware = require('../middleware/auth');

// Crear orden
router.post('/', authMiddleware, OrderController.createOrder);

// Obtener órdenes del usuario
router.get('/', authMiddleware, OrderController.getUserOrders);

// Obtener orden específica
router.get('/:id', authMiddleware, OrderController.getOrderById);

module.exports = router;
