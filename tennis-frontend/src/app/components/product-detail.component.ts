import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/">Inicio</a></li>
          <li class="breadcrumb-item"><a routerLink="/products">Productos</a></li>
          <li class="breadcrumb-item active" *ngIf="product">{{ product.name }}</li>
        </ol>
      </nav>

      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando producto...</span>
        </div>
      </div>

      <div *ngIf="!loading && !product" class="text-center py-5">
        <h3>Producto no encontrado</h3>
        <p class="text-muted">El producto que buscas no existe o ha sido eliminado.</p>
        <a routerLink="/products" class="btn btn-primary">Volver a Productos</a>
      </div>

      <div *ngIf="product" class="row">
        <div class="col-md-6">
          <div class="text-center">
            <img [src]="getImageUrl(product.image)" 
                 [alt]="product.name" 
                 class="img-fluid rounded shadow"
                 style="max-height: 400px; object-fit: contain;">
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h1 class="card-title">{{ product.name }}</h1>
              <p class="card-text">{{ product.description }}</p>
              
              <div class="mb-4">
                <span class="h2 text-success">\${{ (+product.price).toFixed(2) }}</span>
              </div>

              <div class="mb-3">
                <div class="row">
                  <div class="col-6">
                    <label for="quantity" class="form-label">Cantidad:</label>
                    <select class="form-select" id="quantity" [(ngModel)]="selectedQuantity">
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="d-grid gap-2">
                <button 
                  class="btn btn-success btn-lg" 
                  (click)="addToCart()"
                  [disabled]="!isLoggedIn() || isAddingToCart"
                >
                  {{ isAddingToCart ? 'Agregando...' : 'Agregar al Carrito' }}
                </button>
                
                <button class="btn btn-outline-primary" (click)="goBack()">
                  Volver a Productos
                </button>
              </div>

              <div class="alert alert-warning mt-3" *ngIf="!isLoggedIn()">
                <strong>¡Importante!</strong> Debes <a routerLink="/login" class="alert-link">iniciar sesión</a> para agregar productos al carrito.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de características del producto -->
      <div *ngIf="product" class="row mt-5">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h4>Características del Producto</h4>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <ul class="list-unstyled">
                    <li><strong>✓</strong> Materiales de alta calidad</li>
                    <li><strong>✓</strong> Diseño ergonómico</li>
                    <li><strong>✓</strong> Suela antideslizante</li>
                    <li><strong>✓</strong> Transpirable</li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <ul class="list-unstyled">
                    <li><strong>✓</strong> Garantía de calidad</li>
                    <li><strong>✓</strong> Envío gratis</li>
                    <li><strong>✓</strong> Devoluciones fáciles</li>
                    <li><strong>✓</strong> Soporte técnico</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  isAddingToCart = false;
  selectedQuantity = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  loadProduct(id: number) {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.loading = false;
      }
    });
  }

  addToCart() {
    if (!this.product) return;
    
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.isAddingToCart = true;
    this.cartService.addToCart(this.product.id, this.selectedQuantity).subscribe({
      next: () => {
        this.notificationService.productAddedToCart(this.product!.name);
        this.isAddingToCart = false;
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.notificationService.showError('No se pudo agregar el producto al carrito. Intenta nuevamente.');
        this.isAddingToCart = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/products']);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return 'assets/images/default-shoe.jpg';
    
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
}
