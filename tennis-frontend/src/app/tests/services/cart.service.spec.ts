import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CartItem } from '../../models/product.model';

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['getToken']);
    spy.getToken.and.returnValue('mock-token');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CartService,
        { provide: AuthService, useValue: spy }
      ]
    });
    
    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get cart items', () => {
    const mockCartItems: CartItem[] = [
      {
        id: 1,
        product_id: 1,
        quantity: 2,
        name: 'Nike Air Max',
        price: 120.99,
        image: 'nike-air-max.jpg'
      },
      {
        id: 2,
        product_id: 2,
        quantity: 1,
        name: 'Adidas Ultraboost',
        price: 180.00,
        image: 'adidas-ultraboost.jpg'
      }
    ];

    service.getCart().subscribe(items => {
      expect(items).toEqual(mockCartItems);
      expect(items.length).toBe(2);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/cart');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    req.flush(mockCartItems);
  });

  it('should add item to cart', () => {
    const productId = 1;
    const quantity = 2;

    const mockResponse = {
      message: 'Producto agregado al carrito',
      cartItem: {
        id: 3,
        product_id: productId,
        quantity: quantity,
        name: 'Nike Air Max',
        price: 120.99,
        image: 'nike-air-max.jpg'
      }
    };

    service.addToCart(productId, quantity).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/cart/add');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      productId: productId,
      quantity: quantity
    });
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    req.flush(mockResponse);
  });

  it('should update cart item quantity', () => {
    const itemId = 1;
    const newQuantity = 3;

    const mockResponse = {
      message: 'Cantidad actualizada'
    };

    service.updateCartItem(itemId, newQuantity).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`http://localhost:3000/api/cart/${itemId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ quantity: newQuantity });
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    req.flush(mockResponse);
  });

  it('should remove item from cart', () => {
    const itemId = 1;

    const mockResponse = {
      message: 'Producto eliminado del carrito'
    };

    service.removeFromCart(itemId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`http://localhost:3000/api/cart/${itemId}`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    req.flush(mockResponse);
  });

  it('should clear cart', () => {
    const mockResponse = {
      message: 'Carrito vaciado'
    };

    service.clearCart().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/cart');
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    req.flush(mockResponse);
  });

  it('should get cart count', () => {
    const mockCount = { count: 5 };

    service.getCartCount().subscribe(count => {
      expect(count).toEqual(mockCount);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/cart/count');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    req.flush(mockCount);
  });

  it('should handle HTTP errors gracefully', () => {
    service.getCart().subscribe({
      next: () => fail('Should have failed'),
      error: (error: any) => {
        expect(error.status).toBe(404);
      }
    });

    const req = httpMock.expectOne('http://localhost:3000/api/cart');
    req.flush('Cart not found', { status: 404, statusText: 'Not Found' });
  });

  it('should include authorization headers in all requests', () => {
    // Test que verifica que todas las peticiones incluyen el token de autorización
    service.getCart().subscribe();
    service.addToCart(1).subscribe();
    service.clearCart().subscribe();

    const requests = httpMock.match(() => true);
    requests.forEach(req => {
      expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
    });

    requests.forEach(req => req.flush({}));
  });
});
