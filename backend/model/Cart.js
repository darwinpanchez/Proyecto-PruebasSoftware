const pool = require('../config/database');

class Cart {
  static async findByUserId(userId) {
    const [rows] = await pool.execute(`
      SELECT c.*, p.name, p.price, p.image 
      FROM cart c 
      JOIN products p ON c.product_id = p.id 
      WHERE c.user_id = ?
    `, [userId]);
    return rows;
  }

  static async findByUserAndProduct(userId, productId) {
    const [rows] = await pool.execute(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return rows[0];
  }

  static async create(cartData) {
    const { user_id, product_id, quantity } = cartData;
    const [result] = await pool.execute(
      'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
      [user_id, product_id, quantity]
    );
    return result;
  }

  static async updateQuantity(userId, productId, quantity) {
    const [result] = await pool.execute(
      'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [quantity, userId, productId]
    );
    return result;
  }

  static async updateQuantityById(id, userId, quantity) {
    const [result] = await pool.execute(
      'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, id, userId]
    );
    return result;
  }

  static async deleteById(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM cart WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result;
  }

  static async clearByUserId(userId) {
    const [result] = await pool.execute(
      'DELETE FROM cart WHERE user_id = ?',
      [userId]
    );
    return result;
  }

  static async getCartCount(userId) {
    const [rows] = await pool.execute(
      'SELECT COALESCE(SUM(quantity), 0) as count FROM cart WHERE user_id = ?',
      [userId]
    );
    return rows[0].count;
  }
}

module.exports = Cart;
