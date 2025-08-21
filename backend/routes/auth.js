const express = require('express');
const router = express.Router();
const AuthController = require('../controller/AuthController');
const authMiddleware = require('../middleware/auth');

// Registro
router.post('/register', AuthController.register);

// Login
router.post('/login', AuthController.login);

// Perfil del usuario
router.get('/profile', authMiddleware, AuthController.getProfile);

// Verificar si el usuario es admin
router.get('/check-admin', authMiddleware, AuthController.checkAdmin);

module.exports = router;
