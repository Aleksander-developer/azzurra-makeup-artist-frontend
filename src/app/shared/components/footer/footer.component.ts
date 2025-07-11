// src/app/shared/components/footer/footer.component.ts

import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  public currentYear: number = new Date().getFullYear();

  // Le tue URL e numeri di contatto
  // githubUrl: string = 'https://github.com/tuo-profilo-github'; // AGGIORNA CON IL TUO LINK
  linkedinUrl: string = 'https://www.linkedin.com/in/tuo-profilo-linkedin'; // AGGIORNA CON IL TUO LINK
  instagramUrl: string = 'https://www.instagram.com/tuo-profilo-instagram'; // AGGIORNA CON IL TUO LINK
  facebookUrl: string = 'https://www.facebook.com/tuo-profilo-facebook'; // AGGIORNA CON IL TUO LINK

  whatsappNumber: string = '393469604243'; // Il tuo numero WhatsApp senza il '+'
  phoneNumber: string = '393469604243'; // Il tuo numero di telefono
  emailAddress: string = 'azzurraangius95@email.com'; // La tua email

  // URL del sito web dello sviluppatore
  developerWebsiteUrl: string = 'https://aleksander-nikolli-developer.netlify.app/home';

  whatsappLink: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.whatsappLink = this.sanitizer.bypassSecurityTrustResourceUrl(`https://wa.me/${this.whatsappNumber}`);
  }

  ngOnInit(): void {
    // Nessuna logica specifica qui per ora
  }
}
