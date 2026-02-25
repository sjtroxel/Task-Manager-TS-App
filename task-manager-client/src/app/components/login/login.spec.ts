import { importProvidersFrom, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { Eye, EyeOff, LucideAngularModule } from 'lucide-angular';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from './login';

function makeMockAuthService(loginImpl = () => of({})) {
  return {
    login: vi.fn().mockImplementation(loginImpl),
    currentUser: signal<any>(null),
    logout: vi.fn(),
  };
}

const lucideProviders = [importProvidersFrom(LucideAngularModule.pick({ Eye, EyeOff }))];

describe('LoginComponent', () => {
  it('renders Login and Sign Up tab buttons', async () => {
    await render(LoginComponent, {
      providers: [
        { provide: AuthService, useValue: makeMockAuthService() },
        provideRouter([]),
        ...lucideProviders,
      ],
    });

    // Tab buttons (not the submit button, which has aria-label="Sign in")
    expect(screen.getByRole('button', { name: 'Login' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeTruthy();
  });

  it('switches to the signup form when the Sign Up tab is clicked', async () => {
    const user = userEvent.setup();
    await render(LoginComponent, {
      providers: [
        { provide: AuthService, useValue: makeMockAuthService() },
        provideRouter([]),
        ...lucideProviders,
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(screen.getByRole('button', { name: 'Create Account' })).toBeTruthy();
  });

  it('returns to the login form when the Login tab is clicked after switching to signup', async () => {
    const user = userEvent.setup();
    await render(LoginComponent, {
      providers: [
        { provide: AuthService, useValue: makeMockAuthService() },
        provideRouter([]),
        ...lucideProviders,
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Sign Up' }));
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByRole('heading', { name: 'Welcome Back!' })).toBeTruthy();
  });

  it('calls authService.login with the form values on submit', async () => {
    const user = userEvent.setup();
    const authSvc = makeMockAuthService();

    await render(LoginComponent, {
      providers: [
        { provide: AuthService, useValue: authSvc },
        provideRouter([{ path: 'tasks', redirectTo: '' }]),
        ...lucideProviders,
      ],
    });

    await user.type(screen.getByLabelText('Email'), 'user@test.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(authSvc.login).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: 'password123',
    });
  });

  it('shows an error message when login fails', async () => {
    const user = userEvent.setup();
    const authSvc = {
      ...makeMockAuthService(),
      login: vi.fn().mockReturnValue(throwError(() => new Error('401 Unauthorized'))),
    };

    await render(LoginComponent, {
      providers: [
        { provide: AuthService, useValue: authSvc },
        provideRouter([]),
        ...lucideProviders,
      ],
    });

    await user.type(screen.getByLabelText('Email'), 'bad@bad.com');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      screen.getByText('Invalid email or password! Strawberry is disappointed.')
    ).toBeTruthy();
  });

  it('toggles the password input between hidden and visible when the visibility button is clicked', async () => {
    const user = userEvent.setup();
    await render(LoginComponent, {
      providers: [
        { provide: AuthService, useValue: makeMockAuthService() },
        provideRouter([]),
        ...lucideProviders,
      ],
    });

    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput.getAttribute('type')).toBe('password');

    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(passwordInput.getAttribute('type')).toBe('text');

    await user.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(passwordInput.getAttribute('type')).toBe('password');
  });
});
