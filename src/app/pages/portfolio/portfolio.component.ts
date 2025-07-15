// src/app/pages/portfolio/portfolio.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PortfolioService } from '../../portfolio/portfolio.service'; // Percorso corretto
import { Subscription } from 'rxjs';
import { PortfolioItem } from './portfolio-item.model';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit, OnDestroy {
  portfolioItems: PortfolioItem[] = [];
  isLoading = true;
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
    this.portfolioSubscription = this.portfolioService.getPortfolioItems().subscribe({
      next: (items) => {
        this.portfolioItems = items;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento del portfolio:', err);
        this.isLoading = false;
        // Potresti aggiungere un messaggio di errore visibile all'utente qui
      }
    });
  }
}
