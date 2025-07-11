// src/app/pages/portfolio/portfolio-detail/portfolio-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PortfolioService } from '../../../portfolio/portfolio.service';
import { Location } from '@angular/common'; // Per il pulsante "indietro"
import { PortfolioItem } from '../portfolio-item.model';

@Component({
  selector: 'app-portfolio-detail',
  templateUrl: './portfolio-detail.component.html',
  styleUrls: ['./portfolio-detail.component.scss']
})
export class PortfolioDetailComponent implements OnInit {
  portfolioItem: PortfolioItem | undefined;

  constructor(
    private route: ActivatedRoute,
    private portfolioService: PortfolioService,
    private location: Location // Per tornare indietro
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const itemId = params.get('id');
      if (itemId) {
        this.portfolioService.getPortfolioItemById(itemId).subscribe(item => {
          this.portfolioItem = item;
          if (!item) {
            console.warn(`Portfolio item with ID '${itemId}' not found.`);
          }
        });
      } else {
        console.warn('No portfolio item ID provided in route.');
      }
    });
  }

  goBack(): void {
    this.location.back(); // Torna alla pagina precedente
  }
}
