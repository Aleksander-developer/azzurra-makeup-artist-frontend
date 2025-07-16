// src/app/admin/admin-portfolio-manager/admin-portfolio-manager.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { PortfolioService } from '../../portfolio/portfolio.service';
import { PortfolioItem, PortfolioImage } from '../../pages/portfolio/portfolio-item.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent } from '../admin/shared/confirmation-dialog/confirmation-dialog.component';
// CORREZIONE QUI: Assicurati che il percorso sia corretto per la tua struttura di progetto


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
  galleryFiles: File[] = [];

  loading = false;
  isUploading = false;
  mainImagePreview: string | ArrayBuffer | null = null;
  galleryImagePreviews: (string | ArrayBuffer | null)[] = [];

  errorMessage: string | null = null;
  successMessage: string | null = null;

  displayedColumns: string[] = ['title', 'category', 'actions'];

  @ViewChild('mainImageInput') mainImageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('galleryImagesInput') galleryImagesInput!: ElementRef<HTMLInputElement>;

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
      images: this.fb.array([])
    });
  }

  get imagesFormArray(): FormArray {
    return this.portfolioForm.get('images') as FormArray;
  }

  addImageGroup(image?: PortfolioImage): void {
    this.imagesFormArray.push(this.fb.group({
      src: [image ? image.src : ''],
      description: [image ? image.description : ''],
      alt: [image ? image.alt : ''],
      isNew: [image ? false : true]
    }));
  }

  removeImageGroup(index: number): void {
    this.imagesFormArray.removeAt(index);
    if (this.galleryFiles[index]) {
      this.galleryFiles.splice(index, 1);
    }
    if (this.galleryImagePreviews[index]) {
      this.galleryImagePreviews.splice(index, 1);
    }
  }

  loadPortfolioItems(): void {
    this.loading = true;
    this.portfolioService.getPortfolioItems().subscribe({
      next: (items) => {
        this.portfolioItems = items;
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
    } else {
      this.mainImageFile = null;
      this.mainImagePreview = null;
    }
  }

  removeMainImage(): void {
    this.mainImageFile = null;
    this.mainImagePreview = null;
    if (this.mainImageInput) this.mainImageInput.nativeElement.value = '';
  }

  onGalleryImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newFiles = Array.from(input.files);
      this.galleryFiles = [...this.galleryFiles, ...newFiles];

      newFiles.forEach(file => {
        this.addImageGroup();
        const reader = new FileReader();
        reader.onload = () => {
          this.galleryImagePreviews.push(reader.result);
        };
        reader.readAsDataURL(file);
      });
    } else {
      // If no files selected, do not clear existing array
    }
    if (this.galleryImagesInput) this.galleryImagesInput.nativeElement.value = '';
  }

  editItem(item: PortfolioItem): void {
    this.editingItem = item;
    this.portfolioForm.patchValue({
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      category: item.category
    });

    this.imagesFormArray.clear();
    this.galleryImagePreviews = [];
    this.galleryFiles = [];

    if (item.mainImage) {
      this.mainImagePreview = item.mainImage;
    } else {
      this.mainImagePreview = null;
    }

    item.images?.forEach(img => {
      this.addImageGroup(img);
      this.galleryImagePreviews.push(img.src);
    });

    this.mainImageFile = null;
    if (this.mainImageInput) this.mainImageInput.nativeElement.value = '';
    if (this.galleryImagesInput) this.galleryImagesInput.nativeElement.value = '';
  }

  clearForm(): void {
    this.portfolioForm.reset();
    this.editingItem = null;
    this.mainImageFile = null;
    this.galleryFiles = [];
    this.imagesFormArray.clear();
    this.mainImagePreview = null;
    this.galleryImagePreviews = [];
    if (this.mainImageInput) this.mainImageInput.nativeElement.value = '';
    if (this.galleryImagesInput) this.galleryImagesInput.nativeElement.value = '';
    this.snackBar.open('Form resettato.', 'Chiudi', { duration: 2000 });
    this.errorMessage = null;
    this.successMessage = null;
  }

  async onSubmit(): Promise<void> {
    if (this.portfolioForm.invalid) {
      this.snackBar.open('Per favor, compila tutti i campi obbligatori.', 'Chiudi', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.isUploading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const itemData = this.portfolioForm.value;
    const imagesData: { description: string; alt: string; isNew?: boolean; src?: string }[] = itemData.images;

    try {
      if (this.editingItem) {
        await this.portfolioService.updatePortfolioItem(
          this.editingItem.id,
          itemData,
          this.mainImageFile,
          this.galleryFiles,
          imagesData
        ).toPromise();
        this.successMessage = 'Elemento portfolio aggiornato con successo!';
        this.snackBar.open(this.successMessage, 'Chiudi', { duration: 3000 });
      } else {
        if (!this.mainImageFile) {
          this.errorMessage = 'Immagine principale è obbligatoria per un nuovo elemento.';
          this.snackBar.open(this.errorMessage, 'Chiudi', { duration: 3000 });
          this.loading = false;
          this.isUploading = false;
          return;
        }
        await this.portfolioService.addPortfolioItem(
          itemData,
          this.mainImageFile,
          this.galleryFiles,
          imagesData
        ).toPromise();
        this.successMessage = 'Elemento portfolio aggiunto con successo!';
        this.snackBar.open(this.successMessage, 'Chiudi', { duration: 3000 });
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
    }
  }

  deleteItem(id: string): void {
    // AGGIUNTO LOG E CONTROLLO ID
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
          },
          error: (err) => {
            this.errorMessage = 'Errore durante l\'eliminazione dell\'elemento del portfolio: ' + (err.message || 'Errore sconosciuto.');
            this.snackBar.open(this.errorMessage, 'Chiudi', { duration: 5000 });
            console.error('Errore eliminazione portfolio:', err);
          },
          complete: () => {
            this.loading = false;
          }
        });
      }
    });
  }
}
