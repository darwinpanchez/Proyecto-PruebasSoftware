import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '../app.routes';

@Component({ template: 'Home' })
class MockHomeComponent { }

@Component({ template: 'Products' })
class MockProductsComponent { }

@Component({ template: 'Product Detail' })
class MockProductDetailComponent { }

@Component({ template: 'Cart' })
class MockCartComponent { }

@Component({ template: 'Orders' })
class MockOrdersComponent { }

@Component({ template: 'Login' })
class MockLoginComponent { }

@Component({ template: 'Register' })
class MockRegisterComponent { }

describe('AppRoutes', () => {
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    const mockRoutes = [
      { path: '', component: MockHomeComponent },
      { path: 'products', component: MockProductsComponent },
      { path: 'product-detail/:id', component: MockProductDetailComponent },
      { path: 'cart', component: MockCartComponent },
      { path: 'orders', component: MockOrdersComponent },
      { path: 'login', component: MockLoginComponent },
      { path: 'register', component: MockRegisterComponent },
      { path: '**', redirectTo: '' }
    ];

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(mockRoutes),
        MockHomeComponent,
        MockProductsComponent,
        MockProductDetailComponent,
        MockCartComponent,
        MockOrdersComponent,
        MockLoginComponent,
        MockRegisterComponent
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  });

  it('should have correct route structure', () => {
    expect(routes).toBeDefined();
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBe(8);
  });

  it('should have home route as default', () => {
    const homeRoute = routes.find(route => route.path === '');
    expect(homeRoute).toBeDefined();
  });

  it('should have products route', () => {
    const productsRoute = routes.find(route => route.path === 'products');
    expect(productsRoute).toBeDefined();
  });

  it('should have product detail route with parameter', () => {
    const productDetailRoute = routes.find(route => route.path === 'product-detail/:id');
    expect(productDetailRoute).toBeDefined();
  });

  it('should have cart route', () => {
    const cartRoute = routes.find(route => route.path === 'cart');
    expect(cartRoute).toBeDefined();
  });

  it('should have orders route', () => {
    const ordersRoute = routes.find(route => route.path === 'orders');
    expect(ordersRoute).toBeDefined();
  });

  it('should have login route', () => {
    const loginRoute = routes.find(route => route.path === 'login');
    expect(loginRoute).toBeDefined();
  });

  it('should have register route', () => {
    const registerRoute = routes.find(route => route.path === 'register');
    expect(registerRoute).toBeDefined();
  });

  it('should have wildcard route that redirects to home', () => {
    const wildcardRoute = routes.find(route => route.path === '**');
    expect(wildcardRoute).toBeDefined();
    expect(wildcardRoute?.redirectTo).toBe('');
  });

  it('should navigate to home', async () => {
    await router.navigate(['']);
    expect(location.path()).toBe('');
  });

  it('should navigate to products', async () => {
    await router.navigate(['/products']);
    expect(location.path()).toBe('/products');
  });

  it('should navigate to product detail with id', async () => {
    await router.navigate(['/product-detail/123']);
    expect(location.path()).toBe('/product-detail/123');
  });

  it('should navigate to cart', async () => {
    await router.navigate(['/cart']);
    expect(location.path()).toBe('/cart');
  });

  it('should navigate to orders', async () => {
    await router.navigate(['/orders']);
    expect(location.path()).toBe('/orders');
  });

  it('should navigate to login', async () => {
    await router.navigate(['/login']);
    expect(location.path()).toBe('/login');
  });

  it('should navigate to register', async () => {
    await router.navigate(['/register']);
    expect(location.path()).toBe('/register');
  });

  it('should redirect unknown routes to home', async () => {
    await router.navigate(['/unknown-route']);
    expect(location.path()).toBe('');
  });
});
