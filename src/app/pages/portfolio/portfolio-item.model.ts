// src/app/pages/portfolio/portfolio-item.model.ts

// Interfaccia per le immagini della galleria
export interface PortfolioImage {
  src?: string; // URL dell'immagine (opzionale perché potrebbe essere un nuovo file non ancora caricato)
  description?: string; // Reso opzionale
  alt?: string; // Reso opzionale
  isNew?: boolean; // Indica se l'immagine è un nuovo caricamento (frontend-only)
}

// Interfaccia per l'elemento del portfolio
export interface PortfolioItem {
  id: string; // L'ID generato dal backend (MongoDB _id)
  title: string;
  subtitle?: string;
  description?: string;
  category: string;
  images: PortfolioImage[]; // Array di immagini della galleria
  createdAt: Date;
  updatedAt: Date;
  coverImageUrl?: string; // URL dell'immagine di copertina usata nella lista (frontend-only)
}
