const express = require('express');
const router = express.Router();
const ProductController = require('../controller/ProductController');
const adminMiddleware = require('../middleware/adminAuth');
const upload = require('../config/multer');

// Obtener todos los productos
router.get('/', ProductController.getAllProducts);

// Obtener producto por ID
router.get('/:id', ProductController.getProductById);

// Agregar producto (solo admin) - con subida de imagen
router.post('/', adminMiddleware, upload.single('image'), ProductController.createProduct);

// Actualizar producto (solo admin) - con subida de imagen opcional
router.put('/:id', adminMiddleware, upload.single('image'), ProductController.updateProduct);

// Eliminar producto (solo admin)
router.delete('/:id', adminMiddleware, ProductController.deleteProduct);

module.exports = router;
