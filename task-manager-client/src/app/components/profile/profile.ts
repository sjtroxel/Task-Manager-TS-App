import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './profile.html',
  host: { class: 'flex justify-center pt-8' },
})

export class ProfileComponent {
  authService = inject(AuthService);
  router = inject(Router);

  // signals for form handling
  newName = signal(this.authService.currentUser()?.name || '');
  newPassword = signal('');
  confirmPassword = signal('');
  message = signal('');

  showNewPass = signal(false);
  showConfirmPass = signal(false);

  updateProfile() {
    // basic validation
    if (this.newName().length < 2) {
      this.message.set("Name is too short! Strawberry is unimpressed.");
      return;
    }

    if (this.newPassword() && this.newPassword() !== this.confirmPassword()) {
      this.message.set("Passwords don't match! Strawberry is shaking her head.");
      return;
    }

    // prepare the data packet
    const updateData: any = { name: this.newName() };
    if (this.newPassword()) {
      updateData.password = this.newPassword();
    }

    // call the Backend
    this.authService.updateProfile(updateData).subscribe({
      next: () => {
        this.message.set("Profile synced with database!!");
        this.newPassword.set('');      // clear fields for security
        this.confirmPassword.set('');

        setTimeout(() => this.message.set(''), 3000);
      },
      error: (err) => {
        console.error(err);
        this.message.set("Server error: Could not update profile!");
      }
    });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
