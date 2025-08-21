import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer mt-5">
      <div class="container">
        <div class="row">
          <div class="col-md-4">
            <h5>Smash Tenis Store</h5>
            <p>Tu tienda de confianza para tenis deportivos de alta calidad.</p>
          </div>
          <div class="col-md-4">
            <h5>Enlaces útiles</h5>
            <ul class="list-unstyled">
              <li><a href="#">Términos y condiciones</a></li>
              <li><a href="#">Política de privacidad</a></li>
              <li><a href="#">Envíos y devoluciones</a></li>
            </ul>
          </div>
          <div class="col-md-4">
            <h5>Contacto</h5>
            <p>Email: info&#64;smashtenis.com<br>
            Teléfono: +1 234 567 890</p>
          </div>
        </div>
        <hr>
        <div class="text-center">
          <p>&copy; 2025 Smash Tenis Store. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  `,
  styles: []
})
export class FooterComponent {}
