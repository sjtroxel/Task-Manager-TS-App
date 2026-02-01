import { Component, signal, effect } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, LucideAngularModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  isSidebarOpen = signal(false);
  isDarkMode = signal(false);

  constructor() {
    // this 'effect' runs whenever isDarkMode changes
    effect(() => {
      const theme = this.isDarkMode() ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
    });
  }

  toggleSidebar() {
    this.isSidebarOpen.update(val => !val);
  }

  toggleTheme() {
    this.isDarkMode.update(val => !val);
  }
}
