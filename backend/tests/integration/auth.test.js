// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../app');
const User = require('../../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../../model/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      User.findByUsernameOrEmail.mockResolvedValue([]);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue({ insertId: 1 });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'Usuario registrado exitosamente' });
    });

    it('should return error if user already exists', async () => {
      User.findByUsernameOrEmail.mockResolvedValue([{ id: 1, username: 'testuser' }]);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Usuario o email ya existe' });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword'
      };
      User.findByUsername.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken');

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token', 'mockToken');
      expect(response.body).toHaveProperty('user');
    });

    it('should return error for invalid credentials', async () => {
      User.findByUsername.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Credenciales inválidas' });
    });
  });
});