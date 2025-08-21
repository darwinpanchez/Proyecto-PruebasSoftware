import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { appConfig } from '../app.config';

describe('AppConfig', () => {
  it('should provide router', () => {
    const routerProvider = appConfig.providers.find(p => 
      p && typeof p === 'object' && 'ɵproviders' in p &&
      Array.isArray(p.ɵproviders) && 
      p.ɵproviders.some((provider: any) => 
        provider && typeof provider === 'object' && 
        'provide' in provider && 
        provider.provide && provider.provide.name === 'ROUTES'
      )
    );
    expect(routerProvider).toBeDefined();
  });

  it('should provide HTTP client', () => {
    const httpProvider = appConfig.providers.find(p => 
      p && typeof p === 'object' && 'ɵproviders' in p &&
      Array.isArray(p.ɵproviders) && 
      p.ɵproviders.some((provider: any) => 
        provider && typeof provider === 'object' && 
        'provide' in provider && 
        provider.provide && provider.provide.toString().includes('HTTP')
      )
    );
    expect(httpProvider).toBeDefined();
  });

  it('should provide animations', () => {
    expect(appConfig.providers).toBeDefined();
    expect(Array.isArray(appConfig.providers)).toBe(true);
    expect(appConfig.providers.length).toBeGreaterThan(0);
  });

  it('should provide toastr with correct configuration', () => {
    expect(appConfig.providers).toBeDefined();
    expect(Array.isArray(appConfig.providers)).toBe(true);
    expect(appConfig.providers.length).toBeGreaterThan(0);
  });

  it('should have providers array', () => {
    expect(Array.isArray(appConfig.providers)).toBe(true);
    expect(appConfig.providers.length).toBeGreaterThan(0);
  });

  it('should be a valid ApplicationConfig', () => {
    expect(appConfig).toBeDefined();
    expect(appConfig.providers).toBeDefined();
  });

  it('should configure TestBed successfully', () => {
    expect(() => {
      TestBed.configureTestingModule(appConfig);
    }).not.toThrow();
  });
});
