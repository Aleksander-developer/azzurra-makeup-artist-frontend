import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServiziRoutingModule } from './servizi-routing.module';
import { ServiziComponent } from './servizi.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MaterialModule } from '../../shared/shared/material/material.module';


@NgModule({
  declarations: [
    ServiziComponent
  ],
  imports: [
    CommonModule,
    ServiziRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MaterialModule
  ]
})
export class ServiziModule { }
