import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/tasks';

  // signal to store our list of tasks
  tasks = signal<any[]>([]);

  getTasks() {
    return this.http.get<any[]>(this.apiUrl).subscribe(data => {
      this.tasks.set(data);
    });
  }

  addTask(task: {title: string, description: string }) {
    return this.http.post<any>(this.apiUrl, task).pipe(
      tap((newTask) => {
          // update the signal! this is the "magic" part -
          // - it adds the new task to the existing list, without a page refresh.
          this.tasks.update(currentTasks => [...currentTasks, newTask]);
      })
    );
  }
}
