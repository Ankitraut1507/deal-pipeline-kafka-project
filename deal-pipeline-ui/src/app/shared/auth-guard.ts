import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

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

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token || !isTokenValid(token)) {
    // Clear invalid token
    localStorage.removeItem('token');
    router.navigate(['/login']);
    return false;
  }

  return true;
};
