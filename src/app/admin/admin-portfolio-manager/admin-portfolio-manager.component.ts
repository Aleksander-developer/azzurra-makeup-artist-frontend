// src/app/admin/admin-portfolio-manager/admin-portfolio-manager.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { PortfolioService } from '../../portfolio/portfolio.service';
import { PortfolioItem, PortfolioImage } from '../../pages/portfolio/portfolio-item.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent } from '../admin/shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-admin-portfolio-manager',
  templateUrl: './admin-portfolio-manager.component.html',
  styleUrls: ['./admin-portfolio-manager.component.scss']
})
export class AdminPortfolioManagerComponent implements OnInit, OnDestroy {
  portfolioForm!: FormGroup;
  portfolioItems: PortfolioItem[] = [];
  editingItem: PortfolioItem | null = null;

  allImagePreviews: (string | ArrayBuffer | null)[] = [];

  loading = false;
  isUploading = false;

  errorMessage: string | null = null;
  successMessage: string | null = null;

  displayedColumns: string[] = ['title', 'category', 'actions'];

  @ViewChild('galleryFileInput') galleryFileInput!: ElementRef<HTMLInputElement>;


  constructor(
    private fb: FormBuilder,
    private portfolioService: PortfolioService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
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
      images: this.fb.array([])
    });
    console.log('Form inizializzato. imagesFormArray length:', this.imagesFormArray.length);
  }

  get imagesFormArray(): FormArray {
    return this.portfolioForm.get('images') as FormArray;
  }

  createImageGroup(image?: PortfolioImage, file?: File): FormGroup {
    console.log('Creazione FormGroup per immagine:', image, 'File:', file);
    return this.fb.group({
      src: [image ? image.src : undefined],
      description: [image ? image.description : ''],
      alt: [image ? image.alt : ''],
      isNew: [image ? false : true],
      file: [file]
    });
  }

  // **MODIFICATO:** Logica onFilesSelected rivista per gestire correttamente file multipli
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const selectedFiles = Array.from(input.files); // Tutti i file selezionati dall'utente

      // Calcola quanti nuovi file possiamo aggiungere (max 10 totali)
      const maxNewFilesToAdd = 10 - this.imagesFormArray.length;
      const filesToProcess = selectedFiles.slice(0, maxNewFilesToAdd);

      if (filesToProcess.length === 0 && this.imagesFormArray.length >= 10) {
        this.snackBar.open('Massimo 10 immagini consentite per portfolio.', 'Chiudi', { duration: 3000 });
        return;
      }

      // Salva le immagini esistenti se siamo in modalità di modifica
      const existingImages = this.editingItem ? [...this.editingItem.images] : [];

      // Pulisci completamente il FormArray e l'array delle anteprime
      this.imagesFormArray.clear();
      this.allImagePreviews = [];

      // Aggiungi prima le immagini esistenti (se presenti)
      existingImages.forEach(img => {
        this.imagesFormArray.push(this.createImageGroup(img, undefined));
        this.allImagePreviews.push(img.src || null);
      });

      // Aggiungi i nuovi file selezionati
      filesToProcess.forEach((file) => {
        this.imagesFormArray.push(this.createImageGroup(undefined, file));
        this.allImagePreviews.push(null); // Placeholder per l'anteprima
      });

      // Forza la change detection UNA VOLTA dopo aver aggiunto tutti i FormGroups
      this.cdr.detectChanges();
      console.log(`Tutti i FormGroups aggiunti. Change detection forzata.`);
      console.log('imagesFormArray length dopo selezione file:', this.imagesFormArray.length);


      // Carica le anteprime per i file appena aggiunti
      // Iteriamo su tutti i controlli per trovare quelli che hanno un 'file' (sono nuovi)
      this.imagesFormArray.controls.forEach((control, index) => {
        const formGroupValue = control.value;
        if (formGroupValue.isNew && formGroupValue.file instanceof File) {
          const file = formGroupValue.file;
          const reader = new FileReader();
          reader.onload = () => {
            this.allImagePreviews[index] = reader.result;
            // Forza la change detection dopo l'aggiornamento dell'anteprima
            this.cdr.detectChanges();
            console.log(`Anteprima caricata per indice ${index}`);
          };
          reader.readAsDataURL(file);
        }
      });

      console.log('File selezionati per la galleria (totali):', filesToProcess.map(f => f.name));
    }
    // Resetta l'input file per permettere la selezione degli stessi file di nuovo
    if (input) input.value = '';
  }


  removeImage(index: number): void {
    console.log('Tentativo di rimuovere immagine all\'indice:', index);
    if (index >= 0 && index < this.imagesFormArray.length) {
      this.imagesFormArray.removeAt(index);

      // Rimuovi l'anteprima corrispondente
      if (index < this.allImagePreviews.length) { // Controlla il limite per sicurezza
        this.allImagePreviews.splice(index, 1);
      }

      this.cdr.detectChanges(); // Forza l'aggiornamento della vista
      console.log('Immagine rimossa all\'indice:', index);
      console.log('imagesFormArray length dopo remove:', this.imagesFormArray.length);
      console.log('allImagePreviews length dopo remove:', this.allImagePreviews.length);
    } else {
      console.warn('Tentativo di rimuovere un\'immagine con indice non valido:', index);
    }
  }

  loadPortfolioItems(): void {
    this.loading = true;
    this.errorMessage = null;
    this.portfolioService.getPortfolioItems().subscribe({
      next: (items) => {
        this.portfolioItems = items.map(item => ({
          ...item,
          coverImageUrl: this.getPrecalculatedCoverImage(item)
        }));
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Errore nel caricamento degli elementi del portfolio.', 'Chiudi', { duration: 3000 });
        console.error('Errore nel caricamento portfolio:', err);
        this.loading = false;
        this.errorMessage = 'Errore nel caricamento: ' + (err.message || 'Errore sconosciuto.');
      }
    });
  }

  private getPrecalculatedCoverImage(item: PortfolioItem): string {
    if (item.images && item.images.length > 0) {
      const randomIndex = Math.floor(Math.random() * item.images.length);
      return item.images[randomIndex].src || 'assets/placeholder.jpg';
    }
    return 'assets/placeholder.jpg';
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

    this.imagesFormArray.clear();
    this.allImagePreviews = [];

    console.log('FormArray e array immagini resettati per editing.');

    item.images.forEach(img => {
      console.log('Aggiunta immagine esistente in editing:', img);
      this.imagesFormArray.push(this.createImageGroup({
        src: img.src,
        description: img.description,
        alt: img.alt,
        isNew: false
      }, undefined));
      this.allImagePreviews.push(img.src || null);
    });

    console.log('imagesFormArray length dopo popolamento editing:', this.imagesFormArray.length);
    console.log('allImagePreviews length dopo popolamento editing:', this.allImagePreviews.length);

    this.cdr.detectChanges();
  }

  clearForm(): void {
    console.log('Resetting form...');
    this.portfolioForm.reset();
    this.editingItem = null;
    this.imagesFormArray.clear();
    this.allImagePreviews = [];
    if (this.galleryFileInput) this.galleryFileInput.nativeElement.value = '';
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

    const newFilesToUpload: File[] = [];
    const imagesMetadataToSend: PortfolioImage[] = [];

    this.imagesFormArray.controls.forEach(control => {
      const formGroupValue = control.value;
      const file = formGroupValue.file;

      if (formGroupValue.isNew && file instanceof File) {
        newFilesToUpload.push(file);
        imagesMetadataToSend.push({
          src: undefined,
          description: formGroupValue.description,
          alt: formGroupValue.alt,
          isNew: true
        });
      } else {
        imagesMetadataToSend.push({
          src: formGroupValue.src,
          description: formGroupValue.description,
          alt: formGroupValue.alt,
          isNew: false
        });
      }
    });

    if (imagesMetadataToSend.length === 0 && !this.editingItem) {
      this.errorMessage = 'Devi aggiungere almeno un\'immagine al portfolio.';
      this.snackBar.open(this.errorMessage, 'Chiudi', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.isUploading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const itemData = this.portfolioForm.value;

    console.log('Dati del form da inviare:', itemData);
    console.log('Metadati immagini da inviare:', imagesMetadataToSend);
    console.log('Nuovi file da caricare:', newFilesToUpload.map(f => f.name));


    try {
      if (this.editingItem) {
        console.log('Aggiornamento elemento portfolio esistente:', this.editingItem.id);
        await this.portfolioService.updatePortfolioItem(
          this.editingItem.id,
          itemData,
          newFilesToUpload,
          imagesMetadataToSend
        ).toPromise();
        this.successMessage = 'Elemento portfolio aggiornato con successo!';
        this.snackBar.open(this.successMessage, 'Chiudi', { duration: 3000 });
        console.log('Elemento portfolio aggiornato con successo!');
      } else {
        console.log('Aggiunta nuovo elemento portfolio.');
        if (newFilesToUpload.length === 0) {
          this.errorMessage = 'Devi selezionare almeno un\'immagine per un nuovo elemento.';
          this.snackBar.open(this.errorMessage, 'Chiudi', { duration: 3000 });
          this.loading = false;
          this.isUploading = false;
          console.error('Nessuna immagine selezionata per nuovo elemento.');
          return;
        }
        await this.portfolioService.addPortfolioItem(
          itemData,
          newFilesToUpload,
          imagesMetadataToSend
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

  trackByFn(index: number, item: AbstractControl): any {
    return index;
  }
}
