import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContattiRoutingModule } from './contatti-routing.module';
import { ContattiComponent } from './contatti.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../shared/shared/shared.module';


@NgModule({
  declarations: [
    ContattiComponent
  ],
  imports: [
    CommonModule,
    ContattiRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    SharedModule
  ]
})
export class ContattiModule { }
