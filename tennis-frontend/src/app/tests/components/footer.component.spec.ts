import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from '../../components/footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render company name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Smash Tenis Store');
  });

  it('should render contact information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('info@smashtenis.com');
    expect(compiled.textContent).toContain('+1 234 567 890');
  });

  it('should render copyright notice', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('© 2025 Smash Tenis Store. Todos los derechos reservados.');
  });

  it('should render useful links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Términos y condiciones');
    expect(compiled.textContent).toContain('Política de privacidad');
    expect(compiled.textContent).toContain('Envíos y devoluciones');
  });

  it('should have proper footer structure', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('footer')).toBeTruthy();
  });

  it('should display footer as standalone component', () => {
    expect(component).toBeInstanceOf(FooterComponent);
  });

  it('should render all footer sections', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Check that all main sections are present
    expect(compiled.textContent).toContain('Smash Tenis Store');
    expect(compiled.textContent).toContain('info@smashtenis.com');
    expect(compiled.textContent).toContain('+1 234 567 890');
    expect(compiled.textContent).toContain('© 2025 Smash Tenis Store');
    expect(compiled.textContent).toContain('Términos y condiciones');
    expect(compiled.textContent).toContain('Política de privacidad');
    expect(compiled.textContent).toContain('Envíos y devoluciones');
  });
});
