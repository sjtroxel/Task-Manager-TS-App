import { signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import { TaskService } from '../../services/task.service';
import { TaskForm } from './task-form';

function makeMockTaskService() {
  return {
    tasks: signal<any[]>([]),
    getTasks: vi.fn(),
    addTask: vi.fn().mockReturnValue(of({})),
    deleteTask: vi.fn(),
    toggleDone: vi.fn(),
    updateTask: vi.fn().mockReturnValue(of({})),
  };
}

describe('TaskForm', () => {
  it('disables the Add Task! button when the title input is empty', async () => {
    await render(TaskForm, {
      providers: [{ provide: TaskService, useValue: makeMockTaskService() }],
    });

    expect(screen.getByRole('button', { name: 'Add Task!' })).toBeDisabled();
  });

  it('enables the Add Task! button once a title is typed', async () => {
    const user = userEvent.setup();
    await render(TaskForm, {
      providers: [{ provide: TaskService, useValue: makeMockTaskService() }],
    });

    await user.type(screen.getByPlaceholderText('What needs doing?'), 'Buy groceries');
    expect(screen.getByRole('button', { name: 'Add Task!' })).not.toBeDisabled();
  });

  it('calls addTask with the entered title and an empty description', async () => {
    const user = userEvent.setup();
    const taskSvc = makeMockTaskService();

    await render(TaskForm, {
      providers: [{ provide: TaskService, useValue: taskSvc }],
    });

    await user.type(screen.getByPlaceholderText('What needs doing?'), 'Buy groceries');
    await user.click(screen.getByRole('button', { name: 'Add Task!' }));

    expect(taskSvc.addTask).toHaveBeenCalledWith({
      title: 'Buy groceries',
      description: '',
    });
  });

  it('calls addTask with both title and description when both are filled', async () => {
    const user = userEvent.setup();
    const taskSvc = makeMockTaskService();

    await render(TaskForm, {
      providers: [{ provide: TaskService, useValue: taskSvc }],
    });

    await user.type(screen.getByPlaceholderText('What needs doing?'), 'Write tests');
    await user.type(screen.getByPlaceholderText('Add a description...'), 'All of them');
    await user.click(screen.getByRole('button', { name: 'Add Task!' }));

    expect(taskSvc.addTask).toHaveBeenCalledWith({
      title: 'Write tests',
      description: 'All of them',
    });
  });

  it('clears the form fields after a successful submission', async () => {
    const user = userEvent.setup();
    await render(TaskForm, {
      providers: [{ provide: TaskService, useValue: makeMockTaskService() }],
    });

    const titleInput = screen.getByPlaceholderText('What needs doing?');
    await user.type(titleInput, 'Temporary task');
    await user.click(screen.getByRole('button', { name: 'Add Task!' }));

    expect((titleInput as HTMLInputElement).value).toBe('');
  });
});
