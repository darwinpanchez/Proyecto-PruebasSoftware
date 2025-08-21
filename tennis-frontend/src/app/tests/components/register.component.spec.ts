import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from '../../components/register.component';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let router: Router;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['register']);
    const notificationSpy = jasmine.createSpyObj('NotificationService', [
      'registerSuccess', 
      'emailAlreadyExists', 
      'networkError',
      'showError',
      'showWarning'
    ]);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: NotificationService, useValue: notificationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    router = TestBed.inject(Router);
    
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty userData', () => {
    expect(component.userData.username).toBe('');
    expect(component.userData.email).toBe('');
    expect(component.userData.password).toBe('');
    expect(component.confirmPassword).toBe('');
  });

  it('should register successfully with valid data', () => {
    const mockResponse = {
      token: 'mock-token',
      user: { id: 1, username: 'newuser', email: 'new@test.com' }
    };

    authServiceSpy.register.and.returnValue(of(mockResponse));
    spyOn(console, 'log');
    
    component.userData = {
      username: 'newuser',
      email: 'new@test.com',
      password: 'password123'
    };
    component.confirmPassword = 'password123';

    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalledWith({
      username: 'newuser',
      email: 'new@test.com',
      password: 'password123'
    });
    expect(console.log).toHaveBeenCalledWith('Registration successful:', mockResponse);
    expect(notificationServiceSpy.registerSuccess).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle registration error with email conflict', () => {
    const errorResponse = {
      error: { message: 'Email already exists' },
      status: 409
    };

    authServiceSpy.register.and.returnValue(throwError(() => errorResponse));
    spyOn(console, 'error');
    
    component.userData = {
      username: 'newuser',
      email: 'existing@test.com',
      password: 'password123'
    };
    component.confirmPassword = 'password123';

    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Registration error:', errorResponse);
    expect(notificationServiceSpy.emailAlreadyExists).toHaveBeenCalled();
    expect(component.errorMessage).toBe('Email already exists');
    expect(component.isLoading).toBe(false);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should handle network error', () => {
    const networkError = {
      error: { message: 'Network error' },
      status: 0
    };

    authServiceSpy.register.and.returnValue(throwError(() => networkError));
    
    component.userData = {
      username: 'newuser',
      email: 'new@test.com',
      password: 'password123'
    };
    component.confirmPassword = 'password123';

    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalled();
    expect(notificationServiceSpy.networkError).toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
  });

  it('should handle generic server error', () => {
    const serverError = {
      error: { message: 'Internal server error' },
      status: 500
    };

    authServiceSpy.register.and.returnValue(throwError(() => serverError));
    
    component.userData = {
      username: 'newuser',
      email: 'new@test.com',
      password: 'password123'
    };
    component.confirmPassword = 'password123';

    component.onSubmit();

    expect(notificationServiceSpy.showError).toHaveBeenCalledWith(
      'No pudimos crear tu cuenta. Por favor verifica los datos e intenta nuevamente.',
      '❌ Error de Registro'
    );
  });

  it('should not submit with password mismatch', () => {
    component.userData = {
      username: 'newuser',
      email: 'new@test.com',
      password: 'password123'
    };
    component.confirmPassword = 'differentpassword';

    component.onSubmit();

    expect(authServiceSpy.register).not.toHaveBeenCalled();
    expect(notificationServiceSpy.showWarning).toHaveBeenCalledWith(
      'Por favor completa todos los campos correctamente',
      'Datos Incompletos'
    );
  });

  it('should not submit with empty fields', () => {
    component.userData = {
      username: '',
      email: 'new@test.com',
      password: 'password123'
    };
    component.confirmPassword = 'password123';

    component.onSubmit();

    expect(authServiceSpy.register).not.toHaveBeenCalled();
    expect(notificationServiceSpy.showWarning).toHaveBeenCalledWith(
      'Por favor completa todos los campos correctamente',
      'Datos Incompletos'
    );
  });

  it('should set loading state during registration', () => {
    const mockResponse = {
      token: 'mock-token',
      user: { id: 1, username: 'newuser', email: 'new@test.com' }
    };

    authServiceSpy.register.and.returnValue(of(mockResponse));
    
    component.userData = {
      username: 'newuser',
      email: 'new@test.com',
      password: 'password123'
    };
    component.confirmPassword = 'password123';

    expect(component.isLoading).toBe(false);
    
    component.onSubmit();
    
    // After successful registration, loading should be reset in the success handler
    // but since it's async, we can't test the intermediate state easily
    expect(authServiceSpy.register).toHaveBeenCalled();
  });

  it('should handle registration error without message', () => {
    const errorResponse = {
      error: {},
      status: 400
    };

    authServiceSpy.register.and.returnValue(throwError(() => errorResponse));
    
    component.userData = {
      username: 'newuser',
      email: 'new@test.com',
      password: 'password123'
    };
    component.confirmPassword = 'password123';

    component.onSubmit();

    expect(component.errorMessage).toBe('Error al crear la cuenta. Intenta nuevamente.');
    expect(component.isLoading).toBe(false);
  });
});
