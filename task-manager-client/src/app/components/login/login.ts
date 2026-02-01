import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SignupComponent } from '../signup/signup';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-login',
  // standalone: true,        // this is actually not required anymore despite all the LLMs including it
  imports: [FormsModule, CommonModule, SignupComponent, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})

export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  authMode = signal<'login' | 'signup'>('login');   // toggle between login/signup
  showPassword = signal(false);                     // toggle for lucide-icon eyeball
  showForgotPassword = signal(false);               // logic for password foldout

  // form data
  email = '';
  password = '';
  errorMessage = signal('');    // signal for error handling

  onLogin() {
    const credentials = { email: this.email, password: this.password };

    this.authService.login(credentials).subscribe({
      next: () => {
        console.log('Login successful!!');
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        this.errorMessage.set('Invalid email or password! Strawberry is disappointed.');
      }
    });
  }
}
