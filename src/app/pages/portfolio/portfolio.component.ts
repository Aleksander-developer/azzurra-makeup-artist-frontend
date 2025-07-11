// src/app/pages/portfolio/portfolio.component.ts
import { Component, OnInit } from '@angular/core';
import { PortfolioService } from '../../portfolio/portfolio.service';
import { Observable } from 'rxjs';
import { PortfolioItem } from './portfolio-item.model';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {
  portfolioItems: PortfolioItem[] = []; // Inizializza come array vuoto

  constructor(private portfolioService: PortfolioService) { }

  ngOnInit(): void {
    this.portfolioService.getPortfolioItems().subscribe(items => {
      this.portfolioItems = items;
    });
  }
}
