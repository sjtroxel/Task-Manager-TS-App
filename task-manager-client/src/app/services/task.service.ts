import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})

export class TaskService {
  private http = inject(HttpClient);
  private authService = inject(AuthService)
  private apiUrl = `${environment.apiUrl}/tasks`;

  // signal to store our list of tasks
  tasks = signal<any[]>([]);

  private getHeaders() {
    const token = localStorage.getItem('token'); // or however you store it
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  getTasks() {
    return this.http.get<any[]>(this.apiUrl, this.getHeaders()).subscribe(data => {
      this.tasks.set(data);
    });
  }

  addTask(task: {title: string, description: string }) {
    return this.http.post<any>(this.apiUrl, task, this.getHeaders()).pipe(
      tap((newTask) => {
          // update the signal! this is the "magic" part -
          // - it adds the new task to the existing list, without a page refresh.
          this.tasks.update(currentTasks => [...currentTasks, newTask]);
      })
    );
  }

  deleteTask(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders()).subscribe(() => {
          // update the signal: filter out the deleted task
      this.tasks.update(allTasks => allTasks.filter(t => t._id !== id));
    });
  }

  toggleDone(task: any) {
    const updatedStatus = { completed: !task.completed };
    return this.http.patch(`${this.apiUrl}/${task._id}`, updatedStatus, this.getHeaders()).subscribe(() => {
          // update the signal: find the task and flip its status
      this.tasks.update(allTasks =>
        allTasks.map(t => t._id === task._id ? { ...t, completed: !t.completed } : t)
      );
    });
  }

  updateTask(id: string, data: { title: string, description: string }) {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, data, this.getHeaders());
  }
}
