// src/app/pages/home/home.component.ts
import { animate, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  // standalone: false, // Questo è gestito dal modulo HomeModule, non qui direttamente
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
    ]),
  ]
})
export class HomeComponent { // Rinominato da 'Home' a 'HomeComponent' per convenzione
  // Puoi aggiungere qui logiche specifiche per la home page, se necessario
}
