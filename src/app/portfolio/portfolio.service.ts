// src/app/portfolio/portfolio.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs'; // Per simulare chiamate asincrone
import { PortfolioItem } from '../pages/portfolio/portfolio-item.model';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {

  // Dati di esempio per il portfolio
  private portfolioItems: PortfolioItem[] = [
    {
      id: 'trucco-sposa-giulia',
      title: 'Eleganza Sposa: Giulia',
      subtitle: 'Make-up e Acconciatura Sposa',
      description: 'Un look etereo e luminoso per Giulia, sposa radiosa in una cornice classica romana.',
      mainImage: 'https://placehold.co/600x400/F8C8DC/4A2A4A?text=Sposa+Giulia',
      category: 'Sposa',
      images: [
        { src: 'https://placehold.co/800x600/F8C8DC/4A2A4A?text=Giulia+1', alt: 'Trucco sposa Giulia primo piano', description: 'Primo piano del trucco occhi, con toni neutri e luminosi.' },
        { src: 'https://placehold.co/800x600/E6E6FA/333333?text=Giulia+2', alt: 'Acconciatura sposa Giulia', description: 'Acconciatura raccolta con dettagli floreali, elegante e raffinata.' },
        { src: 'https://placehold.co/800x600/FFC0CB/FFFFFF?text=Giulia+3', alt: 'Trucco sposa Giulia figura intera', description: 'Look completo di trucco e acconciatura, in armonia con l\'abito.' },
      ]
    },
    {
      id: 'trucco-cerimonia-chiara',
      title: 'Incanto Cerimonia: Chiara',
      subtitle: 'Make-up per Evento Serale',
      description: 'Un make-up sofisticato per un evento di gala, con focus su labbra intense e occhi definiti.',
      mainImage: 'https://placehold.co/600x400/E6E6FA/333333?text=Cerimonia+Chiara',
      category: 'Cerimonia',
      images: [
        { src: 'https://placehold.co/800x600/E6E6FA/333333?text=Chiara+1', alt: 'Trucco cerimonia Chiara', description: 'Dettaglio del trucco serale con eyeliner grafico.' },
        { src: 'https://placehold.co/800x600/FFB6C1/333333?text=Chiara+2', alt: 'Chiara in posa', description: 'Look completo per un evento elegante.' },
      ]
    },
    {
      id: 'trucco-editoriale-lara',
      title: 'Visione Artistica: Lara',
      subtitle: 'Make-up per Shooting Fotografico',
      description: 'Un look audace e creativo per un servizio fotografico di moda.',
      mainImage: 'https://placehold.co/600x400/FFB6C1/333333?text=Editoriale+Lara',
      category: 'Eventi',
      images: [
        { src: 'https://placehold.co/800x600/FFB6C1/333333?text=Lara+1', alt: 'Trucco editoriale Lara', description: 'Make-up artistico con dettagli glitter.' },
        { src: 'https://placehold.co/800x600/F8C8DC/4A2A4A?text=Lara+2', alt: 'Lara in studio', description: 'Scatto dietro le quinte del servizio fotografico.' },
      ]
    },
    {
      id: 'trucco-sposa-sofia',
      title: 'Incanto Naturale: Sofia',
      subtitle: 'Trucco Sposa Naturale',
      description: 'Un make-up leggero e luminoso per esaltare la bellezza naturale di Sofia nel suo giorno più bello.',
      mainImage: 'https://placehold.co/600x400/FFDAB9/696969?text=Sposa+Sofia',
      category: 'Sposa',
      images: [
        { src: 'https://placehold.co/800x600/FFDAB9/696969?text=Sofia+1', alt: 'Trucco sposa Sofia primo piano', description: 'Focus sul trucco occhi e incarnato luminoso.' },
        { src: 'https://placehold.co/800x600/ADD8E6/4682B4?text=Sofia+2', alt: 'Sofia con velo', description: 'Acconciatura semplice e velo leggero.' },
      ]
    }
  ];

  constructor() { }

  // Restituisce tutti gli elementi del portfolio
  getPortfolioItems(): Observable<PortfolioItem[]> {
    return of(this.portfolioItems);
  }

  // Restituisce un singolo elemento del portfolio per ID
  getPortfolioItemById(id: string): Observable<PortfolioItem | undefined> {
    const item = this.portfolioItems.find(p => p.id === id);
    return of(item);
  }
}
