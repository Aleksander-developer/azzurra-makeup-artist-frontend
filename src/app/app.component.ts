/* src/app/app.component.ts */

import { Component, HostListener, Inject, PLATFORM_ID, AfterViewInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'Azzurra Angius Makeup Artist'; // Aggiornato il titolo per il tuo progetto

  showScrollButton: boolean = false;
  scrollButtonBottom: number = 30; // Posizione iniziale dal basso
  isButtonOverFooter: boolean = false;

  @ViewChild('footerRef') footerRef!: ElementRef; // Riferimento al footer

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Usa Renderer2 per ascoltare gli eventi, più sicuro in SSR
      this.renderer.listen('window', 'scroll', () => this.onWindowScroll());
      this.renderer.listen('window', 'resize', () => this.updateScrollButtonPosition());
      this.updateScrollButtonPosition(); // Aggiorna posizione iniziale
    }
  }

  onWindowScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      this.showScrollButton = scrollY > 100; // Mostra il pulsante dopo 100px di scroll
      this.updateScrollButtonPosition();
    }
  }

  /**
   * Calcola la posizione del pulsante, facendolo fermare a metà del footer.
   */
  updateScrollButtonPosition(): void {
    // Controlla se il footerRef è disponibile (potrebbe non esserlo in SSR)
    if (!this.footerRef?.nativeElement || !isPlatformBrowser(this.platformId)) {
      return;
    }

    const footerEl = this.footerRef.nativeElement as HTMLElement;
    const footerRect = footerEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const footerHeight = footerEl.offsetHeight; // Altezza totale del footer

    const defaultButtonMargin = 30; // Margine di default dal fondo

    if (footerRect.top < viewportHeight) {
      // Il footer è visibile.
      const visibleFooterHeight = viewportHeight - footerRect.top;

      // Calcoliamo la posizione che il pulsante dovrebbe avere per fermarsi a metà del footer.
      // La sua distanza dal fondo della viewport sarà l'altezza visibile del footer meno metà dell'altezza totale del footer.
      const positionRelativeToFooter = visibleFooterHeight - (footerHeight / 2);

      // Il pulsante deve stare alla sua posizione di default (30px) OPPURE più in alto se il footer lo "spinge".
      // Usiamo Math.max per assicurarci che non scenda mai sotto il suo margine di default.
      this.scrollButtonBottom = Math.max(defaultButtonMargin, positionRelativeToFooter);

      this.isButtonOverFooter = true; // Indica che il pulsante è sopra il footer
    } else {
      // Il footer non è visibile, il pulsante torna alla sua posizione di default.
      this.scrollButtonBottom = defaultButtonMargin;
      this.isButtonOverFooter = false;
    }
  }

  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }
}