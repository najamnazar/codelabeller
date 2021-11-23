import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyResponsesComponent } from './my-responses.component';
import { AuthGuard } from '../../modules/auth/auth.guard';

const routes: Routes = [
  { path: "my-responses", component: MyResponsesComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyResponsesRoutingModule { }
