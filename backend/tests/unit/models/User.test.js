// tests/unit/models/User.test.js
const pool = require('../../../config/database');
const User = require('../../../model/User');

jest.mock('../../../config/database');

describe('User Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUsername', () => {
    it('should find user by username', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      pool.execute.mockResolvedValue([[mockUser]]);

      const result = await User.findByUsername('testuser');

      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE username = ?',
        ['testuser']
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      pool.execute.mockResolvedValue([[mockUser]]);

      const result = await User.findByEmail('test@example.com');

      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ?',
        ['test@example.com']
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = { username: 'testuser', email: 'test@example.com', password: 'hashedPassword' };
      const mockResult = { insertId: 1 };
      pool.execute.mockResolvedValue([mockResult]);

      const result = await User.create(userData);

      expect(pool.execute).toHaveBeenCalledWith(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        ['testuser', 'test@example.com', 'hashedPassword']
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('findByUsernameOrEmail', () => {
    it('should find users by username or email', async () => {
      const mockUsers = [
        { id: 1, username: 'testuser', email: 'test@example.com' },
        { id: 2, username: 'admin', email: 'admin@example.com' }
      ];
      pool.execute.mockResolvedValue([mockUsers]);

      const result = await User.findByUsernameOrEmail('testuser', 'test@example.com');

      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        ['testuser', 'test@example.com']
      );
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      pool.execute.mockResolvedValue([[mockUser]]);

      const result = await User.findById(1);

      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT id, username, email, created_at FROM users WHERE id = ?',
        [1]
      );
      expect(result).toEqual(mockUser);
    });
  });
});