import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

function getUserRole(): 'ADMIN' | 'USER' | null {
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

function isTokenValid(token: string): boolean {
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

export const roleGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token || !isTokenValid(token)) {
    localStorage.removeItem('token');
    router.navigate(['/login']);
    return false;
  }

  const role = getUserRole();
  if (role !== 'ADMIN') {
    router.navigate(['/deals']);
    return false;
  }

  return true;
};
