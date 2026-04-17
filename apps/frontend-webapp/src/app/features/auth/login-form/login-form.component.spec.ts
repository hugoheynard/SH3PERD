import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginFormComponent } from './login-form.component';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(LoginFormComponent, {
      set: {
        template: '',
      },
    });

    await TestBed.configureTestingModule({
      imports: [LoginFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits submitted credentials for a valid form payload', () => {
    const emitSpy = spyOn(component.login, 'emit');

    component.onSubmit({
      valid: true,
      value: { email: 'john@doe.com', password: 'secret' },
    });

    expect(emitSpy).toHaveBeenCalledWith({
      email: 'john@doe.com',
      password: 'secret',
    });
  });

  it('still emits the form payload even when validity is false', () => {
    const emitSpy = spyOn(component.login, 'emit');

    component.onSubmit({
      valid: false,
      value: { email: 'john@doe.com', password: 'secret' },
    });

    expect(emitSpy).toHaveBeenCalledWith({
      email: 'john@doe.com',
      password: 'secret',
    });
  });
});
