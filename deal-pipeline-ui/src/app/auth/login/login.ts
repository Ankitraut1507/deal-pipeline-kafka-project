import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { AuthService } from '../auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  loading = false;
  hidePassword = true;

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/deals']);
      },
      error: (error) => {
        this.loading = false;
        
        // Handle different error scenarios
        if (error.status === 401) {
          if (error.error?.message?.toLowerCase().includes('inactive') || 
              error.error?.message?.toLowerCase().includes('deactivated')) {
            alert('Your account has been deactivated. Please contact administrator.');
          } else {
            alert('Invalid username or password. Please try again.');
          }
        } else if (error.status === 403) {
          if (error.error?.message?.toLowerCase().includes('inactive') || 
              error.error?.message?.toLowerCase().includes('deactivated')) {
            alert('Your account has been deactivated. Please contact administrator.');
          } else {
            alert('Access denied. Your account may not be active.');
          }
        } else {
          alert('Login failed. Please try again later.');
        }
      }
    });
  }

  toggleHidePassword() {
    this.hidePassword = !this.hidePassword;
  }
}
