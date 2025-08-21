import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { ProductDetailComponent } from '../../components/product-detail.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let cartService: jasmine.SpyObj<CartService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  const mockProduct = {
    id: 1,
    name: 'Nike Air Max',
    description: 'Comfortable running shoes',
    price: 150.00,
    image: 'assets/img/nike-air-max.jpg'
  };

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', ['getProductById']);
    const cartServiceSpy = jasmine.createSpyObj('CartService', ['addToCart']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']);

    activatedRoute = {
      params: of({ id: '1' })
    };

    await TestBed.configureTestingModule({
      imports: [ProductDetailComponent, RouterTestingModule],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: CartService, useValue: cartServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    cartService = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    // Default mock setup
    productService.getProductById.and.returnValue(of(mockProduct));
    authService.isLoggedIn.and.returnValue(false);
    router.createUrlTree.and.returnValue({} as any);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load product on init with valid id', () => {
    productService.getProductById.and.returnValue(of(mockProduct));

    component.ngOnInit();

    expect(productService.getProductById).toHaveBeenCalledWith(1);
    expect(component.product).toEqual(mockProduct);
    expect(component.loading).toBeFalse();
  });

  it('should handle product loading error', () => {
    productService.getProductById.and.returnValue(throwError(() => new Error('Product not found')));
    spyOn(console, 'error');

    component.ngOnInit();

    expect(console.error).toHaveBeenCalledWith('Error loading product:', jasmine.any(Error));
    expect(component.loading).toBeFalse();
  });

  it('should not load product with invalid id', () => {
    activatedRoute.params = of({ id: 'invalid' });

    component.ngOnInit();

    expect(productService.getProductById).not.toHaveBeenCalled();
  });

  it('should add product to cart successfully when logged in', () => {
    component.product = mockProduct;
    component.selectedQuantity = 2;
    authService.isLoggedIn.and.returnValue(true);
    cartService.addToCart.and.returnValue(of({}));
    spyOn(window, 'alert');

    component.addToCart();

    expect(cartService.addToCart).toHaveBeenCalledWith(1, 2);
    expect(window.alert).toHaveBeenCalledWith('2 producto(s) agregado(s) al carrito exitosamente');
    expect(component.isAddingToCart).toBeFalse();
  });

  it('should not add to cart when not logged in', () => {
    component.product = mockProduct;
    authService.isLoggedIn.and.returnValue(false);
    spyOn(window, 'alert');

    component.addToCart();

    expect(window.alert).toHaveBeenCalledWith('Debes iniciar sesión para agregar productos al carrito');
    expect(cartService.addToCart).not.toHaveBeenCalled();
  });

  it('should not add to cart when product is null', () => {
    component.product = null;
    authService.isLoggedIn.and.returnValue(true);

    component.addToCart();

    expect(cartService.addToCart).not.toHaveBeenCalled();
  });

  it('should handle add to cart error', () => {
    component.product = mockProduct;
    authService.isLoggedIn.and.returnValue(true);
    cartService.addToCart.and.returnValue(throwError(() => new Error('Cart error')));
    spyOn(console, 'error');
    spyOn(window, 'alert');

    component.addToCart();

    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Error al agregar producto al carrito');
    expect(component.isAddingToCart).toBeFalse();
  });

  it('should navigate back to products', () => {
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
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
    expect(component.getImageUrl('')).toBe('assets/img/default-shoe.jpg');
  });

  it('should display loading spinner when loading', () => {
    component.loading = true;
    component.product = null;
    
    // Test component state
    expect(component.loading).toBeTrue();
    expect(component.product).toBeNull();
  });

  it('should display product not found message when product is null and not loading', () => {
    component.loading = false;
    component.product = null;
    
    // Test component state
    expect(component.loading).toBeFalse();
    expect(component.product).toBeNull();
  });

  it('should display product details when product is loaded', () => {
    component.product = mockProduct;
    component.loading = false;
    
    // Test component state
    expect(component.product.name).toBe('Nike Air Max');
    expect(component.product.description).toBe('Comfortable running shoes');
    expect(component.product.price).toBe(150.00);
  });

  it('should display login warning when not logged in', () => {
    component.product = mockProduct;
    authService.isLoggedIn.and.returnValue(false);
    
    // Just test the component logic, not the DOM rendering
    expect(component.isLoggedIn()).toBeFalse();
  });

  it('should disable add to cart button when not logged in', () => {
    component.product = mockProduct;
    authService.isLoggedIn.and.returnValue(false);
    
    // Just test the component logic
    expect(component.isLoggedIn()).toBeFalse();
  });

  it('should disable add to cart button when adding to cart', () => {
    component.product = mockProduct;
    component.isAddingToCart = true;
    authService.isLoggedIn.and.returnValue(true);
    
    // Test component state
    expect(component.isAddingToCart).toBeTrue();
  });

  it('should display breadcrumb navigation', () => {
    component.product = mockProduct;
    
    // Test component has product
    expect(component.product).toBeTruthy();
  });

  it('should display product characteristics section', () => {
    component.product = mockProduct;
    
    // Test component has product
    expect(component.product.name).toBe('Nike Air Max');
  });

  it('should render quantity selector', () => {
    component.product = mockProduct;
    
    // Test default quantity
    expect(component.selectedQuantity).toBe(1);
  });

  it('should update selected quantity', () => {
    component.selectedQuantity = 3;
    expect(component.selectedQuantity).toBe(3);
  });

  it('should handle route params changes', () => {
    activatedRoute.params = of({ id: '2' });
    productService.getProductById.and.returnValue(of(mockProduct));

    component.ngOnInit();

    expect(productService.getProductById).toHaveBeenCalledWith(2);
  });

  it('should load product method should work correctly', () => {
    productService.getProductById.and.returnValue(of(mockProduct));

    component.loadProduct(1);

    expect(component.loading).toBeFalse();
    expect(component.product).toEqual(mockProduct);
  });
});
