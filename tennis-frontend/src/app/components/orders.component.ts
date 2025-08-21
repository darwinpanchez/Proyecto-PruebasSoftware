import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { Order } from '../models/product.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <h1 class="mb-4">📋 Mis Pedidos</h1>

      <div *ngIf="!isLoggedIn()" class="alert alert-warning">
        <strong>¡Atención!</strong> Debes <a routerLink="/login" class="alert-link">iniciar sesión</a> para ver tus pedidos.
      </div>

      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando pedidos...</span>
        </div>
      </div>

      <div *ngIf="isLoggedIn() && orders.length === 0 && !loading" class="text-center py-5">
        <h3>No tienes pedidos aún</h3>
        <p class="text-muted">Cuando realices tu primer pedido aparecerá aquí</p>
        <a routerLink="/products" class="btn btn-primary">Comenzar a Comprar</a>
      </div>

      <div *ngIf="isLoggedIn() && orders.length > 0">
        <div class="row">
          <div class="col-12">
            <div class="card mb-4" *ngFor="let order of orders">
              <div class="card-header">
                <div class="row align-items-center">
                  <div class="col-md-6">
                    <h5 class="mb-0">Pedido #{{ order.id }}</h5>
                    <small class="text-muted">{{ formatDate(order.created_at || order.orderDate || '') }}</small>
                  </div>
                  <div class="col-md-6 text-md-end">
                    <span class="badge" [ngClass]="getStatusClass(order.status)">
                      {{ getStatusText(order.status) }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-8">
                    <h6>Productos:</h6>
                    <div class="table-responsive">
                      <table class="table table-sm">
                        <tbody>
                          <tr *ngFor="let item of order.items">
                            <td class="text-center" style="width: 80px;">
                              <img [src]="getImageUrl(item.image || item.product?.image || '')" 
                                   [alt]="item.name || item.product?.name"
                                   style="width: 50px; height: 50px; object-fit: contain;">
                            </td>
                            <td>
                              <strong>{{ item.name || item.product?.name }}</strong>
                            </td>
                            <td class="text-center">
                              Cantidad: {{ item.quantity }}
                            </td>
                            <td class="text-end">
                              \${{ (+item.price).toFixed(2) }} c/u
                            </td>
                            <td class="text-end">
                              <strong>\${{ ((+item.price) * item.quantity).toFixed(2) }}</strong>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="text-end">
                      <h5>Total del Pedido:</h5>
                      <h3 class="text-success">\${{ (+order.total).toFixed(2) }}</h3>
                      
                      <div class="mt-3">
                        <button class="btn btn-outline-primary btn-sm me-2" 
                                (click)="viewOrderDetails(order)">
                          Ver Detalles
                        </button>
                        <button class="btn btn-outline-success btn-sm" 
                                (click)="reorder(order.id)"
                                *ngIf="order.status === 'delivered'">
                          Volver a Pedir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal para detalles del pedido -->
      <div class="modal fade" id="orderDetailsModal" tabindex="-1" *ngIf="selectedOrder">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detalles del Pedido #{{ selectedOrder.id }}</h5>
              <button type="button" class="btn-close" (click)="closeModal()"></button>
            </div>
            <div class="modal-body">
              <div class="row mb-3">
                <div class="col-md-6">
                  <strong>Fecha:</strong> {{ formatDate(selectedOrder.created_at || selectedOrder.orderDate || '') }}
                </div>
                <div class="col-md-6">
                  <strong>Estado:</strong> 
                  <span class="badge ms-2" [ngClass]="getStatusClass(selectedOrder.status)">
                    {{ getStatusText(selectedOrder.status) }}
                  </span>
                </div>
              </div>
              
              <h6>Productos del pedido:</h6>
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th class="text-center">Cantidad</th>
                      <th class="text-end">Precio</th>
                      <th class="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of selectedOrder.items">
                      <td>
                        <div class="d-flex align-items-center">
                          <img [src]="getImageUrl(item.image || item.product?.image || '')" 
                               [alt]="item.name || item.product?.name"
                               class="me-3" style="width: 60px; height: 60px; object-fit: contain;">
                          <div>
                            <strong>{{ item.name || item.product?.name }}</strong>
                            <br>
                            <small class="text-muted">{{ item.product?.description }}</small>
                          </div>
                        </div>
                      </td>
                      <td class="text-center">{{ item.quantity }}</td>
                      <td class="text-end">\${{ (+item.price).toFixed(2) }}</td>
                      <td class="text-end"><strong>\${{ ((+item.price) * item.quantity).toFixed(2) }}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div class="text-end">
                <h5>Total: <span class="text-success">\${{ (+selectedOrder.total).toFixed(2) }}</span></h5>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  selectedOrder: Order | null = null;

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.isLoggedIn()) {
      this.loadOrders();
    }
  }

  loadOrders() {
    this.loading = true;
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders.map(order => ({
          ...order,
          items: Array.isArray(order.items) ? order.items : this.parseOrderItems(order.items)
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  private parseOrderItems(items: any): any[] {
    try {
      if (typeof items === 'string') {
        // Si es string, intentar parsearlo como JSON
        const parsed = JSON.parse(items);
        return Array.isArray(parsed) ? parsed : [parsed];
      } else if (Array.isArray(items)) {
        return items;
      } else if (items && typeof items === 'object') {
        // Si es un objeto, convertirlo en array
        return [items];
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error parsing order items:', error, 'Raw items:', items);
      return [];
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendiente',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'pending': 'bg-warning text-dark',
      'processing': 'bg-primary',
      'shipped': 'bg-info',
      'delivered': 'bg-success',
      'cancelled': 'bg-danger'
    };
    return classMap[status] || 'bg-secondary';
  }

  viewOrderDetails(order: Order) {
    this.selectedOrder = order;
    // En un entorno real, usarías Bootstrap Modal
    // Por ahora, el modal se muestra con *ngIf
  }

  closeModal() {
    this.selectedOrder = null;
  }

  reorder(orderId: number) {
    if (confirm('¿Quieres agregar todos los productos de este pedido al carrito?')) {
      this.orderService.reorder(orderId).subscribe({
        next: () => {
          alert('Productos agregados al carrito exitosamente');
        },
        error: (error) => {
          console.error('Error reordering:', error);
          alert('Error al agregar productos al carrito');
        }
      });
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return 'assets/img/default-shoe.jpg';
    const cleanPath = imagePath.replace('../', '');
    return cleanPath.startsWith('assets/') ? cleanPath : `assets/${cleanPath}`;
  }
}
