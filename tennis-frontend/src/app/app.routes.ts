import { Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { ProductsComponent } from './components/products.component';
import { ProductDetailComponent } from './components/product-detail.component';
import { CartComponent } from './components/cart.component';
import { OrdersComponent } from './components/orders.component';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { AdminComponent } from './components/admin.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'product-detail/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];
