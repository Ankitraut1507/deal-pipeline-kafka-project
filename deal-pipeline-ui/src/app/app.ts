import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './auth/auth';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterModule,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  showNavbar = true;
  isAdmin = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    // Check initial route
    this.updateNavbarVisibility();
    this.isAdmin = this.authService.isAdmin();
    
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateNavbarVisibility();
      this.isAdmin = this.authService.isAdmin();
    });
  }

  /** 🔐 Update navbar visibility based on current route */
  private updateNavbarVisibility(): void {
    const currentUrl = this.router.url;
    
    // Hide navbar on login page and any auth-related pages
    const hideOnRoutes = ['/login', '/register', '/forgot-password'];
    this.showNavbar = !hideOnRoutes.some(route => currentUrl.includes(route));
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        // Navigation is handled in AuthService
        console.log('Logout successful');
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if backend logout fails, user will be redirected to login
      }
    });
  }
}
