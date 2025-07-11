import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TruccoSposaRoutingModule } from './trucco-sposa-routing.module';
import { TruccoSposaComponent } from './trucco-sposa.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [
    TruccoSposaComponent
  ],
  imports: [
    CommonModule,
    TruccoSposaRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class TruccoSposaModule { }
