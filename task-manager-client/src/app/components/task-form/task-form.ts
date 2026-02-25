import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-form',
  imports: [FormsModule],
  templateUrl: './task-form.html',
})

export class TaskForm {
  private taskService = inject(TaskService);

  title = '';
  description = '';

  onSubmit() {
    if (!this.title) return;

    this.taskService.addTask({
      title: this.title,
      description: this.description
    }).subscribe({
      next: () => {
        // reset form upon success
        this.title = '';
        this.description = '';
      }
    });
  }
}
