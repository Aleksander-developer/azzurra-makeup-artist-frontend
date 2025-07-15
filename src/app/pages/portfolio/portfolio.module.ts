// src/app/pages/portfolio/portfolio.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioRoutingModule } from './portfolio-routing.module';
import { PortfolioComponent } from './portfolio.component';

// Moduli Angular Material necessari
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PortfolioDetailComponent } from './portfolio-detail/portfolio-detail.component';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@NgModule({
  declarations: [
    PortfolioComponent,
    PortfolioDetailComponent
  ],
  imports: [
    CommonModule,
    PortfolioRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatProgressSpinnerModule
  ]
})
export class PortfolioModule { }
