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
  styleUrl: './profile.scss',
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

    // update the local state
    const currentUser = this.authService.currentUser();
    this.authService.currentUser.set({ ...currentUser, name: this.newName() });

    // save to localStorage, so it persists
    localStorage.setItem('user', JSON.stringify(this.authService.currentUser()));

    this.message.set("Profile updated successfully!!");

    // clear message after 3 seconds
    setTimeout(() => this.message.set(''), 3000);
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
