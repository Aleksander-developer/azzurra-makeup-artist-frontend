import { Component, HostListener, Inject, PLATFORM_ID, AfterViewInit, ViewChild, ElementRef, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router'; // Importa Router e NavigationEnd
import { filter } from 'rxjs/operators';
import { SeoService } from './core/services/seo.service'; // Importa il servizio SEO

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  title = 'Azzurra Angius Makeup Artist';

  showScrollButton: boolean = false;
  scrollButtonBottom: number = 30;
  isButtonOverFooter: boolean = false;

  @ViewChild('footerRef') footerRef!: ElementRef;

  private langChangeSubscription: Subscription | undefined;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private translate: TranslateService,
    private router: Router, // Inietta il Router
    private seoService: SeoService // Inietta il servizio SEO
  ) {
    translate.addLangs(['en', 'it']);
    translate.setDefaultLang('it');

    if (isPlatformBrowser(this.platformId)) {
      const browserLang = translate.getBrowserLang();
      const langToUse = browserLang && browserLang.match(/en|it/) ? browserLang : 'it';
      translate.use(langToUse).subscribe(() => {
        console.log(`Lingua impostata su: ${langToUse}`);
        this.updateHtmlLangAttribute(langToUse);
      }, (error) => {
        console.error('Errore nel caricamento della lingua:', error);
      });
    } else {
      this.updateHtmlLangAttribute(translate.getDefaultLang());
    }
  }

  ngOnInit(): void {
    // Imposta i meta tag globali all'inizializzazione dell'app
    this.setGlobalSeo();

    // Sottoscriviti al cambio di lingua per aggiornare i meta tag globali
    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      this.setGlobalSeo();
      this.updateHtmlLangAttribute(this.translate.currentLang);
    });

    // Ascolta gli eventi del router per aggiornare i meta tag globali ad ogni navigazione completata
    // Questo serve come fallback se un componente di pagina non imposta i propri meta tag specifici.
    if (isPlatformBrowser(this.platformId)) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        window.scrollTo(0, 0); // Scrolla in cima alla pagina
        this.setGlobalSeo(); // Aggiorna i meta tag globali per la nuova rotta
      });
    }
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.listen('window', 'scroll', () => this.onWindowScroll());
      this.renderer.listen('window', 'resize', () => this.updateScrollButtonPosition());
      this.updateScrollButtonPosition();
    }
  }

  /**
   * Imposta i meta tag SEO globali/di fallback per l'applicazione.
   * Questo metodo viene chiamato all'avvio e ad ogni cambio di lingua/rotta.
   */
  private setGlobalSeo(): void {
    this.seoService.setPageSeo({
      titleKey: 'COMMON.SITE_NAME',
      descriptionKey: 'COMMON.SITE_DESCRIPTION',
      url: this.router.url, // Usa l'URL corrente del router
      imageUrl: 'logo_dhzlmi.png', // Immagine predefinita (logo)
      imageAltKey: 'COMMON.SITE_NAME',
      type: 'website'
    });
  }

  private updateHtmlLangAttribute(lang: string): void {
    if (isPlatformBrowser(this.platformId)) {
      this.document.documentElement.lang = lang;
    }
  }

  onWindowScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      this.showScrollButton = scrollY > 100;
      this.updateScrollButtonPosition();
    }
  }

  updateScrollButtonPosition(): void {
    if (!this.footerRef?.nativeElement || !isPlatformBrowser(this.platformId)) {
      return;
    }

    const footerEl = this.footerRef.nativeElement as HTMLElement;
    const footerRect = footerEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const footerHeight = footerEl.offsetHeight;

    const defaultButtonMargin = 30;

    if (footerRect.top < viewportHeight) {
      const visibleFooterHeight = viewportHeight - footerRect.top;
      const positionRelativeToFooter = visibleFooterHeight - (footerHeight / 2);
      this.scrollButtonBottom = Math.max(defaultButtonMargin, positionRelativeToFooter);
      this.isButtonOverFooter = true;
    } else {
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
