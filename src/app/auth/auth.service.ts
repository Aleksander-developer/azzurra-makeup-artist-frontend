// src/app/auth/auth.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core'; // Importa PLATFORM_ID e Inject
import { isPlatformBrowser } from '@angular/common'; // Importa isPlatformBrowser
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, delay, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn.asObservable();

  private readonly MOCK_EMAIL = 'azzurraangius95@gmail.com';
  private readonly MOCK_PASSWORD = 'AzzuBestMakeupArtist';

  // Aggiungi un flag per controllare se siamo nel browser
  private isBrowser: boolean;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // Inietta PLATFORM_ID
  ) {
    // Determina se il codice sta eseguendo nel browser
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Accedi a localStorage solo se siamo nel browser
    if (this.isBrowser) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        this._isLoggedIn.next(true);
      }
    }
  }

  login(email: string, password: string): Observable<{ token: string }> {
    return of(null).pipe(
      delay(1000),
      map(() => {
        if (email === this.MOCK_EMAIL && password === this.MOCK_PASSWORD) {
          const mockToken = 'mock_jwt_token_12345';
          // Accedi a localStorage solo se siamo nel browser
          if (this.isBrowser) {
            localStorage.setItem('auth_token', mockToken);
          }
          this._isLoggedIn.next(true);
          console.log('Login successful!');
          return { token: mockToken };
        } else {
          console.error('Login failed: Invalid credentials');
          throw { code: 'auth/invalid-credential', message: 'Credenziali non valide.' };
        }
      }),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    // Accedi a localStorage solo se siamo nel browser
    if (this.isBrowser) {
      localStorage.removeItem('auth_token');
    }
    this._isLoggedIn.next(false);
    this.router.navigate(['/login']);
    console.log('Logout successful!');
  }

  checkLoginStatus(): boolean {
    return this._isLoggedIn.getValue();
  }
}
