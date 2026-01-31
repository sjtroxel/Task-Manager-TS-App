import { Component, OnInit, inject } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { CommonModule } from '@angular/common';
import { TaskForm } from '../task-form/task-form';

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, TaskForm],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})

export class TaskListComponent implements OnInit {
  // inject the service
  taskService = inject(TaskService);

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
}
