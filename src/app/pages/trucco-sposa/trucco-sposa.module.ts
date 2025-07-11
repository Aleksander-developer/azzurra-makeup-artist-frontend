import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TruccoSposaRoutingModule } from './trucco-sposa-routing.module';
import { TruccoSposaComponent } from './trucco-sposa.component';


@NgModule({
  declarations: [
    TruccoSposaComponent
  ],
  imports: [
    CommonModule,
    TruccoSposaRoutingModule
  ]
})
export class TruccoSposaModule { }
