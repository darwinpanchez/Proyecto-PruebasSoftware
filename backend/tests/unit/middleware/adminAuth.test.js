// tests/unit/middleware/adminAuth.test.js
const jwt = require('jsonwebtoken');
const User = require('../../../model/User');
const adminMiddleware = require('../../../middleware/adminAuth');

jest.mock('jsonwebtoken');
jest.mock('../../../model/User');

describe('Admin Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next for admin user', async () => {
    req.header.mockReturnValue('Bearer validToken');
    jwt.verify.mockReturnValue({ userId: 1 });
    const mockUser = { id: 1, username: 'Admin' };
    User.findById.mockResolvedValue(mockUser);

    await adminMiddleware(req, res, next);

    expect(req.userId).toBe(1);
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if no token provided', async () => {
    req.header.mockReturnValue(undefined);

    await adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token requerido' });
  });

  it('should return 401 if token is invalid', async () => {
    req.header.mockReturnValue('Bearer invalidToken');
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido' });
  });

  it('should return 401 if user not found', async () => {
    req.header.mockReturnValue('Bearer validToken');
    jwt.verify.mockReturnValue({ userId: 999 });
    User.findById.mockResolvedValue(null);

    await adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
  });

  it('should return 403 for non-admin user', async () => {
    req.header.mockReturnValue('Bearer validToken');
    jwt.verify.mockReturnValue({ userId: 2 });
    const mockUser = { id: 2, username: 'regularuser' };
    User.findById.mockResolvedValue(mockUser);

    await adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Acceso denegado. Solo administradores pueden realizar esta acción'
    });
  });
});