import { signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../services/auth.service';
import { noAuthGuard } from './no-auth-guard';

describe('noAuthGuard', () => {
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

  it('returns true when the user is not authenticated', () => {
    authService.currentUser.set(null);

    const result = TestBed.runInInjectionContext(() => noAuthGuard());

    expect(result).toBe(true);
  });

  it('redirects to /tasks when the user is already authenticated', () => {
    authService.currentUser.set({ name: 'Logged In User' });
    vi.spyOn(router, 'createUrlTree');

    const result = TestBed.runInInjectionContext(() => noAuthGuard());

    expect(router.createUrlTree).toHaveBeenCalledWith(['/tasks']);
    expect(result).toBeTruthy(); // UrlTree returned, not boolean
    expect(result).not.toBe(true);
  });
});
