// src/app/shared/components/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../../auth/auth.service'; // Percorso corretto per AuthService

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  isLoggedIn = false;

  constructor(private auth: AuthService) {
    this.auth.isLoggedIn$.subscribe((status: boolean) => {
      this.isLoggedIn = status;
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
