import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChiSonoRoutingModule } from './chi-sono-routing.module';
import { ChiSonoComponent } from './chi-sono.component';


@NgModule({
  declarations: [
    ChiSonoComponent
  ],
  imports: [
    CommonModule,
    ChiSonoRoutingModule
  ]
})
export class ChiSonoModule { }
