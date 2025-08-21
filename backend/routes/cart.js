const express = require('express');
const router = express.Router();
const CartController = require('../controller/CartController');
const authMiddleware = require('../middleware/auth');

// Obtener carrito del usuario
router.get('/', authMiddleware, CartController.getCart);

// Obtener conteo de items del carrito
router.get('/count', authMiddleware, CartController.getCartCount);

// Agregar al carrito
router.post('/add', authMiddleware, CartController.addToCart);

// Actualizar cantidad en carrito
router.put('/:id', authMiddleware, CartController.updateCartItem);

// Eliminar del carrito
router.delete('/:id', authMiddleware, CartController.removeFromCart);

// Limpiar carrito
router.delete('/', authMiddleware, CartController.clearCart);

module.exports = router;
