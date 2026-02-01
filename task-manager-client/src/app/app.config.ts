import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth-interceptor';

import { routes } from './app.routes';

import { LucideAngularModule, Menu, ListTodo, User, Sun, Moon, Eye, EyeOff } from 'lucide-angular'

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    importProvidersFrom(LucideAngularModule.pick({ Menu, ListTodo, User, Sun, Moon, Eye, EyeOff }))
  ]
};
