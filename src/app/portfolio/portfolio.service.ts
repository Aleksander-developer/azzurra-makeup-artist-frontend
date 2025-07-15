// src/app/portfolio/portfolio.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, throwError } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

// Importa le funzioni Firestore e Storage necessarie
import {
  getFirestore, collection, doc, getDoc,
  addDoc, updateDoc, deleteDoc, onSnapshot,
  Firestore, DocumentData, QuerySnapshot, DocumentReference, DocumentSnapshot
} from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, StorageReference } from 'firebase/storage';

import { PortfolioItem, PortfolioImage } from '../pages/portfolio/portfolio-item.model'; // Assicurati che il percorso sia corretto

// Dichiarazione globale per db (inizializzato in main.ts)
declare const db: Firestore;
declare const appId: string; // Variabile globale per l'ID dell'app
declare const firebaseApp: any; // Dichiarazione per l'app Firebase (inizializzata in main.ts)

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private portfolioCollectionName = 'portfolioItems'; // Nome della collezione Firestore
  private isBrowser: boolean;
  private firestoreDb: Firestore | undefined;
  private currentAppId: string | undefined;
  private firebaseStorage: any; // Riferimento a Firebase Storage

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.firestoreDb = (window as any).db;
      this.currentAppId = (window as any).appId;
      // Inizializza Storage solo se siamo nel browser e firebaseApp è disponibile
      if ((window as any).firebaseApp) {
        this.firebaseStorage = getStorage((window as any).firebaseApp);
      } else {
        console.error('Firebase App non è stato inizializzato correttamente in window.firebaseApp');
      }

      if (!this.firestoreDb) {
        console.error('Firestore DB non è stato inizializzato correttamente in window.db');
      }
      if (!this.currentAppId) {
        console.error('App ID non è stato inizializzato correttamente in window.appId');
      }
    }
  }

  /**
   * Carica un file su Firebase Storage e restituisce l'URL di download.
   * @param file Il file da caricare.
   * @param path Il percorso in cui salvare il file (es. 'portfolio-images/').
   * @returns Un Observable che emette l'URL di download del file.
   */
  uploadFile(file: File, path: string): Observable<string> {
    if (!this.isBrowser || !this.firebaseStorage) {
      return throwError(() => new Error('Firebase Storage non disponibile o non inizializzato.'));
    }

    // Crea un riferimento al percorso nel bucket di Storage
    const filePath = `${path}/${Date.now()}_${file.name}`; // Nome file unico
    const storageRef: StorageReference = ref(this.firebaseStorage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Observable(observer => {
      uploadTask.on('state_changed',
        (snapshot) => {
          // Puoi gestire il progresso qui se vuoi
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          // console.log('Upload is ' + progress + '% done'); // Commentato per evitare spam in console
          // observer.next(progress); // Se vuoi emettere il progresso
        },
        (error: any) => { // Tipizzato error
          console.error('Errore durante l\'upload:', error);
          observer.error(error);
        },
        () => {
          // Upload completato, ottieni l'URL di download
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL: string) => {
            observer.next(downloadURL);
            observer.complete();
          }).catch((urlError: any) => { // Tipizzato urlError
            console.error('Errore nell\'ottenere l\'URL di download:', urlError);
            observer.error(urlError);
          });
        }
      );
    });
  }

  // --- Metodi Firestore esistenti ---

  getPortfolioItems(): Observable<PortfolioItem[]> {
    if (!this.isBrowser || !this.firestoreDb || !this.currentAppId) {
      console.warn('Firestore non disponibile o non inizializzato (non nel browser o db/appId mancanti). Restituisco array vuoto.');
      return of([]);
    }

    const portfolioCollectionRef = collection(this.firestoreDb, `artifacts/${this.currentAppId}/public/data/${this.portfolioCollectionName}`);
    return new Observable(observer => {
      const unsubscribe = onSnapshot(portfolioCollectionRef, (snapshot: QuerySnapshot<DocumentData>) => {
        const items: PortfolioItem[] = [];
        snapshot.forEach((docData: DocumentData) => {
          // Assicurati che 'id' sia una stringa e che i dati siano tipizzati correttamente
          items.push({ id: docData['id'], ...docData['data']() } as PortfolioItem); // Usare docData.data()
        });
        observer.next(items);
      }, (error: any) => {
        console.error("Errore nel recupero degli elementi del portfolio:", error);
        observer.error(error);
      });

      return { unsubscribe };
    });
  }

  getPortfolioItemById(id: string): Observable<PortfolioItem | undefined> {
    if (!this.isBrowser || !this.firestoreDb || !this.currentAppId) {
      console.warn('Firestore non disponibile o non inizializzato. Restituisco undefined.');
      return of(undefined);
    }

    const docRef = doc(this.firestoreDb, `artifacts/${this.currentAppId}/public/data/${this.portfolioCollectionName}`, id);
    return new Observable(observer => {
      getDoc(docRef).then((docSnap: DocumentSnapshot<DocumentData>) => {
        if (docSnap.exists()) {
          observer.next({ id: docSnap.id, ...docSnap.data() } as PortfolioItem);
        } else {
          observer.next(undefined);
        }
        observer.complete();
      }).catch((error: any) => {
        console.error("Errore nel recupero dell'elemento portfolio per ID:", error);
        observer.error(error);
      });
    });
  }

  addPortfolioItem(item: Omit<PortfolioItem, 'id'>): Observable<string> {
    if (!this.isBrowser || !this.firestoreDb || !this.currentAppId) {
      return throwError(() => new Error('Firestore non disponibile o non inizializzato.'));
    }
    const portfolioCollectionRef = collection(this.firestoreDb, `artifacts/${this.currentAppId}/public/data/${this.portfolioCollectionName}`);
    return new Observable(observer => {
      addDoc(portfolioCollectionRef, item).then((docRef: DocumentReference) => {
        observer.next(docRef.id);
        observer.complete();
      }).catch((error: any) => {
        console.error("Errore nell'aggiunta dell'elemento portfolio:", error);
        observer.error(error);
      });
    });
  }

  updatePortfolioItem(id: string, item: Partial<PortfolioItem>): Observable<void> {
    if (!this.isBrowser || !this.firestoreDb || !this.currentAppId) {
      return throwError(() => new Error('Firestore non disponibile o non inizializzato.'));
    }
    const docRef = doc(this.firestoreDb, `artifacts/${this.currentAppId}/public/data/${this.portfolioCollectionName}`, id);
    return new Observable(observer => {
      updateDoc(docRef, item).then(() => {
        observer.next();
        observer.complete();
      }).catch((error: any) => {
        console.error("Errore nell'aggiornamento dell'elemento portfolio:", error);
        observer.error(error);
      });
    });
  }

  deletePortfolioItem(id: string): Observable<void> {
    if (!this.isBrowser || !this.firestoreDb || !this.currentAppId) {
      return throwError(() => new Error('Firestore non disponibile o non inizializzato.'));
    }
    const docRef = doc(this.firestoreDb, `artifacts/${this.currentAppId}/public/data/${this.portfolioCollectionName}`, id);
    return new Observable(observer => {
      deleteDoc(docRef).then(() => {
        observer.next();
        observer.complete();
      }).catch((error: any) => {
        console.error("Errore nell'eliminazione dell'elemento portfolio:", error);
        observer.error(error);
      });
    });
  }
}
