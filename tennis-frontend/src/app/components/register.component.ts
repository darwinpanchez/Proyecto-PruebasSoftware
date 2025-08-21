import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { RegisterRequest } from '../models/product.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="modern-auth-container">
      <div class="auth-card">
        <div class="card-header">
          <div class="auth-icon">
            <i class="fas fa-user-plus"></i>
          </div>
          <h3>Crear Cuenta</h3>
          <p>Únete a nuestra tienda de tenis</p>
        </div>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="auth-form">
          <div class="floating-group">
            <input 
              type="text" 
              class="floating-input" 
              id="username" 
              name="username"
              [(ngModel)]="userData.username" 
              required
              minlength="3"
              #username="ngModel"
              [class.error]="username.invalid && username.touched"
              placeholder=" "
            >
            <label for="username" class="floating-label">
              <i class="fas fa-user"></i> Usuario
            </label>
            <div *ngIf="username.invalid && username.touched" class="error-message">
              <div *ngIf="username.errors?.['required']">El usuario es requerido</div>
              <div *ngIf="username.errors?.['minlength']">Mínimo 3 caracteres</div>
            </div>
          </div>
          
          <div class="floating-group">
            <input 
              type="email" 
              class="floating-input" 
              id="email" 
              name="email"
              [(ngModel)]="userData.email" 
              required
              email
              #email="ngModel"
              [class.error]="email.invalid && email.touched"
              placeholder=" "
            >
            <label for="email" class="floating-label">
              <i class="fas fa-envelope"></i> Email
            </label>
            <div *ngIf="email.invalid && email.touched" class="error-message">
              <div *ngIf="email.errors?.['required']">El email es requerido</div>
              <div *ngIf="email.errors?.['email']">Formato de email inválido</div>
            </div>
          </div>
          
          <div class="floating-group">
            <input 
              type="password" 
              class="floating-input" 
              id="password" 
              name="password"
              [(ngModel)]="userData.password" 
              required
              minlength="6"
              #password="ngModel"
              [class.error]="password.invalid && password.touched"
              placeholder=" "
            >
            <label for="password" class="floating-label">
              <i class="fas fa-lock"></i> Contraseña
            </label>
            <div *ngIf="password.invalid && password.touched" class="error-message">
              <div *ngIf="password.errors?.['required']">La contraseña es requerida</div>
              <div *ngIf="password.errors?.['minlength']">Mínimo 6 caracteres</div>
            </div>
          </div>

          <div class="floating-group">
            <input 
              type="password" 
              class="floating-input" 
              id="confirmPassword" 
              name="confirmPassword"
              [(ngModel)]="confirmPassword" 
              required
              #confPassword="ngModel"
              [class.error]="confPassword.touched && confirmPassword !== userData.password"
              placeholder=" "
            >
            <label for="confirmPassword" class="floating-label">
              <i class="fas fa-lock"></i> Confirmar Contraseña
            </label>
            <div *ngIf="confPassword.touched && confirmPassword !== userData.password" class="error-message">
              Las contraseñas no coinciden
            </div>
          </div>

          <button 
            type="submit" 
            class="submit-btn"
            [disabled]="registerForm.invalid || confirmPassword !== userData.password || isLoading"
          >
            <span *ngIf="!isLoading">
              <i class="fas fa-user-plus"></i> Crear Cuenta
            </span>
            <span *ngIf="isLoading">
              <i class="fas fa-spinner fa-spin"></i> Creando cuenta...
            </span>
          </button>
        </form>

        <div class="auth-footer">
          <p>¿Ya tienes cuenta? 
            <a routerLink="/login" class="auth-link">Inicia sesión aquí</a>
          </p>
        </div>
      </div>

      <div class="decorative-elements">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </div>
  `,
  styles: [`
    .modern-auth-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }

    .auth-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 420px;
      position: relative;
      z-index: 2;
      animation: slideUp 0.8s ease-out;
    }

    .card-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .auth-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #28a745, #20c997);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      box-shadow: 0 10px 30px rgba(40, 167, 69, 0.3);
    }

    .auth-icon i {
      font-size: 2rem;
      color: white;
    }

    .card-header h3 {
      color: #333;
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 10px 0;
      background: linear-gradient(135deg, #28a745, #20c997);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .card-header p {
      color: #666;
      font-size: 16px;
      margin: 0;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .floating-group {
      position: relative;
      margin-bottom: 20px;
    }

    .floating-input {
      width: 100%;
      padding: 20px 15px 10px 45px;
      border: 2px solid #e1e5e9;
      border-radius: 12px;
      font-size: 16px;
      background: white;
      transition: all 0.3s ease;
      outline: none;
    }

    .floating-input:focus {
      border-color: #28a745;
      box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
      transform: translateY(-2px);
    }

    .floating-input.error {
      border-color: #dc3545;
      box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
    }

    .floating-input:focus + .floating-label,
    .floating-input:not(:placeholder-shown) + .floating-label {
      transform: translateY(-25px) scale(0.8);
      color: #28a745;
    }

    .floating-label {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: #666;
      font-size: 16px;
      pointer-events: none;
      transition: all 0.3s ease;
      background: white;
      padding: 0 5px;
    }

    .floating-label i {
      margin-right: 8px;
      color: #28a745;
    }

    .error-message {
      color: #dc3545;
      font-size: 13px;
      margin-top: 5px;
      padding-left: 15px;
    }

    .submit-btn {
      background: linear-gradient(135deg, #28a745, #20c997);
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 10px;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(40, 167, 69, 0.3);
    }

    .submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .submit-btn i {
      margin-right: 8px;
    }

    .auth-footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .auth-footer p {
      color: #666;
      margin: 0;
    }

    .auth-link {
      color: #28a745;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .auth-link:hover {
      color: #20c997;
      text-decoration: underline;
    }

    .decorative-elements {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: 1;
    }

    .circle {
      position: absolute;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      animation: float 6s ease-in-out infinite;
    }

    .circle-1 {
      width: 200px;
      height: 200px;
      top: -50px;
      left: -50px;
      animation-delay: 0s;
    }

    .circle-2 {
      width: 150px;
      height: 150px;
      top: 50%;
      right: -75px;
      animation-delay: -2s;
    }

    .circle-3 {
      width: 100px;
      height: 100px;
      bottom: 50px;
      left: 20%;
      animation-delay: -4s;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-20px);
      }
    }

    @media (max-width: 480px) {
      .modern-auth-container {
        padding: 10px;
      }

      .auth-card {
        padding: 30px 20px;
        max-width: 100%;
      }

      .floating-input {
        padding: 18px 15px 8px 40px;
      }
    }
  `]
})
export class RegisterComponent {
  userData: RegisterRequest = {
    username: '',
    email: '',
    password: ''
  };
  
  confirmPassword = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  onSubmit() {
    if (this.userData.username && this.userData.email && this.userData.password && 
        this.confirmPassword === this.userData.password) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.authService.register(this.userData).subscribe({
        next: (response) => {
          this.notificationService.registerSuccess();
          this.router.navigate(['/']);
        },
        error: (error) => {
          
          if (error.status === 409 || error.error?.message?.includes('email')) {
            this.notificationService.emailAlreadyExists();
          } else if (error.status === 0) {
            this.notificationService.networkError();
          } else {
            this.notificationService.showError(
              'No pudimos crear tu cuenta. Por favor verifica los datos e intenta nuevamente.',
              '❌ Error de Registro'
            );
          }
          
          this.errorMessage = error.error?.message || 'Error al crear la cuenta. Intenta nuevamente.';
          this.isLoading = false;
        }
      });
    } else {
      this.notificationService.showWarning('Por favor completa todos los campos correctamente', 'Datos Incompletos');
    }
  }
}
