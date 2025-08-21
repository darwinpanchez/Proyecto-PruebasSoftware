import { Product, CartItem, Order, OrderItem, User, AuthResponse, LoginRequest, RegisterRequest } from '../../models/product.model';

describe('Product Model', () => {
  it('should create a valid Product', () => {
    const product: Product = {
      id: 1,
      name: 'Nike Air Max',
      description: 'Running shoes',
      price: 150.00,
      image: 'nike.jpg'
    };

    expect(product.id).toBe(1);
    expect(product.name).toBe('Nike Air Max');
    expect(product.description).toBe('Running shoes');
    expect(product.price).toBe(150.00);
    expect(product.image).toBe('nike.jpg');
  });

  it('should create a valid CartItem', () => {
    const cartItem: CartItem = {
      id: 1,
      product_id: 1,
      user_id: 1,
      quantity: 2,
      name: 'Nike Air Max',
      price: 150.00,
      image: 'nike.jpg'
    };

    expect(cartItem.id).toBe(1);
    expect(cartItem.product_id).toBe(1);
    expect(cartItem.user_id).toBe(1);
    expect(cartItem.quantity).toBe(2);
    expect(cartItem.name).toBe('Nike Air Max');
  });

  it('should create a valid Order', () => {
    const order: Order = {
      id: 1,
      user_id: 1,
      total: 300.00,
      status: 'pending',
      created_at: '2023-01-01T00:00:00Z',
      items: []
    };

    expect(order.id).toBe(1);
    expect(order.user_id).toBe(1);
    expect(order.total).toBe(300.00);
    expect(order.status).toBe('pending');
    expect(order.items).toEqual([]);
  });

  it('should create a valid OrderItem', () => {
    const orderItem: OrderItem = {
      id: 1,
      order_id: 1,
      product_id: 1,
      quantity: 2,
      price: 150.00,
      name: 'Nike Air Max',
      image: 'nike.jpg'
    };

    expect(orderItem.id).toBe(1);
    expect(orderItem.order_id).toBe(1);
    expect(orderItem.product_id).toBe(1);
    expect(orderItem.quantity).toBe(2);
    expect(orderItem.price).toBe(150.00);
    expect(orderItem.name).toBe('Nike Air Max');
  });

  it('should create a valid User', () => {
    const user: User = {
      id: 1,
      username: 'johndoe',
      email: 'john@test.com'
    };

    expect(user.id).toBe(1);
    expect(user.username).toBe('johndoe');
    expect(user.email).toBe('john@test.com');
  });

  it('should create a valid AuthResponse', () => {
    const authResponse: AuthResponse = {
      token: 'jwt-token-string',
      user: {
        id: 1,
        username: 'johndoe',
        email: 'john@test.com'
      }
    };

    expect(authResponse.token).toBe('jwt-token-string');
    expect(authResponse.user.id).toBe(1);
    expect(authResponse.user.username).toBe('johndoe');
    expect(authResponse.user.email).toBe('john@test.com');
  });

  it('should create a valid LoginRequest', () => {
    const loginRequest: LoginRequest = {
      username: 'johndoe',
      password: 'password123'
    };

    expect(loginRequest.username).toBe('johndoe');
    expect(loginRequest.password).toBe('password123');
  });

  it('should create a valid RegisterRequest', () => {
    const registerRequest: RegisterRequest = {
      username: 'johndoe',
      email: 'john@test.com',
      password: 'password123'
    };

    expect(registerRequest.username).toBe('johndoe');
    expect(registerRequest.email).toBe('john@test.com');
    expect(registerRequest.password).toBe('password123');
  });

  it('should handle optional Product properties', () => {
    const product: Product = {
      id: 1,
      name: 'Nike Air Max',
      description: 'Running shoes',
      price: 150.00,
      image: 'nike.jpg',
      created_at: '2023-01-01T00:00:00Z'
    };

    expect(product.created_at).toBe('2023-01-01T00:00:00Z');
  });

  it('should handle Order with items', () => {
    const orderItem: OrderItem = {
      id: 1,
      order_id: 1,
      product_id: 1,
      quantity: 2,
      price: 150.00,
      name: 'Nike Air Max'
    };

    const order: Order = {
      id: 1,
      user_id: 1,
      total: 300.00,
      status: 'pending',
      created_at: '2023-01-01T00:00:00Z',
      items: [orderItem]
    };

    expect(order.items.length).toBe(1);
    expect(order.items[0]).toEqual(orderItem);
  });

  it('should handle CartItem with alternative property names', () => {
    const cartItem: CartItem = {
      id: 1,
      productId: 1,
      quantity: 2,
      name: 'Nike Air Max',
      price: 150.00,
      image: 'nike.jpg'
    };

    expect(cartItem.productId).toBe(1);
    expect(cartItem.name).toBe('Nike Air Max');
  });

  it('should handle OrderItem with alternative property names', () => {
    const orderItem: OrderItem = {
      id: 1,
      orderId: 1,
      productId: 1,
      quantity: 2,
      price: 150.00
    };

    expect(orderItem.orderId).toBe(1);
    expect(orderItem.productId).toBe(1);
  });
});
