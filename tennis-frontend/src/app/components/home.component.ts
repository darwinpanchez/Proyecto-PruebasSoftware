import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="store-header">
      <h1>Smash Tenis Store</h1>
      <p>¡Bienvenido a la tienda líder en tenis deportivos! Encuentra los mejores modelos, ofertas exclusivas y la mejor atención para potenciar tu juego.</p>
    </div>

    <div class="container my-5">
      <div class="row align-items-center mb-5">
        <div class="col-md-6">
          <img src="assets/img/balen.jpg" 
               alt="Tienda de tenis deportivos" 
               class="img-fluid rounded shadow"
               loading="lazy"
               style="width: 100%; height: auto; max-height: 400px; object-fit: cover;">
        </div>
        <div class="col-md-6">
          <h2 class="mb-3" style="color:#4f8cff;">¡Equípate como un profesional!</h2>
          <p>En <strong>Smash Tennis Store</strong> te ofrecemos tenis deportivos de las mejores marcas, asesoría personalizada y envíos rápidos a todo el país. ¡Haz tu pedido hoy y vive la experiencia de jugar con lo mejor!</p>
          <ul>
            <li>Envíos en 48h</li>
            <li>Descuentos para miembros</li>
            <li>Productos originales garantizados</li>
            <li>Atención personalizada</li>
          </ul>
          <a routerLink="/products" class="btn btn-buy mt-2">Ver catálogo completo</a>
        </div>
      </div>

      <h2 class="mb-4" style="color:#4f8cff;">Productos Destacados</h2>
      <div class="featured-products mb-5" *ngIf="featuredProducts.length > 0">
        <div class="product-card" *ngFor="let product of featuredProducts">
          <img [src]="getImageUrl(product.image)" 
               [alt]="product.name"
               loading="lazy"
               style="width: 100%; height: 200px; object-fit: contain;">
          <div class="product-title">{{ product.name }}</div>
          <div class="product-price">\${{ (+product.price).toFixed(2) }}</div>
          <a [routerLink]="['/product-detail', product.id]" class="btn btn-buy">Ver más</a>
        </div>
      </div>

      <div class="text-center" *ngIf="featuredProducts.length === 0">
        <p>Cargando productos destacados...</p>
      </div>

      <!-- Sección de beneficios -->
      <div class="row mt-5">
        <div class="col-md-4 text-center mb-4">
          <img src="assets/img/envio_rapido.png" 
               alt="Envío rápido" 
               class="img-fluid mb-3" 
               loading="lazy"
               style="max-height: 80px; width: auto;">
          <h4 style="color:#4f8cff;">Envío Rápido</h4>
          <p>Recibe tus productos en 48 horas o menos en toda la ciudad.</p>
        </div>
        <div class="col-md-4 text-center mb-4">
          <img src="assets/img/calidad.png" 
               alt="Calidad garantizada" 
               class="img-fluid mb-3" 
               loading="lazy"
               style="max-height: 80px; width: auto;">
          <h4 style="color:#4f8cff;">Calidad Garantizada</h4>
          <p>Solo vendemos productos originales de las mejores marcas.</p>
        </div>
        <div class="col-md-4 text-center mb-4">
          <img src="assets/img/suport.png" 
               alt="Soporte 24/7" 
               class="img-fluid mb-3" 
               loading="lazy"
               style="max-height: 80px; width: auto;">
          <h4 style="color:#4f8cff;">Soporte 24/7</h4>
          <p>Nuestro equipo está disponible para ayudarte cuando lo necesites.</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts() {
    this.productService.getFeaturedProducts().subscribe({
      next: (products) => {
        this.featuredProducts = products.slice(0, 3); // Solo los primeros 3
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
        // Si hay error, mostrar productos por defecto o vacío
        this.featuredProducts = [];
      }
    });
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
