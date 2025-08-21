import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { NavbarComponent } from '../../components/navbar.component';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/product.model';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let cartServiceSpy: jasmine.SpyObj<CartService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let userSubject: BehaviorSubject<User | null>;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@test.com'
  };

  beforeEach(async () => {
    userSubject = new BehaviorSubject<User | null>(null);
    
    const authSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser$: userSubject.asObservable()
    });
    const cartSpy = jasmine.createSpyObj('CartService', ['getCartCount']);
    const notificationSpy = jasmine.createSpyObj('NotificationService', ['logoutSuccess']);

    await TestBed.configureTestingModule({
      imports: [NavbarComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: CartService, useValue: cartSpy },
        { provide: NotificationService, useValue: notificationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    cartServiceSpy = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with no user and zero cart count', () => {
    fixture.detectChanges();
    expect(component.currentUser).toBeNull();
    expect(component.cartCount).toBe(0);
  });

  it('should update currentUser when user logs in', () => {
    cartServiceSpy.getCartCount.and.returnValue(of({ count: 3 }));
    
    fixture.detectChanges();
    userSubject.next(mockUser);

    expect(component.currentUser).toEqual(mockUser);
    expect(cartServiceSpy.getCartCount).toHaveBeenCalled();
  });

  it('should load cart count when user is logged in', () => {
    cartServiceSpy.getCartCount.and.returnValue(of({ count: 5 }));
    
    fixture.detectChanges();
    userSubject.next(mockUser);

    expect(component.cartCount).toBe(5);
  });

  it('should handle cart count as number response', () => {
    cartServiceSpy.getCartCount.and.returnValue(of(7));
    
    fixture.detectChanges();
    userSubject.next(mockUser);

    expect(component.cartCount).toBe(7);
  });

  it('should handle cart count error', () => {
    cartServiceSpy.getCartCount.and.returnValue(throwError(() => new Error('Cart error')));
    spyOn(console, 'error');
    
    fixture.detectChanges();
    userSubject.next(mockUser);

    expect(component.cartCount).toBe(0);
    expect(console.error).toHaveBeenCalledWith('Error loading cart count:', jasmine.any(Error));
  });

  it('should reset cart count when user logs out', () => {
    // First log in user
    cartServiceSpy.getCartCount.and.returnValue(of({ count: 3 }));
    fixture.detectChanges();
    userSubject.next(mockUser);
    expect(component.cartCount).toBe(3);

    // Then log out
    userSubject.next(null);
    expect(component.currentUser).toBeNull();
    expect(component.cartCount).toBe(0);
  });

  it('should call logout methods when logout is triggered', () => {
    component.logout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(notificationServiceSpy.logoutSuccess).toHaveBeenCalled();
  });

  it('should load cart count manually', () => {
    component.currentUser = mockUser;
    cartServiceSpy.getCartCount.and.returnValue(of({ count: 10 }));

    component.loadCartCount();

    expect(cartServiceSpy.getCartCount).toHaveBeenCalled();
    expect(component.cartCount).toBe(10);
  });

  it('should not load cart count if no user', () => {
    component.currentUser = null;

    component.loadCartCount();

    expect(cartServiceSpy.getCartCount).not.toHaveBeenCalled();
  });

  it('should handle cart count as undefined response', () => {
    cartServiceSpy.getCartCount.and.returnValue(of(undefined as any));
    
    fixture.detectChanges();
    userSubject.next(mockUser);

    expect(component.cartCount).toBe(0);
  });

  it('should handle cart count as object with undefined count', () => {
    cartServiceSpy.getCartCount.and.returnValue(of({ count: undefined }));
    
    userSubject.next(mockUser);
    fixture.detectChanges();
    
    expect(component.cartCount).toBe(0);
  });

  it('should not load cart count when no user', () => {
    fixture.detectChanges();
    // User remains null
    
    expect(cartServiceSpy.getCartCount).not.toHaveBeenCalled();
    expect(component.cartCount).toBe(0);
  });

  it('should call logout and show notification', () => {
    fixture.detectChanges();
    
    component.logout();
    
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(notificationServiceSpy.logoutSuccess).toHaveBeenCalled();
  });
});
