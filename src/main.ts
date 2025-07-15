// src/main.ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// Questo file ora si occupa solo di avviare l'applicazione Angular.
// Tutte le inizializzazioni di Firebase sono state rimosse.

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
