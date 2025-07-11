import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Moduli di Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav'; // Aggiunto per la sidenav nel layout
import { MatListModule } from '@angular/material/list';     // Aggiunto per le liste nella sidenav
import { MatProgressBarModule } from '@angular/material/progress-bar'; // Aggiunto per le progress bar

// Altri moduli
import { RouterModule } from '@angular/router'; // Necessario se i componenti Material usano routerLink (es. MatButton)
import { LayoutModule } from '@angular/cdk/layout'; // Per funzionalità responsive (es. BreakpointObserver)
import { ReactiveFormsModule } from '@angular/forms'; // Per i form reattivi
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



@NgModule({
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatCardModule,
    MatGridListModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatDividerModule,
    MatSidenavModule,
    MatListModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    RouterModule,
    LayoutModule,
    ReactiveFormsModule
  ],
  exports: [
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatCardModule,
    MatGridListModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatDividerModule,
    MatSidenavModule,
    MatListModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    RouterModule,
    LayoutModule,
    ReactiveFormsModule,
  ]
})
export class MaterialModule { }
