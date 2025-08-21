import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../models/product.model';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <!-- Sidebar -->
        <nav id="sidebarMenu" class="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
          <div class="position-sticky pt-3">
            <ul class="nav flex-column">
              <li class="nav-item">
                <a class="nav-link" [class.active]="activeSection === 'dashboard'" (click)="setActiveSection('dashboard')">
                  <i class="fas fa-tachometer-alt"></i>
                  Dashboard
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" [class.active]="activeSection === 'products'" (click)="setActiveSection('products')">
                  <i class="fas fa-box"></i>
                  Gestión de Productos
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" (click)="logout()">
                  <i class="fas fa-sign-out-alt"></i>
                  Cerrar Sesión
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <!-- Main content -->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Panel de Administración</h1>
          </div>

          <!-- Dashboard Section -->
          <div *ngIf="activeSection === 'dashboard'" class="row">
            <div class="col-md-6 col-lg-3 mb-4">
              <div class="card text-white bg-primary">
                <div class="card-body">
                  <div class="d-flex justify-content-between">
                    <div>
                      <h5 class="card-title">Total Productos</h5>
                      <h2>{{ products.length }}</h2>
                    </div>
                    <div class="align-self-center">
                      <i class="fas fa-box fa-2x"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Products Section -->
          <div *ngIf="activeSection === 'products'">
            <div class="d-flex justify-content-between mb-3">
              <h3>Gestión de Productos</h3>
              <button class="btn btn-success" (click)="showAddModal()">
                <i class="fas fa-plus"></i> Agregar Producto
              </button>
            </div>

            <!-- Products Table -->
            <div class="table-responsive">
              <table class="table table-striped">
                <thead class="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Precio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let product of products">
                    <td>{{ product.id }}</td>
                    <td>
                      <img [src]="getImageUrl(product.image)" [alt]="product.name" class="img-thumbnail" style="width: 50px; height: 50px; object-fit: cover;">
                    </td>
                    <td>{{ product.name }}</td>
                    <td>{{ product.description | slice:0:50 }}...</td>
                    <td>\${{ product.price }}</td>
                    <td>
                      <button class="btn btn-sm btn-warning me-2" (click)="editProduct(product)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-sm btn-danger" (click)="deleteProduct(product.id!)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Add/Edit Product Modal -->
    <div class="modal fade" id="productModal" tabindex="-1" [class.show]="showModal" [style.display]="showModal ? 'block' : 'none'">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Editar' : 'Agregar' }} Producto</h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveProduct()" #productForm="ngForm">
              <div class="mb-3">
                <label for="name" class="form-label">Nombre</label>
                <input type="text" class="form-control" id="name" [(ngModel)]="currentProduct.name" name="name" required>
              </div>
              <div class="mb-3">
                <label for="description" class="form-label">Descripción</label>
                <textarea class="form-control" id="description" rows="3" [(ngModel)]="currentProduct.description" name="description" required></textarea>
              </div>
              <div class="mb-3">
                <label for="price" class="form-label">Precio</label>
                <input type="number" class="form-control" id="price" step="0.01" [(ngModel)]="currentProduct.price" name="price" required>
              </div>
              <div class="mb-3">
                <label for="image" class="form-label">Imagen del Producto</label>
                <input type="file" class="form-control" id="image" (change)="onFileSelected($event)" accept="image/*" required>
                <div class="form-text">Selecciona una imagen para el producto</div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" (click)="saveProduct()">{{ isEditing ? 'Actualizar' : 'Agregar' }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal backdrop -->
    <div class="modal-backdrop fade" [class.show]="showModal" *ngIf="showModal"></div>
  `,
  styles: [`
    .container-fluid {
      min-height: calc(100vh - 120px); /* Ajustar según altura del navbar y footer */
    }

    .sidebar {
      position: sticky;
      top: 80px; /* Ajustar según altura del navbar */
      height: calc(100vh - 160px); /* Altura disponible menos navbar y footer */
      overflow-y: auto;
      z-index: 100;
      padding: 20px 0;
      background-color: #f8f9fa;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }

    .nav-link {
      color: #495057;
      cursor: pointer;
      padding: 12px 20px;
      margin: 4px 8px;
      border-radius: 8px;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .nav-link:hover {
      color: #007bff;
      background-color: rgba(0, 123, 255, 0.1);
      transform: translateX(5px);
    }

    .nav-link.active {
      color: #007bff;
      background-color: rgba(0, 123, 255, 0.15);
      font-weight: 600;
      border-left: 4px solid #007bff;
    }

    .nav-link i {
      margin-right: 12px;
      width: 20px;
      text-align: center;
    }

    main {
      margin-left: 0;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      min-height: calc(100vh - 160px);
    }

    @media (max-width: 768px) {
      .sidebar {
        position: relative;
        height: auto;
        margin-bottom: 20px;
      }
      
      main {
        margin-left: 0;
      }
    }

    .card {
      transition: all 0.3s ease;
      border: none;
      border-radius: 15px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
    }

    .table {
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .table thead {
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
    }

    .table tbody tr {
      transition: background-color 0.2s ease;
    }

    .table tbody tr:hover {
      background-color: rgba(0, 123, 255, 0.05);
    }

    .btn {
      border-radius: 20px;
      padding: 8px 16px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .btn-success {
      background: linear-gradient(135deg, #28a745, #20c997);
      border: none;
    }

    .btn-warning {
      background: linear-gradient(135deg, #ffc107, #fd7e14);
      border: none;
    }

    .btn-danger {
      background: linear-gradient(135deg, #dc3545, #c82333);
      border: none;
    }

    .modal.show {
      display: block !important;
    }

    .modal-backdrop.show {
      opacity: 0.5;
    }
  `]
})
export class AdminComponent implements OnInit {
  activeSection = 'dashboard';
  products: Product[] = [];
  showModal = false;
  isEditing = false;
  selectedFile: File | null = null;
  currentProduct: Omit<Product, 'id'> & { id?: number } = {
    name: '',
    description: '',
    price: 0,
    image: ''
  };

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario es admin
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
    
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error: any) => {
        this.notificationService.showError('Error al cargar productos');
      }
    });
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  showAddModal(): void {
    this.isEditing = false;
    this.selectedFile = null;
    this.currentProduct = {
      name: '',
      description: '',
      price: 0,
      image: ''
    };
    this.showModal = true;
  }

  editProduct(product: Product): void {
    this.isEditing = true;
    this.selectedFile = null;
    this.currentProduct = { ...product };
    this.showModal = true;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveProduct(): void {
    if (this.isEditing && this.currentProduct.id) {
      this.productService.updateProduct(this.currentProduct.id, this.currentProduct, this.selectedFile || undefined).subscribe({
        next: (response) => {
          this.notificationService.showSuccess('Producto actualizado correctamente');
          this.loadProducts();
          this.closeModal();
        },
        error: (error: any) => {
          this.notificationService.showError('Error al actualizar el producto');
        }
      });
    } else {
      if (!this.selectedFile) {
        this.notificationService.showError('Por favor selecciona una imagen');
        return;
      }
      
      this.productService.addProduct(this.currentProduct, this.selectedFile).subscribe({
        next: (response) => {
          this.notificationService.showSuccess('Producto creado correctamente');
          this.loadProducts();
          this.closeModal();
        },
        error: (error: any) => {
          this.notificationService.showError('Error al crear el producto');
        }
      });
    }
  }

  deleteProduct(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Producto eliminado correctamente');
          this.loadProducts();
        },
        error: (error: any) => {
          this.notificationService.showError('Error al eliminar producto');
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
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
