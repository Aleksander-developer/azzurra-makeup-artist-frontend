/* src/app/app.component.ts */
import { Component, HostListener, Inject, PLATFORM_ID, AfterViewInit, ViewChild, ElementRef, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common'; // Importa DOCUMENT
import { TranslateService } from '@ngx-translate/core';
import { Title, Meta } from '@angular/platform-browser'; // Importa Title e Meta
import { Subscription } from 'rxjs'; // Per gestire le sottoscrizioni

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  title = 'Azzurra Angius Makeup Artist'; // Questo titolo verrà sovrascritto dinamicamente

  showScrollButton: boolean = false;
  scrollButtonBottom: number = 30; // Posizione iniziale dal basso
  isButtonOverFooter: boolean = false;

  @ViewChild('footerRef') footerRef!: ElementRef; // Riferimento al footer

  private langChangeSubscription: Subscription | undefined; // Per gestire la sottoscrizione al cambio lingua

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document, // Inietta DOCUMENT per accedere al DOM
    private renderer: Renderer2,
    private translate: TranslateService,
    private titleService: Title, // Inietta Title service
    private metaService: Meta    // Inietta Meta service
  ) {
    // Configura le lingue disponibili e quella predefinita
    translate.addLangs(['en', 'it']);
    translate.setDefaultLang('it'); // Lingua predefinita

    // Prova a usare la lingua del browser, altrimenti usa quella predefinita
    if (isPlatformBrowser(this.platformId)) {
      const browserLang = translate.getBrowserLang();
      const langToUse = browserLang && browserLang.match(/en|it/) ? browserLang : 'it';
      translate.use(langToUse).subscribe(() => {
        console.log(`Lingua impostata su: ${langToUse}`);
        this.updateHtmlLangAttribute(langToUse); // Aggiorna l'attributo lang di <html>
      }, (error) => {
        console.error('Errore nel caricamento della lingua:', error);
      });
    } else {
      // Per SSR, imposta una lingua predefinita per l'attributo lang
      this.updateHtmlLangAttribute(translate.getDefaultLang());
    }
  }

  ngOnInit(): void {
    // Sottoscriviti al cambio di lingua per aggiornare i meta tag
    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateMetaTags();
      this.updateHtmlLangAttribute(this.translate.currentLang); // Aggiorna l'attributo lang di <html>
    });

    // Aggiorna i meta tag all'inizializzazione (dopo che la lingua è stata impostata)
    this.updateMetaTags();
  }

  ngOnDestroy(): void {
    // Annulla la sottoscrizione per evitare memory leak
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Usa Renderer2 per ascoltare gli eventi, più sicuro in SSR
      this.renderer.listen('window', 'scroll', () => this.onWindowScroll());
      this.renderer.listen('window', 'resize', () => this.updateScrollButtonPosition());
      this.updateScrollButtonPosition(); // Aggiorna posizione iniziale
    }
  }

  /**
   * Aggiorna dinamicamente il titolo della pagina e i meta tag SEO/Social.
   */
  private updateMetaTags(): void {
    // Aggiorna il titolo della pagina
    this.translate.get('SEO.TITLE').subscribe((translatedTitle: string) => {
      this.titleService.setTitle(translatedTitle);
    });

    // Aggiorna la meta description
    this.translate.get('SEO.DESCRIPTION').subscribe((translatedDescription: string) => {
      this.metaService.updateTag({ name: 'description', content: translatedDescription });
    });

    // Aggiorna i meta tag Open Graph (per Facebook, LinkedIn, etc.)
    this.translate.get('SEO.OG_TITLE').subscribe((translatedOgTitle: string) => {
      this.metaService.updateTag({ property: 'og:title', content: translatedOgTitle });
    });
    this.translate.get('SEO.OG_DESCRIPTION').subscribe((translatedOgDescription: string) => {
      this.metaService.updateTag({ property: 'og:description', content: translatedOgDescription });
    });
    // L'immagine e l'URL sono statici, non necessitano di traduzione
    this.metaService.updateTag({ property: 'og:image', content: this.translate.instant('SEO.OG_IMAGE') });
    this.metaService.updateTag({ property: 'og:url', content: this.translate.instant('SEO.OG_URL') });
    this.translate.get('SEO.OG_SITE_NAME').subscribe((translatedOgSiteName: string) => {
      this.metaService.updateTag({ property: 'og:site_name', content: translatedOgSiteName });
    });
    // Aggiorna la locale di Open Graph
    this.metaService.updateTag({ property: 'og:locale', content: this.translate.currentLang === 'it' ? 'it_IT' : 'en_US' });


    // Aggiorna i meta tag Twitter Cards
    this.translate.get('SEO.TWITTER_TITLE').subscribe((translatedTwitterTitle: string) => {
      this.metaService.updateTag({ name: 'twitter:title', content: translatedTwitterTitle });
    });
    this.translate.get('SEO.TWITTER_DESCRIPTION').subscribe((translatedTwitterDescription: string) => {
      this.metaService.updateTag({ name: 'twitter:description', content: translatedTwitterDescription });
    });
    this.metaService.updateTag({ name: 'twitter:image', content: this.translate.instant('SEO.TWITTER_IMAGE') });
    this.translate.get('SEO.TWITTER_IMAGE_ALT').subscribe((translatedTwitterImageAlt: string) => {
      this.metaService.updateTag({ name: 'twitter:image:alt', content: translatedTwitterImageAlt });
    });
  }

  /**
   * Aggiorna l'attributo 'lang' dell'elemento <html> in base alla lingua corrente.
   * Questo è importante per l'accessibilità e la SEO.
   * @param lang La lingua da impostare (es. 'it', 'en').
   */
  private updateHtmlLangAttribute(lang: string): void {
    if (isPlatformBrowser(this.platformId)) {
      this.document.documentElement.lang = lang;
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
