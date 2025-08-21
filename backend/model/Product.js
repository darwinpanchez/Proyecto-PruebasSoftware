const pool = require('../config/database');

class Product {
  static async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create(productData) {
    const { name, description, price, image } = productData;
    const [result] = await pool.execute(
      'INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)',
      [name, description, price, image]
    );
    return result;
  }

  static async update(id, productData) {
    const { name, description, price, image } = productData;
    const [result] = await pool.execute(
      'UPDATE products SET name = ?, description = ?, price = ?, image = ? WHERE id = ?',
      [name, description, price, image, id]
    );
    return result;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM products WHERE id = ?',
      [id]
    );
    return result;
  }
}

module.exports = Product;
