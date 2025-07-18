import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs'; // Per gestire le sottoscrizioni

// Interfaccia per definire la struttura di un servizio
interface ServiceItem {
  id: string; // Un ID unico per il servizio (utile per la randomizzazione e il tracciamento)
  titleKey: string; // Chiave di traduzione per il titolo
  subtitleKey: string; // Chiave di traduzione per il sottotitolo
  descriptionKey: string; // Chiave di traduzione per la descrizione
  buttonAriaKey: string; // Chiave di traduzione per l'aria-label del bottone
  images: string[]; // Array di URL delle immagini per il carousel
  imageAltKey: string; // Chiave di traduzione per l'alt text delle immagini
  currentIndex: number; // Indice dell'immagine corrente nel carousel
}

@Component({
  selector: 'app-servizi',
  templateUrl: './servizi.component.html',
  styleUrls: ['./servizi.component.scss']
})
export class ServiziComponent implements OnInit, OnDestroy {

  // Array dei servizi con le relative immagini e chiavi di traduzione
  services: ServiceItem[] = [
    {
      id: 'ceremony',
      titleKey: 'SERVIZI.CEREMONY_TITLE',
      subtitleKey: 'SERVIZI.CEREMONY_SUBTITLE',
      descriptionKey: 'SERVIZI.CEREMONY_DESCRIPTION',
      buttonAriaKey: 'SERVIZI.CEREMONY_BUTTON_ARIA',
      images: [
        'assets/Trucco Eventi & Servizi Fotografici.png', // Sostituisci con le tue immagini reali
        'assets/trucco-cerimonia.png',
        'assets/trucco-sposa-standard.png'
        // Aggiungi qui altri percorsi di immagini per la cerimonia
      ],
      imageAltKey: 'SERVIZI.CEREMONY_IMAGE_ALT',
      currentIndex: 0
    },
    {
      id: 'events',
      titleKey: 'SERVIZI.EVENTS_TITLE',
      subtitleKey: 'SERVIZI.EVENTS_SUBTITLE',
      descriptionKey: 'SERVIZI.EVENTS_DESCRIPTION',
      buttonAriaKey: 'SERVIZI.EVENTS_BUTTON_ARIA',
      images: [
        'assets/Trucco Eventi & Servizi Fotografici.png', // Sostituisci con le tue immagini reali
        'assets/trucco-cerimonia.png',
        'assets/trucco-sposa-standard.png'
        // Aggiungi qui altri percorsi di immagini per eventi/fotografici
      ],
      imageAltKey: 'SERVIZI.EVENTS_IMAGE_ALT',
      currentIndex: 0
    }
  ];

  isFullscreen: boolean = false;
  fullscreenImageUrl: string = '';
  fullscreenImageAlt: string = '';
  private langChangeSubscription: Subscription | undefined;

  constructor(private translate: TranslateService) { }

  ngOnInit(): void {
    // Randomizza l'ordine delle immagini per ogni servizio all'inizializzazione
    this.services.forEach(service => {
      this.shuffleArray(service.images);
      service.currentIndex = 0; // Assicurati che l'indice parta da 0 dopo la randomizzazione
    });

    // Sottoscriviti al cambio di lingua per aggiornare eventuali testi dinamici
    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      // Se avessi testi delle recensioni che cambiano dinamicamente con la lingua,
      // potresti ricaricarli qui. Per ora, le chiavi sono statiche nei JSON.
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
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
   * Passa all'immagine precedente nel carousel di un servizio specifico.
   * @param service Il servizio di cui aggiornare il carousel.
   */
  prevImage(service: ServiceItem): void {
    service.currentIndex = (service.currentIndex - 1 + service.images.length) % service.images.length;
  }

  /**
   * Passa all'immagine successiva nel carousel di un servizio specifico.
   * @param service Il servizio di cui aggiornare il carousel.
   */
  nextImage(service: ServiceItem): void {
    service.currentIndex = (service.currentIndex + 1) % service.images.length;
  }

  /**
   * Apre la modalità fullscreen per un'immagine specifica.
   * @param imageUrl L'URL dell'immagine da visualizzare in fullscreen.
   * @param imageAltKey La CHIAVE di traduzione dell'alt text dell'immagine.
   */
  openFullscreen(imageUrl: string, imageAltKey: string): void {
    this.fullscreenImageUrl = imageUrl;
    // Traduci la chiave dell'alt text usando translate.instant()
    this.fullscreenImageAlt = this.translate.instant(imageAltKey);
    this.isFullscreen = true;
    // Opzionale: blocca lo scroll del body quando il fullscreen è attivo
    document.body.style.overflow = 'hidden';
  }

  /**
   * Chiude la modalità fullscreen.
   */
  closeFullscreen(): void {
    this.isFullscreen = false;
    this.fullscreenImageUrl = '';
    this.fullscreenImageAlt = '';
    // Opzionale: ripristina lo scroll del body
    document.body.style.overflow = '';
  }
}
