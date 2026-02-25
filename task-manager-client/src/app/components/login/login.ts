import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SignupComponent } from '../signup/signup';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-login',
  // standalone: true,        // this is actually not required anymore despite all the LLMs including it
  imports: [FormsModule, CommonModule, SignupComponent, LucideAngularModule],
  templateUrl: './login.html',
})

export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  authMode = signal<'login' | 'signup'>('login');   // toggle between login/signup
  showPassword = signal(false);                     // toggle for lucide-icon eyeball
  showForgotPassword = signal(false);               // logic for password foldout

  // form data
  email = '';
  password = '';
  errorMessage = signal('');    // signal for error handling

  ngOnInit() {
      // Check if we came here with ?mode=signup in the URL
      const mode = this.route.snapshot.queryParamMap.get('mode');
      if (mode === 'signup') {
        this.authMode.set('signup');
      }
    }

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
