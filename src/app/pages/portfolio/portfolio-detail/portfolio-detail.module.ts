import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortfolioDetailRoutingModule } from './portfolio-detail-routing.module';
import { PortfolioDetailComponent } from './portfolio-detail.component';


@NgModule({
  declarations: [
    PortfolioDetailComponent
  ],
  imports: [
    CommonModule,
    PortfolioDetailRoutingModule
  ]
})
export class PortfolioDetailModule { }
