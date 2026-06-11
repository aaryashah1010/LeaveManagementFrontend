import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Check if the token exists in local storage
  const token = localStorage.getItem('token');

  if (token) {
    // User is logged in, allow them to access the route
    return true;
  } else {
    // User is NOT logged in, kick them back to the login page
    router.navigate(['/login']);
    return false;
  }
};