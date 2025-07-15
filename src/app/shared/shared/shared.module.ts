// src/app/shared/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Necessario per routerLink in Navbar/Footer

// Importa i tuoi componenti condivisi che sono dichiarati in questo modulo
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';
import { QuoteBoxComponent } from '../components/quote-box/quote-box.component';
import { ReviewsComponent } from '../components/reviews/reviews.component';
import { WhyChoseMeComponent } from '../components/why-chose-me/why-chose-me.component';

// Importa il tuo MaterialModule (che raggruppa tutti i moduli Material)
import { MaterialModule } from './material/material.module'; // Assicurati che il percorso sia corretto


@NgModule({
  // Dichiara tutti i componenti che appartengono a questo modulo
  declarations: [
    NavbarComponent,
    FooterComponent,
    QuoteBoxComponent,
    ReviewsComponent,
    WhyChoseMeComponent
  ],
  // Importa i moduli necessari per i componenti dichiarati sopra
  imports: [
    CommonModule,
    RouterModule, // Per routerLink
    MaterialModule // Per tutti i componenti Angular Material usati nei componenti condivisi
  ],
  // Esporta i componenti e i moduli che devono essere disponibili per altri moduli
  // che importano questo SharedModule (es. AppModule, HomeModule, ContattiModule)
  exports: [
    NavbarComponent,
    FooterComponent,
    QuoteBoxComponent,
    ReviewsComponent,
    WhyChoseMeComponent,
    MaterialModule, // <-- FONDAMENTALE: Esporta MaterialModule
    CommonModule,   // Utile per direttive come *ngIf, *ngFor
    RouterModule    // Utile se i moduli che importano SharedModule usano routerLink
  ]
})
export class SharedModule { }

