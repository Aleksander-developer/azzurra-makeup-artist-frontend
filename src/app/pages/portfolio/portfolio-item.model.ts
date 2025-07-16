// src/app/pages/portfolio/portfolio-item.model.ts

// Definizione dell'interfaccia per una singola immagine del portfolio
export interface PortfolioImage {
  src: string;
  description: string;
  alt: string;
  isNew?: boolean; // Aggiunto: Indica se l'immagine è nuova (caricata) o esistente
}

// Definizione dell'interfaccia per un elemento completo del portfolio
export interface PortfolioItem {
  id: string; // MongoDB usa _id, ma nel frontend lo mappiamo a 'id'
  title: string;
  subtitle?: string; // Opzionale
  description?: string; // Opzionale
  mainImage: string; // URL dell'immagine principale
  category: string;
  images?: PortfolioImage[]; // Array di immagini della galleria (opzionale)
  createdAt: Date;
  updatedAt: Date;
}
