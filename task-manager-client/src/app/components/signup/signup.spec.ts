import { importProvidersFrom, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { Eye, EyeOff, LucideAngularModule } from 'lucide-angular';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SignupComponent } from './signup';

function makeMockAuthService(registerImpl = () => of({})) {
  return {
    register: vi.fn().mockImplementation(registerImpl),
    currentUser: signal<any>(null),
    logout: vi.fn(),
  };
}

const lucideProviders = [importProvidersFrom(LucideAngularModule.pick({ Eye, EyeOff }))];

describe('SignupComponent', () => {
  it('renders all required form fields', async () => {
    await render(SignupComponent, {
      providers: [
        { provide: AuthService, useValue: makeMockAuthService() },
        provideRouter([]),
        ...lucideProviders,
      ],
    });

    expect(screen.getByLabelText('Name')).toBeTruthy();
    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.getByLabelText('Confirm Password')).toBeTruthy();
  });

  it('calls authService.register with form data on valid submission', async () => {
    const user = userEvent.setup();
    const authSvc = makeMockAuthService();

    await render(SignupComponent, {
      providers: [
        { provide: AuthService, useValue: authSvc },
        provideRouter([{ path: 'tasks', redirectTo: '' }]),
        ...lucideProviders,
      ],
    });

    await user.type(screen.getByLabelText('Name'), 'Test User');
    await user.type(screen.getByLabelText('Email'), 'new@test.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(authSvc.register).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'new@test.com',
      password: 'password123',
    });
  });

  it('shows an error message when registration fails', async () => {
    const user = userEvent.setup();
    const authSvc = {
      ...makeMockAuthService(),
      register: vi.fn().mockReturnValue(throwError(() => new Error('Email taken'))),
    };

    await render(SignupComponent, {
      providers: [
        { provide: AuthService, useValue: authSvc },
        provideRouter([]),
        ...lucideProviders,
      ],
    });

    await user.type(screen.getByLabelText('Name'), 'Test User');
    await user.type(screen.getByLabelText('Email'), 'taken@test.com');
    await user.type(screen.getByLabelText('Password'), 'pass123');
    await user.type(screen.getByLabelText('Confirm Password'), 'pass123');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(screen.getByText('Signup failed. Try a different email?')).toBeTruthy();
  });

  it('shows an alert when passwords do not match', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'alert').mockReturnValue(undefined);

    await render(SignupComponent, {
      providers: [
        { provide: AuthService, useValue: makeMockAuthService() },
        provideRouter([]),
        ...lucideProviders,
      ],
    });

    await user.type(screen.getByLabelText('Name'), 'Test User');
    await user.type(screen.getByLabelText('Email'), 'test@test.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'different');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(window.alert).toHaveBeenCalledWith("Passwords don't match! Strawberry is confused.");
    vi.restoreAllMocks();
  });

  it('disables Create Account when required fields are empty', async () => {
    await render(SignupComponent, {
      providers: [
        { provide: AuthService, useValue: makeMockAuthService() },
        provideRouter([]),
        ...lucideProviders,
      ],
    });

    expect(screen.getByRole('button', { name: 'Create Account' })).toBeDisabled();
  });
});
