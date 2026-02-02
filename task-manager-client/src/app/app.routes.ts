import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { TaskListComponent } from './components/task-list/task-list';
import { ProfileComponent } from './components/profile/profile';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'tasks', component: TaskListComponent},
  { path: 'profile', component: ProfileComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }  // default to login page
];
