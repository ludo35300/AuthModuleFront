import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth/interceptor/auth.interceptor';
import { mockBackendInterceptor } from './auth/interceptor/mock-backend.interceptor';
import { errorInterceptor } from './auth/interceptor/error-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), // Injectez appInfos partout
    // IMPORTANT: HttpClient + interceptor
    provideHttpClient(withInterceptors([authInterceptor, mockBackendInterceptor , errorInterceptor ])),
  ],
};


export const appInfos = {
  title: 'AuthModule',
};

