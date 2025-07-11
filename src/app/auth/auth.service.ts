// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs'; // Importa BehaviorSubject e Observable

@Injectable({
  providedIn: 'root' // Rende il servizio disponibile a livello globale
})
export class AuthService {
  // BehaviorSubject per tenere traccia dello stato di login.
  // Inizia con 'false' (non loggato).
  private _isLoggedIn = new BehaviorSubject<boolean>(false);

  // Observable pubblico per permettere ai componenti di sottoscriversi allo stato di login.
  isLoggedIn$: Observable<boolean> = this._isLoggedIn.asObservable();

  constructor() {
    // In un'applicazione reale, qui potresti controllare il localStorage
    // per vedere se l'utente era già loggato da una sessione precedente.
    // Esempio:
    // const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    // this._isLoggedIn.next(loggedIn);
  }

  // Metodo per simulare il login
  login(): void {
    // In un'applicazione reale, qui avresti la logica di autenticazione (es. chiamata API)
    console.log('Tentativo di login...');
    this._isLoggedIn.next(true); // Imposta lo stato di login a true
    // localStorage.setItem('isLoggedIn', 'true'); // Salva lo stato
    console.log('Utente loggato.');
  }

  // Metodo per simulare il logout
  logout(): void {
    // In un'applicazione reale, qui avresti la logica di logout (es. invalidazione token)
    console.log('Tentativo di logout...');
    this._isLoggedIn.next(false); // Imposta lo stato di login a false
    // localStorage.removeItem('isLoggedIn'); // Rimuovi lo stato
    console.log('Utente sloggato.');
  }

  // Metodo per ottenere lo stato attuale di login (sincrono)
  get isLoggedIn(): boolean {
    return this._isLoggedIn.value;
  }
}
