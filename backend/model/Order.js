const pool = require('../config/database');

class Order {
  static async create(orderData) {
    const { user_id, total } = orderData;
    const [result] = await pool.execute(
      'INSERT INTO orders (user_id, total) VALUES (?, ?)',
      [user_id, total]
    );
    return result;
  }

  static async findByUserId(userId) {
    const [rows] = await pool.execute(`
      SELECT o.*, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'product_id', oi.product_id,
            'name', p.name,
            'quantity', oi.quantity,
            'price', oi.price,
            'image', p.image
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [userId]);
    
    // Procesar items de manera segura
    return rows.map(order => {
      let items = [];
      try {
        if (order.items && typeof order.items === 'string') {
          items = JSON.parse(order.items);
        } else if (Array.isArray(order.items)) {
          items = order.items;
        } else if (order.items) {
          // Si items no es null pero tampoco es string ni array
          items = [order.items];
        }
        
        // Filtrar items null que pueden venir de LEFT JOIN
        items = items.filter(item => item && item.product_id);
        
      } catch (error) {
        console.error('Error parsing order items:', error, order.items);
        items = [];
      }
      
      return {
        ...order,
        items
      };
    });
  }

  static async findByIdAndUserId(orderId, userId) {
    const [rows] = await pool.execute(`
      SELECT o.*, oi.*, p.name, p.image
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.id = ? AND o.user_id = ?
    `, [orderId, userId]);
    return rows;
  }
}

class OrderItem {
  static async create(itemData) {
    const { order_id, product_id, quantity, price } = itemData;
    const [result] = await pool.execute(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [order_id, product_id, quantity, price]
    );
    return result;
  }
}

module.exports = { Order, OrderItem };
