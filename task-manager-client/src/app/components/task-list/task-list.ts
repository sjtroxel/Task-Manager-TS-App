import { Component, OnInit, inject, signal } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { CommonModule } from '@angular/common';
import { TaskForm } from '../task-form/task-form';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, TaskForm, FormsModule],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})

export class TaskListComponent implements OnInit {
  public authService = inject(AuthService);
  taskService = inject(TaskService);

  // inject the router
  private router = inject(Router);

  ngOnInit() {
    // fetch tasks on load
    this.taskService.getTasks();
  }

  onDelete(id: string) {
    if (confirm('Are you sure Strawberry wants to delete this?')) {
      this.taskService.deleteTask(id);
    }
  }

  onToggle(task: any) {
    this.taskService.toggleDone(task);
  }

  // track the ID of the task being edited
  editingTaskId = signal<string | null>(null);

  //temporary storage for the edits
  editTitle = '';
  editDescription = '';

  startEdit(task: any) {
    this.editingTaskId.set(task._id);
    this.editTitle = task.title;
    this.editDescription = task.description;
  }

  cancelEdit() {
    this.editingTaskId.set(null);
  }

  saveEdit(task: any) {
    const updatedData = {title: this.editTitle, description: this.editDescription};

    // now we call the service method instead of doing the HTTP work here
    this.taskService.updateTask(task._id, updatedData).subscribe(() => {
      this.taskService.tasks.update(all =>
        all.map(t => t._id === task._id ? { ...t, ...updatedData } : t)
      );
      this.cancelEdit();
    });
  }

  onLogout() {
    this.authService.logout();  // use the service method!
    this.router.navigate(['/login']);
  }
}
