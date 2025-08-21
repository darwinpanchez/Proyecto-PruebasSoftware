import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order, CreateOrderResponse } from '../../models/product.model';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockOrders: Order[] = [
    {
      id: 1,
      user_id: 1,
      total: 299.98,
      status: 'completed',
      created_at: '2024-01-15T10:30:00Z',
      items: [
        {
          id: 1,
          order_id: 1,
          product_id: 1,
          quantity: 2,
          price: 149.99,
          name: 'Nike Air Max',
          image: 'assets/img/nike.jpg'
        }
      ]
    },
    {
      id: 2,
      user_id: 1,
      total: 180.00,
      status: 'pending',
      created_at: '2024-01-16T14:20:00Z',
      items: [
        {
          id: 2,
          order_id: 2,
          product_id: 2,
          quantity: 1,
          price: 180.00,
          name: 'Adidas Ultraboost',
          image: 'assets/img/adidas.jpg'
        }
      ]
    }
  ];

  const mockOrder: Order = mockOrders[0];

  const mockCreateOrderResponse: CreateOrderResponse = {
    orderId: 123,
    message: 'Order created successfully'
  };

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OrderService,
        { provide: AuthService, useValue: authSpy }
      ]
    });

    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createOrder', () => {
    it('should create a new order', () => {
      authServiceSpy.getToken.and.returnValue('test-token');

      service.createOrder().subscribe(response => {
        expect(response).toEqual(mockCreateOrderResponse);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/orders');
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.body).toEqual({});
      req.flush(mockCreateOrderResponse);
    });

    it('should handle create order error', () => {
      authServiceSpy.getToken.and.returnValue('test-token');

      service.createOrder().subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('http://localhost:3000/api/orders');
      req.flush('Cart is empty', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getOrders', () => {
    it('should return user orders', () => {
      authServiceSpy.getToken.and.returnValue('test-token');

      service.getOrders().subscribe(orders => {
        expect(orders).toEqual(mockOrders);
        expect(orders.length).toBe(2);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/orders');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush(mockOrders);
    });

    it('should handle empty orders list', () => {
      authServiceSpy.getToken.and.returnValue('test-token');

      service.getOrders().subscribe(orders => {
        expect(orders).toEqual([]);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/orders');
      req.flush([]);
    });

    it('should handle unauthorized access', () => {
      authServiceSpy.getToken.and.returnValue('invalid-token');

      service.getOrders().subscribe({
        next: () => fail('should have failed with 401 error'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne('http://localhost:3000/api/orders');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('getOrderById', () => {
    it('should return a specific order', () => {
      const orderId = 1;
      authServiceSpy.getToken.and.returnValue('test-token');

      service.getOrderById(orderId).subscribe(order => {
        expect(order).toEqual(mockOrder);
      });

      const req = httpMock.expectOne(`http://localhost:3000/api/orders/${orderId}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush(mockOrder);
    });

    it('should handle order not found', () => {
      const orderId = 999;
      authServiceSpy.getToken.and.returnValue('test-token');

      service.getOrderById(orderId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`http://localhost:3000/api/orders/${orderId}`);
      req.flush('Order not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('reorder', () => {
    it('should reorder an existing order', () => {
      const orderId = 1;
      authServiceSpy.getToken.and.returnValue('test-token');

      service.reorder(orderId).subscribe(response => {
        expect(response).toEqual(mockCreateOrderResponse);
      });

      const req = httpMock.expectOne(`http://localhost:3000/api/orders/${orderId}/reorder`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      expect(req.request.body).toEqual({});
      req.flush(mockCreateOrderResponse);
    });

    it('should handle reorder failure', () => {
      const orderId = 1;
      authServiceSpy.getToken.and.returnValue('test-token');

      service.reorder(orderId).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`http://localhost:3000/api/orders/${orderId}/reorder`);
      req.flush('Cannot reorder this order', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getHeaders', () => {
    it('should create headers with token', () => {
      authServiceSpy.getToken.and.returnValue('my-token');

      const headers = (service as any).getHeaders();

      expect(headers.get('Authorization')).toBe('Bearer my-token');
      expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('should create headers with null token', () => {
      authServiceSpy.getToken.and.returnValue(null);

      const headers = (service as any).getHeaders();

      expect(headers.get('Authorization')).toBe('Bearer null');
      expect(headers.get('Content-Type')).toBe('application/json');
    });
  });
});
