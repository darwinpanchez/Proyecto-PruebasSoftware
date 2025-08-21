import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { LoginRequest } from '../models/product.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-primary text-white text-center">
              <h3>Iniciar Sesión</h3>
            </div>
            <div class="card-body">
              <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
                <div class="mb-3">
                  <label for="username" class="form-label">Usuario</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="username" 
                    name="username"
                    [(ngModel)]="credentials.username" 
                    required
                    #username="ngModel"
                  >
                  <div *ngIf="username.invalid && username.touched" class="text-danger">
                    El usuario es requerido
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="password" class="form-label">Contraseña</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="password" 
                    name="password"
                    [(ngModel)]="credentials.password" 
                    required
                    #password="ngModel"
                  >
                  <div *ngIf="password.invalid && password.touched" class="text-danger">
                    La contraseña es requerida
                  </div>
                </div>

                <div class="alert alert-danger" *ngIf="errorMessage">
                  {{ errorMessage }}
                </div>

                <div class="d-grid">
                  <button 
                    type="submit" 
                    class="btn btn-primary" 
                    [disabled]="loginForm.invalid || isLoading"
                  >
                    {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
                  </button>
                </div>
              </form>

              <div class="text-center mt-3">
                <p>¿No tienes cuenta? <a routerLink="/register">Regístrate aquí</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0;
      padding: 40px 15px;
      max-width: 100%;
    }

    .card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: none;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
    }

    .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 30px;
      border: none;
    }

    .card-header h2 {
      margin: 0;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .card-body {
      padding: 40px;
    }

    .form-floating {
      margin-bottom: 20px;
    }

    .form-control {
      border: 2px solid #e9ecef;
      border-radius: 15px;
      padding: 20px 15px 5px;
      transition: all 0.3s ease;
      background-color: #f8f9fa;
    }

    .form-control:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      background-color: white;
    }

    .form-floating > label {
      color: #6c757d;
      font-weight: 500;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 50px;
      padding: 15px 30px;
      font-weight: 600;
      font-size: 16px;
      letter-spacing: 1px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.7;
      transform: none;
    }

    .alert-danger {
      background-color: #f8d7da;
      border: 2px solid #f5c6cb;
      color: #721c24;
      border-radius: 15px;
      padding: 15px;
    }

    .text-danger {
      color: #dc3545 !important;
      font-size: 14px;
      margin-top: 5px;
    }

    a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    a:hover {
      color: #764ba2;
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .container {
        padding: 20px 10px;
      }
      
      .card-body {
        padding: 30px 20px;
      }
      
      .card-header {
        padding: 25px 20px;
      }
    }
  `]
})
export class LoginComponent {
  credentials: LoginRequest = {
    username: '',
    password: ''
  };
  
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  onSubmit() {
    if (this.credentials.username && this.credentials.password) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.authService.login(this.credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.notificationService.loginSuccess(response.user?.username || this.credentials.username);
          
          // Redirigir al panel de admin si el usuario es Admin
          if (response.user?.username === 'Admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          
          if (error.status === 401) {
            this.notificationService.invalidCredentials();
          } else if (error.status === 0) {
            this.notificationService.networkError();
          } else {
            this.notificationService.serverError();
          }
          
          this.errorMessage = error.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
          this.isLoading = false;
        }
      });
    } else {
      this.notificationService.showWarning('Por favor completa todos los campos', 'Campos Requeridos');
    }
  }
}
