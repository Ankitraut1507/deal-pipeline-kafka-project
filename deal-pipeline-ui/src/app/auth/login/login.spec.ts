import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login';
import { AuthService } from '../auth';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty fields', () => {
    expect(component.loginForm.get('username')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should have required validators on form fields', () => {
    const usernameControl = component.loginForm.get('username');
    const passwordControl = component.loginForm.get('password');

    expect(usernameControl?.hasError('required')).toBeTrue();
    expect(passwordControl?.hasError('required')).toBeTrue();
  });

  it('should validate form as invalid when empty', () => {
    expect(component.loginForm.invalid).toBeTrue();
  });

  it('should validate form as valid when fields are filled', () => {
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'testpass'
    });

    expect(component.loginForm.valid).toBeTrue();
  });

  it('should not submit form when invalid', () => {
    spyOn(window, 'alert');
    
    component.onSubmit();
    
    expect(mockAuthService.login).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should handle successful login', () => {
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'testpass'
    });

    mockAuthService.login.and.returnValue(of({}));

    component.onSubmit();

    expect(mockAuthService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'testpass'
    });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/deals']);
    expect(component.loading).toBeTrue(); // Loading stays true on success
  });

  it('should handle 401 error with invalid credentials', () => {
    spyOn(window, 'alert');
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'wrongpass'
    });

    const error401 = { status: 401, error: { message: 'Invalid credentials' } };
    mockAuthService.login.and.returnValue(throwError(() => error401));

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Invalid username or password. Please try again.');
    expect(component.loading).toBeFalse();
  });

  it('should handle 401 error with deactivated account', () => {
    spyOn(window, 'alert');
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'testpass'
    });

    const error401 = { status: 401, error: { message: 'Account deactivated' } };
    mockAuthService.login.and.returnValue(throwError(() => error401));

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Your account has been deactivated. Please contact administrator.');
    expect(component.loading).toBeFalse();
  });

  it('should handle 403 error with deactivated account', () => {
    spyOn(window, 'alert');
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'testpass'
    });

    const error403 = { status: 403, error: { message: 'Account INACTIVE' } };
    mockAuthService.login.and.returnValue(throwError(() => error403));

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Your account has been deactivated. Please contact administrator.');
    expect(component.loading).toBeFalse();
  });

  it('should handle 403 error with access denied', () => {
    spyOn(window, 'alert');
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'testpass'
    });

    const error403 = { status: 403, error: { message: 'Access denied' } };
    mockAuthService.login.and.returnValue(throwError(() => error403));

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Access denied. Your account may not be active.');
    expect(component.loading).toBeFalse();
  });

  it('should handle generic network error', () => {
    spyOn(window, 'alert');
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'testpass'
    });

    const genericError = { status: 500 };
    mockAuthService.login.and.returnValue(throwError(() => genericError));

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Login failed. Please try again later.');
    expect(component.loading).toBeFalse();
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword).toBeTrue();

    component.toggleHidePassword();

    expect(component.hidePassword).toBeFalse();

    component.toggleHidePassword();

    expect(component.hidePassword).toBeTrue();
  });

  it('should set loading to true during login attempt', () => {
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'testpass'
    });

    mockAuthService.login.and.returnValue(of({}));

    // Check initial loading state
    expect(component.loading).toBeFalse();

    component.onSubmit();

    // Loading should be set to true during the call
    expect(component.loading).toBeTrue();
    expect(mockAuthService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'testpass'
    });
  });
});
