import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  // URL base del tuo sito, importante per i percorsi assoluti nei meta tag
  private baseUrl = 'https://azzurraangius.com/'; // Assicurati che questo sia il tuo dominio finale

  // URL base per le immagini, se le gestisci su un CDN come Cloudinary
  // CORREZIONE: Questo è l'URL pubblico per gli asset su Cloudinary
  private baseImageUrl = 'https://res.cloudinary.com/ddqilzddj/image/upload/v1752847726/'; 

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private router: Router,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        // La logica di aggiornamento dei meta tag per le singole pagine
        // è gestita dai componenti stessi chiamando setPageSeo in ngOnInit
      });
    }
  }

  /**
   * Aggiorna i meta tag SEO e Open Graph per la pagina corrente.
   * @param pageData Oggetto contenente i dati specifici della pagina.
   * - titleKey: Chiave di traduzione per il titolo della pagina.
   * - descriptionKey: Chiave di traduzione per la descrizione della pagina.
   * - url: Percorso URL relativo della pagina (es. '/servizi').
   * - imageUrl: Nome del file immagine (es. 'logo_dhzlmi.png'). Verrà combinato con baseImageUrl.
   * - imageAltKey: Chiave di traduzione per l'alt text dell'immagine.
   * - type: Tipo di contenuto (es. 'website', 'article').
   * - siteNameKey: Chiave di traduzione per il il nome del sito.
   */
  setPageSeo(pageData: {
    titleKey: string;
    descriptionKey: string;
    url: string;
    imageUrl?: string;
    imageAltKey?: string;
    type?: string;
    siteNameKey?: string;
  }): void {
    const title = this.translate.instant(pageData.titleKey);
    const description = this.translate.instant(pageData.descriptionKey);
    const siteName = pageData.siteNameKey ? this.translate.instant(pageData.siteNameKey) : this.translate.instant('COMMON.SITE_NAME');
    const imageAlt = pageData.imageAltKey ? this.translate.instant(pageData.imageAltKey) : title;

    const fullPageUrl = `${this.baseUrl}${pageData.url.startsWith('/') ? pageData.url.substring(1) : pageData.url}`;
    // Costruisce l'URL completo dell'immagine, usando il nome del file fornito o il logo di fallback
    const fullImageUrl = pageData.imageUrl ? `${this.baseImageUrl}${pageData.imageUrl}` : `${this.baseImageUrl}logo_dhzlmi.png`;

    // 1. Aggiorna il tag <title>
    this.titleService.setTitle(title);

    // 2. Aggiorna i meta tag standard (per SEO generale)
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'keywords', content: this.translate.instant('COMMON.KEYWORDS') });

    // 3. Aggiorna i meta tag Open Graph (per Facebook, LinkedIn, WhatsApp, etc.)
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:image', content: fullImageUrl });
    this.metaService.updateTag({ property: 'og:url', content: fullPageUrl });
    this.metaService.updateTag({ property: 'og:type', content: pageData.type || 'website' });
    this.metaService.updateTag({ property: 'og:site_name', content: siteName });
    this.metaService.updateTag({ property: 'og:locale', content: this.translate.currentLang === 'en' ? 'en_US' : 'it_IT' });

    // 4. Aggiorna i meta tag Twitter Cards
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    this.metaService.updateTag({ name: 'twitter:image', content: fullImageUrl });
    this.metaService.updateTag({ name: 'twitter:image:alt', content: imageAlt });

    // Rimuovi eventuali meta tag vecchi che non sono stati aggiornati (opzionale)
    this.metaService.removeTag('name="robots"');
  }
}
