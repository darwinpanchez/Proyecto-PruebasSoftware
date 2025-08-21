// tests/unit/controllers/ProductController.test.js
const ProductController = require('../../../controller/ProductController');
const Product = require('../../../model/Product');

jest.mock('../../../model/Product');

describe('ProductController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      file: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 100 },
        { id: 2, name: 'Product 2', price: 200 }
      ];
      Product.findAll.mockResolvedValue(mockProducts);

      await ProductController.getAllProducts(req, res);

      expect(Product.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });

    it('should handle server errors', async () => {
      Product.findAll.mockRejectedValue(new Error('DB error'));

      await ProductController.getAllProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener productos' });
    });
  });

  describe('getProductById', () => {
    it('should return a product by ID', async () => {
      req.params.id = 1;
      const mockProduct = { id: 1, name: 'Product 1', price: 100 };
      Product.findById.mockResolvedValue(mockProduct);

      await ProductController.getProductById(req, res);

      expect(Product.findById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockProduct);
    });

    it('should return 404 if product not found', async () => {
      req.params.id = 999;
      Product.findById.mockResolvedValue(null);

      await ProductController.getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto no encontrado' });
    });

    it('should handle database errors', async () => {
      req.params.id = 1;
      Product.findById.mockRejectedValue(new Error('DB error'));

      await ProductController.getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener producto' });
    });
  });

  describe('createProduct', () => {
    it('should create a product with default image', async () => {
      req.body = { name: 'New Product', description: 'Description', price: '100' };
      Product.create.mockResolvedValue({ insertId: 1 });

      await ProductController.createProduct(req, res);

      expect(Product.create).toHaveBeenCalledWith({
        name: 'New Product',
        description: 'Description',
        price: 100,
        image: 'assets/images/default-shoe.jpg'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Producto creado exitosamente',
        id: 1,
        imageUrl: 'assets/images/default-shoe.jpg'
      });
    });

    it('should create a product with uploaded image', async () => {
      req.body = { name: 'New Product', description: 'Description', price: '100' };
      req.file = { filename: 'product-image.jpg' };
      Product.create.mockResolvedValue({ insertId: 1 });

      await ProductController.createProduct(req, res);

      expect(Product.create).toHaveBeenCalledWith({
        name: 'New Product',
        description: 'Description',
        price: 100,
        image: 'http://localhost:3000/uploads/product-image.jpg'
      });
    });

    it('should handle database errors', async () => {
      req.body = { name: 'New Product', description: 'Description', price: '100' };
      Product.create.mockRejectedValue(new Error('DB error'));

      await ProductController.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al crear el producto' });
    });
  });

  describe('updateProduct', () => {
    it('should update a product successfully', async () => {
      req.params.id = 1;
      req.body = { name: 'Updated Product', description: 'Updated Description', price: '150' };
      const existingProduct = { id: 1, name: 'Product', description: 'Description', price: 100, image: 'image.jpg' };
      Product.findById.mockResolvedValue(existingProduct);
      Product.update.mockResolvedValue({});

      await ProductController.updateProduct(req, res);

      expect(Product.update).toHaveBeenCalledWith(1, {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 150,
        image: 'image.jpg'
      });
      expect(res.json).toHaveBeenCalledWith({
        message: 'Producto actualizado exitosamente',
        imageUrl: 'image.jpg'
      });
    });

    it('should return 404 if product not found', async () => {
      req.params.id = 999;
      Product.findById.mockResolvedValue(null);

      await ProductController.updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto no encontrado' });
    });

    it('should handle database errors', async () => {
      req.params.id = 1;
      req.body = { name: 'Updated Product', description: 'Updated Description', price: '150' };
      Product.findById.mockRejectedValue(new Error('DB error'));

      await ProductController.updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al actualizar el producto' });
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      req.params.id = 1;
      const existingProduct = { id: 1, name: 'Product' };
      Product.findById.mockResolvedValue(existingProduct);
      Product.delete.mockResolvedValue({});

      await ProductController.deleteProduct(req, res);

      expect(Product.delete).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto eliminado exitosamente' });
    });

    it('should return 404 if product not found', async () => {
      req.params.id = 999;
      Product.findById.mockResolvedValue(null);

      await ProductController.deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto no encontrado' });
    });

    it('should handle database errors', async () => {
      req.params.id = 1;
      Product.findById.mockRejectedValue(new Error('DB error'));

      await ProductController.deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al eliminar el producto' });
    });
  });
});