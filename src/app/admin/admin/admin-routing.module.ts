// src/app/admin/admin/admin-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPortfolioManagerComponent } from '../admin-portfolio-manager/admin-portfolio-manager.component';

const routes: Routes = [
  {
    path: 'portfolio-manager', // Rotta completa sarà /admin/portfolio-manager
    component: AdminPortfolioManagerComponent // <-- ATTIVATA LA ROTTA
  },
  { path: '', redirectTo: 'portfolio-manager', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
