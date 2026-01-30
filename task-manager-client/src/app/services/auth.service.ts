import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  // 1. modern injection (no more constructor bloat?!)
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/users';

  // 2. the global user signal
  // this is your app's "Source of Truth" for who is logged in
  currentUser = signal<any | null>(null);

  login(credentials: any) {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        // in Angular 21, we use .set() to update signals
        this.currentUser.set(response);
        localStorage.setItem('token', response.token);
      })
    );
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('token');
  }
}
