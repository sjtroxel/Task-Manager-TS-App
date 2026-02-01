import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})

export class SignupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = signal('');
  showPassword = signal(false);           // lucide-icon "eyeball" state
  showConfirmPassword = signal(false);    // separate signal!!

  onSignup() {
    if (this.password !== this.confirmPassword) {
      alert("Passwords don't match! Strawberry is confused.");
      return;
    }
    this.authService.register({
    name: this.name,
    email: this.email,
    password: this.password
    }).subscribe({
      next: () => this.router.navigate(['/tasks']),
      error: (err) => this.errorMessage.set("Signup failed. Try a different email?")
    });
  }
}
