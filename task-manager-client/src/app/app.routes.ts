import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { TaskListComponent } from './components/task-list/task-list';
import { ProfileComponent } from './components/profile/profile';
import { HomeComponent } from './components/home/home';

export const routes: Routes = [
  { path: '', component: HomeComponent },               // the new front door
  { path: 'login', component: LoginComponent },         // handles both login & signup
  { path: 'tasks', component: TaskListComponent},
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: '' }                        // redirect 404s to home
];
