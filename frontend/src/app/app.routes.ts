import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { WorkspaceHomeComponent } from './workspace-home/workspace-home.component';
import { WorkspaceProfileComponent } from './workspace-profile/workspace-profile.component';
import { WorkspaceMepComponent } from './workspace-mep/workspace-mep.component';
import { WorkspaceDownloadComponent } from './workspace-download/workspace-download.component';

export const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'login', component: LoginComponent },
  { path: 'workspace', component: WorkspaceComponent },
];

export const workspaceRoutes: Routes = [
  {
    path: 'workspace',
    component: WorkspaceComponent,
    children: [
      { path: 'home', component: WorkspaceHomeComponent },
      { path: 'profile', component: WorkspaceProfileComponent },
      { path: 'mep', component: WorkspaceMepComponent },
      { path: 'download', component: WorkspaceDownloadComponent },
    ],
  },
];
