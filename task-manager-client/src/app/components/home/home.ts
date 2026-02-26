import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.html',
  host: {
    class: 'flex flex-col items-center justify-center text-center min-h-[80vh] p-8 gap-16 lg:flex-row lg:text-left lg:justify-between lg:max-w-[1200px] lg:mx-auto',
  },
})

export class HomeComponent {
  authService = inject(AuthService);
}
