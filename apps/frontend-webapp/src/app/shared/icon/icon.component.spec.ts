import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent } from './icon.component';

function create(name: string, extra: Record<string, unknown> = {}) {
  const fixture: ComponentFixture<IconComponent> = TestBed.createComponent(IconComponent);
  const ref = fixture.componentRef;
  // cast so tests can pass either a valid name or probe edge cases
  ref.setInput('name', name);
  for (const [k, v] of Object.entries(extra)) ref.setInput(k, v);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance };
}

describe('IconComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconComponent],
    }).compileComponents();
  });

  it('renders the SVG for a known icon', () => {
    const { fixture } = create('search');
    const root = fixture.nativeElement.querySelector('.icon-root') as HTMLElement;
    expect(root.innerHTML).toContain('<svg');
  });

  it('sets aria-hidden when no title is provided', () => {
    const { fixture } = create('bin');
    const root = fixture.nativeElement.querySelector('.icon-root') as HTMLElement;
    expect(root.getAttribute('aria-hidden')).toBe('true');
    expect(root.getAttribute('aria-label')).toBeNull();
  });

  it('sets aria-label from the title input', () => {
    const { fixture } = create('edit', { title: 'Edit entry' });
    const root = fixture.nativeElement.querySelector('.icon-root') as HTMLElement;
    expect(root.getAttribute('aria-label')).toBe('Edit entry');
    expect(root.getAttribute('aria-hidden')).toBeNull();
  });

  it('maps size presets to pixel values', () => {
    const { component } = create('search', { size: 'lg' });
    expect(component.sizeVar()).toBe('24px');
  });

  it('accepts an explicit pixel size', () => {
    const { component } = create('search', { size: 42 });
    expect(component.sizeVar()).toBe('42px');
  });

  it('warns when the icon name is unknown', () => {
    const warn = spyOn(console, 'warn');
    create('__nope__');
    expect(warn).toHaveBeenCalled();
  });
});
