import { signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  let authService: { currentUser: ReturnType<typeof signal<any>> };
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { currentUser: signal<any>(null) } },
        provideRouter([]),
      ],
    });
    authService = TestBed.inject(AuthService) as any;
    router = TestBed.inject(Router);
  });

  it('returns true when the user is authenticated', () => {
    authService.currentUser.set({ name: 'Test User' });

    const result = TestBed.runInInjectionContext(() => authGuard());

    expect(result).toBe(true);
  });

  it('redirects to /login when the user is not authenticated', () => {
    authService.currentUser.set(null);
    vi.spyOn(router, 'createUrlTree');

    const result = TestBed.runInInjectionContext(() => authGuard());

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBeTruthy(); // UrlTree returned, not boolean
    expect(result).not.toBe(true);
  });
});
