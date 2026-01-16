import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './user-create.html',
  styleUrl: './user-create.scss'
})
export class UserCreateComponent {

  form: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: [''],
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;

    // Set role to USER by default
    const userData = {
      ...this.form.value,
      role: 'USER'
    };

    this.userService.createUser(userData).subscribe({
      next: () => {
        this.snackBar.open('User created successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/admin/users']);
      },
      error: (error) => {
        console.error('Error creating user:', error);
        
        // Check for duplicate user/email error
        if (error.status === 409 || error.error?.message?.includes('already exists')) {
          this.snackBar.open('User with this username or email already exists', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        } else {
          this.snackBar.open('Error creating user. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }
}
