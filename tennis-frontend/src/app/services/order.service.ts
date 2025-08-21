import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, CreateOrderResponse } from '../models/product.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:3000/api/orders';

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

  createOrder(): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(this.apiUrl, {}, { headers: this.getHeaders() });
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`, { headers: this.getHeaders() });
  }

  reorder(orderId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${orderId}/reorder`, {}, { headers: this.getHeaders() });
  }
}
