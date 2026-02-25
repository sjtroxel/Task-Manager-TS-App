import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { TaskListComponent } from './task-list';

function makeMockTaskService(initialTasks: any[] = []) {
  const tasks = signal<any[]>(initialTasks);
  return {
    tasks,
    getTasks: vi.fn(),
    addTask: vi.fn().mockReturnValue(of({})),
    deleteTask: vi.fn(),
    toggleDone: vi.fn(),
    updateTask: vi.fn().mockReturnValue(of({})),
  };
}

function makeMockAuthService() {
  return {
    currentUser: signal<any>({ name: 'Test User' }),
    logout: vi.fn(),
  };
}

describe('TaskListComponent', () => {
  it('shows an empty state message when there are no tasks', async () => {
    await render(TaskListComponent, {
      providers: [
        { provide: TaskService, useValue: makeMockTaskService([]) },
        { provide: AuthService, useValue: makeMockAuthService() },
        provideRouter([]),
      ],
    });

    expect(screen.getByText('No tasks found. Time for a nap?!')).toBeInTheDocument();
  });

  it("renders each task's title and description from the service signal", async () => {
    const tasks = [
      { _id: '1', title: 'Buy milk', description: 'From the corner store', completed: false },
      { _id: '2', title: 'Write tests', description: 'All of them', completed: false },
    ];
    await render(TaskListComponent, {
      providers: [
        { provide: TaskService, useValue: makeMockTaskService(tasks) },
        { provide: AuthService, useValue: makeMockAuthService() },
        provideRouter([]),
      ],
    });

    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(screen.getByText('Write tests')).toBeInTheDocument();
    expect(screen.getByText('All of them')).toBeInTheDocument();
  });

  it('calls toggleDone when the Done button is clicked on an incomplete task', async () => {
    const user = userEvent.setup();
    const task = { _id: '1', title: 'Finish task', description: '', completed: false };
    const taskSvc = makeMockTaskService([task]);

    await render(TaskListComponent, {
      providers: [
        { provide: TaskService, useValue: taskSvc },
        { provide: AuthService, useValue: makeMockAuthService() },
        provideRouter([]),
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(taskSvc.toggleDone).toHaveBeenCalledWith(task);
  });

  it('shows an Undo button for completed tasks', async () => {
    const task = { _id: '1', title: 'Already done', description: '', completed: true };
    await render(TaskListComponent, {
      providers: [
        { provide: TaskService, useValue: makeMockTaskService([task]) },
        { provide: AuthService, useValue: makeMockAuthService() },
        provideRouter([]),
      ],
    });

    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
  });

  it('calls deleteTask when Delete is clicked and the confirm dialog is accepted', async () => {
    const user = userEvent.setup();
    const task = { _id: '1', title: 'Doomed task', description: '', completed: false };
    const taskSvc = makeMockTaskService([task]);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    await render(TaskListComponent, {
      providers: [
        { provide: TaskService, useValue: taskSvc },
        { provide: AuthService, useValue: makeMockAuthService() },
        provideRouter([]),
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(taskSvc.deleteTask).toHaveBeenCalledWith('1');
    vi.restoreAllMocks();
  });

  it('does not call deleteTask when the confirm dialog is cancelled', async () => {
    const user = userEvent.setup();
    const task = { _id: '1', title: 'Safe task', description: '', completed: false };
    const taskSvc = makeMockTaskService([task]);
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    await render(TaskListComponent, {
      providers: [
        { provide: TaskService, useValue: taskSvc },
        { provide: AuthService, useValue: makeMockAuthService() },
        provideRouter([]),
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(taskSvc.deleteTask).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('shows Save and Cancel buttons when Edit is clicked', async () => {
    const user = userEvent.setup();
    const task = { _id: '1', title: 'Edit me', description: 'Old desc', completed: false };

    await render(TaskListComponent, {
      providers: [
        { provide: TaskService, useValue: makeMockTaskService([task]) },
        { provide: AuthService, useValue: makeMockAuthService() },
        provideRouter([]),
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls updateTask with the new title when Save is clicked after editing', async () => {
    const user = userEvent.setup();
    const task = { _id: '1', title: 'Old title', description: 'Old desc', completed: false };
    const taskSvc = makeMockTaskService([task]);

    await render(TaskListComponent, {
      providers: [
        { provide: TaskService, useValue: taskSvc },
        { provide: AuthService, useValue: makeMockAuthService() },
        provideRouter([]),
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    // The edit input is pre-filled with the task's current title — find it by its current value
    const titleInput = screen.getByDisplayValue('Old title');
    await user.clear(titleInput);
    await user.type(titleInput, 'New title');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(taskSvc.updateTask).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ title: 'New title' })
    );
  });

  it('restores the task card view when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const task = { _id: '1', title: 'My task', description: '', completed: false };

    await render(TaskListComponent, {
      providers: [
        { provide: TaskService, useValue: makeMockTaskService([task]) },
        { provide: AuthService, useValue: makeMockAuthService() },
        provideRouter([]),
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByText('My task')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('calls authService.logout when the Logout button is clicked', async () => {
    const user = userEvent.setup();
    const authSvc = makeMockAuthService();

    await render(TaskListComponent, {
      providers: [
        { provide: TaskService, useValue: makeMockTaskService([]) },
        { provide: AuthService, useValue: authSvc },
        provideRouter([]),
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Logout' }));
    expect(authSvc.logout).toHaveBeenCalled();
  });
});
