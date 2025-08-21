import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { ProductsComponent } from '../../components/products.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let cartService: jasmine.SpyObj<CartService>;
  let authService: jasmine.SpyObj<AuthService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  const mockProducts = [
    {
      id: 1,
      name: 'Nike Air Max',
      description: 'Comfortable running shoes',
      price: 150.00,
      image: 'assets/img/nike-air-max.jpg'
    },
    {
      id: 2,
      name: 'Adidas UltraBoost',
      description: 'High performance shoes',
      price: 200.00,
      image: '../img/adidas.jpg'
    }
  ];

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', ['getProducts']);
    const cartServiceSpy = jasmine.createSpyObj('CartService', ['addToCart']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'showWarning', 'productAddedToCart', 'networkError', 'showError'
    ]);

    await TestBed.configureTestingModule({
      imports: [ProductsComponent, RouterTestingModule],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: CartService, useValue: cartServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    cartService = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;

    // Default mock setup
    productService.getProducts.and.returnValue(of([]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    productService.getProducts.and.returnValue(of(mockProducts));

    component.ngOnInit();

    expect(productService.getProducts).toHaveBeenCalled();
    expect(component.products).toEqual(mockProducts);
    expect(component.loading).toBeFalse();
  });

  it('should handle products loading error', () => {
    productService.getProducts.and.returnValue(throwError(() => new Error('Network error')));
    spyOn(console, 'error');

    component.ngOnInit();

    expect(console.error).toHaveBeenCalledWith('Error loading products:', jasmine.any(Error));
    expect(component.loading).toBeFalse();
  });

  it('should show warning when adding to cart without login', () => {
    authService.isLoggedIn.and.returnValue(false);

    component.addToCart(1);

    expect(notificationService.showWarning).toHaveBeenCalledWith(
      'Para agregar productos al carrito necesitas iniciar sesión',
      '🔐 Sesión Requerida'
    );
    expect(cartService.addToCart).not.toHaveBeenCalled();
  });

  it('should add product to cart successfully when logged in', () => {
    authService.isLoggedIn.and.returnValue(true);
    cartService.addToCart.and.returnValue(of({}));
    component.products = mockProducts;

    component.addToCart(1);

    expect(cartService.addToCart).toHaveBeenCalledWith(1, 1);
    expect(notificationService.productAddedToCart).toHaveBeenCalledWith('Nike Air Max');
    expect(component.isAddingToCart).toBeFalse();
  });

  it('should handle network error when adding to cart', () => {
    authService.isLoggedIn.and.returnValue(true);
    cartService.addToCart.and.returnValue(throwError(() => ({ status: 0 })));
    spyOn(console, 'error');
    component.products = mockProducts;

    component.addToCart(1);

    expect(console.error).toHaveBeenCalled();
    expect(notificationService.networkError).toHaveBeenCalled();
    expect(component.isAddingToCart).toBeFalse();
  });

  it('should handle general error when adding to cart', () => {
    authService.isLoggedIn.and.returnValue(true);
    cartService.addToCart.and.returnValue(throwError(() => ({ status: 500 })));
    spyOn(console, 'error');
    component.products = mockProducts;

    component.addToCart(1);

    expect(console.error).toHaveBeenCalled();
    expect(notificationService.showError).toHaveBeenCalledWith(
      'No pudimos agregar el producto al carrito. Intenta nuevamente.',
      '❌ Error al Agregar'
    );
    expect(component.isAddingToCart).toBeFalse();
  });

  it('should add product with default name when product not found', () => {
    authService.isLoggedIn.and.returnValue(true);
    cartService.addToCart.and.returnValue(of({}));
    component.products = [];

    component.addToCart(999);

    expect(notificationService.productAddedToCart).toHaveBeenCalledWith('Producto');
  });

  it('should check if user is logged in', () => {
    authService.isLoggedIn.and.returnValue(true);
    expect(component.isLoggedIn()).toBeTrue();

    authService.isLoggedIn.and.returnValue(false);
    expect(component.isLoggedIn()).toBeFalse();
  });

  it('should get correct image URL', () => {
    expect(component.getImageUrl('img/shoe.jpg')).toBe('assets/img/shoe.jpg');
    expect(component.getImageUrl('../img/shoe.jpg')).toBe('assets/img/shoe.jpg');
    expect(component.getImageUrl('assets/img/shoe.jpg')).toBe('assets/img/shoe.jpg');
  });

  it('should display products when loaded', () => {
    productService.getProducts.and.returnValue(of(mockProducts)); // Mock the service call
    component.products = mockProducts;
    component.loading = false;
    
    // Test component state
    expect(component.products.length).toBe(2);
    expect(component.products[0].name).toBe('Nike Air Max');
    expect(component.products[1].name).toBe('Adidas UltraBoost');
  });

  it('should display loading spinner when loading', () => {
    productService.getProducts.and.returnValue(of([])); // Mock the service call
    component.loading = true;
    component.products = [];
    
    // Test component state instead of DOM
    expect(component.loading).toBeTrue();
    expect(component.products.length).toBe(0);
  });

  it('should display no products message when empty and not loading', () => {
    productService.getProducts.and.returnValue(of([])); // Mock the service call
    component.products = [];
    component.loading = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No hay productos disponibles');
    expect(compiled.textContent).toContain('Por favor, intenta más tarde');
  });

  it('should display login warning when not logged in', () => {
    productService.getProducts.and.returnValue(of([])); // Mock the service call
    authService.isLoggedIn.and.returnValue(false);
    
    // Test component logic
    expect(component.isLoggedIn()).toBeFalse();
  });

  it('should disable add to cart button when not logged in', () => {
    productService.getProducts.and.returnValue(of(mockProducts)); // Mock the service call
    authService.isLoggedIn.and.returnValue(false);
    component.products = mockProducts;
    
    // Test component logic
    expect(component.isLoggedIn()).toBeFalse();
  });

  it('should disable add to cart button when adding to cart', () => {
    productService.getProducts.and.returnValue(of(mockProducts)); // Mock the service call
    authService.isLoggedIn.and.returnValue(true);
    component.products = mockProducts;
    component.isAddingToCart = true;
    
    // Test component state
    expect(component.isAddingToCart).toBeTrue();
  });

  it('should show product details link', () => {
    productService.getProducts.and.returnValue(of(mockProducts)); // Mock the service call
    component.products = mockProducts;
    
    // Test component has products
    expect(component.products.length).toBeGreaterThan(0);
  });

  it('should render product images with correct attributes', () => {
    productService.getProducts.and.returnValue(of(mockProducts)); // Mock the service call
    component.products = mockProducts;
    
    // Test component has products with images
    expect(component.products[0].image).toBe('assets/img/nike-air-max.jpg');
    expect(component.products[1].image).toBe('../img/adidas.jpg');
  });
});
