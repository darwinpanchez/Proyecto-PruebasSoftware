const Product = require('../model/Product');

class ProductController {
  static async getAllProducts(req, res) {
    try {
      const products = await Product.findAll();
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener productos' });
    }
  }

  static async getProductById(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      res.json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener producto' });
    }
  }

  static async createProduct(req, res) {
    try {
      const { name, description, price } = req.body;
      
      // Si se subió una imagen, generar la URL
      let imageUrl = 'assets/images/default-shoe.jpg'; // imagen por defecto
      if (req.file) {
        imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
      }
      
      const result = await Product.create({ 
        name, 
        description, 
        price: parseFloat(price), 
        image: imageUrl 
      });
      
      res.status(201).json({ 
        message: 'Producto creado exitosamente', 
        id: result.insertId,
        imageUrl: imageUrl
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al crear el producto' });
    }
  }

  static async updateProduct(req, res) {
    try {
      const { name, description, price } = req.body;
      const productId = req.params.id;
      
      // Verificar si el producto existe
      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      // Preparar datos para actualizar
      const updateData = { 
        name, 
        description, 
        price: parseFloat(price),
        image: existingProduct.image  // Conservar imagen existente por defecto
      };
      
      // Si se subió una nueva imagen, actualizar la URL
      if (req.file) {
        updateData.image = `http://localhost:3000/uploads/${req.file.filename}`;
      }
      
      await Product.update(productId, updateData);
      
      res.json({ 
        message: 'Producto actualizado exitosamente',
        imageUrl: updateData.image || existingProduct.image
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar el producto' });
    }
  }

  static async deleteProduct(req, res) {
    try {
      const productId = req.params.id;
      
      // Verificar si el producto existe
      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      await Product.delete(productId);
      
      res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar el producto' });
    }
  }
}

module.exports = ProductController;
