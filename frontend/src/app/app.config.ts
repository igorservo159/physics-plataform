import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes, workspaceRoutes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter([...routes, ...workspaceRoutes]), provideAnimationsAsync()]
};