// src/app/admin/admin-portfolio-manager/admin-portfolio-manager.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { PortfolioService } from '../../portfolio/portfolio.service';
import { PortfolioItem, PortfolioImage } from '../../pages/portfolio/portfolio-item.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent } from '../admin/shared/confirmation-dialog/confirmation-dialog.component';
// Assicurati che il percorso sia corretto per la tua struttura di progetto

@Component({
  selector: 'app-admin-portfolio-manager',
  templateUrl: './admin-portfolio-manager.component.html',
  styleUrls: ['./admin-portfolio-manager.component.scss']
})
export class AdminPortfolioManagerComponent implements OnInit, OnDestroy {
  portfolioForm!: FormGroup;
  portfolioItems: PortfolioItem[] = [];
  editingItem: PortfolioItem | null = null;
  mainImageFile: File | null = null;
  galleryFiles: File[] = []; // Nuovi file della galleria da caricare

  loading = false;
  isUploading = false;
  mainImagePreview: string | ArrayBuffer | null = null;
  galleryImagePreviews: (string | ArrayBuffer | null)[] = []; // Per le anteprime delle immagini della galleria

  errorMessage: string | null = null;
  successMessage: string | null = null;

  displayedColumns: string[] = ['title', 'category', 'actions'];

  @ViewChild('mainImageInput') mainImageInput!: ElementRef<HTMLInputElement>;
  // NUOVO: Riferimento al singolo input file della galleria
  @ViewChild('singleGalleryImageInput') singleGalleryImageInput!: ElementRef<HTMLInputElement>;
  // NUOVO: Variabile per tenere traccia dell'indice dell'immagine della galleria corrente
  currentGalleryImageIndex: number | null = null;


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
    // Nessuna sottoscrizione da disiscrivere manualmente se usi takeUntil o async pipe
  }

  initForm(): void {
    this.portfolioForm = this.fb.group({
      title: ['', Validators.required],
      subtitle: [''],
      description: [''],
      category: ['', Validators.required],
      images: this.fb.array([]) // Array di FormGroup per le immagini della galleria
    });
    console.log('Form inizializzato. imagesFormArray length:', this.imagesFormArray.length);
  }

  get imagesFormArray(): FormArray {
    return this.portfolioForm.get('images') as FormArray;
  }

  // Metodo per creare un FormGroup per una singola immagine della galleria
  createImageGroup(image?: PortfolioImage): FormGroup {
    console.log('Creazione FormGroup per immagine:', image);
    return this.fb.group({
      src: [image ? image.src : ''],
      description: [image ? image.description : ''],
      alt: [image ? image.alt : ''],
      isNew: [image ? false : true]
    });
  }

  // Questo metodo è per il pulsante "Aggiungi Immagine Galleria"
  addNewImageGroup(): void {
    console.log('Aggiunta nuovo gruppo immagine (pulsante)');
    const newFormGroup = this.createImageGroup();
    this.imagesFormArray.push(newFormGroup);
    // Aggiungi un placeholder per il file e la preview per mantenere la sincronizzazione degli indici
    this.galleryFiles.push(null as any);
    this.galleryImagePreviews.push(null);
    console.log('imagesFormArray length dopo addNew:', this.imagesFormArray.length);
    console.log('galleryFiles length dopo addNew:', this.galleryFiles.length);
    console.log('galleryImagePreviews length dopo addNew:', this.galleryImagePreviews.length);
  }

  // Rimuove un gruppo di form e i dati associati
  removeImageGroup(index: number): void {
    console.log('Tentativo di rimuovere gruppo immagine all\'indice:', index);
    if (index >= 0 && index < this.imagesFormArray.length) {
      this.imagesFormArray.removeAt(index);

      // Rimuovi anche l'immagine dal preview e dal file array, se esistono
      if (this.galleryFiles[index]) {
        this.galleryFiles.splice(index, 1);
      }
      if (this.galleryImagePreviews[index]) {
        this.galleryImagePreviews.splice(index, 1);
      }
      console.log('Gruppo immagine rimosso all\'indice:', index);
      console.log('imagesFormArray length dopo remove:', this.imagesFormArray.length);
      console.log('galleryFiles length dopo remove:', this.galleryFiles.length);
      console.log('galleryImagePreviews length dopo remove:', this.galleryImagePreviews.length);
    } else {
      console.warn('Tentativo di rimuovere un gruppo immagine con indice non valido:', index);
    }
  }

  loadPortfolioItems(): void {
    this.loading = true;
    this.portfolioService.getPortfolioItems().subscribe({
      next: (items) => {
        this.portfolioItems = items;
        console.log('Elementi portfolio caricati:', this.portfolioItems);
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Errore nel caricamento degli elementi del portfolio.', 'Chiudi', { duration: 3000 });
        console.error('Errore nel caricamento portfolio:', err);
        this.loading = false;
      }
    });
  }

  onMainImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.mainImageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.mainImagePreview = reader.result;
      };
      reader.readAsDataURL(this.mainImageFile);
      console.log('Immagine principale selezionata:', this.mainImageFile.name);
    } else {
      this.mainImageFile = null;
      this.mainImagePreview = null;
      console.log('Nessuna immagine principale selezionata.');
    }
  }

  removeMainImage(): void {
    this.mainImageFile = null;
    this.mainImagePreview = null;
    if (this.mainImageInput) this.mainImageInput.nativeElement.value = '';
    console.log('Immagine principale rimossa.');
  }

  // NUOVO: Metodo per aprire il singolo input file della galleria e memorizzare l'indice
  openGalleryFileInput(index: number): void {
    console.log('openGalleryFileInput chiamato per indice:', index);
    this.currentGalleryImageIndex = index; // Memorizza l'indice dell'immagine che stiamo caricando
    this.singleGalleryImageInput.nativeElement.click(); // Triggera il click sull'input file nascosto
  }

  // Gestisce la selezione di immagini per la galleria (ora senza indice nel parametro)
  onGalleryImagesSelected(event: Event): void {
    // Usa l'indice memorizzato in currentGalleryImageIndex
    if (this.currentGalleryImageIndex === null) {
      console.error('Errore: currentGalleryImageIndex è null in onGalleryImagesSelected.');
      return;
    }
    const formGroupIndex = this.currentGalleryImageIndex;
    console.log('onGalleryImagesSelected chiamato per indice (da currentGalleryImageIndex):', formGroupIndex);

    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Aggiorna il file nell'array dei file della galleria all'indice corretto
      this.galleryFiles[formGroupIndex] = file;
      console.log(`File galleria selezionato per indice ${formGroupIndex}:`, file.name);

      const reader = new FileReader();
      reader.onload = () => {
        // Aggiorna la preview
        this.galleryImagePreviews[formGroupIndex] = reader.result;
        console.log(`Preview galleria aggiornata per indice ${formGroupIndex}.`);

        // Aggiorna il form control per src e isNew
        const imageFormGroup = this.imagesFormArray.at(formGroupIndex) as FormGroup;
        if (imageFormGroup) {
          imageFormGroup.get('src')?.setValue(reader.result as string);
          imageFormGroup.get('isNew')?.setValue(true);
          console.log(`FormGroup per indice ${formGroupIndex} aggiornato con src e isNew.`);
        } else {
          console.error(`Errore: FormGroup non trovato per indice ${formGroupIndex} in onGalleryImagesSelected.`);
        }
      };
      reader.readAsDataURL(file);
    } else {
      console.log(`Nessun file selezionato per l'immagine galleria all'indice ${formGroupIndex}.`);
    }
    // Resetta l'input file per permettere di selezionare lo stesso file più volte
    if (input) input.value = '';
    this.currentGalleryImageIndex = null; // Resetta l'indice dopo l'operazione
  }


  editItem(item: PortfolioItem): void {
    console.log('Inizio editing per elemento:', item.id);
    this.editingItem = item;
    this.portfolioForm.patchValue({
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      category: item.category
    });

    this.imagesFormArray.clear(); // Pulisce tutti i controlli esistenti
    this.galleryImagePreviews = [];
    this.galleryFiles = []; // Resetta i file caricati per l'editing
    console.log('FormArray e array immagini galleria resettati per editing.');

    if (item.mainImage) {
      this.mainImagePreview = item.mainImage;
    } else {
      this.mainImagePreview = null;
    }

    item.images?.forEach(img => {
      console.log('Aggiunta immagine esistente in editing:', img);
      this.imagesFormArray.push(this.createImageGroup(img));
      this.galleryImagePreviews.push(img.src);
      this.galleryFiles.push(null as any); // Placeholder per i file non caricati
    });
    console.log('imagesFormArray length dopo popolamento editing:', this.imagesFormArray.length);
    console.log('galleryFiles length dopo popolamento editing:', this.galleryFiles.length);
    console.log('galleryImagePreviews length dopo popolamento editing:', this.galleryImagePreviews.length);

    this.mainImageFile = null;
    if (this.mainImageInput) this.mainImageInput.nativeElement.value = '';
  }

  clearForm(): void {
    console.log('Resetting form...');
    this.portfolioForm.reset();
    this.editingItem = null;
    this.mainImageFile = null;
    this.galleryFiles = [];
    this.imagesFormArray.clear();
    this.mainImagePreview = null;
    this.galleryImagePreviews = [];
    if (this.mainImageInput) this.mainImageInput.nativeElement.value = '';
    this.snackBar.open('Form resettato.', 'Chiudi', { duration: 2000 });
    this.errorMessage = null;
    this.successMessage = null;
    console.log('Form resettato completamente.');
  }

  async onSubmit(): Promise<void> {
    console.log('Submit del form avviato.');
    this.portfolioForm.markAllAsTouched();

    if (this.portfolioForm.invalid) {
      this.snackBar.open('Per favor, compila tutti i campi obbligatori.', 'Chiudi', { duration: 3000 });
      console.warn('Form non valido al submit.');
      return;
    }

    this.loading = true;
    this.isUploading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const itemData = this.portfolioForm.value;
    const imagesDataToSend: { description: string; alt: string; isNew?: boolean; src?: string }[] = itemData.images.map((img: PortfolioImage) => ({
      src: img.src,
      description: img.description,
      alt: img.alt,
      isNew: img.isNew
    }));
    console.log('Dati del form da inviare:', itemData);
    console.log('Dati immagini da inviare:', imagesDataToSend);
    console.log('File immagine principale:', this.mainImageFile?.name);
    console.log('File immagini galleria:', this.galleryFiles.map(f => f?.name));


    try {
      if (this.editingItem) {
        console.log('Aggiornamento elemento portfolio esistente:', this.editingItem.id);
        await this.portfolioService.updatePortfolioItem(
          this.editingItem.id,
          itemData,
          this.mainImageFile,
          this.galleryFiles,
          imagesDataToSend
        ).toPromise();
        this.successMessage = 'Elemento portfolio aggiornato con successo!';
        this.snackBar.open(this.successMessage, 'Chiudi', { duration: 3000 });
        console.log('Elemento portfolio aggiornato con successo!');
      } else {
        console.log('Aggiunta nuovo elemento portfolio.');
        if (!this.mainImageFile) {
          this.errorMessage = 'Immagine principale è obbligatoria per un nuovo elemento.';
          this.snackBar.open(this.errorMessage, 'Chiudi', { duration: 3000 });
          this.loading = false;
          this.isUploading = false;
          console.error('Immagine principale mancante per nuovo elemento.');
          return;
        }
        await this.portfolioService.addPortfolioItem(
          itemData,
          this.mainImageFile,
          this.galleryFiles,
          imagesDataToSend
        ).toPromise();
        this.successMessage = 'Elemento portfolio aggiunto con successo!';
        this.snackBar.open(this.successMessage, 'Chiudi', { duration: 3000 });
        console.log('Elemento portfolio aggiunto con successo!');
      }
      this.clearForm();
      this.loadPortfolioItems();
    } catch (error: any) {
      this.errorMessage = 'Errore durante l\'operazione sul portfolio: ' + (error.message || 'Errore sconosciuto.');
      this.snackBar.open(this.errorMessage, 'Chiudi', { duration: 5000 });
      console.error('Errore portfolio:', error);
    } finally {
      this.loading = false;
      this.isUploading = false;
      console.log('Operazione portfolio completata.');
    }
  }

  deleteItem(id: string): void {
    console.log('Tentativo di eliminare elemento con ID:', id);
    if (!id) {
      this.snackBar.open('Impossibile eliminare: ID elemento non valido.', 'Chiudi', { duration: 3000 });
      console.error('ID elemento non valido per l\'eliminazione:', id);
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '300px',
      data: { message: 'Sei sicuro di voler eliminare questo elemento del portfolio?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.portfolioService.deletePortfolioItem(id).subscribe({
          next: () => {
            this.successMessage = 'Elemento portfolio eliminato con successo!';
            this.snackBar.open(this.successMessage, 'Chiudi', { duration: 3000 });
            this.loadPortfolioItems();
            console.log('Elemento portfolio eliminato con successo!');
          },
          error: (err) => {
            this.errorMessage = 'Errore durante l\'eliminazione dell\'elemento del portfolio: ' + (err.message || 'Errore sconosciuto.');
            this.snackBar.open(this.errorMessage, 'Chiudi', { duration: 5000 });
            console.error('Errore eliminazione portfolio:', err);
          },
          complete: () => {
            this.loading = false;
            console.log('Operazione di eliminazione completata.');
          }
        });
      }
    });
  }
}
