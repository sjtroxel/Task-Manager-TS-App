import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { TaskListComponent } from './components/task-list/task-list';
import { ProfileComponent } from './components/profile/profile';
import { HomeComponent } from './components/home/home';
import { authGuard } from './guards/auth-guard';
import { noAuthGuard } from './guards/no-auth-guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },               // the new front door
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },         // handles both login & signup
  { path: 'tasks', component: TaskListComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }                        // redirect 404s to home
];
