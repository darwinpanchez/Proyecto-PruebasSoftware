// tests/unit/controllers/OrderController.test.js
const OrderController = require('../../../controller/OrderController');
const pool = require('../../../config/database');
const Cart = require('../../../model/Cart');
const { Order, OrderItem } = require('../../../model/Order');

jest.mock('../../../config/database');
jest.mock('../../../model/Cart');
jest.mock('../../../model/Order');

describe('OrderController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      userId: 1
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      const mockConnection = {
        beginTransaction: jest.fn().mockResolvedValue(),
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue(),
        release: jest.fn()
      };
      pool.getConnection.mockResolvedValue(mockConnection);
      
      const mockCartItems = [
        { product_id: 1, quantity: 2, price: 100 },
        { product_id: 2, quantity: 1, price: 200 }
      ];
      Cart.findByUserId.mockResolvedValue(mockCartItems);
      
      Order.create.mockResolvedValue({ insertId: 1 });
      
      await OrderController.createOrder(req, res);

      expect(pool.getConnection).toHaveBeenCalled();
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(Cart.findByUserId).toHaveBeenCalledWith(1);
      expect(Order.create).toHaveBeenCalledWith({
        user_id: 1,
        total: 400 // (2*100 + 1*200)
      });
      expect(OrderItem.create).toHaveBeenCalledTimes(2);
      expect(Cart.clearByUserId).toHaveBeenCalledWith(1);
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Orden creada exitosamente',
        orderId: 1,
        total: 400
      });
    });

    it('should return error for empty cart', async () => {
      const mockConnection = {
        beginTransaction: jest.fn().mockResolvedValue(),
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue(),
        release: jest.fn()
      };
      pool.getConnection.mockResolvedValue(mockConnection);
      
      Cart.findByUserId.mockResolvedValue([]);
      
      await OrderController.createOrder(req, res);

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'El carrito está vacío' });
    });

    it('should handle server errors', async () => {
      const mockConnection = {
        beginTransaction: jest.fn().mockResolvedValue(),
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue(),
        release: jest.fn()
      };
      pool.getConnection.mockResolvedValue(mockConnection);
      
      Cart.findByUserId.mockRejectedValue(new Error('DB error'));
      
      await OrderController.createOrder(req, res);

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al crear orden' });
    });
  });

  describe('getUserOrders', () => {
    it('should get user orders successfully', async () => {
      const mockOrders = [{ id: 1, total: 100 }];
      Order.findByUserId.mockResolvedValue(mockOrders);

      await OrderController.getUserOrders(req, res);

      expect(Order.findByUserId).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });

    it('should handle server errors', async () => {
      Order.findByUserId.mockRejectedValue(new Error('DB error'));

      await OrderController.getUserOrders(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener órdenes' });
    });
  });

  describe('getOrderById', () => {
    it('should get order by id successfully', async () => {
      req.params = { id: 1 };
      const mockOrderItems = [{ order_id: 1, product_id: 1 }];
      Order.findByIdAndUserId.mockResolvedValue(mockOrderItems);

      await OrderController.getOrderById(req, res);

      expect(Order.findByIdAndUserId).toHaveBeenCalledWith(1, 1);
      expect(res.json).toHaveBeenCalledWith(mockOrderItems);
    });

    it('should return 404 if order not found', async () => {
      req.params = { id: 999 };
      Order.findByIdAndUserId.mockResolvedValue([]);

      await OrderController.getOrderById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Orden no encontrada' });
    });

    it('should handle server errors', async () => {
      req.params = { id: 1 };
      Order.findByIdAndUserId.mockRejectedValue(new Error('DB error'));

      await OrderController.getOrderById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener orden' });
    });
  });
});