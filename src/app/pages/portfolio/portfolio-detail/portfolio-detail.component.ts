// src/app/pages/portfolio/portfolio-detail/portfolio-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PortfolioService } from '../../../portfolio/portfolio.service'; // Percorso corretto
import { Subscription } from 'rxjs';
import { PortfolioItem } from '../portfolio-item.model';

@Component({
  selector: 'app-portfolio-detail',
  templateUrl: './portfolio-detail.component.html',
  styleUrls: ['./portfolio-detail.component.scss']
})
export class PortfolioDetailComponent implements OnInit, OnDestroy {
  portfolioItem: PortfolioItem | undefined;
  isLoading = true;
  private routeSubscription: Subscription | undefined;
  private portfolioSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private portfolioService: PortfolioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const itemId = params.get('id');
      if (itemId) {
        this.loadPortfolioItem(itemId);
      } else {
        // Se non c'è ID nella rotta, reindirizza o mostra un errore
        this.isLoading = false;
        this.portfolioItem = undefined; // Assicurati che sia undefined per mostrare il messaggio "non trovato"
        // this.router.navigate(['/portfolio']); // Potresti reindirizzare qui
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.portfolioSubscription) {
      this.portfolioSubscription.unsubscribe();
    }
  }

  loadPortfolioItem(id: string): void {
    this.isLoading = true;
    this.portfolioSubscription = this.portfolioService.getPortfolioItemById(id).subscribe({
      next: (item) => {
        this.portfolioItem = item;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento del dettaglio portfolio:', err);
        this.isLoading = false;
        this.portfolioItem = undefined; // Assicurati che sia undefined per mostrare il messaggio "non trovato"
        // this.router.navigate(['/portfolio']); // Potresti reindirizzare qui in caso di errore grave
      }
    });
  }
}
