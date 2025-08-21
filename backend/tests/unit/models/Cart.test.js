// tests/unit/models/Cart.test.js
const pool = require('../../../config/database');
const Cart = require('../../../model/Cart');

jest.mock('../../../config/database');

describe('Cart Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('should find cart items by user ID', async () => {
      const mockItems = [
        { id: 1, user_id: 1, product_id: 1, quantity: 2 },
        { id: 2, user_id: 1, product_id: 2, quantity: 1 }
      ];
      pool.execute.mockResolvedValue([mockItems]);

      const result = await Cart.findByUserId(1);

      expect(pool.execute).toHaveBeenCalledWith(`
      SELECT c.*, p.name, p.price, p.image 
      FROM cart c 
      JOIN products p ON c.product_id = p.id 
      WHERE c.user_id = ?
    `, [1]);
      expect(result).toEqual(mockItems);
    });
  });

  describe('findByUserAndProduct', () => {
    it('should find cart item by user and product', async () => {
      const mockItem = { id: 1, user_id: 1, product_id: 1, quantity: 2 };
      pool.execute.mockResolvedValue([[mockItem]]);

      const result = await Cart.findByUserAndProduct(1, 1);

      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
        [1, 1]
      );
      expect(result).toEqual(mockItem);
    });
  });

  describe('create', () => {
    it('should create a new cart item', async () => {
      const cartData = { user_id: 1, product_id: 1, quantity: 2 };
      const mockResult = { insertId: 1 };
      pool.execute.mockResolvedValue([mockResult]);

      const result = await Cart.create(cartData);

      expect(pool.execute).toHaveBeenCalledWith(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [1, 1, 2]
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateQuantity', () => {
    it('should update cart item quantity', async () => {
      const mockResult = { affectedRows: 1 };
      pool.execute.mockResolvedValue([mockResult]);

      const result = await Cart.updateQuantity(1, 1, 5);

      expect(pool.execute).toHaveBeenCalledWith(
        'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
        [5, 1, 1]
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteById', () => {
    it('should delete cart item by ID', async () => {
      const mockResult = { affectedRows: 1 };
      pool.execute.mockResolvedValue([mockResult]);

      const result = await Cart.deleteById(1, 1);

      expect(pool.execute).toHaveBeenCalledWith(
        'DELETE FROM cart WHERE id = ? AND user_id = ?',
        [1, 1]
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateQuantityById', () => {
    it('should update cart item quantity', async () => {
      const mockResult = { affectedRows: 1 };
      pool.execute.mockResolvedValue([mockResult]);

      const result = await Cart.updateQuantityById(1, 1, 3);

      expect(pool.execute).toHaveBeenCalledWith(
        'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
        [3, 1, 1]
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('clearByUserId', () => {
    it('should clear all cart items for user', async () => {
      const mockResult = { affectedRows: 2 };
      pool.execute.mockResolvedValue([mockResult]);

      const result = await Cart.clearByUserId(1);

      expect(pool.execute).toHaveBeenCalledWith(
        'DELETE FROM cart WHERE user_id = ?',
        [1]
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getCartCount', () => {
    it('should get cart item count', async () => {
      const mockResult = [{ count: 5 }];
      pool.execute.mockResolvedValue([mockResult]);

      const result = await Cart.getCartCount(1);

      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT COALESCE(SUM(quantity), 0) as count FROM cart WHERE user_id = ?',
        [1]
      );
      expect(result).toEqual(5);
    });
  });
});