import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { CartItem } from '../models/product.model';

interface CheckoutForm {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  payment_method: string;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">Carrito de Compras</h2>
        <div>
          <button class="btn btn-warning me-2" 
                  (click)="clearCart()" 
                  *ngIf="cartItems.length > 0"
                  [disabled]="loadingItemId === 'clearing'"
                  title="Vaciar todo el carrito">
            <span *ngIf="loadingItemId === 'clearing'" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i *ngIf="loadingItemId !== 'clearing'" class="fas fa-broom me-2"></i>
            {{ loadingItemId === 'clearing' ? 'Vaciando...' : 'Vaciar Carrito' }}
          </button>
          <button class="btn btn-secondary" (click)="goBack()">
            <i class="fas fa-arrow-left me-2"></i> Continuar Comprando
          </button>
        </div>
      </div>

      <div *ngIf="cartItems.length === 0" class="text-center py-5">
        <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
        <h4 class="text-muted">Tu carrito está vacío</h4>
        <p class="text-muted">¡Agrega algunos productos increíbles!</p>
        <button class="btn btn-primary" (click)="goToProducts()">
          Ver Productos
        </button>
      </div>

      <div *ngIf="cartItems.length > 0">
        <div class="row">
          <!-- Cart Items -->
          <div class="col-lg-8">
            <div class="card">
              <div class="card-body">
                <div *ngFor="let item of cartItems" class="cart-item mb-3 pb-3 border-bottom">
                  <div class="row align-items-center">
                    <div class="col-md-2">
                      <img [src]="getImageUrl(item.image_url || item.image)" 
                           [alt]="item.product_name || item.name" 
                           class="img-fluid rounded"
                           style="width: 80px; height: 80px; object-fit: cover;">
                    </div>
                    <div class="col-md-4">
                      <h6 class="mb-1">{{item.product_name || item.name}}</h6>
                      <small class="text-muted" *ngIf="item.size">Talla: {{item.size}}</small>
                    </div>
                    <div class="col-md-3">
                      <div class="d-flex align-items-center justify-content-center">
                        <button class="btn btn-danger btn-sm me-2" 
                                (click)="updateQuantity(item, item.quantity - 1)"
                                [disabled]="item.quantity <= 1 || loadingItemId === item.id"
                                title="Disminuir cantidad"
                                style="min-width: 40px; font-size: 1.2rem; font-weight: bold;">
                          <span *ngIf="loadingItemId === item.id" class="spinner-border spinner-border-sm" role="status"></span>
                          <span *ngIf="loadingItemId !== item.id">−</span>
                        </button>
                        <span class="mx-3 fw-bold fs-4 text-primary" style="min-width: 40px; text-align: center;">{{item.quantity}}</span>
                        <button class="btn btn-success btn-sm ms-2" 
                                (click)="updateQuantity(item, item.quantity + 1)"
                                [disabled]="(item.stock && item.quantity >= item.stock) || loadingItemId === item.id"
                                title="Aumentar cantidad"
                                style="min-width: 40px; font-size: 1.2rem; font-weight: bold;">
                          <span *ngIf="loadingItemId === item.id" class="spinner-border spinner-border-sm" role="status"></span>
                          <span *ngIf="loadingItemId !== item.id">+</span>
                        </button>
                      </div>
                    </div>
                    <div class="col-md-2 text-end">
                      <strong>\${{getItemTotal(item)}}</strong>
                    </div>
                    <div class="col-md-1 text-end">
                      <button class="btn btn-danger btn-sm" 
                              (click)="removeFromCart(item.id)"
                              [disabled]="loadingItemId === item.id"
                              title="Eliminar producto del carrito"
                              style="min-width: 40px;">
                        <span *ngIf="loadingItemId === item.id" class="spinner-border spinner-border-sm text-light" role="status"></span>
                        <i *ngIf="loadingItemId !== item.id" class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Cart Summary -->
          <div class="col-lg-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Resumen del Pedido</h5>
                <div class="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>\${{getSubtotal().toFixed(2)}}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>Envío:</span>
                  <span>\${{getShipping().toFixed(2)}}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>Impuestos:</span>
                  <span>\${{getTax().toFixed(2)}}</span>
                </div>
                <hr>
                <div class="d-flex justify-content-between mb-3">
                  <strong>Total:</strong>
                  <strong>\${{getTotal().toFixed(2)}}</strong>
                </div>
                
                <div *ngIf="!isLoggedIn()" class="alert alert-info mb-3">
                  Por favor <a routerLink="/login" class="alert-link">inicia sesión</a> para continuar con el pago.
                </div>
                
                <button class="btn btn-success w-100 fw-bold py-3" 
                        data-bs-toggle="modal" 
                        data-bs-target="#checkoutModal"
                        [disabled]="cartItems.length === 0 || !isLoggedIn()"
                        style="font-size: 1.1rem;">
                  <i class="fas fa-credit-card me-2"></i>
                  {{ isLoggedIn() ? 'Proceder al Pago' : 'Inicia Sesión para Continuar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Checkout Modal -->
    <div class="modal fade" id="checkoutModal" tabindex="-1" aria-labelledby="checkoutModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="checkoutModalLabel">Finalizar Compra</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form #checkoutForm="ngForm" (ngSubmit)="processCheckout(checkoutForm)">
            <div class="modal-body">
              <div class="row">
                <!-- Customer Information -->
                <div class="col-md-6">
                  <h6 class="mb-3">Información Personal</h6>
                  
                  <div class="mb-3">
                    <label for="customer_name" class="form-label">Nombre Completo *</label>
                    <input type="text" 
                           class="form-control" 
                           id="customer_name" 
                           name="customer_name"
                           [(ngModel)]="form.customer_name"
                           #customerName="ngModel"
                           required
                           minlength="2"
                           maxlength="100"
                           pattern="^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$"
                           [class.is-invalid]="customerName.invalid && customerName.touched"
                           placeholder="Ingresa tu nombre completo">
                    <div class="invalid-feedback" *ngIf="customerName.invalid && customerName.touched">
                      <div *ngIf="customerName.errors?.['required']">El nombre es obligatorio</div>
                      <div *ngIf="customerName.errors?.['minlength']">El nombre debe tener al menos 2 caracteres</div>
                      <div *ngIf="customerName.errors?.['maxlength']">El nombre no puede exceder 100 caracteres</div>
                      <div *ngIf="customerName.errors?.['pattern']">El nombre solo puede contener letras y espacios</div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="customer_email" class="form-label">Correo Electrónico *</label>
                    <input type="email" 
                           class="form-control" 
                           id="customer_email" 
                           name="customer_email"
                           [(ngModel)]="form.customer_email"
                           #customerEmail="ngModel"
                           required
                           pattern="^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                           [class.is-invalid]="customerEmail.invalid && customerEmail.touched"
                           placeholder="ejemplo@correo.ec">
                    <div class="invalid-feedback" *ngIf="customerEmail.invalid && customerEmail.touched">
                      <div *ngIf="customerEmail.errors?.['required']">El correo electrónico es obligatorio</div>
                      <div *ngIf="customerEmail.errors?.['pattern']">Ingresa un correo electrónico válido (ej: nombre&#64;correo.ec)</div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="customer_phone" class="form-label">Teléfono *</label>
                    <input type="tel" 
                           class="form-control" 
                           id="customer_phone" 
                           name="customer_phone"
                           [(ngModel)]="form.customer_phone"
                           #customerPhone="ngModel"
                           required
                           pattern="^[0-9\-\s()]{7,15}$"
                           [class.is-invalid]="customerPhone.invalid && customerPhone.touched"
                           placeholder="Ej: 09-9999-9999 o 02-999-9999">
                    <div class="invalid-feedback" *ngIf="customerPhone.invalid && customerPhone.touched">
                      <div *ngIf="customerPhone.errors?.['required']">El teléfono es obligatorio</div>
                      <div *ngIf="customerPhone.errors?.['pattern']">Ingresa un número de teléfono válido de Ecuador</div>
                    </div>
                    <div class="invalid-feedback" *ngIf="customerPhone.invalid && customerPhone.touched">
                      <div *ngIf="customerPhone.errors?.['required']">El teléfono es obligatorio</div>
                      <div *ngIf="customerPhone.errors?.['pattern']">Ingresa un número de teléfono válido (8-15 dígitos)</div>
                    </div>
                  </div>
                </div>

                <!-- Shipping Information -->
                <div class="col-md-6">
                  <h6 class="mb-3">Dirección de Envío</h6>
                  
                  <div class="mb-3">
                    <label for="shipping_address" class="form-label">Dirección *</label>
                    <textarea class="form-control" 
                              id="shipping_address" 
                              name="shipping_address"
                              [(ngModel)]="form.shipping_address"
                              #shippingAddress="ngModel"
                              required
                              minlength="10"
                              maxlength="200"
                              [class.is-invalid]="shippingAddress.invalid && shippingAddress.touched"
                              rows="3"
                              placeholder="Calle principal, número, sector, referencias (Ej: Av. 10 de Agosto N24-253 y Cordero)"></textarea>
                    <div class="invalid-feedback" *ngIf="shippingAddress.invalid && shippingAddress.touched">
                      <div *ngIf="shippingAddress.errors?.['required']">La dirección es obligatoria</div>
                      <div *ngIf="shippingAddress.errors?.['minlength']">La dirección debe tener al menos 10 caracteres</div>
                      <div *ngIf="shippingAddress.errors?.['maxlength']">La dirección no puede exceder 200 caracteres</div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="shipping_city" class="form-label">Ciudad *</label>
                    <input type="text" 
                           class="form-control" 
                           id="shipping_city" 
                           name="shipping_city"
                           [(ngModel)]="form.shipping_city"
                           #shippingCity="ngModel"
                           required
                           minlength="2"
                           maxlength="50"
                           pattern="^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$"
                           [class.is-invalid]="shippingCity.invalid && shippingCity.touched"
                           placeholder="Quito, Guayaquil, Cuenca, etc.">
                    <div class="invalid-feedback" *ngIf="shippingCity.invalid && shippingCity.touched">
                      <div *ngIf="shippingCity.errors?.['required']">La ciudad es obligatoria</div>
                      <div *ngIf="shippingCity.errors?.['minlength']">La ciudad debe tener al menos 2 caracteres</div>
                      <div *ngIf="shippingCity.errors?.['maxlength']">La ciudad no puede exceder 50 caracteres</div>
                      <div *ngIf="shippingCity.errors?.['pattern']">La ciudad solo puede contener letras y espacios</div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="payment_method" class="form-label">Método de Pago *</label>
                    <select class="form-select" 
                            id="payment_method" 
                            name="payment_method"
                            [(ngModel)]="form.payment_method"
                            #paymentMethod="ngModel"
                            required
                            [class.is-invalid]="paymentMethod.invalid && paymentMethod.touched">
                      <option value="">Selecciona un método de pago</option>
                      <option value="credit_card">Tarjeta de Crédito</option>
                      <option value="debit_card">Tarjeta de Débito</option>
                    </select>
                    <div class="invalid-feedback" *ngIf="paymentMethod.invalid && paymentMethod.touched">
                      <div *ngIf="paymentMethod.errors?.['required']">Selecciona un método de pago</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Order Summary -->
              <div class="row mt-4">
                <div class="col-12">
                  <h6>Resumen del Pedido</h6>
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let item of cartItems">
                          <td>{{item.product_name || item.name}}<span *ngIf="item.size"> ({{item.size}})</span></td>
                          <td>{{item.quantity}}</td>
                          <td>\${{formatPrice(item.price)}}</td>
                          <td>\${{getItemTotal(item)}}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colspan="3"><strong>Total:</strong></td>
                          <td><strong>\${{getTotal().toFixed(2)}}</strong></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" 
                      class="btn btn-primary" 
                      [disabled]="!checkoutForm.form.valid || !validateForm() || isProcessing">
                <span *ngIf="isProcessing" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{isProcessing ? 'Procesando...' : 'Confirmar Pedido'}}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-item {
      transition: all 0.3s ease;
      padding: 20px;
      border-radius: 15px;
      background: rgba(248, 249, 250, 0.7);
      border: 1px solid rgba(0, 123, 255, 0.1);
    }

    .cart-item:hover {
      background: rgba(0, 123, 255, 0.08);
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      border-color: rgba(0, 123, 255, 0.2);
    }

    .btn {
      border-radius: 10px;
      transition: all 0.3s ease;
      font-weight: 600;
    }

    .btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }

    .btn-danger:hover:not(:disabled) {
      box-shadow: 0 6px 20px rgba(220, 53, 69, 0.3);
    }

    .btn-success:hover:not(:disabled) {
      box-shadow: 0 6px 20px rgba(40, 167, 69, 0.3);
    }

    .btn-warning {
      background: linear-gradient(135deg, #ffc107, #fd7e14);
      border: none;
    }

    .btn-warning:hover:not(:disabled) {
      box-shadow: 0 6px 20px rgba(255, 193, 7, 0.4);
    }

    .btn-secondary {
      background: linear-gradient(135deg, #6c757d, #495057);
      border: none;
    }

    .card {
      border: none;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .card:hover {
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
      transform: translateY(-5px);
    }

    .card-body {
      padding: 30px;
    }

    .quantity-controls .btn {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.3rem;
    }

    .empty-cart {
      padding: 80px 40px;
      text-align: center;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 20px;
      margin: 40px 0;
    }

    .empty-cart i {
      color: #6c757d;
      margin-bottom: 30px;
      opacity: 0.7;
    }

    .empty-cart h4 {
      color: #495057;
      margin-bottom: 15px;
    }

    .empty-cart p {
      color: #6c757d;
      margin-bottom: 30px;
      font-size: 1.1rem;
    }

    .modal-content {
      border-radius: 20px;
      border: none;
      overflow: hidden;
    }

    .modal-header {
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
      padding: 25px;
    }

    .modal-body {
      padding: 40px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .form-control, .form-select {
      border-radius: 10px;
      border: 2px solid #e9ecef;
      padding: 12px 16px;
      transition: all 0.3s ease;
      font-size: 1rem;
    }

    .form-control:focus, .form-select:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 0.25rem rgba(0, 123, 255, 0.15);
      transform: translateY(-1px);
    }

    .form-label {
      font-weight: 600;
      color: #495057;
      margin-bottom: 10px;
    }

    .is-invalid {
      border-color: #dc3545;
    }

    .invalid-feedback {
      display: block;
      width: 100%;
      margin-top: 0.25rem;
      font-size: 0.875em;
      color: #dc3545;
    }

    .form-control.is-invalid,
    .form-select.is-invalid {
      border-color: #dc3545;
      padding-right: calc(1.5em + 0.75rem);
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath d='m5.8 3.6 1.4 1.4-1.4 1.4'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right calc(0.375em + 0.1875rem) center;
      background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
    }

    .total-amount {
      font-size: 1.4rem;
      font-weight: bold;
      color: #28a745;
      background: rgba(40, 167, 69, 0.1);
      padding: 15px;
      border-radius: 12px;
      text-align: center;
    }

    @media (max-width: 768px) {
      .cart-item {
        padding: 15px;
      }
      
      .cart-item .row > div {
        margin-bottom: 15px;
        text-align: center;
      }
      
      .card-body {
        padding: 20px;
      }
      
      .modal-body {
        padding: 20px;
      }
    }

    .fade-in {
      animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  isProcessing = false;
  loadingItemId: number | string | null = null; // Para mostrar loading en botones específicos
  
  form: CheckoutForm = {
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    shipping_city: '',
    payment_method: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadCart();
    this.checkAuthentication();
    this.prefillUserData();
  }

  checkAuthentication(): void {
    if (!this.authService.isLoggedIn()) {
      this.notificationService.loginRequiredForCart();
      this.router.navigate(['/login']);
      return;
    }
  }

  loadCart(): void {
    if (!this.authService.isLoggedIn()) {
      this.notificationService.loginRequiredForCart();
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.getCart().subscribe({
      next: (items) => {
        this.cartItems = items;
      },
      error: (error) => {
        this.notificationService.networkError();
      }
    });
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1 || (item.stock && newQuantity > item.stock) || this.loadingItemId === item.id) {
      if (item.stock && newQuantity > item.stock) {
        this.notificationService.showWarning(
          `Solo disponemos de ${item.stock} unidades de este producto`,
          '⚠️ Stock Limitado'
        );
      }
      return;
    }

    this.loadingItemId = item.id;
    this.cartService.updateCartItem(item.id, newQuantity).subscribe({
      next: () => {
        setTimeout(() => {
          item.quantity = newQuantity;
          this.loadingItemId = null;
          this.notificationService.showSuccess(
            `Cantidad actualizada: ${newQuantity} ${newQuantity === 1 ? 'unidad' : 'unidades'}`,
            '✅ Cantidad Actualizada'
          );
        }, 500);
      },
      error: (error) => {
        this.loadingItemId = null;
        this.notificationService.quantityUpdateError();
      }
    });
  }

  removeFromCart(itemId: number): void {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
      this.loadingItemId = itemId;
      
      this.cartService.removeFromCart(itemId).subscribe({
        next: () => {
          setTimeout(() => {
            this.cartItems = this.cartItems.filter(item => item.id !== itemId);
            this.loadingItemId = null;
            this.notificationService.itemRemovedFromCart();
          }, 300);
        },
        error: (error) => {
          this.loadingItemId = null;
          this.notificationService.itemRemoveError();
        }
      });
    }
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => {
      const price = this.getItemPrice(item);
      const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  }

  getShipping(): number {
    const subtotal = this.getSubtotal();
    return subtotal > 100 ? 0 : 15; // Free shipping over $100
  }

  getTax(): number {
    return this.getSubtotal() * 0.15; // 15% tax como en la versión original
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShipping() + this.getTax();
  }

  processCheckout(form: any): void {
    if (!form.valid || !this.validateForm()) {
      this.notificationService.cartValidationError();
      return;
    }

    if (this.cartItems.length === 0) {
      this.notificationService.emptyCartError();
      return;
    }

    this.isProcessing = true;
    
    // Simular proceso de verificación de pago como en la versión original
    this.notificationService.showInfo('Comprobando datos de pago...', 'Procesando');
    
    setTimeout(() => {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      const orderData = {
        ...this.form,
        total_amount: this.getTotal(),
        items: this.cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: this.getItemPrice(item),
          size: item.size
        }))
      };

      this.http.post('http://localhost:3000/api/orders', orderData, { headers })
        .subscribe({
          next: (response: any) => {
            this.isProcessing = false;
            
            // Mostrar mensaje de éxito como en la versión original
            this.notificationService.showSuccess(
              `¡Gracias, ${this.form.customer_name}! Tu pedido ha sido registrado. Enviaremos una confirmación a ${this.form.customer_email}.`,
              '¡Pago completado!'
            );
            
            // Clear cart
            this.cartItems = [];
            
            // Reset form
            this.form = {
              customer_name: '',
              customer_email: '',
              customer_phone: '',
              shipping_address: '',
              shipping_city: '',
              payment_method: ''
            };
            
            // Close modal and redirect like original
            const modal = document.getElementById('checkoutModal');
            if (modal) {
              const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
              if (bootstrapModal) {
                bootstrapModal.hide();
              }
            }
            
            // Redirect after 3 seconds like original
            setTimeout(() => {
              this.router.navigate(['/orders']);
            }, 3000);
          },
          error: (error) => {
            this.isProcessing = false;
            this.notificationService.orderProcessError();
          }
        });
    }, 2000); // 2 segundos de simulación como en la versión original
  }

  goBack(): void {
    window.history.back();
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  clearCart(): void {
    // Confirmar directamente sin doble notificación
    if (window.confirm('¿Estás seguro de que quieres vaciar todo el carrito? Esta acción no se puede deshacer.')) {
      this.loadingItemId = 'clearing';
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.delete('http://localhost:3000/api/cart', { headers })
        .subscribe({
          next: () => {
            setTimeout(() => {
              this.cartItems = [];
              this.loadingItemId = null;
              this.notificationService.cartCleared();
            }, 1000); // Simular tiempo de procesamiento
          },
          error: (error) => {
            this.loadingItemId = null;
            this.notificationService.cartClearError();
          }
        });
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  validateForm(): boolean {
    const { customer_name, customer_email, customer_phone, shipping_address, shipping_city, payment_method } = this.form;
    
    const namePattern = /^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$/;
    const emailPattern = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phonePattern = /^[0-9\-\s()]{7,15}$/;
    const cityPattern = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/;

    return (
      !!customer_name && 
      customer_name.length >= 2 && 
      namePattern.test(customer_name) &&
      
      !!customer_email && 
      emailPattern.test(customer_email) &&
      
      !!customer_phone && 
      phonePattern.test(customer_phone) &&
      
      !!shipping_address && 
      shipping_address.length >= 10 &&
      
      !!shipping_city && 
      shipping_city.length >= 2 && 
      cityPattern.test(shipping_city) &&
      
      !!payment_method
    );
  }

  // Helper functions para manejar precios de manera segura
  formatPrice(price: any): string {
    const numPrice = typeof price === 'number' ? price : parseFloat(price) || 0;
    return numPrice.toFixed(2);
  }

  getFormattedPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  getItemPrice(item: any): number {
    return typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
  }

  getItemTotal(item: any): string {
    const price = this.getItemPrice(item);
    const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 0;
    return (price * quantity).toFixed(2);
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return 'assets/img/default-shoe.jpg';
    
    // Si la imagen ya es una URL completa, devolverla tal como está
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Si empieza con slash, agregar solo el dominio
    if (imagePath.startsWith('/')) {
      return `http://localhost:3000${imagePath}`;
    }
    
    // Limpiar path y construir URL
    const cleanPath = imagePath.replace('../', '');
    if (cleanPath.startsWith('assets/')) {
      return cleanPath;
    }
    
    return `http://localhost:3000/${cleanPath}`;
  }

  prefillUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.form.customer_name = currentUser.username || '';
      this.form.customer_email = currentUser.email || '';
      // Los campos de dirección y teléfono quedan vacíos para que el usuario los complete
    }
  }
}
