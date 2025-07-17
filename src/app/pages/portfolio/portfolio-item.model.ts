// src/app/pages/portfolio/portfolio-item.model.ts

// Definizione dell'interfaccia per una singola immagine del portfolio
export interface PortfolioImage {
  src?: string; // L'URL dell'immagine (opzionale perché potrebbe essere un nuovo file non ancora caricato)
  description: string; // Descrizione dell'immagine
  alt: string; // Testo alternativo per l'accessibilità
  isNew?: boolean; // Indica se l'immagine è un nuovo file da caricare (true) o un'immagine esistente (false/undefined)
}

// Definizione dell'interfaccia per un elemento completo del portfolio
export interface PortfolioItem {
  id: string; // ID dell'elemento del portfolio
  title: string;
  subtitle?: string; // Opzionale
  description?: string; // Opzionale
  // **RIMOSSO:** mainImage: string; // Non più un campo separato
  category: string;
  images: PortfolioImage[]; // **MODIFICATO:** Ora contiene tutte le immagini, inclusa quella che sarà la "copertina"
  createdAt: Date;
  updatedAt: Date;
}
