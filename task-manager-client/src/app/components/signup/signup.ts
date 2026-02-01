import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})

export class SignupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';

  onSignup() {
    this.authService.register({ name: this.name, email: this.email, password: this.password })
      .subscribe(() => this.router.navigate(['/tasks']));
  }
}
