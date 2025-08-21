import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { NotificationService } from '../services/notification.service';
import { User } from '../models/product.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" routerLink="/">Smash Tenis Store</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" 
              aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Inicio</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/products" routerLinkActive="active">Productos</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/cart" routerLinkActive="active">
              Carrito <span *ngIf="cartCount > 0" class="badge bg-danger">{{ cartCount }}</span>
            </a>
          </li>
          <li class="nav-item" *ngIf="currentUser">
            <a class="nav-link" routerLink="/orders" routerLinkActive="active">Mis pedidos</a>
          </li>
          <li class="nav-item" *ngIf="currentUser && isAdmin()">
            <a class="nav-link" routerLink="/admin" routerLinkActive="active">
              <i class="fas fa-cogs"></i> Admin
            </a>
          </li>
          <li class="nav-item" *ngIf="currentUser">
            <span class="nav-link">👤 {{ currentUser.username }}</span>
          </li>
          <li class="nav-item" *ngIf="currentUser">
            <a class="nav-link" href="#" (click)="logout()">Cerrar Sesión</a>
          </li>
          <li class="nav-item" *ngIf="!currentUser">
            <a class="nav-link" routerLink="/login" routerLinkActive="active">Iniciar Sesión</a>
          </li>
          <li class="nav-item" *ngIf="!currentUser">
            <a class="nav-link" routerLink="/register" routerLinkActive="active">Registrarse</a>
          </li>
        </ul>
      </div>
    </nav>
  `,
  styles: []
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  cartCount = 0;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.cartService.updateCartCount();
      } else {
        this.cartCount = 0;
      }
    });

    // Suscribirse a los cambios del contador del carrito
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });
  }

  loadCartCount() {
    if (this.currentUser) {
      this.cartService.getCartCount().subscribe({
        next: (response) => {
          if (response && typeof response === 'object' && 'count' in response) {
            this.cartCount = response.count || 0;
          } else {
            this.cartCount = response || 0;
          }
        },
        error: (error) => {
          console.error('Error loading cart count:', error);
          this.cartCount = 0;
        }
      });
    }
  }

  logout() {
    this.authService.logout();
    this.notificationService.logoutSuccess();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
