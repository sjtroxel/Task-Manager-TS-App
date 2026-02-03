import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const noAuthGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // if the user IS logged in, don't let them see the Login/Signup/Home pages
  if (authService.currentUser()) {
    // redirect them to the dashboard
    return router.createUrlTree(['/tasks']);
  }

  // not logged in? cool, they can see the public pages
  return true;
};
