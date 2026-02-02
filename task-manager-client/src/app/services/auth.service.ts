import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/users';

  currentUser = signal<any | null>(JSON.parse(localStorage.getItem('user') || 'null'));

  login(credentials: any) {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        this.saveSession(response);
      })
    );
  }

  register(userData: any) {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      tap((response: any) => {
        this.saveSession(response);
      })
    );
  }

  private saveSession(response: any) {
    this.currentUser.set(response);
    localStorage.setItem('token', response.token);
    // Store the whole response (including name) so it survives a refresh!
    localStorage.setItem('user', JSON.stringify(response));
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}
