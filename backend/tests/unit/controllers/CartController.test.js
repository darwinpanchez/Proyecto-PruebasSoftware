// tests/unit/controllers/CartController.test.js
const CartController = require('../../../controller/CartController');
const Cart = require('../../../model/Cart');

jest.mock('../../../model/Cart');

describe('CartController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      userId: 1,
      params: {},
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should get user cart successfully', async () => {
      const mockCartItems = [
        { id: 1, product_id: 1, quantity: 2 },
        { id: 2, product_id: 2, quantity: 1 }
      ];
      Cart.findByUserId.mockResolvedValue(mockCartItems);

      await CartController.getCart(req, res);

      expect(Cart.findByUserId).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockCartItems);
    });

    it('should handle server errors', async () => {
      Cart.findByUserId.mockRejectedValue(new Error('DB error'));

      await CartController.getCart(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener carrito' });
    });
  });

  describe('addToCart', () => {
    it('should add new item to cart', async () => {
      req.body = { productId: 1, quantity: 2 };
      Cart.findByUserAndProduct.mockResolvedValue(null);
      Cart.create.mockResolvedValue({});

      await CartController.addToCart(req, res);

      expect(Cart.findByUserAndProduct).toHaveBeenCalledWith(1, 1);
      expect(Cart.create).toHaveBeenCalledWith({
        user_id: 1,
        product_id: 1,
        quantity: 2
      });
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto agregado al carrito' });
    });

    it('should update quantity if item already in cart', async () => {
      req.body = { productId: 1, quantity: 2 };
      const existingItem = { id: 1, product_id: 1, quantity: 3 };
      Cart.findByUserAndProduct.mockResolvedValue(existingItem);
      Cart.updateQuantity.mockResolvedValue({});

      await CartController.addToCart(req, res);

      expect(Cart.updateQuantity).toHaveBeenCalledWith(1, 1, 5);
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto agregado al carrito' });
    });

    it('should handle server errors', async () => {
      req.body = { productId: 1, quantity: 2 };
      Cart.findByUserAndProduct.mockRejectedValue(new Error('DB error'));

      await CartController.addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al agregar al carrito' });
    });
  });

  describe('updateCartItem', () => {
    it('should update cart item quantity', async () => {
      req.params = { id: 1 };
      req.body = { quantity: 5 };
      Cart.updateQuantityById.mockResolvedValue({});

      await CartController.updateCartItem(req, res);

      expect(Cart.updateQuantityById).toHaveBeenCalledWith(1, 1, 5);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cantidad actualizada' });
    });

    it('should handle server errors', async () => {
      req.params = { id: 1 };
      req.body = { quantity: 5 };
      Cart.updateQuantityById.mockRejectedValue(new Error('DB error'));

      await CartController.updateCartItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al actualizar carrito' });
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      req.params = { id: 1 };
      Cart.deleteById.mockResolvedValue({});

      await CartController.removeFromCart(req, res);

      expect(Cart.deleteById).toHaveBeenCalledWith(1, 1);
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto eliminado del carrito' });
    });

    it('should handle server errors', async () => {
      req.params = { id: 1 };
      Cart.deleteById.mockRejectedValue(new Error('DB error'));

      await CartController.removeFromCart(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al eliminar del carrito' });
    });
  });

  describe('clearCart', () => {
    it('should clear user cart', async () => {
      Cart.clearByUserId.mockResolvedValue({});

      await CartController.clearCart(req, res);

      expect(Cart.clearByUserId).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ message: 'Carrito limpiado' });
    });

    it('should handle server errors', async () => {
      Cart.clearByUserId.mockRejectedValue(new Error('DB error'));

      await CartController.clearCart(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al limpiar carrito' });
    });
  });

  describe('getCartCount', () => {
    it('should get cart item count', async () => {
      Cart.getCartCount.mockResolvedValue(5);

      await CartController.getCartCount(req, res);

      expect(Cart.getCartCount).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ count: 5 });
    });

    it('should handle server errors', async () => {
      Cart.getCartCount.mockRejectedValue(new Error('DB error'));

      await CartController.getCartCount(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error interno del servidor' });
    });
  });
});