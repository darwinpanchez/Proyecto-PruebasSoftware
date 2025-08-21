import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/products';

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

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}?limit=3`, { headers: this.getHeaders() });
  }

  addProduct(product: Omit<Product, 'id'>, imageFile?: File): Observable<{ message: string; id: number; imageUrl: string }> {
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('price', product.price.toString());
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    return this.http.post<{ message: string; id: number; imageUrl: string }>(this.apiUrl, formData, { headers });
  }

  updateProduct(id: number, product: Partial<Product>, imageFile?: File): Observable<{ message: string; imageUrl: string }> {
    const formData = new FormData();
    
    if (product.name) formData.append('name', product.name);
    if (product.description) formData.append('description', product.description);
    if (product.price !== undefined) formData.append('price', product.price.toString());
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    return this.http.put<{ message: string; imageUrl: string }>(`${this.apiUrl}/${id}`, formData, { headers });
  }

  deleteProduct(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
