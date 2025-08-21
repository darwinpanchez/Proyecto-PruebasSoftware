const pool = require('../config/database');
const Cart = require('../model/Cart');
const { Order, OrderItem } = require('../model/Order');

class OrderController {
  static async createOrder(req, res) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Obtener items del carrito
      const cartItems = await Cart.findByUserId(req.userId);
      
      if (cartItems.length === 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'El carrito está vacío' });
      }
      
      // Calcular total
      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Crear orden
      const orderResult = await Order.create({
        user_id: req.userId,
        total
      });
      
      const orderId = orderResult.insertId;
      
      // Crear items de la orden
      for (const item of cartItems) {
        await OrderItem.create({
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        });
      }
      
      // Limpiar carrito
      await Cart.clearByUserId(req.userId);
      
      await connection.commit();
      
      res.status(201).json({ 
        message: 'Orden creada exitosamente', 
        orderId: orderId,
        total: total 
      });
      
    } catch (error) {
      await connection.rollback();
      console.error(error);
      res.status(500).json({ message: 'Error al crear orden' });
    } finally {
      connection.release();
    }
  }

  static async getUserOrders(req, res) {
    try {
      const orders = await Order.findByUserId(req.userId);
      res.json(orders);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener órdenes' });
    }
  }

  static async getOrderById(req, res) {
    try {
      const orderItems = await Order.findByIdAndUserId(req.params.id, req.userId);
      
      if (orderItems.length === 0) {
        return res.status(404).json({ message: 'Orden no encontrada' });
      }
      
      res.json(orderItems);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener orden' });
    }
  }
}

module.exports = OrderController;
