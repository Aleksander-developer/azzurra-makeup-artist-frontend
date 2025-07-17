// src/app/portfolio/portfolio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PortfolioItem, PortfolioImage } from '../pages/portfolio/portfolio-item.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiUrl = `${environment.apiUrl}/api/portfolio`; // Assicurati che l'URL sia corretto

  constructor(private http: HttpClient) { }

  // Metodo per aggiungere un nuovo elemento portfolio
  addPortfolioItem(
    itemData: any,
    newFiles: File[],
    imagesMetadata: PortfolioImage[]
  ): Observable<PortfolioItem> {
    const formData = new FormData();
    formData.append('title', itemData.title);
    formData.append('subtitle', itemData.subtitle || '');
    formData.append('description', itemData.description || '');
    formData.append('category', itemData.category);

    // Aggiungi i nuovi file
    newFiles.forEach(file => {
      formData.append('images', file, file.name);
    });

    // Aggiungi i metadati delle immagini (esistenti e nuove)
    formData.append('imagesMetadata', JSON.stringify(imagesMetadata));

    return this.http.post<PortfolioItem>(this.apiUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  // Metodo per ottenere tutti gli elementi del portfolio
  getPortfolioItems(): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // **NUOVO METODO:** Per ottenere un singolo elemento del portfolio per ID
  getPortfolioItemById(id: string): Observable<PortfolioItem> {
    return this.http.get<PortfolioItem>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Metodo per aggiornare un elemento portfolio esistente
  updatePortfolioItem(
    id: string,
    itemData: any,
    newFiles: File[],
    imagesMetadata: PortfolioImage[]
  ): Observable<PortfolioItem> {
    const formData = new FormData();
    formData.append('title', itemData.title);
    formData.append('subtitle', itemData.subtitle || '');
    formData.append('description', itemData.description || '');
    formData.append('category', itemData.category);

    newFiles.forEach(file => {
      formData.append('images', file, file.name);
    });

    formData.append('imagesMetadata', JSON.stringify(imagesMetadata));

    return this.http.put<PortfolioItem>(`${this.apiUrl}/${id}`, formData).pipe(
      catchError(this.handleError)
    );
  }

  // Metodo per eliminare un elemento portfolio
  deletePortfolioItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    let errorMessage = 'Something went wrong; please try again later.';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}
