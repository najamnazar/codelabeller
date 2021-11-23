import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent, OP_LOGIN, OP_LOGOUT } from './component/auth.component';

const AUTH_ROUTES: Routes = [
  { path: 'login', component: AuthComponent, data: { operation: OP_LOGIN } },
  { path: 'logout', component: AuthComponent, data: { operation: OP_LOGOUT } },
];

@NgModule({
  imports: [RouterModule.forChild(AUTH_ROUTES)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
