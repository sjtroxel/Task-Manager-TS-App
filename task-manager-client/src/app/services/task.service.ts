import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})

export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/tasks';

  // signal to store our list of tasks
  tasks = signal<any[]>([]);

  getTasks() {
    // we need to send the token so the backend knows who we are!
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any[]>(this.apiUrl, { headers }).subscribe(data => {
      this.tasks.set(data);
    });
  }
}
