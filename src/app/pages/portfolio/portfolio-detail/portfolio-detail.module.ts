// src/app/pages/portfolio/portfolio-detail/portfolio-detail.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortfolioDetailRoutingModule } from './portfolio-detail-routing.module';
import { PortfolioDetailComponent } from './portfolio-detail.component';

// Moduli Angular Material necessari
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // <-- QUESTA RIGA DEVE ESSERCI


@NgModule({
  declarations: [
    PortfolioDetailComponent
  ],
  imports: [
    CommonModule,
    PortfolioDetailRoutingModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class PortfolioDetailModule { }
