import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { Eye, EyeOff, LucideAngularModule } from 'lucide-angular';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ProfileComponent } from './profile';

function makeMockAuthService(updateProfileImpl = () => of({})) {
  return {
    currentUser: signal<any>({ name: 'Test User', email: 'test@test.com' }),
    logout: vi.fn(),
    updateProfile: vi.fn().mockImplementation(updateProfileImpl),
  };
}

const lucideProviders = [importProvidersFrom(LucideAngularModule.pick({ Eye, EyeOff }))];

describe('ProfileComponent', () => {
  it('calls updateProfile with the new name when Save All Changes is clicked', async () => {
    const user = userEvent.setup();
    const authSvc = makeMockAuthService();

    await render(ProfileComponent, {
      providers: [
        { provide: AuthService, useValue: authSvc },
        provideRouter([]),
        ...lucideProviders,
      ],
    });

    const nameInput = screen.getByLabelText('Display Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'New Name');
    await user.click(screen.getByRole('button', { name: 'Save All Changes' }));

    expect(authSvc.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New Name' })
    );
  });

  it('shows a success message after a successful profile update', async () => {
    const user = userEvent.setup();
    const authSvc = makeMockAuthService();

    await render(ProfileComponent, {
      providers: [
        { provide: AuthService, useValue: authSvc },
        provideRouter([]),
        ...lucideProviders,
      ],
    });

    const nameInput = screen.getByLabelText('Display Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');
    await user.click(screen.getByRole('button', { name: 'Save All Changes' }));

    expect(screen.getByText('Profile synced with database!!')).toBeInTheDocument();
  });

  it('shows an error message when the server returns an error', async () => {
    const user = userEvent.setup();
    const authSvc = {
      ...makeMockAuthService(),
      updateProfile: vi.fn().mockReturnValue(throwError(() => new Error('Server error'))),
    };

    await render(ProfileComponent, {
      providers: [
        { provide: AuthService, useValue: authSvc },
        provideRouter([]),
        ...lucideProviders,
      ],
    });

    const nameInput = screen.getByLabelText('Display Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Some Name');
    await user.click(screen.getByRole('button', { name: 'Save All Changes' }));

    expect(screen.getByText('Server error: Could not update profile!')).toBeInTheDocument();
  });

  it('shows a validation error when the display name is too short', async () => {
    const user = userEvent.setup();
    const authSvc = makeMockAuthService();

    await render(ProfileComponent, {
      providers: [
        { provide: AuthService, useValue: authSvc },
        provideRouter([]),
        ...lucideProviders,
      ],
    });

    const nameInput = screen.getByLabelText('Display Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'X');
    await user.click(screen.getByRole('button', { name: 'Save All Changes' }));

    expect(screen.getByText('Name is too short! Strawberry is unimpressed.')).toBeInTheDocument();
    expect(authSvc.updateProfile).not.toHaveBeenCalled();
  });

  it('calls authService.logout when the Logout button is clicked', async () => {
    const user = userEvent.setup();
    const authSvc = makeMockAuthService();

    await render(ProfileComponent, {
      providers: [
        { provide: AuthService, useValue: authSvc },
        provideRouter([]),
        ...lucideProviders,
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Logout' }));
    expect(authSvc.logout).toHaveBeenCalled();
  });
});
