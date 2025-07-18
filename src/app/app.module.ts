// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, Title, Meta } from '@angular/platform-browser'; // <-- Importa Title e Meta qui
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared/shared.module';
import { AuthService } from './auth/auth.service';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';

// Importa i moduli delle pagine
import { HomeModule } from './pages/home/home.module';
import { ChiSonoModule } from './pages/chi-sono/chi-sono.module';
import { PortfolioModule } from './pages/portfolio/portfolio.module';
import { ServiziModule } from './pages/servizi/servizi.module';
import { ContattiModule } from './pages/contatti/contatti.module';
import { LoginModule } from './pages/login/login.module';
import { TruccoSposaModule } from './pages/trucco-sposa/trucco-sposa.module';
import { AdminModule } from './admin/admin/admin.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CookieConsentComponent } from './cookie-consent/cookie-consent.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

// **NGX-TRANSLATE IMPORTS**
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// Funzione per caricare i file di traduzione
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    CookieConsentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    HomeModule,
    ChiSonoModule,
    PortfolioModule,
    ServiziModule,
    ContattiModule,
    LoginModule,
    TruccoSposaModule,
    AdminModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    // **NGX-TRANSLATE CONFIGURATION**
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    AuthService,
    provideHttpClient(withFetch()),
    provideClientHydration(),
    provideAnimationsAsync(),
    Title,
    Meta
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
