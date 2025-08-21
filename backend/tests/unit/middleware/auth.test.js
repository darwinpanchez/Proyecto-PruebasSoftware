// tests/unit/middleware/auth.test.js
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../../middleware/auth');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
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

  it('should call next with valid token', () => {
    req.header.mockReturnValue('Bearer validToken');
    jwt.verify.mockReturnValue({ userId: 1 });

    authMiddleware(req, res, next);

    expect(req.userId).toBe(1);
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if no token provided', () => {
    req.header.mockReturnValue(undefined);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token requerido' });
  });

  it('should return 401 if token is invalid', () => {
    req.header.mockReturnValue('Bearer invalidToken');
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido' });
  });
});