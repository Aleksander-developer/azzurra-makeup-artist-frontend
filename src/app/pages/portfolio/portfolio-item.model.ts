// src/app/portfolio/portfolio-item.model.ts

export interface PortfolioImage {
  src: string;
  alt: string;
  description: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  mainImage: string | undefined; // Immagine principale per la card del portfolio
  category: string; // Es. 'Sposa', 'Cerimonia', 'Eventi'
  images: PortfolioImage[]; // Array di immagini per la pagina di dettaglio
}
