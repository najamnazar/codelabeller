import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotAuthGuard } from '../../modules/auth/not-auth.guard';
import { LandingComponent } from './landing.component';

const routes: Routes = [
  { path: "landing", component: LandingComponent, canActivate: [NotAuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingRoutingModule { }
