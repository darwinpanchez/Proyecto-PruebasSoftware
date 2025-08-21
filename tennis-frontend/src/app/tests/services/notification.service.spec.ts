import { TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../services/notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: ToastrService, useValue: spy }
      ]
    });
    
    service = TestBed.inject(NotificationService);
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show success notification', () => {
    const message = 'Test success message';
    const title = 'Success';

    service.showSuccess(message, title);

    expect(toastrSpy.success).toHaveBeenCalledWith(message, title, {
      timeOut: 3000,
      progressBar: true,
      closeButton: true
    });
  });

  it('should show error notification', () => {
    const message = 'Test error message';
    const title = 'Error';

    service.showError(message, title);

    expect(toastrSpy.error).toHaveBeenCalledWith(message, title, {
      timeOut: 5000,
      progressBar: true,
      closeButton: true
    });
  });

  it('should show warning notification', () => {
    const message = 'Test warning message';

    service.showWarning(message);

    expect(toastrSpy.warning).toHaveBeenCalledWith(message, '¡Atención!', {
      timeOut: 4000,
      progressBar: true,
      closeButton: true
    });
  });

  it('should show info notification', () => {
    const message = 'Test info message';

    service.showInfo(message);

    expect(toastrSpy.info).toHaveBeenCalledWith(message, 'Información', {
      timeOut: 3000,
      progressBar: true,
      closeButton: true
    });
  });

  it('should call toastr with custom title and message', () => {
    const customMessage = 'Custom success message';
    const customTitle = 'Custom Title';
    
    service.showSuccess(customMessage, customTitle);
    
    expect(toastrSpy.success).toHaveBeenCalledWith(customMessage, customTitle, jasmine.any(Object));
  });

  it('should call showError with default title when not provided', () => {
    const message = 'Error occurred';
    
    service.showError(message);
    
    expect(toastrSpy.error).toHaveBeenCalledWith(message, '¡Error!', jasmine.any(Object));
  });

  it('should call showWarning with proper configuration', () => {
    const message = 'Warning message';
    const title = 'Warning!';
    
    service.showWarning(message, title);
    
    expect(toastrSpy.warning).toHaveBeenCalledWith(message, title, {
      timeOut: 4000,
      progressBar: true,
      closeButton: true
    });
  });

  it('should call showInfo with default title', () => {
    const message = 'Info message';
    
    service.showInfo(message);
    
    expect(toastrSpy.info).toHaveBeenCalledWith(message, 'Información', jasmine.any(Object));
  });

  it('should show product added to cart notification', () => {
    const productName = 'Nike Air Max';
    
    service.productAddedToCart(productName);
    
    expect(toastrSpy.success).toHaveBeenCalledWith(
      '<strong>Nike Air Max</strong> se ha agregado al carrito',
      '🛒 ¡Agregado al Carrito!',
      jasmine.any(Object)
    );
  });

  it('should show login success notification', () => {
    const userName = 'John Doe';
    
    service.loginSuccess(userName);
    
    expect(toastrSpy.success).toHaveBeenCalledWith(
      '¡Bienvenido de vuelta, <strong>John Doe</strong>!',
      '🎾 ¡Hola!',
      jasmine.any(Object)
    );
  });

  it('should show logout success notification', () => {
    service.logoutSuccess();
    
    expect(toastrSpy.info).toHaveBeenCalledWith(
      'Has cerrado sesión correctamente. ¡Vuelve pronto!',
      '👋 ¡Hasta luego!',
      jasmine.any(Object)
    );
  });

  it('should show register success notification', () => {
    service.registerSuccess();
    
    expect(toastrSpy.success).toHaveBeenCalledWith(
      'Tu cuenta ha sido creada exitosamente. ¡Ya puedes empezar a comprar!',
      '🎉 ¡Registro Exitoso!',
      jasmine.any(Object)
    );
  });

  it('should show order placed notification', () => {
    service.orderPlaced();
    
    expect(toastrSpy.success).toHaveBeenCalledWith(
      'Tu pedido ha sido procesado correctamente. Recibirás un email de confirmación.',
      '📦 ¡Pedido Realizado!',
      jasmine.any(Object)
    );
  });

  it('should show cart cleared notification', () => {
    service.cartCleared();
    
    expect(toastrSpy.info).toHaveBeenCalledWith(
      'Tu carrito ha sido vaciado',
      '🧹 Carrito Limpio',
      jasmine.any(Object)
    );
  });

  it('should show item removed from cart notification', () => {
    service.itemRemovedFromCart();
    
    expect(toastrSpy.warning).toHaveBeenCalledWith(
      'El producto ha sido eliminado del carrito',
      '🗑️ Producto Eliminado',
      jasmine.any(Object)
    );
  });

  it('should show network error notification', () => {
    service.networkError();
    
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Error de conexión. Por favor verifica tu internet e intenta nuevamente.',
      '🌐 Error de Conexión',
      jasmine.any(Object)
    );
  });

  it('should show server error notification', () => {
    service.serverError();
    
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Ups! Algo salió mal en nuestros servidores. Estamos trabajando para solucionarlo.',
      '⚠️ Error del Servidor',
      jasmine.any(Object)
    );
  });

  it('should show invalid credentials notification', () => {
    service.invalidCredentials();
    
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Email o contraseña incorrectos. Por favor verifica tus datos.',
      '🔐 Credenciales Inválidas',
      jasmine.any(Object)
    );
  });

  it('should show email already exists notification', () => {
    service.emailAlreadyExists();
    
    expect(toastrSpy.warning).toHaveBeenCalledWith(
      'Ya existe una cuenta con este email. ¿Olvidaste tu contraseña?',
      '📧 Email en Uso',
      jasmine.any(Object)
    );
  });
});
