// src/app/pages/portfolio/portfolio-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PortfolioComponent } from './portfolio.component';
import { PortfolioDetailComponent } from './portfolio-detail/portfolio-detail.component'; // <-- ASSICURATI CHE SIA IMPORTATO


const routes: Routes = [
  {
    path: '', // Corrisponde a /portfolio
    component: PortfolioComponent
  },
  {
    path: ':id', // <-- RIATTIVA QUESTA ROTTA
    component: PortfolioDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortfolioRoutingModule { }
