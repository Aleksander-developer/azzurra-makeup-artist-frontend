import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss'],
  animations: [
    trigger('reviewFadeSlide', [
      transition(':increment', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':decrement', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
    ]),
  ]
})
export class ReviewsComponent implements OnInit, OnDestroy {
  // Lasciamo l'array vuoto per le recensioni reali.
  // Quando avrai le recensioni reali, potrai popolarlo qui
  // o caricarle da un servizio (es. Firebase, API).
  reviews: { author: string; text: string; rating: number; }[] = [];

  // Se vuoi rimettere delle recensioni di test per lo sviluppo, usa questo formato:
  /*
  reviews = [
    {
      author: 'Giulia',
      text: 'Servizio fantastico, molto professionale!',
      rating: 5
    },
    {
      author: 'Laura',
      text: 'Trucco impeccabile per il mio matrimonio, grazie!',
      rating: 4
    }
  ];
  */

  currentIndex: number = 0;
  private autoSlideInterval: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Avvia l'autoslide solo se ci sono recensioni
      if (this.reviews.length > 1) { // L'autoslide ha senso solo con più di una recensione
        this.autoSlideInterval = setInterval(() => {
          this.next();
        }, 4000);
      }
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  prev(): void {
    if (this.reviews.length) {
      this.currentIndex = (this.currentIndex - 1 + this.reviews.length) % this.reviews.length;
    }
  }

  next(): void {
    if (this.reviews.length) {
      this.currentIndex = (this.currentIndex + 1) % this.reviews.length;
    }
  }
}
