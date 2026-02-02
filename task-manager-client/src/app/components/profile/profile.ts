import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})

export class ProfileComponent {
  authService = inject(AuthService);

  // signals for form handling
  newName = signal(this.authService.currentUser()?.name || '');
  message = signal('');

  updateProfile() {
    // temporarily we will just simulate the update logic
    // connect to the backend probably later today
    if (this.newName().length < 2) {
      this.message.set("Name is too short! Strawberry is unimpressed.");
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
}
