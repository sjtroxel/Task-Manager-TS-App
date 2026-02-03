import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // if the signal has a user, they are good to go!
  if (authService.currentUser()) {
    return true;
  }

  // otherwise, bounce them to login
  return router.createUrlTree(['/login']);
};
