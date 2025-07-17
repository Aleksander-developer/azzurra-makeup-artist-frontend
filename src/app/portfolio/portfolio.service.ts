// src/app/portfolio/portfolio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PortfolioItem, PortfolioImage } from '../pages/portfolio/portfolio-item.model';
import { environment } from '../environments/environment'; // Assicurati che questo percorso sia corretto

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiUrl = `${environment.apiUrl}/api/portfolio`; // Assicurati che backendUrl sia definito in environment

  constructor(private http: HttpClient) { }

  // **MODIFICATO:** Metodo per aggiungere un nuovo elemento al portfolio
  // Ora accetta un array di File per tutte le nuove immagini
  addPortfolioItem(
    itemData: any,
    newFiles: File[], // Tutti i file da caricare per il nuovo elemento
    imagesMetadata: PortfolioImage[] // Metadati di tutte le immagini (anche quelle non ancora caricate)
  ): Observable<PortfolioItem> {
    const formData = new FormData();
    formData.append('title', itemData.title);
    formData.append('subtitle', itemData.subtitle);
    formData.append('description', itemData.description);
    formData.append('category', itemData.category);

    // Aggiungi tutti i nuovi file al FormData
    newFiles.forEach((file, index) => {
      formData.append(`images`, file, file.name); // 'images' come nome del campo per l'array di file
    });

    // Aggiungi i metadati per tutte le immagini (nuove ed esistenti, se in editing)
    // È importante che il backend sappia quali metadati corrispondono a quali immagini.
    // Qui serializziamo l'intero array di metadati come una stringa JSON.
    formData.append('imagesMetadata', JSON.stringify(imagesMetadata));

    return this.http.post<PortfolioItem>(this.apiUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  // **MODIFICATO:** Metodo per aggiornare un elemento del portfolio esistente
  // Ora accetta un array di File per i nuovi caricamenti e metadati per tutte le immagini
  updatePortfolioItem(
    id: string,
    itemData: any,
    newFiles: File[], // Solo i nuovi file da caricare durante l'aggiornamento
    imagesMetadata: PortfolioImage[] // Metadati di tutte le immagini (nuove ed esistenti)
  ): Observable<PortfolioItem> {
    const formData = new FormData();
    formData.append('title', itemData.title);
    formData.append('subtitle', itemData.subtitle);
    formData.append('description', itemData.description);
    formData.append('category', itemData.category);

    // Aggiungi solo i nuovi file al FormData
    newFiles.forEach((file, index) => {
      formData.append(`newImages`, file, file.name); // Usa un nome diverso per i nuovi file in update
    });

    // Aggiungi i metadati per tutte le immagini (nuove ed esistenti)
    formData.append('imagesMetadata', JSON.stringify(imagesMetadata));

    return this.http.put<PortfolioItem>(`${this.apiUrl}/${id}`, formData).pipe(
      catchError(this.handleError)
    );
  }


  // Metodo per ottenere tutti gli elementi del portfolio
  getPortfolioItems(): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>(this.apiUrl).pipe(
      map(items => items.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }))),
      catchError(this.handleError)
    );
  }

  // Metodo per ottenere un singolo elemento del portfolio per ID
  getPortfolioItemById(id: string): Observable<PortfolioItem> {
    return this.http.get<PortfolioItem>(`${this.apiUrl}/${id}`).pipe(
      map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      })),
      catchError(this.handleError)
    );
  }

  // Metodo per eliminare un elemento del portfolio
  deletePortfolioItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Errore lato client o di rete
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Errore lato server
      errorMessage = `Server Error: ${error.status} - ${error.error.message || error.statusText}`;
    }
    console.error('Errore nel PortfolioService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
