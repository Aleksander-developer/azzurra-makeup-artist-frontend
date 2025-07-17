// src/app/cookie-consent/cookie-consent.component.ts
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core'; // Importa Inject e PLATFORM_ID
import { isPlatformBrowser } from '@angular/common'; // Importa isPlatformBrowser
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-cookie-consent',
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.scss']
})
export class CookieConsentComponent implements OnInit, OnDestroy {
  showBanner: boolean = false;
  showCustomizeOptions: boolean = false;
  cookiePreferencesForm!: FormGroup;

  private isBrowser: boolean; // Nuova proprietà per tenere traccia dell'ambiente

  constructor(
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object // Inietta PLATFORM_ID
  ) {
    this.isBrowser = isPlatformBrowser(platformId); // Determina se siamo nel browser
  }

  ngOnInit(): void {
    this.initForm();
    // Esegui checkCookieConsent solo se siamo nel browser
    if (this.isBrowser) {
      this.checkCookieConsent();
    }
  }

  ngOnDestroy(): void {
    // Nessuna sottoscrizione da disiscrivere manualmente in questo componente
  }

  private initForm(): void {
    this.cookiePreferencesForm = this.fb.group({
      essential: [{ value: true, disabled: true }], // Essenziali sempre attivi
      analytics: [false],
      marketing: [false]
    });
  }

  private checkCookieConsent(): void {
    // Accedi a localStorage solo se isBrowser è true
    const consent = this.isBrowser ? localStorage.getItem('cookieConsent') : null;
    if (!consent) {
      this.showBanner = true;
    } else {
      const preferences = JSON.parse(consent);
      this.cookiePreferencesForm.patchValue(preferences);
      console.log('Consenso cookie già presente:', preferences);
      this.applyCookiePreferences(preferences);
    }
  }

  acceptAllCookies(): void {
    if (!this.isBrowser) return; // Non eseguire se non siamo nel browser

    const preferences = {
      essential: true,
      analytics: true,
      marketing: true
    };
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    this.showBanner = false;
    this.applyCookiePreferences(preferences);
    console.log('Tutti i cookie accettati.');
  }

  rejectAllCookies(): void {
    if (!this.isBrowser) return; // Non eseguire se non siamo nel browser

    const preferences = {
      essential: true, // Essenziali rimangono attivi
      analytics: false,
      marketing: false
    };
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    this.showBanner = false;
    this.applyCookiePreferences(preferences);
    console.log('Tutti i cookie non essenziali rifiutati.');
  }

  toggleCustomizeOptions(): void {
    this.showCustomizeOptions = !this.showCustomizeOptions;
  }

  savePreferences(): void {
    if (!this.isBrowser) return; // Non eseguire se non siamo nel browser

    const preferences = this.cookiePreferencesForm.getRawValue(); // Usa getRawValue per includere i campi disabilitati
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    this.showBanner = false;
    this.showCustomizeOptions = false;
    this.applyCookiePreferences(preferences);
    console.log('Preferenze cookie salvate:', preferences);
  }

  private applyCookiePreferences(preferences: any): void {
    if (!this.isBrowser) return; // Non eseguire se non siamo nel browser
    // Qui dovresti implementare la logica per caricare o bloccare gli script
    // basandoti sulle preferenze dell'utente.
    // Esempio:
    if (preferences.analytics) {
      console.log('Abilitazione cookie analitici (es. Google Analytics)');
      // Inserisci qui il codice per caricare Google Analytics o altri script di analisi
      // Esempio fittizio: loadGoogleAnalyticsScript();
    } else {
      console.log('Disabilitazione cookie analitici');
      // Esempio fittizio: disableGoogleAnalytics();
    }

    if (preferences.marketing) {
      console.log('Abilitazione cookie di marketing (es. Facebook Pixel)');
      // Inserisci qui il codice per caricare Facebook Pixel o altri script di marketing
      // Esempio fittizio: loadFacebookPixelScript();
    } else {
      console.log('Disabilitazione cookie di marketing');
      // Esempio fittizio: disableFacebookPixel();
    }

    // Per i cookie essenziali, non c'è bisogno di fare nulla qui,
    // poiché sono sempre attivi e gestiti dal sito stesso.
  }
}
