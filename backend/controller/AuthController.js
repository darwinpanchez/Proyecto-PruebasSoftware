const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');

class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password } = req.body;
      
      // Verificar si el usuario ya existe
      const existingUsers = await User.findByUsernameOrEmail(username, email);
      
      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Usuario o email ya existe' });
      }
      
      // Hashear password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Crear usuario
      await User.create({ username, email, password: hashedPassword });
      
      res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;
      
      // Buscar usuario
      const user = await User.findByUsername(username);
      
      if (!user) {
        return res.status(400).json({ message: 'Credenciales inválidas' });
      }
      
      // Verificar password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Credenciales inválidas' });
      }
      
      // Generar token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET || 'your_jwt_secret_key_here',
        { expiresIn: '24h' }
      );
      
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }

  static async checkAdmin(req, res) {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      const isAdmin = user.username === 'Admin';
      res.json({ 
        isAdmin,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
}

module.exports = AuthController;
