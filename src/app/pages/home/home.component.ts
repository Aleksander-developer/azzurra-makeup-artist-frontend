// src/app/pages/home/home.component.ts
import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
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
export class HomeComponent implements OnInit, OnDestroy {

  // Array di percorsi delle immagini per il carousel
  heroImages: string[] = [
    '/assets/trucco-cerimonia.png', // La tua foto originale
    '/assets/trucco-sposa-seguimi.png', // Altra foto che hai caricato
    '/assets/trucco-sposa-standard.png' // Un'altra foto che hai caricato
    // Aggiungi qui altri percorsi di immagini se ne hai
  ];

  currentImageIndex: number = 0;
  currentHeroImage: string = '';
  private imageIntervalSubscription: Subscription | undefined;

  ngOnInit(): void {
    this.shuffleArray(this.heroImages); // Randomizza l'ordine delle immagini all'avvio
    this.currentHeroImage = this.heroImages[this.currentImageIndex];
    this.startImageCarousel();
  }

  ngOnDestroy(): void {
    if (this.imageIntervalSubscription) {
      this.imageIntervalSubscription.unsubscribe(); // Ferma l'intervallo quando il componente viene distrutto
    }
  }

  /**
   * Mescola un array in modo casuale (algoritmo Fisher-Yates).
   * @param array L'array da mescolare.
   */
  private shuffleArray(array: string[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Scambia gli elementi
    }
  }

  /**
   * Avvia lo scorrimento automatico delle immagini del carousel.
   */
  private startImageCarousel(): void {
    // Cambia immagine ogni 5 secondi (5000 ms)
    this.imageIntervalSubscription = interval(5000).subscribe(() => {
      this.nextImage();
    });
  }

  /**
   * Passa all'immagine precedente nel carousel.
   */
  prevImage(): void {
    // Ferma l'intervallo per evitare salti durante la navigazione manuale
    if (this.imageIntervalSubscription) {
      this.imageIntervalSubscription.unsubscribe();
    }
    this.currentImageIndex = (this.currentImageIndex - 1 + this.heroImages.length) % this.heroImages.length;
    this.currentHeroImage = this.heroImages[this.currentImageIndex];
    this.startImageCarousel(); // Riavvia l'intervallo
  }

  /**
   * Passa all'immagine successiva nel carousel.
   */
  nextImage(): void {
    // Ferma l'intervallo per evitare salti durante la navigazione manuale
    if (this.imageIntervalSubscription) {
      this.imageIntervalSubscription.unsubscribe();
    }
    this.currentImageIndex = (this.currentImageIndex + 1) % this.heroImages.length;
    this.currentHeroImage = this.heroImages[this.currentImageIndex];
    this.startImageCarousel(); // Riavvia l'intervallo
  }
}
