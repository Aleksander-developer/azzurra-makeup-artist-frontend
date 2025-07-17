// src/app/pages/portfolio/portfolio.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PortfolioService } from '../../portfolio/portfolio.service';
import { PortfolioItem } from './portfolio-item.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit, OnDestroy {
  portfolioItems: PortfolioItem[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  private portfolioSubscription: Subscription | undefined;

  constructor(private portfolioService: PortfolioService) { }

  ngOnInit(): void {
    this.loadPortfolioItems();
  }

  ngOnDestroy(): void {
    if (this.portfolioSubscription) {
      this.portfolioSubscription.unsubscribe();
    }
  }

  loadPortfolioItems(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.portfolioSubscription = this.portfolioService.getPortfolioItems().subscribe({
      next: (items: PortfolioItem[]) => {
        this.portfolioItems = items;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = 'Errore nel caricamento degli elementi del portfolio: ' + (err.message || 'Errore sconosciuto.');
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  // **NUOVO METODO:** Per ottenere un'immagine casuale da usare come copertina
  getRandomCoverImage(item: PortfolioItem): string {
    if (item.images && item.images.length > 0) {
      const randomIndex = Math.floor(Math.random() * item.images.length);
      return item.images[randomIndex].src || 'assets/placeholder.jpg'; // Usa un placeholder se src è undefined
    }
    return 'assets/placeholder.jpg'; // Immagine placeholder di fallback se non ci sono immagini
  }
}
