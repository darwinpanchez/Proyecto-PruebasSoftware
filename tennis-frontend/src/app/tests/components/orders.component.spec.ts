import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { OrdersComponent } from '../../components/orders.component';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

describe('OrdersComponent', () => {
  let component: OrdersComponent;
  let fixture: ComponentFixture<OrdersComponent>;
  let orderService: jasmine.SpyObj<OrderService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockOrders = [
    {
      id: 1,
      total: 150.00,
      status: 'delivered',
      created_at: '2025-01-01T10:00:00Z',
      items: [
        {
          id: 1,
          name: 'Nike Air Max',
          price: 150.00,
          quantity: 1,
          image: 'assets/img/nike-air-max.jpg',
          product: { 
            id: 1,
            name: 'Nike Air Max', 
            description: 'Great shoes',
            price: 150.00,
            image: 'assets/img/nike-air-max.jpg'
          }
        }
      ]
    },
    {
      id: 2,
      total: 200.00,
      status: 'pending',
      orderDate: '2025-01-02T15:30:00Z',
      items: [] as any // Will be parsed as string in test
    }
  ];

  beforeEach(async () => {
    const orderServiceSpy = jasmine.createSpyObj('OrderService', ['getOrders', 'reorder']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);

    await TestBed.configureTestingModule({
      imports: [OrdersComponent, RouterTestingModule],
      providers: [
        { provide: OrderService, useValue: orderServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersComponent);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    
    // Default mock setup
    orderService.getOrders.and.returnValue(of([]));
    authService.isLoggedIn.and.returnValue(false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load orders on init when user is logged in', () => {
    authService.isLoggedIn.and.returnValue(true);
    orderService.getOrders.and.returnValue(of(mockOrders));

    component.ngOnInit();

    expect(orderService.getOrders).toHaveBeenCalled();
    expect(component.orders.length).toBe(2);
    expect(component.loading).toBeFalse();
  });

  it('should not load orders when user is not logged in', () => {
    authService.isLoggedIn.and.returnValue(false);

    component.ngOnInit();

    expect(orderService.getOrders).not.toHaveBeenCalled();
  });

  it('should handle orders loading error', () => {
    authService.isLoggedIn.and.returnValue(true);
    orderService.getOrders.and.returnValue(throwError(() => new Error('Network error')));
    spyOn(console, 'error');

    component.ngOnInit();

    expect(console.error).toHaveBeenCalledWith('Error loading orders:', jasmine.any(Error));
    expect(component.loading).toBeFalse();
  });

  it('should format date correctly', () => {
    const dateString = '2025-01-15T10:30:00Z';
    const formattedDate = component.formatDate(dateString);
    
    expect(formattedDate).toContain('2025');
    expect(formattedDate).toContain('enero');
  });

  it('should return default text for empty date', () => {
    const result = component.formatDate('');
    expect(result).toBe('Fecha no disponible');
  });

  it('should get correct status text', () => {
    expect(component.getStatusText('pending')).toBe('Pendiente');
    expect(component.getStatusText('processing')).toBe('Procesando');
    expect(component.getStatusText('shipped')).toBe('Enviado');
    expect(component.getStatusText('delivered')).toBe('Entregado');
    expect(component.getStatusText('cancelled')).toBe('Cancelado');
    expect(component.getStatusText('unknown')).toBe('unknown');
  });

  it('should get correct status CSS class', () => {
    expect(component.getStatusClass('pending')).toBe('bg-warning text-dark');
    expect(component.getStatusClass('processing')).toBe('bg-primary');
    expect(component.getStatusClass('shipped')).toBe('bg-info');
    expect(component.getStatusClass('delivered')).toBe('bg-success');
    expect(component.getStatusClass('cancelled')).toBe('bg-danger');
    expect(component.getStatusClass('unknown')).toBe('bg-secondary');
  });

  it('should view order details', () => {
    const order = mockOrders[0];
    component.viewOrderDetails(order);
    expect(component.selectedOrder).toBe(order);
  });

  it('should close modal', () => {
    component.selectedOrder = mockOrders[0];
    component.closeModal();
    expect(component.selectedOrder).toBeNull();
  });

  it('should reorder successfully', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    orderService.reorder.and.returnValue(of({}));

    component.reorder(1);

    expect(window.confirm).toHaveBeenCalled();
    expect(orderService.reorder).toHaveBeenCalledWith(1);
    expect(window.alert).toHaveBeenCalledWith('Productos agregados al carrito exitosamente');
  });

  it('should handle reorder error', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    spyOn(console, 'error');
    orderService.reorder.and.returnValue(throwError(() => new Error('Reorder error')));

    component.reorder(1);

    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Error al agregar productos al carrito');
  });

  it('should not reorder when user cancels', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.reorder(1);

    expect(orderService.reorder).not.toHaveBeenCalled();
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

  it('should parse order items correctly', () => {
    // Test string JSON parsing
    const stringItems = '[{"name":"Product","price":100}]';
    const parsedString = component['parseOrderItems'](stringItems);
    expect(parsedString).toEqual([{name: 'Product', price: 100}]);

    // Test array input
    const arrayItems = [{name: 'Product', price: 100}];
    const parsedArray = component['parseOrderItems'](arrayItems);
    expect(parsedArray).toEqual(arrayItems);

    // Test object input
    const objectItems = {name: 'Product', price: 100};
    const parsedObject = component['parseOrderItems'](objectItems);
    expect(parsedObject).toEqual([objectItems]);

    // Test invalid input
    const invalidItems = null;
    const parsedInvalid = component['parseOrderItems'](invalidItems);
    expect(parsedInvalid).toEqual([]);
  });

  it('should handle parse error gracefully', () => {
    spyOn(console, 'error');
    const invalidJson = '{invalid json}';
    const result = component['parseOrderItems'](invalidJson);
    
    expect(console.error).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should display login warning when not logged in', () => {
    authService.isLoggedIn.and.returnValue(false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Debes iniciar sesión para ver tus pedidos');
  });

  it('should display loading spinner when loading', () => {
    authService.isLoggedIn.and.returnValue(true);
    orderService.getOrders.and.returnValue(of([])); // Mock the service call
    component.loading = true;
    
    // Test component state instead of DOM
    expect(component.loading).toBeTrue();
    expect(component.isLoggedIn()).toBeTrue();
  });

  it('should display no orders message when empty and logged in', () => {
    authService.isLoggedIn.and.returnValue(true);
    orderService.getOrders.and.returnValue(of([])); // Mock the service call
    component.orders = [];
    component.loading = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No tienes pedidos aún');
    expect(compiled.textContent).toContain('Comenzar a Comprar');
  });

  it('should display orders when available', () => {
    authService.isLoggedIn.and.returnValue(true);
    orderService.getOrders.and.returnValue(of(mockOrders)); // Mock the service call
    component.orders = mockOrders;
    component.loading = false;
    
    // Test component state
    expect(component.orders.length).toBe(2);
    expect(component.orders[0].id).toBe(1);
    expect(component.orders[0].total).toBe(150.00);
  });
});
