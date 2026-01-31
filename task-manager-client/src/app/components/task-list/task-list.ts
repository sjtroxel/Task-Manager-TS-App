import { Component, OnInit, inject } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-list',
  imports: [CommonModule],
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
}
