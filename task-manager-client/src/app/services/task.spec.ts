import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { environment } from '../../environments/environment';

const BASE_URL = `${environment.apiUrl}/tasks`;

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('getTasks()', () => {
    it('GETs all tasks and populates the tasks signal', () => {
      const mockTasks = [
        { _id: '1', title: 'Task A', description: '', completed: false },
        { _id: '2', title: 'Task B', description: 'Do something', completed: true },
      ];

      service.getTasks();

      const req = httpMock.expectOne(BASE_URL);
      expect(req.request.method).toBe('GET');
      req.flush(mockTasks);

      expect(service.tasks()).toEqual(mockTasks);
    });
  });

  describe('addTask()', () => {
    it('POSTs a new task and appends it to the tasks signal', () => {
      const existing = { _id: '1', title: 'Existing', description: '', completed: false };
      service.tasks.set([existing]);

      const newTaskInput = { title: 'New Task', description: 'Detail' };
      const newTaskResponse = { _id: '2', ...newTaskInput, completed: false };

      service.addTask(newTaskInput).subscribe();

      const req = httpMock.expectOne(BASE_URL);
      expect(req.request.method).toBe('POST');
      req.flush(newTaskResponse);

      expect(service.tasks()).toHaveLength(2);
      expect(service.tasks()[1]).toEqual(newTaskResponse);
    });
  });

  describe('deleteTask()', () => {
    it('DELETEs a task by ID and removes it from the tasks signal', () => {
      const tasks = [
        { _id: '1', title: 'Keep Me', description: '', completed: false },
        { _id: '2', title: 'Delete Me', description: '', completed: false },
      ];
      service.tasks.set(tasks);

      service.deleteTask('2');

      const req = httpMock.expectOne(`${BASE_URL}/2`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      expect(service.tasks()).toHaveLength(1);
      expect(service.tasks()[0]._id).toBe('1');
    });
  });

  describe('toggleDone()', () => {
    it('PATCHes with { completed: true } and flips an incomplete task to done', () => {
      const task = { _id: '1', title: 'Task', description: '', completed: false };
      service.tasks.set([task]);

      service.toggleDone(task);

      const req = httpMock.expectOne(`${BASE_URL}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ completed: true });
      req.flush({});

      expect(service.tasks()[0].completed).toBe(true);
    });

    it('PATCHes with { completed: false } and flips a completed task back to incomplete', () => {
      const task = { _id: '2', title: 'Done Task', description: '', completed: true };
      service.tasks.set([task]);

      service.toggleDone(task);

      const req = httpMock.expectOne(`${BASE_URL}/2`);
      expect(req.request.body).toEqual({ completed: false });
      req.flush({});

      expect(service.tasks()[0].completed).toBe(false);
    });
  });

  describe('updateTask()', () => {
    it('PATCHes the task with new title and description and returns an observable', () => {
      const data = { title: 'Updated Title', description: 'Updated Desc' };
      let resolved = false;

      service.updateTask('1', data).subscribe(() => (resolved = true));

      const req = httpMock.expectOne(`${BASE_URL}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(data);
      req.flush({ _id: '1', ...data, completed: false });

      expect(resolved).toBe(true);
    });
  });
});
