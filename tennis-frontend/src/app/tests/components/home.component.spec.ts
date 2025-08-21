import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { HomeComponent } from '../../components/home.component';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Nike Air Max',
      description: 'Tenis deportivos',
      price: 150.00,
      image: 'assets/img/nike.jpg'
    },
    {
      id: 2,
      name: 'Adidas Ultraboost',
      description: 'Tenis de running',
      price: 180.00,
      image: '../img/adidas.jpg'
    },
    {
      id: 3,
      name: 'Puma RS-X',
      description: 'Tenis casual',
      price: 120.00,
      image: 'puma.jpg'
    },
    {
      id: 4,
      name: 'Reebok Classic',
      description: 'Tenis retro',
      price: 90.00,
      image: 'assets/img/reebok.jpg'
    }
  ];

  beforeEach(async () => {
    const productSpy = jasmine.createSpyObj('ProductService', ['getFeaturedProducts']);

    await TestBed.configureTestingModule({
      imports: [HomeComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: ProductService, useValue: productSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    productServiceSpy = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty featured products', () => {
    expect(component.featuredProducts).toEqual([]);
  });

  it('should load featured products on init', () => {
    productServiceSpy.getFeaturedProducts.and.returnValue(of(mockProducts));

    component.ngOnInit();

    expect(productServiceSpy.getFeaturedProducts).toHaveBeenCalled();
    expect(component.featuredProducts.length).toBe(3);
    expect(component.featuredProducts).toEqual(mockProducts.slice(0, 3));
  });

  it('should handle error when loading featured products', () => {
    productServiceSpy.getFeaturedProducts.and.returnValue(throwError(() => new Error('Network error')));
    spyOn(console, 'error');

    component.loadFeaturedProducts();

    expect(component.featuredProducts).toEqual([]);
    expect(console.error).toHaveBeenCalledWith('Error loading featured products:', jasmine.any(Error));
  });

  it('should limit featured products to 3 items', () => {
    productServiceSpy.getFeaturedProducts.and.returnValue(of(mockProducts));

    component.loadFeaturedProducts();

    expect(component.featuredProducts.length).toBe(3);
  });

  it('should handle empty product list', () => {
    productServiceSpy.getFeaturedProducts.and.returnValue(of([]));

    component.loadFeaturedProducts();

    expect(component.featuredProducts).toEqual([]);
  });

  describe('getImageUrl', () => {
    it('should return path as-is if it starts with assets/', () => {
      const imagePath = 'assets/img/nike.jpg';
      const result = component.getImageUrl(imagePath);
      expect(result).toBe('assets/img/nike.jpg');
    });

    it('should remove ../ prefix and add assets/ prefix', () => {
      const imagePath = '../img/adidas.jpg';
      const result = component.getImageUrl(imagePath);
      expect(result).toBe('assets/img/adidas.jpg');
    });

    it('should add assets/ prefix if path does not start with assets/', () => {
      const imagePath = 'puma.jpg';
      const result = component.getImageUrl(imagePath);
      expect(result).toBe('assets/puma.jpg');
    });

    it('should handle complex paths correctly', () => {
      const imagePath = '../images/shoes/nike.jpg';
      const result = component.getImageUrl(imagePath);
      expect(result).toBe('assets/images/shoes/nike.jpg');
    });
  });
});
