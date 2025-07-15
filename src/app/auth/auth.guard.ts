// src/app/auth/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Assicurati che il percorso sia corretto
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.authService.isLoggedIn$.pipe(
      take(1), // Prende solo l'ultimo valore e poi completa l'Observable
      map(isLoggedIn => {
        if (isLoggedIn) {
          return true; // L'utente è loggato, permette l'accesso
        } else {
          // L'utente non è loggato, reindirizza alla pagina di login
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
}
