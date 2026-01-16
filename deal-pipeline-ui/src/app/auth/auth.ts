import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) {}

  login(data: any) {
    return this.http.post<any>(
      `${environment.apiUrl}/api/auth/login`,
      data
    ).pipe(
      tap(res => {
        localStorage.setItem('token', res.accessToken);
      })
    );
  }

  getCurrentUser() {
    return this.http.get<any>(
      `${environment.apiUrl}/api/users/me`
    );
  }

  // 🔐 NEW: Refresh JWT Token
  refreshToken() {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token available'));
    }

    return this.http.post<any>(
      `${environment.apiUrl}/api/auth/refresh`,
      {},
      { headers: { Authorization: `Bearer ${token}` }}
    ).pipe(
      tap(res => {
        localStorage.setItem('token', res.accessToken);
      }),
      catchError(error => {
        this.clearToken();
        this.router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  }

  // 🚪 UPDATED: Proper logout with backend invalidation
  logout() {
    const token = this.getToken();
    
    if (token) {
      return this.http.post<void>(
        `${environment.apiUrl}/api/auth/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      ).pipe(
        tap(() => {
          this.clearToken();
          this.router.navigate(['/login']);
        }),
        catchError(error => {
          // Even if backend logout fails, clear local token
          this.clearToken();
          this.router.navigate(['/login']);
          return throwError(() => error);
        })
      );
    } else {
      this.clearToken();
      this.router.navigate(['/login']);
      return throwError(() => new Error('No token to logout'));
    }
  }

  // 🔧 Helper method to get token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // 🔧 Helper method to clear token
  clearToken(): void {
    localStorage.removeItem('token');
  }

  // ⏰ Check if token is expiring soon (within 5 minutes)
  isTokenExpiringSoon(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      if (!exp) return true;

      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = exp - currentTime;
      
      // Return true if token expires within 5 minutes (300 seconds)
      return timeUntilExpiry < 300;
    } catch (e) {
      return true;
    }
  }

  // 🔐 Get token expiration time
  getTokenExpirationTime(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp || null;
    } catch (e) {
      return null;
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      if (!exp) return false;

      const currentTime = Math.floor(Date.now() / 1000);
      return currentTime < exp;
    } catch (e) {
      return false;
    }
  }

  getUserRole(): 'ADMIN' | 'USER' | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role || payload.authorities?.[0]?.replace('ROLE_', '');
      
      // Normalize role to uppercase
      if (role) {
        const normalizedRole = role.toUpperCase();
        return (normalizedRole === 'ADMIN' || normalizedRole === 'USER') 
          ? normalizedRole as 'ADMIN' | 'USER' 
          : null;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  getUserId(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.sub || payload.userId || null;
      return userId;
    } catch (e) {
      return null;
    }
  }
}
