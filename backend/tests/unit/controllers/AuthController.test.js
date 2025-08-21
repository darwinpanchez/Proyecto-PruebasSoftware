// tests/unit/controllers/AuthController.test.js
const AuthController = require('../../../controller/AuthController');
const User = require('../../../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../../../model/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      req.body = { username: 'testuser', email: 'test@example.com', password: 'password123' };
      User.findByUsernameOrEmail.mockResolvedValue([]);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue({ insertId: 1 });

      await AuthController.register(req, res);

      expect(User.findByUsernameOrEmail).toHaveBeenCalledWith('testuser', 'test@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(User.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario registrado exitosamente' });
    });

    it('should return error if user already exists', async () => {
      req.body = { username: 'existinguser', email: 'existing@example.com', password: 'password123' };
      User.findByUsernameOrEmail.mockResolvedValue([{ id: 1, username: 'existinguser' }]);

      await AuthController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario o email ya existe' });
    });

    it('should handle server errors', async () => {
      req.body = { username: 'testuser', email: 'test@example.com', password: 'password123' };
      User.findByUsernameOrEmail.mockRejectedValue(new Error('DB error'));

      await AuthController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error en el servidor' });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      req.body = { username: 'testuser', password: 'password123' };
      const mockUser = { id: 1, username: 'testuser', password: 'hashedPassword' };
      User.findByUsername.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken');

      await AuthController.login(req, res);

      expect(User.findByUsername).toHaveBeenCalledWith('testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        token: 'mockToken',
        user: {
          id: 1,
          username: 'testuser',
          email: undefined
        }
      });
    });

    it('should return error for invalid credentials - user not found', async () => {
      req.body = { username: 'nonexistent', password: 'password123' };
      User.findByUsername.mockResolvedValue(null);

      await AuthController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Credenciales inválidas' });
    });

    it('should return error for invalid credentials - wrong password', async () => {
      req.body = { username: 'testuser', password: 'wrongpassword' };
      const mockUser = { id: 1, username: 'testuser', password: 'hashedPassword' };
      User.findByUsername.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await AuthController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Credenciales inválidas' });
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      req.userId = 1;
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
      User.findById.mockResolvedValue(mockUser);

      await AuthController.getProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return error if user not found', async () => {
      req.userId = 999;
      User.findById.mockResolvedValue(null);

      await AuthController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });

    it('should handle database errors', async () => {
      req.userId = 1;
      User.findById.mockRejectedValue(new Error('DB error'));

      await AuthController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error en el servidor' });
    });
  });

  describe('checkAdmin', () => {
    it('should return true for admin user', async () => {
      req.userId = 1;
      const mockUser = { id: 1, username: 'Admin', email: 'admin@example.com' };
      User.findById.mockResolvedValue(mockUser);

      await AuthController.checkAdmin(req, res);

      expect(res.json).toHaveBeenCalledWith({
        isAdmin: true,
        user: {
          id: 1,
          username: 'Admin',
          email: 'admin@example.com'
        }
      });
    });

    it('should return false for non-admin user', async () => {
      req.userId = 2;
      const mockUser = { id: 2, username: 'regularuser', email: 'user@example.com' };
      User.findById.mockResolvedValue(mockUser);

      await AuthController.checkAdmin(req, res);

      expect(res.json).toHaveBeenCalledWith({
        isAdmin: false,
        user: {
          id: 2,
          username: 'regularuser',
          email: 'user@example.com'
        }
      });
    });

    it('should return error if user not found', async () => {
      req.userId = 999;
      User.findById.mockResolvedValue(null);

      await AuthController.checkAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });

    it('should handle database errors', async () => {
      req.userId = 1;
      User.findById.mockRejectedValue(new Error('DB error'));

      await AuthController.checkAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error en el servidor' });
    });
  });
});