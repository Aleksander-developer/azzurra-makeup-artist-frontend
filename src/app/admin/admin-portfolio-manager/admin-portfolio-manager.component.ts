// src/app/admin/admin/admin-portfolio-manager/admin-portfolio-manager.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { catchError, map, finalize } from 'rxjs/operators';
import { PortfolioImage, PortfolioItem } from '../../pages/portfolio/portfolio-item.model';
import { PortfolioService } from '../../portfolio/portfolio.service';
import { ConfirmationDialogComponent } from '../admin/shared/confirmation-dialog/confirmation-dialog.component';


@Component({
  selector: 'app-admin-portfolio-manager',
  templateUrl: './admin-portfolio-manager.component.html',
  styleUrls: ['./admin-portfolio-manager.component.scss']
})
export class AdminPortfolioManagerComponent implements OnInit, OnDestroy {
  portfolioForm!: FormGroup;
  portfolioItems: PortfolioItem[] = [];
  displayedColumns: string[] = ['title', 'category', 'actions'];
  isLoading = false; // Per il bottone del form (salvataggio dati Firestore)
  uploadInProgress = false; // Per indicare che c'è un upload di immagini in corso
  isLoadingList = true; // Per il caricamento della lista
  errorMessage: string | null = null;
  successMessage: string | null = null;
  editingItem: PortfolioItem | null = null; // L'elemento che stiamo modificando

  mainImageFile: File | null = null;
  mainImagePreview: string | ArrayBuffer | null = null;
  mainImageUploadProgress: number = 0; // Progresso upload immagine principale

  galleryImageFiles: (File | null)[] = []; // Array di File per le immagini della galleria
  galleryImagePreviews: (string | ArrayBuffer | null)[] = []; // Array di anteprime per la galleria
  galleryImageUploadProgress: number[] = []; // Progresso upload per ogni immagine galleria

  private portfolioSubscription: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private portfolioService: PortfolioService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadPortfolioItems();
  }

  ngOnDestroy(): void {
    if (this.portfolioSubscription) {
      this.portfolioSubscription.unsubscribe();
    }
  }

  initForm(): void {
    this.portfolioForm = this.fb.group({
      title: ['', Validators.required],
      subtitle: [''],
      description: [''],
      mainImage: [''], // Non più required qui, sarà gestito dall'upload
      category: ['', Validators.required],
      images: this.fb.array([])
    });
  }

  get imagesFormArray(): FormArray {
    return this.portfolioForm.get('images') as FormArray;
  }

  // Gestione upload immagine principale
  onMainImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.mainImageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = e => this.mainImagePreview = reader.result;
      reader.readAsDataURL(this.mainImageFile);
      this.portfolioForm.get('mainImage')?.setErrors(null); // Rimuovi errori di validazione se un file è selezionato
      this.portfolioForm.get('mainImage')?.markAsDirty(); // Marca come sporco per indicare un cambiamento
    } else {
      this.mainImageFile = null;
      this.mainImagePreview = null;
      // Se non c'è un editingItem, l'immagine principale è richiesta
      if (!this.editingItem) {
        this.portfolioForm.get('mainImage')?.setErrors({ 'required': true });
      } else if (this.editingItem && !this.editingItem.mainImage) { // Se editing e non c'è immagine esistente
        this.portfolioForm.get('mainImage')?.setErrors({ 'required': true });
      } else { // Editing e c'è un'immagine esistente, non è più richiesta
        this.portfolioForm.get('mainImage')?.setErrors(null);
      }
    }
  }

  removeMainImage(): void {
    this.mainImageFile = null;
    this.mainImagePreview = null;
    this.portfolioForm.get('mainImage')?.setValue(''); // Pulisci il valore nel form control
    // Se non c'è un editingItem, l'immagine principale è richiesta
    if (!this.editingItem) {
      this.portfolioForm.get('mainImage')?.setErrors({ 'required': true });
    } else if (this.editingItem && this.editingItem.mainImage) { // Se editing e c'era un'immagine, ora è stata rimossa
      this.portfolioForm.get('mainImage')?.setErrors({ 'required': true });
    }
    this.portfolioForm.get('mainImage')?.markAsTouched();
  }

  // Gestione upload immagini galleria
  onGalleryImageSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.galleryImageFiles[index] = input.files[0];
      const reader = new FileReader();
      reader.onload = e => this.galleryImagePreviews[index] = reader.result;
      reader.readAsDataURL(this.galleryImageFiles[index]!);
      this.imagesFormArray.at(index).get('src')?.markAsDirty(); // Marca come sporco
    } else {
      this.galleryImageFiles[index] = null;
      this.galleryImagePreviews[index] = null;
    }
  }

  // Aggiunge un nuovo gruppo di form per un'immagine della galleria
  addImage(image?: PortfolioImage): void {
    this.imagesFormArray.push(this.fb.group({
      src: [image ? image.src : ''],
      description: [image ? image.description : ''],
      alt: [image ? image.alt : ''] // AGGIUNTO 'alt' QUI
    }));
    this.galleryImageFiles.push(null); // Inizializza il file per la nuova immagine
    this.galleryImagePreviews.push(null); // Inizializza l'anteprima
    this.galleryImageUploadProgress.push(0); // Inizializza il progresso
  }

  // Rimuove un gruppo di form per un'immagine della galleria
  removeImage(index: number): void {
    this.imagesFormArray.removeAt(index);
    this.galleryImageFiles.splice(index, 1);
    this.galleryImagePreviews.splice(index, 1);
    this.galleryImageUploadProgress.splice(index, 1);
  }

  // Funzione per rimuovere una singola immagine dalla galleria (usata nel template)
  removeGalleryImage(index: number): void {
    this.imagesFormArray.at(index).get('src')?.setValue('');
    this.imagesFormArray.at(index).get('description')?.setValue('');
    this.imagesFormArray.at(index).get('alt')?.setValue('');
    this.galleryImageFiles[index] = null;
    this.galleryImagePreviews[index] = null;
    this.galleryImageUploadProgress[index] = 0;
  }

  loadPortfolioItems(): void {
    this.isLoadingList = true;
    this.portfolioSubscription = this.portfolioService.getPortfolioItems().subscribe({
      next: (items) => {
        this.portfolioItems = items;
        this.isLoadingList = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento del portfolio:', err);
        this.snackBar.open('Errore nel caricamento del portfolio.', 'Chiudi', { duration: 3000 });
        this.isLoadingList = false;
      }
    });
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = null;
    this.successMessage = null;

    // Dinamicamente imposta il validatore per mainImage
    // Se non siamo in modifica O (siamo in modifica E non c'è un'immagine esistente E non c'è un nuovo file selezionato)
    if (!this.editingItem || (this.editingItem && !this.editingItem.mainImage && !this.mainImageFile && !this.mainImagePreview)) {
      this.portfolioForm.get('mainImage')?.setValidators(Validators.required);
    } else {
      this.portfolioForm.get('mainImage')?.setValidators(null);
    }
    this.portfolioForm.get('mainImage')?.updateValueAndValidity();


    // Validazione iniziale del form
    if (this.portfolioForm.invalid) {
      this.portfolioForm.markAllAsTouched();
      this.errorMessage = 'Per favore, compila tutti i campi obbligatori e carica l\'immagine principale.';
      this.snackBar.open(this.errorMessage, 'Chiudi', { duration: 3000 });
      return;
    }

    this.uploadInProgress = true; // Inizia il processo di upload
    this.isLoading = true; // Mostra spinner per il salvataggio generale

    const itemData: PortfolioItem = { ...this.portfolioForm.value };

    try {
      // 1. Upload immagine principale (se nuova o modificata)
      if (this.mainImageFile) {
        const mainImageUrl = await this.portfolioService.uploadFile(this.mainImageFile, 'portfolio-images').toPromise();
        itemData.mainImage = mainImageUrl;
      } else if (this.editingItem && !this.mainImagePreview) { // Se eravamo in modifica e l'utente ha rimosso l'immagine principale esistente
          itemData.mainImage = '';
      }


      // 2. Upload immagini della galleria (se nuove o modificate)
      const uploadGalleryObservables: Observable<PortfolioImage | null>[] = []; // Tipizzato per includere null
      itemData.images = []; // Inizializza l'array images per evitare duplicati in caso di modifica

      // Per ogni immagine nella galleria
      for (let i = 0; i < this.imagesFormArray.controls.length; i++) {
        const imageGroup = this.imagesFormArray.at(i);
        const currentImageSrc = imageGroup.get('src')?.value;
        const currentImageDescription = imageGroup.get('description')?.value;
        const currentImageAlt = imageGroup.get('alt')?.value;
        const file = this.galleryImageFiles[i];

        if (file) {
          // Se c'è un nuovo file, caricalo
          const uploadObs = this.portfolioService.uploadFile(file, 'portfolio-gallery').pipe(
            map((url: string) => ({ src: url, description: currentImageDescription || '', alt: currentImageAlt || '' })),
            catchError(err => {
              console.error(`Errore upload galleria immagine ${i}:`, err);
              this.snackBar.open(`Errore upload immagine galleria ${i}.`, 'Chiudi', { duration: 3000 });
              return of(null); // Ritorna null in caso di errore per non bloccare forkJoin
            })
          );
          uploadGalleryObservables.push(uploadObs);
        } else if (currentImageSrc) {
          // Se non c'è un nuovo file ma c'è un URL esistente, mantienilo
          uploadGalleryObservables.push(of({ src: currentImageSrc, description: currentImageDescription || '', alt: currentImageAlt || '' }));
        } else {
            // Se non c'è né un file né un URL, non aggiungere nulla all'array di upload
            uploadGalleryObservables.push(of(null));
        }
      }

      // Esegui tutti gli upload della galleria in parallelo
      const uploadedGalleryImages = await forkJoin(uploadGalleryObservables.length > 0 ? uploadGalleryObservables : of([])).toPromise();
      // Filtra eventuali null e assegna a itemData.images
      itemData.images = uploadedGalleryImages?.filter(img => img !== null) as unknown as PortfolioImage[];


      // 3. Salva i dati del portfolio in Firestore
      if (this.editingItem) {
        await this.portfolioService.updatePortfolioItem(this.editingItem.id, itemData).toPromise();
        this.snackBar.open('Lavoro aggiornato con successo!', 'Chiudi', { duration: 3000 });
        this.successMessage = 'Lavoro aggiornato con successo!';
      } else {
        await this.portfolioService.addPortfolioItem(itemData).toPromise();
        this.snackBar.open('Lavoro aggiunto con successo!', 'Chiudi', { duration: 3000 });
        this.successMessage = 'Lavoro aggiunto con successo!';
      }

      this.resetForm();
    } catch (err: any) {
      console.error('Errore durante il salvataggio del lavoro:', err);
      this.errorMessage = `Errore durante il salvataggio del lavoro: ${err.message || 'Errore sconosciuto'}`;
      this.snackBar.open(this.errorMessage, 'Chiudi', { duration: 5000 });
    } finally {
      this.isLoading = false;
      this.uploadInProgress = false;
    }
  }

  editItem(item: PortfolioItem): void {
    this.editingItem = item;
    this.portfolioForm.patchValue(item);

    // Gestisci l'immagine principale esistente per l'anteprima
    this.mainImageFile = null; // Nessun file nuovo selezionato per ora
    this.mainImagePreview = item.mainImage || null;

    // Popola le immagini della galleria
    this.imagesFormArray.clear();
    this.galleryImageFiles = [];
    this.galleryImagePreviews = [];
    this.galleryImageUploadProgress = [];

    item.images?.forEach(img => {
      this.addImage(img); // Aggiunge il FormGroup per l'immagine
      // Imposta l'anteprima per le immagini esistenti della galleria
      this.galleryImagePreviews[this.galleryImagePreviews.length - 1] = img.src;
    });

    this.successMessage = null;
    this.errorMessage = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteItem(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { message: 'Sei sicuro di voler eliminare questo lavoro dal portfolio?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoadingList = true;
        this.portfolioService.deletePortfolioItem(id).subscribe({
          next: () => {
            this.snackBar.open('Lavoro eliminato con successo!', 'Chiudi', { duration: 3000 });
          },
          error: (err) => {
            console.error('Errore nell\'eliminazione del lavoro:', err);
            this.snackBar.open('Errore durante l\'eliminazione.', 'Chiudi', { duration: 3000 });
          },
          complete: () => {
            this.isLoadingList = false;
          }
        });
      }
    });
  }

  resetForm(): void {
    this.portfolioForm.reset();
    this.imagesFormArray.clear();
    this.editingItem = null;
    this.errorMessage = null;
    this.successMessage = null;
    this.portfolioForm.get('category')?.setValue('');

    // Resetta anche gli stati degli upload e delle anteprime
    this.mainImageFile = null;
    this.mainImagePreview = null;
    this.mainImageUploadProgress = 0;
    this.galleryImageFiles = [];
    this.galleryImagePreviews = [];
    this.galleryImageUploadProgress = [];
    this.uploadInProgress = false;
  }
}
