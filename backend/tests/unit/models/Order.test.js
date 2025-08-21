// tests/unit/models/Order.test.js
const pool = require('../../../config/database');
const { Order, OrderItem } = require('../../../model/Order');

jest.mock('../../../config/database');

describe('Order Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Order.create', () => {
    it('should create a new order', async () => {
      const orderData = { user_id: 1, total: 100 };
      const mockResult = { insertId: 1 };
      pool.execute.mockResolvedValue([mockResult]);

      const result = await Order.create(orderData);

      expect(pool.execute).toHaveBeenCalledWith(
        'INSERT INTO orders (user_id, total) VALUES (?, ?)',
        [1, 100]
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('Order.findByUserId', () => {
    it('should find orders by user ID with JSON string items', async () => {
      const mockOrders = [
        { id: 1, user_id: 1, total: 100, items: '[{"product_id":1,"quantity":2}]' }
      ];
      pool.execute.mockResolvedValue([mockOrders]);

      const result = await Order.findByUserId(1);

      expect(pool.execute).toHaveBeenCalledWith(expect.stringContaining('SELECT o.*'), [1]);
      expect(result).toBeInstanceOf(Array);
      expect(result[0].items).toEqual([{"product_id":1,"quantity":2}]);
    });

    it('should handle orders with array items', async () => {
      const mockOrders = [
        { id: 1, user_id: 1, total: 100, items: [{"product_id":1,"quantity":2}] }
      ];
      pool.execute.mockResolvedValue([mockOrders]);

      const result = await Order.findByUserId(1);

      expect(result[0].items).toEqual([{"product_id":1,"quantity":2}]);
    });

    it('should handle orders with single item object', async () => {
      const mockOrders = [
        { id: 1, user_id: 1, total: 100, items: {"product_id":1,"quantity":2} }
      ];
      pool.execute.mockResolvedValue([mockOrders]);

      const result = await Order.findByUserId(1);

      expect(result[0].items).toEqual([{"product_id":1,"quantity":2}]);
    });

    it('should handle orders with invalid JSON items', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockOrders = [
        { id: 1, user_id: 1, total: 100, items: 'invalid json' }
      ];
      pool.execute.mockResolvedValue([mockOrders]);

      const result = await Order.findByUserId(1);

      expect(result[0].items).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Error parsing order items:', expect.any(Error), 'invalid json');
      
      consoleSpy.mockRestore();
    });

    it('should filter out null items from LEFT JOIN', async () => {
      const mockOrders = [
        { id: 1, user_id: 1, total: 100, items: [{"product_id":1,"quantity":2}, null, {"product_id":null}] }
      ];
      pool.execute.mockResolvedValue([mockOrders]);

      const result = await Order.findByUserId(1);

      expect(result[0].items).toEqual([{"product_id":1,"quantity":2}]);
    });
  });

  describe('Order.findByIdAndUserId', () => {
    it('should find order by ID and user ID', async () => {
      const mockOrderItems = [
        { order_id: 1, product_id: 1, quantity: 2, price: 50 }
      ];
      pool.execute.mockResolvedValue([mockOrderItems]);

      const result = await Order.findByIdAndUserId(1, 1);

      expect(pool.execute).toHaveBeenCalledWith(expect.stringContaining('SELECT o.*'), [1, 1]);
      expect(result).toEqual(mockOrderItems);
    });
  });

  describe('OrderItem.create', () => {
    it('should create a new order item', async () => {
      const itemData = { order_id: 1, product_id: 1, quantity: 2, price: 50 };
      const mockResult = { insertId: 1 };
      pool.execute.mockResolvedValue([mockResult]);

      const result = await OrderItem.create(itemData);

      expect(pool.execute).toHaveBeenCalledWith(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [1, 1, 2, 50]
      );
      expect(result).toEqual(mockResult);
    });
  });
});