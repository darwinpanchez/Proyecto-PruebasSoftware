import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../../services/auth.service';
import { LoginRequest, RegisterRequest, AuthResponse } from '../../models/product.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Limpiar localStorage antes de cada test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login successfully', () => {
    const mockLoginRequest: LoginRequest = {
      username: 'testuser',
      password: 'password123'
    };

    const mockResponse: AuthResponse = {
      token: 'mock-jwt-token',
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      }
    };

    service.login(mockLoginRequest).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(localStorage.getItem('token')).toBe('mock-jwt-token');
      expect(service.isLoggedIn()).toBeTruthy();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockLoginRequest);
    req.flush(mockResponse);
  });

  it('should register successfully', () => {
    const mockRegisterRequest: RegisterRequest = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123'
    };

    const mockResponse: AuthResponse = {
      token: 'mock-jwt-token',
      user: {
        id: 2,
        username: 'newuser',
        email: 'newuser@example.com'
      }
    };

    service.register(mockRegisterRequest).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(localStorage.getItem('token')).toBe('mock-jwt-token');
      expect(service.isLoggedIn()).toBeTruthy();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRegisterRequest);
    req.flush(mockResponse);
  });

  it('should logout successfully', () => {
    // Setup: simular usuario logueado
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, username: 'test', email: 'test@test.com' }));
    
    service.logout();
    
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(service.isLoggedIn()).toBeFalsy();
    expect(service.getCurrentUser()).toBeNull();
  });

  it('should return current user when logged in', () => {
    const mockUser = { id: 1, username: 'test', email: 'test@test.com' };
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    // Forzar la recarga del usuario desde localStorage
    (service as any).loadCurrentUser();
    
    expect(service.getCurrentUser()).toEqual(mockUser);
  });

  it('should return null when not logged in', () => {
    expect(service.getCurrentUser()).toBeNull();
    expect(service.isLoggedIn()).toBeFalsy();
  });

  it('should handle isLoggedIn with no token', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    
    const result = service.isLoggedIn();
    
    expect(result).toBe(false);
  });

  it('should handle isLoggedIn with empty token', () => {
    spyOn(localStorage, 'getItem').and.returnValue('');
    
    const result = service.isLoggedIn();
    
    expect(result).toBe(false);
  });

  it('should handle getCurrentUser with no stored user', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    
    const result = service.getCurrentUser();
    
    expect(result).toBeNull();
  });

  it('should handle getCurrentUser with invalid JSON', () => {
    spyOn(localStorage, 'getItem').and.returnValue('invalid-json');
    spyOn(console, 'error');
    
    const result = service.getCurrentUser();
    
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle token expiration check with invalid token', () => {
    spyOn(localStorage, 'getItem').and.returnValue('invalid.token.format');
    
    const result = service.isLoggedIn();
    
    expect(result).toBe(false);
  });

  it('should emit user updates correctly', () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@test.com' };
    const credentials = { username: 'test', password: 'password' };
    let emittedUser: any = null;
    
    service.currentUser$.subscribe(user => {
      emittedUser = user;
    });
    
    service.login(credentials).subscribe();
    
    const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
    req.flush({ token: 'test-token', user: mockUser });
    
    expect(emittedUser).toEqual(mockUser);
  });
});
