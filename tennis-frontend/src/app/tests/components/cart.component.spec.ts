import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CartComponent } from '../../components/cart.component';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let cartServiceSpy: jasmine.SpyObj<CartService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockCartItems = [
    {
      id: 1,
      product_id: 1,
      product_name: 'Nike Air Max',
      price: 150.00,
      quantity: 2,
      size: '42',
      image_url: 'assets/img/nike.jpg',
      stock: 10
    },
    {
      id: 2,
      product_id: 2,
      product_name: 'Adidas Ultraboost',
      price: 180.00,
      quantity: 1,
      size: '43',
      image_url: 'assets/img/adidas.jpg',
      stock: 5
    }
  ];

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@test.com'
  };

  beforeEach(async () => {
    const cartSpy = jasmine.createSpyObj('CartService', ['cartItems$']);
    const authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'getCurrentUser']);
    const notificationSpy = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
      'showError',
      'showWarning',
      'showInfo',
      'networkError',
      'serverError',
      'itemRemovedFromCart',
      'cartCleared'
    ]);

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue('mock-token');

    await TestBed.configureTestingModule({
      imports: [CartComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: CartService, useValue: cartSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: NotificationService, useValue: notificationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    cartServiceSpy = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    // Setup default auth state
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.getCurrentUser.and.returnValue(mockUser);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.cartItems).toEqual([]);
    expect(component.isProcessing).toBe(false);
    expect(component.loadingItemId).toBe(null);
  });

  it('should load cart items on init when user is logged in', () => {
    component.ngOnInit();

    const req = httpMock.expectOne('http://localhost:3000/api/cart');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    
    req.flush(mockCartItems);
    expect(component.cartItems).toEqual(mockCartItems);
  });

  it('should redirect to login if not authenticated', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);

    component.checkAuthentication();

    expect(notificationServiceSpy.showError).toHaveBeenCalledWith('Debes iniciar sesión para ver tu carrito');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle error when loading cart', () => {
    spyOn(console, 'error');
    component.ngOnInit();

    const req = httpMock.expectOne('http://localhost:3000/api/cart');
    req.flush('Error loading cart', { status: 500, statusText: 'Internal Server Error' });

    expect(console.error).toHaveBeenCalled();
    expect(notificationServiceSpy.networkError).toHaveBeenCalled();
  });

  it('should calculate subtotal correctly', () => {
    component.cartItems = mockCartItems;
    
    const subtotal = component.getSubtotal();
    const expectedSubtotal = (150.00 * 2) + (180.00 * 1); // 480.00
    
    expect(subtotal).toBe(expectedSubtotal);
  });

  it('should calculate shipping cost correctly', () => {
    component.cartItems = mockCartItems;
    
    const shipping = component.getShipping();
    const subtotal = component.getSubtotal();
    
    // Should be free shipping over $100
    expect(shipping).toBe(subtotal > 100 ? 0 : 15);
  });

  it('should calculate tax correctly', () => {
    component.cartItems = mockCartItems;
    
    const tax = component.getTax();
    const subtotal = component.getSubtotal();
    
    expect(tax).toBe(subtotal * 0.15);
  });

  it('should calculate total correctly', () => {
    component.cartItems = mockCartItems;
    
    const total = component.getTotal();
    const subtotal = component.getSubtotal();
    const shipping = component.getShipping();
    const tax = component.getTax();
    
    expect(total).toBe(subtotal + shipping + tax);
  });

  it('should update quantity successfully', () => {
    const item = mockCartItems[0];
    const newQuantity = 3;
    
    component.updateQuantity(item, newQuantity);

    const req = httpMock.expectOne(`http://localhost:3000/api/cart/${item.id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ quantity: newQuantity });
    
    req.flush({ message: 'Quantity updated' });
  });

  it('should not update quantity if exceeds stock', () => {
    const item = mockCartItems[0];
    const newQuantity = 15; // exceeds stock of 10
    
    component.updateQuantity(item, newQuantity);

    expect(notificationServiceSpy.showWarning).toHaveBeenCalledWith(
      `Solo disponemos de ${item.stock} unidades de este producto`,
      '⚠️ Stock Limitado'
    );
    httpMock.expectNone(`http://localhost:3000/api/cart/${item.id}`);
  });

  it('should remove item from cart successfully', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const itemId = 1;
    component.cartItems = [...mockCartItems];
    
    component.removeFromCart(itemId);

    const req = httpMock.expectOne(`http://localhost:3000/api/cart/${itemId}`);
    expect(req.request.method).toBe('DELETE');
    
    req.flush({ message: 'Item removed' });
  });

  it('should not remove item if user cancels confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    const itemId = 1;
    
    component.removeFromCart(itemId);

    httpMock.expectNone(`http://localhost:3000/api/cart/${itemId}`);
    expect(component.loadingItemId).toBe(null);
  });

  it('should clear cart successfully', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.cartItems = [...mockCartItems];
    
    component.clearCart();

    const req = httpMock.expectOne('http://localhost:3000/api/cart');
    expect(req.request.method).toBe('DELETE');
    
    req.flush({ message: 'Cart cleared' });
  });

  it('should format price correctly', () => {
    expect(component.formatPrice(150.99)).toBe('150.99');
    expect(component.formatPrice(150)).toBe('150.00');
    expect(component.formatPrice('150.5')).toBe('150.50');
  });

  it('should get item price correctly', () => {
    const item = { price: 150.99 };
    const itemWithStringPrice = { price: '150.99' };
    
    expect(component.getItemPrice(item)).toBe(150.99);
    expect(component.getItemPrice(itemWithStringPrice)).toBe(150.99);
  });

  it('should get item total correctly', () => {
    const item = { price: 150.00, quantity: 2 };
    
    expect(component.getItemTotal(item)).toBe('300.00');
  });

  it('should validate form correctly', () => {
    // Invalid form
    expect(component.validateForm()).toBe(false);
    
    // Valid form
    component.form = {
      customer_name: 'Juan Pérez',
      customer_email: 'juan@test.com',
      customer_phone: '09-9999-9999',
      shipping_address: 'Av. 10 de Agosto N24-253',
      shipping_city: 'Quito',
      shipping_postal_code: '170150',
      payment_method: 'credit_card'
    };
    
    expect(component.validateForm()).toBe(true);
  });

  it('should get image URL correctly', () => {
    expect(component.getImageUrl('assets/img/nike.jpg')).toBe('assets/img/nike.jpg');
    expect(component.getImageUrl('../img/nike.jpg')).toBe('http://localhost:3000/img/nike.jpg');
    expect(component.getImageUrl('http://example.com/image.jpg')).toBe('http://example.com/image.jpg');
    expect(component.getImageUrl('')).toBe('assets/img/default-shoe.jpg');
  });

  it('should prefill user data', () => {
    component.prefillUserData();
    
    expect(component.form.customer_name).toBe(mockUser.username);
    expect(component.form.customer_email).toBe(mockUser.email);
  });

  it('should go back in history', () => {
    spyOn(window.history, 'back');
    
    component.goBack();
    
    expect(window.history.back).toHaveBeenCalled();
  });

  it('should go to products page', () => {
    component.goToProducts();
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should handle processCheckout with valid form - cash payment', () => {
    const mockForm = {
      valid: true,
      value: {
        customer_name: 'John Doe',
        customer_email: 'john@test.com',
        customer_phone: '0999999999',
        shipping_address: 'Test Address 123',
        shipping_city: 'Quito',
        shipping_postal_code: '170150',
        payment_method: 'cash'
      }
    } as any;

    component.cartItems = mockCartItems;
    component.form = mockForm.value;
    const mockResponse = { success: true, order_id: 123 };
    
    component.processCheckout(mockForm);

    expect(notificationServiceSpy.showInfo).toHaveBeenCalledWith('Comprobando datos de pago...', 'Procesando');
    
    // Simulate timeout
    setTimeout(() => {
      const req = httpMock.expectOne('http://localhost:3000/api/orders');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.payment_method).toBe('cash');
      req.flush(mockResponse);

      expect(notificationServiceSpy.showSuccess).toHaveBeenCalled();
    }, 2100);
  });

  it('should handle processCheckout error', (done) => {
    const mockForm = {
      valid: true,
      value: {
        customer_name: 'John Doe',
        customer_email: 'john@test.com',
        customer_phone: '0999999999',
        shipping_address: 'Test Address 123',
        shipping_city: 'Quito',
        shipping_postal_code: '170150',
        payment_method: 'cash'
      }
    } as any;

    component.cartItems = mockCartItems;
    component.form = mockForm.value;
    
    component.processCheckout(mockForm);

    // Simulate timeout
    setTimeout(() => {
      const req = httpMock.expectOne('http://localhost:3000/api/orders');
      req.flush({ error: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });

      expect(notificationServiceSpy.showError).toHaveBeenCalledWith('Error al procesar el pedido. Por favor intenta nuevamente.');
      expect(component.isProcessing).toBe(false);
      done();
    }, 2100);
  });

  it('should validate form with partial data', () => {
    component.form = {
      customer_name: 'Jo',
      customer_email: 'john.doe@test.com',
      customer_phone: '0999999999',
      shipping_address: 'Test Address Street 123',
      shipping_city: 'Quito',
      shipping_postal_code: '',
      payment_method: 'credit_card'
    };

    const isValid = component.validateForm();
    
    expect(isValid).toBe(true);
  });

  it('should validate postal code as optional', () => {
    component.form = {
      customer_name: 'John Doe Smith',
      customer_email: 'john.doe@test.com',
      customer_phone: '0999999999',
      shipping_address: 'Test Address Street 123',
      shipping_city: 'Quito',
      shipping_postal_code: '',
      payment_method: 'credit_card'
    };

    const isValid = component.validateForm();
    
    expect(isValid).toBe(true);
  });

  it('should not process checkout with invalid form', () => {
    const mockForm = {
      valid: false,
      value: {}
    } as any;

    component.processCheckout(mockForm);

    expect(notificationServiceSpy.showError).toHaveBeenCalledWith('Todos los campos son obligatorios y deben ser válidos');
    httpMock.expectNone('http://localhost:3000/api/orders');
  });

  it('should handle edge cases in calculation methods', () => {
    component.cartItems = [];
    
    expect(component.getSubtotal()).toBe(0);
    expect(component.getShipping()).toBe(0);
    expect(component.getTax()).toBe(0);
    expect(component.getTotal()).toBe(0);
  });

  it('should handle image URL with various inputs', () => {
    expect(component.getImageUrl('assets/img/product.jpg')).toBe('assets/img/product.jpg');
    expect(component.getImageUrl('')).toBe('assets/img/default-product.png');
    expect(component.getImageUrl(null as any)).toBe('assets/img/default-product.png');
    expect(component.getImageUrl(undefined as any)).toBe('assets/img/default-product.png');
  });

  it('should prefill user data with complete user info', () => {
    const completeUser = {
      id: 1,
      username: 'testuser',
      email: 'test@test.com',
      customer_name: 'Test User',
      customer_phone: '0999999999',
      shipping_address: 'Test Address',
      shipping_city: 'Quito'
    };
    
    authServiceSpy.getCurrentUser.and.returnValue(completeUser);
    
    component.prefillUserData();
    
    expect(component.form.customer_name).toBe('Test User');
    expect(component.form.customer_email).toBe('test@test.com');
    expect(component.form.customer_phone).toBe('0999999999');
  });
});
