// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared/shared.module'; // <-- ASSICURATI CHE IL PERCORSO SIA CORRETTO
import { AuthService } from './auth/auth.service';
import { provideHttpClient, withFetch } from '@angular/common/http';

// Importa i moduli delle pagine (se non sono lazy-loaded, altrimenti non servono qui)
// Li lascio qui per sicurezza, ma se il tuo routing è lazy-loaded, non sono strettamente necessari.
import { HomeModule } from './pages/home/home.module';
import { ChiSonoModule } from './pages/chi-sono/chi-sono.module';
import { PortfolioModule } from './pages/portfolio/portfolio.module';
import { ServiziModule } from './pages/servizi/servizi.module';
import { ContattiModule } from './pages/contatti/contatti.module';
import { LoginModule } from './pages/login/login.module';
import { TruccoSposaModule } from './pages/trucco-sposa/trucco-sposa.module';
import { AdminModule } from './admin/admin/admin.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';


@NgModule({
  declarations: [
    AppComponent
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
  ],
  providers: [
    AuthService,
    provideHttpClient(withFetch()),
    provideClientHydration(),
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
