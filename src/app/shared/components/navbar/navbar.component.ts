// src/app/shared/components/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { TranslateService } from '@ngx-translate/core'; // Importa TranslateService

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  isLoggedIn = false;

  constructor(
    private auth: AuthService,
    private translate: TranslateService // Inietta TranslateService
  ) {
    this.auth.isLoggedIn$.subscribe((status: boolean) => {
      this.isLoggedIn = status;
    });
  }

  logout(): void {
    this.auth.logout();
  }

  // Metodo per cambiare la lingua
  changeLanguage(lang: string): void {
    this.translate.use(lang);
  }
}
