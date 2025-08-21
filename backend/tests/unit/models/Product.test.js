// tests/unit/models/Product.test.js
const pool = require('../../../config/database');
const Product = require('../../../model/Product');

jest.mock('../../../config/database');

describe('Product Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should find all products', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 100 },
        { id: 2, name: 'Product 2', price: 200 }
      ];
      pool.execute.mockResolvedValue([mockProducts]);

      const result = await Product.findAll();

      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM products ORDER BY created_at DESC'
      );
      expect(result).toEqual(mockProducts);
    });
  });

  describe('findById', () => {
    it('should find product by ID', async () => {
      const mockProduct = { id: 1, name: 'Product 1', price: 100 };
      pool.execute.mockResolvedValue([[mockProduct]]);

      const result = await Product.findById(1);

      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE id = ?',
        [1]
      );
      expect(result).toEqual(mockProduct);
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const productData = { name: 'New Product', description: 'Description', price: 100, image: 'image.jpg' };
      const mockResult = { insertId: 1 };
      pool.execute.mockResolvedValue([mockResult]);

      const result = await Product.create(productData);

      expect(pool.execute).toHaveBeenCalledWith(
        'INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)',
        ['New Product', 'Description', 100, 'image.jpg']
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const productData = { name: 'Updated Product', description: 'Updated Description', price: 150, image: 'new-image.jpg' };
      const mockResult = { affectedRows: 1 };
      pool.execute.mockResolvedValue([mockResult]);

      const result = await Product.update(1, productData);

      expect(pool.execute).toHaveBeenCalledWith(
        'UPDATE products SET name = ?, description = ?, price = ?, image = ? WHERE id = ?',
        ['Updated Product', 'Updated Description', 150, 'new-image.jpg', 1]
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      const mockResult = { affectedRows: 1 };
      pool.execute.mockResolvedValue([mockResult]);

      const result = await Product.delete(1);

      expect(pool.execute).toHaveBeenCalledWith(
        'DELETE FROM products WHERE id = ?',
        [1]
      );
      expect(result).toEqual(mockResult);
    });
  });
});