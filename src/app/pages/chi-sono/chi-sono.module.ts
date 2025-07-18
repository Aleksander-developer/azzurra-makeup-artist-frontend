import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChiSonoRoutingModule } from './chi-sono-routing.module';
import { ChiSonoComponent } from './chi-sono.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    ChiSonoComponent
  ],
  imports: [
    CommonModule,
    ChiSonoRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ]
})
export class ChiSonoModule { }
