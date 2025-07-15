// src/app/portfolio/portfolio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; // Importa HttpClient
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment.prod'; // Importa l'ambiente per l'URL del backend

import { PortfolioItem } from '../pages/portfolio/portfolio-item.model';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiUrl = environment.apiUrl; // URL del tuo backend su Render

  constructor(private http: HttpClient) { } // Inietta HttpClient

  // Metodo helper per la gestione degli errori HTTP
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Errore lato client o di rete
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Errore lato server
      errorMessage = `Server Error: ${error.status} - ${error.message || ''}\n${JSON.stringify(error.error)}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Recupera tutti gli elementi del portfolio dal backend.
   * @returns Un Observable di un array di PortfolioItem.
   */
  getPortfolioItems(): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>(`${this.apiUrl}/api/portfolio`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Recupera un singolo elemento del portfolio per ID dal backend.
   * @param id L'ID dell'elemento del portfolio.
   * @returns Un Observable dell'elemento PortfolioItem o undefined se non trovato.
   */
  getPortfolioItemById(id: string): Observable<PortfolioItem | undefined> {
    return this.http.get<PortfolioItem>(`${this.apiUrl}/api/portfolio/${id}`).pipe(
      catchError(this.handleError),
      map(item => item || undefined) // Assicura che ritorni undefined se non trovato
    );
  }

  /**
   * Aggiunge un nuovo elemento del portfolio al backend.
   * Gestisce l'upload di file tramite FormData.
   * @param item I dati testuali del portfolio item.
   * @param mainImageFile Il file dell'immagine principale.
   * @param galleryFiles Un array di file per le immagini della galleria.
   * @returns Un Observable dell'ID del nuovo elemento.
   */
  addPortfolioItem(
    item: Omit<PortfolioItem, 'id' | 'mainImage' | 'images'>, // Dati testuali
    mainImageFile: File,
    galleryFiles: File[],
    imagesData: { description: string; alt: string; isNew?: boolean; src?: string }[] // Dettagli testuali per le immagini della galleria
  ): Observable<string> {
    const formData = new FormData();
    formData.append('title', item.title);
    if (item.subtitle) formData.append('subtitle', item.subtitle);
    if (item.description) formData.append('description', item.description);
    formData.append('category', item.category);

    // Aggiungi l'immagine principale
    formData.append('mainImage', mainImageFile, mainImageFile.name);

    // Aggiungi le immagini della galleria e i loro dettagli testuali
    galleryFiles.forEach((file, index) => {
      formData.append('galleryImages', file, file.name);
    });
    // Invia i dettagli testuali delle immagini della galleria come stringa JSON
    formData.append('images', JSON.stringify(imagesData));

    return this.http.post<{ _id: string }>(`${this.apiUrl}/api/portfolio`, formData).pipe(
      map(response => response._id), // Il backend restituisce _id
      catchError(this.handleError)
    );
  }


  /**
   * Aggiorna un elemento del portfolio esistente nel backend.
   * Gestisce l'upload di nuove immagini e l'aggiornamento dei dettagli.
   * @param id L'ID dell'elemento da aggiornare.
   * @param item I dati testuali aggiornati.
   * @param mainImageFile Il nuovo file dell'immagine principale (opzionale).
   * @param galleryFiles Un array di nuovi file per le immagini della galleria (opzionale).
   * @param imagesData Dettagli testuali per tutte le immagini della galleria (esistenti e nuove).
   * @returns Un Observable che completa quando l'aggiornamento è finito.
   */
  updatePortfolioItem(
    id: string,
    item: Partial<Omit<PortfolioItem, 'id' | 'mainImage' | 'images'>>,
    mainImageFile: File | null, // null se non cambi, File se ne carichi una nuova
    galleryFiles: File[],
    imagesData: { description: string; alt: string; isNew?: boolean; src?: string }[]
  ): Observable<void> {
    const formData = new FormData();

    // Aggiungi i campi testuali solo se sono stati modificati
    if (item.title !== undefined) formData.append('title', item.title);
    if (item.subtitle !== undefined) formData.append('subtitle', item.subtitle);
    if (item.description !== undefined) formData.append('description', item.description);
    if (item.category !== undefined) formData.append('category', item.category);

    // Gestione immagine principale
    if (mainImageFile) {
      formData.append('mainImage', mainImageFile, mainImageFile.name);
    } else if (mainImageFile === null) {
      // Se mainImageFile è null, significa che l'immagine principale è stata rimossa
      formData.append('mainImage', '');
    }

    // Aggiungi le nuove immagini della galleria
    galleryFiles.forEach((file) => {
      formData.append('galleryImages', file, file.name);
    });

    // Invia tutti i dettagli delle immagini della galleria (esistenti e nuove)
    formData.append('images', JSON.stringify(imagesData));

    return this.http.put<void>(`${this.apiUrl}/api/portfolio/${id}`, formData).pipe(
      catchError(this.handleError)
    );
  }


  /**
   * Elimina un elemento del portfolio dal backend.
   * @param id L'ID dell'elemento da eliminare.
   * @returns Un Observable che completa quando l'eliminazione è finita.
   */
  deletePortfolioItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/portfolio/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}
