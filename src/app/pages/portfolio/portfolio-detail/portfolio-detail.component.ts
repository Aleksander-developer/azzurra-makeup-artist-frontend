// src/app/pages/portfolio/portfolio-detail/portfolio-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PortfolioService } from '../../../portfolio/portfolio.service';
import { PortfolioItem } from '../portfolio-item.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-portfolio-detail',
  templateUrl: './portfolio-detail.component.html',
  styleUrls: ['./portfolio-detail.component.scss']
})
export class PortfolioDetailComponent implements OnInit, OnDestroy {
  portfolioItem: PortfolioItem | undefined;
  isLoading = true;
  errorMessage: string | null = null;
  private routeSubscription: Subscription | undefined;

  // **NUOVE PROPRIETÀ PER IL FULLSCREEN**
  showFullscreen: boolean = false;
  fullscreenImageIndex: number = 0;

  constructor(
    private route: ActivatedRoute,
    private portfolioService: PortfolioService
  ) { }

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadPortfolioItem(id);
      } else {
        this.errorMessage = 'ID portfolio non fornito.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  loadPortfolioItem(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.portfolioService.getPortfolioItemById(id).subscribe({
      next: (item: PortfolioItem) => {
        this.portfolioItem = item;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = 'Errore nel caricamento del dettaglio del portfolio: ' + (err.message || 'Errore sconosciuto.');
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  // **NUOVI METODI PER IL FULLSCREEN**
  openFullscreen(index: number): void {
    this.fullscreenImageIndex = index;
    this.showFullscreen = true;
    // Opzionale: blocca lo scroll del body quando il fullscreen è attivo
    document.body.style.overflow = 'hidden';
  }

  closeFullscreen(): void {
    this.showFullscreen = false;
    // Opzionale: ripristina lo scroll del body
    document.body.style.overflow = 'auto';
  }

  nextFullscreenImage(): void {
    if (this.portfolioItem && this.portfolioItem.images) {
      this.fullscreenImageIndex = (this.fullscreenImageIndex + 1) % this.portfolioItem.images.length;
    }
  }

  prevFullscreenImage(): void {
    if (this.portfolioItem && this.portfolioItem.images) {
      this.fullscreenImageIndex = (this.fullscreenImageIndex - 1 + this.portfolioItem.images.length) % this.portfolioItem.images.length;
    }
  }
}
