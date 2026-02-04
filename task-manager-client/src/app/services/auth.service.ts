import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

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

  updateProfile(updates: { name: string; password?: string }) {
    // this sends a PUT request to http://localhost:5000/api/users/profile
    // the authInterceptor will automatically attach the Token!
    return this.http.put(`${this.apiUrl}/profile`, updates).pipe(
      tap((updatedUser: any) => {
        // update the signal and localStorage with the fresh data from the server
        const current = this.currentUser();
        const merged = { ...current, ...updatedUser };

        this.currentUser.set(merged);
        localStorage.setItem('user', JSON.stringify(merged));
      })
    );
  }
}
