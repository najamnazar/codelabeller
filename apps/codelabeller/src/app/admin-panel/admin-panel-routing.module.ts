import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminPanelComponent } from './admin-panel.component'
import { AuthGuard } from '../../modules/auth/auth.guard';
import { AdminGuard } from '../../modules/auth/admin.guard';

const routes: Routes = [
  { path: "admin-panel", component: AdminPanelComponent, canActivate: [AuthGuard, AdminGuard], data: { 'route': '/' } },
  { path: "admin-panel/users", component: AdminPanelComponent, canActivate: [AuthGuard, AdminGuard], data: { 'route': '/users' } },
  { path: "admin-panel/design-patterns", component: AdminPanelComponent, canActivate: [AuthGuard, AdminGuard], data: { 'route': '/design-patterns' } },
  { path: "admin-panel/projects", component: AdminPanelComponent, canActivate: [AuthGuard, AdminGuard], data: { 'route': '/projects' } },
  { path: "admin-panel/all-responses", component: AdminPanelComponent, canActivate: [AuthGuard, AdminGuard], data: { 'route': '/all-responses' } },
  { path: "admin-panel/upload-jobs", component: AdminPanelComponent, canActivate: [AuthGuard, AdminGuard], data: { 'route': '/upload-jobs' } },
  { path: "admin-panel/settings", component: AdminPanelComponent, canActivate: [AuthGuard, AdminGuard], data: { 'route': '/settings' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminPanelRoutingModule { }
