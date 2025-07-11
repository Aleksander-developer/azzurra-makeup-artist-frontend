// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard'; // Importa la guardia

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Rotte delle Pagine Principali (Lazy Loaded)
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule) }, // <-- La rotta per la tua nuova Home
  { path: 'chi-sono', loadChildren: () => import('./pages/chi-sono/chi-sono.module').then(m => m.ChiSonoModule) },
  { path: 'portfolio', loadChildren: () => import('./pages/portfolio/portfolio.module').then(m => m.PortfolioModule) },
  { path: 'servizi', loadChildren: () => import('./pages/servizi/servizi.module').then(m => m.ServiziModule) },
  { path: 'contatti', loadChildren: () => import('./pages/contatti/contatti.module').then(m => m.ContattiModule) },
  { path: 'login', loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule) },
  { path: 'trucco-sposa', loadChildren: () => import('./pages/trucco-sposa/trucco-sposa.module').then(m => m.TruccoSposaModule) },


  // Rotte dell'Area Amministrativa (Protette da authGuard e Lazy Loaded)
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./admin/admin/admin.module').then(m => m.AdminModule) // Assicurati che il percorso sia corretto: './admin/admin.module'
  },
  // { path: '**', component: NotFoundComponent } // Se hai un componente 404
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      // enableTracing: true // Utile per il debug del routing, commenta in produzione
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
