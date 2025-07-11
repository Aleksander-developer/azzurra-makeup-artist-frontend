// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // <-- DEVE ESSERE QUESTO

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared/shared.module'; // Assicurati che sia importato
import { AuthService } from './auth/auth.service';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ChiSonoModule } from './pages/chi-sono/chi-sono.module';
import { PortfolioModule } from './pages/portfolio/portfolio.module';
import { ServiziModule } from './pages/servizi/servizi.module';
import { ContattiModule } from './pages/contatti/contatti.module';
import { LoginModule } from './pages/login/login.module';
import { TruccoSposaModule } from './pages/trucco-sposa/trucco-sposa.module';
import { AdminModule } from './admin/admin/admin.module';
import { HomeModule } from './pages/home/home.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HomeModule,
    ChiSonoModule,
    PortfolioModule,
    ServiziModule,
    ContattiModule,
    LoginModule,
    TruccoSposaModule,
    AdminModule,
    SharedModule
  ],
  providers: [
    AuthService,
    provideHttpClient(withFetch()),
    provideClientHydration()
    // provideAnimationsAsync() // <-- ASSICURATI CHE QUESTO SIA RIMOSSO O COMMENTATO
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {}
}
