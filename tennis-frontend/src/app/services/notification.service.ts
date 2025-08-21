import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private toastr: ToastrService) {}

  showSuccess(message: string, title: string = '¡Éxito!') {
    this.toastr.success(message, title, {
      timeOut: 3000,
      progressBar: true,
      closeButton: true
    });
  }

  showError(message: string, title: string = '¡Error!') {
    this.toastr.error(message, title, {
      timeOut: 5000,
      progressBar: true,
      closeButton: true
    });
  }

  showWarning(message: string, title: string = '¡Atención!') {
    this.toastr.warning(message, title, {
      timeOut: 4000,
      progressBar: true,
      closeButton: true
    });
  }

  showInfo(message: string, title: string = 'Información') {
    this.toastr.info(message, title, {
      timeOut: 3000,
      progressBar: true,
      closeButton: true
    });
  }

  // Mensajes específicos de la tienda
  productAddedToCart(productName: string) {
    this.showSuccess(
      `<strong>${productName}</strong> se ha agregado al carrito`,
      '🛒 ¡Agregado al Carrito!'
    );
  }

  loginSuccess(userName: string) {
    this.showSuccess(
      `¡Bienvenido de vuelta, <strong>${userName}</strong>!`,
      '🎾 ¡Hola!'
    );
  }

  logoutSuccess() {
    this.showInfo(
      'Has cerrado sesión correctamente. ¡Vuelve pronto!',
      '👋 ¡Hasta luego!'
    );
  }

  registerSuccess() {
    this.showSuccess(
      'Tu cuenta ha sido creada exitosamente. ¡Ya puedes empezar a comprar!',
      '🎉 ¡Registro Exitoso!'
    );
  }

  orderPlaced() {
    this.showSuccess(
      'Tu pedido ha sido procesado correctamente. Recibirás un email de confirmación.',
      '📦 ¡Pedido Realizado!'
    );
  }

  cartCleared() {
    this.showInfo(
      'Tu carrito ha sido vaciado',
      '🧹 Carrito Limpio'
    );
  }

  itemRemovedFromCart() {
    this.showWarning(
      'El producto ha sido eliminado del carrito',
      '🗑️ Producto Eliminado'
    );
  }

  networkError() {
    this.showError(
      'Error de conexión. Por favor verifica tu internet e intenta nuevamente.',
      '🌐 Error de Conexión'
    );
  }

  serverError() {
    this.showError(
      'Ups! Algo salió mal en nuestros servidores. Estamos trabajando para solucionarlo.',
      '⚠️ Error del Servidor'
    );
  }

  invalidCredentials() {
    this.showError(
      'Email o contraseña incorrectos. Por favor verifica tus datos.',
      '🔐 Credenciales Inválidas'
    );
  }

  emailAlreadyExists() {
    this.showWarning(
      'Ya existe una cuenta con este email. ¿Olvidaste tu contraseña?',
      '📧 Email en Uso'
    );
  }

  // Métodos específicos para el carrito
  loginRequiredForCart() {
    this.showWarning(
      'Para ver tu carrito necesitas iniciar sesión primero',
      '🔐 Sesión Requerida'
    );
  }

  cartValidationError() {
    this.showError(
      'Por favor completa todos los campos correctamente antes de continuar',
      '📝 Formulario Incompleto'
    );
  }

  emptyCartError() {
    this.showWarning(
      'No puedes proceder con el pago porque tu carrito está vacío',
      '🛒 Carrito Vacío'
    );
  }

  orderProcessError() {
    this.showError(
      'No pudimos procesar tu pedido. Por favor revisa los datos e intenta nuevamente.',
      '❌ Error en el Pedido'
    );
  }

  quantityUpdateError() {
    this.showError(
      'No pudimos actualizar la cantidad. Por favor intenta nuevamente.',
      '🔢 Error de Actualización'
    );
  }

  itemRemoveError() {
    this.showError(
      'No pudimos eliminar el producto. Por favor intenta nuevamente.',
      '🗑️ Error al Eliminar'
    );
  }

  cartClearError() {
    this.showError(
      'No pudimos vaciar el carrito. Por favor intenta nuevamente.',
      '🧹 Error al Limpiar'
    );
  }
}
