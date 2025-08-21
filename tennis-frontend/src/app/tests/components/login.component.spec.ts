import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from '../../components/login.component';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let router: Router;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login', 'isLoggedIn']);
    const notificationSpy = jasmine.createSpyObj('NotificationService', [
      'loginSuccess', 
      'invalidCredentials', 
      'networkError',
      'showWarning'
    ]);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: NotificationService, useValue: notificationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    router = TestBed.inject(Router);
    
    // Configurar espías para router después de la inyección
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty credentials', () => {
    expect(component.credentials.username).toBe('');
    expect(component.credentials.password).toBe('');
  });

  it('should login successfully with valid credentials', () => {
    const mockResponse = {
      token: 'mock-token',
      user: { id: 1, username: 'testuser', email: 'test@test.com' }
    };

    authServiceSpy.login.and.returnValue(of(mockResponse));
    
    component.credentials = {
      username: 'testuser',
      password: 'password123'
    };

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123'
    });
    expect(notificationServiceSpy.loginSuccess).toHaveBeenCalledWith('testuser');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle login error with invalid credentials', () => {
    const errorResponse = {
      error: { message: 'Invalid credentials' },
      status: 401
    };

    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));
    
    component.credentials = {
      username: 'wronguser',
      password: 'wrongpass'
    };

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalled();
    expect(notificationServiceSpy.invalidCredentials).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should handle network error', () => {
    const networkError = {
      error: { message: 'Network error' },
      status: 0
    };

    authServiceSpy.login.and.returnValue(throwError(() => networkError));
    
    component.credentials = {
      username: 'testuser',
      password: 'password123'
    };

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalled();
    expect(notificationServiceSpy.networkError).toHaveBeenCalled();
  });

  it('should handle validation correctly', () => {
    // Test que verifica que no se puede enviar con credenciales vacías
    expect(component.credentials.username).toBe('');
    expect(component.credentials.password).toBe('');
    
    component.onSubmit();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should not submit form with empty credentials', () => {
    component.credentials = {
      username: '',
      password: ''
    };

    component.onSubmit();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should not submit form with empty username', () => {
    component.credentials = {
      username: '',
      password: 'password123'
    };

    component.onSubmit();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should not submit form with empty password', () => {
    component.credentials = {
      username: 'testuser',
      password: ''
    };

    component.onSubmit();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should set loading state during login', () => {
    const mockResponse = {
      token: 'mock-token',
      user: { id: 1, username: 'testuser', email: 'test@test.com' }
    };

    authServiceSpy.login.and.returnValue(of(mockResponse));
    
    component.credentials = {
      username: 'testuser',
      password: 'password123'
    };

    expect(component.isLoading).toBeFalse();
    
    component.onSubmit();
    
    // El loading debería haberse reseteado después del login exitoso
    expect(component.isLoading).toBeFalse();
  });
});
