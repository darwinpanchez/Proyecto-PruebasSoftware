import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { CartItem } from '../models/product.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:3000/api/cart';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();
  
  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  addToCart(productId: number, quantity: number = 1): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, { productId, quantity }, { headers: this.getHeaders() }).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  updateCartItem(itemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${itemId}`, { quantity }, { headers: this.getHeaders() }).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  removeFromCart(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${itemId}`, { headers: this.getHeaders() }).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap(() => this.cartCountSubject.next(0))
    );
  }

  private refreshCartCount(): void {
    this.getCartCount().subscribe({
      next: (response) => {
        const count = response?.count || response || 0;
        this.cartCountSubject.next(count);
      },
      error: () => this.cartCountSubject.next(0)
    });
  }

  public updateCartCount(): void {
    this.refreshCartCount();
  }

  getCartCount(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/count`, { headers: this.getHeaders() });
  }
}
