const Cart = require('../model/Cart');

class CartController {
  static async getCart(req, res) {
    try {
      const cartItems = await Cart.findByUserId(req.userId);
      res.json(cartItems);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener carrito' });
    }
  }

  static async addToCart(req, res) {
    try {
      const { productId, quantity = 1 } = req.body;
      
      // Verificar si el producto ya está en el carrito
      const existingItem = await Cart.findByUserAndProduct(req.userId, productId);
      
      if (existingItem) {
        // Actualizar cantidad
        await Cart.updateQuantity(req.userId, productId, existingItem.quantity + quantity);
      } else {
        // Insertar nuevo item
        await Cart.create({
          user_id: req.userId,
          product_id: productId,
          quantity
        });
      }
      
      res.json({ message: 'Producto agregado al carrito' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al agregar al carrito' });
    }
  }

  static async updateCartItem(req, res) {
    try {
      const { quantity } = req.body;
      
      await Cart.updateQuantityById(req.params.id, req.userId, quantity);
      
      res.json({ message: 'Cantidad actualizada' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar carrito' });
    }
  }

  static async removeFromCart(req, res) {
    try {
      await Cart.deleteById(req.params.id, req.userId);
      res.json({ message: 'Producto eliminado del carrito' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar del carrito' });
    }
  }

  static async clearCart(req, res) {
    try {
      await Cart.clearByUserId(req.userId);
      res.json({ message: 'Carrito limpiado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al limpiar carrito' });
    }
  }

  static async getCartCount(req, res) {
    try {
      const count = await Cart.getCartCount(req.userId);
      res.json({ count });
    } catch (error) {
      console.error('Error al obtener conteo del carrito:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

module.exports = CartController;
