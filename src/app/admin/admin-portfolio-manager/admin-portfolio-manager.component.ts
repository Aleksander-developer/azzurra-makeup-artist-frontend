// src/app/admin/admin-portfolio-manager/admin-portfolio-manager.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { PortfolioService } from '../../portfolio/portfolio.service';
import { PortfolioItem, PortfolioImage } from '../../pages/portfolio/portfolio-item.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent } from '../admin/shared/confirmation-dialog/confirmation-dialog.component'; // Assicurati che il percorso sia corretto

@Component({
  selector: 'app-admin-portfolio-manager',
  templateUrl: './admin-portfolio-manager.component.html',
  styleUrls: ['./admin-portfolio-manager.component.scss']
})
export class AdminPortfolioManagerComponent implements OnInit, OnDestroy {
  portfolioForm!: FormGroup;
  portfolioItems: PortfolioItem[] = [];
  editingItem: PortfolioItem | null = null;

  // **RIMOSSO:** mainImageFile: File | null = null;
  // **MODIFICATO:** galleryFiles ora conterrà tutti i file selezionati per il caricamento in blocco
  selectedNewFiles: File[] = [];
  // **MODIFICATO:** galleryImagePreviews ora conterrà le anteprime di TUTTE le immagini (nuove ed esistenti)
  allImagePreviews: (string | ArrayBuffer | null)[] = [];

  loading = false;
  isUploading = false;

  errorMessage: string | null = null;
  successMessage: string | null = null;

  displayedColumns: string[] = ['title', 'category', 'actions'];

  // **RIMOSSO:** @ViewChild('mainImageInput') mainImageInput!: ElementRef<HTMLInputElement>;
  // **MODIFICATO:** Riferimento al singolo input file per la selezione multipla di immagini
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
      images: this.fb.array([]) // Array di FormGroup per le immagini (ora include tutte le immagini)
    });
    console.log('Form inizializzato. imagesFormArray length:', this.imagesFormArray.length);
  }

  get imagesFormArray(): FormArray {
    return this.portfolioForm.get('images') as FormArray;
  }

  // Metodo per creare un FormGroup per una singola immagine del portfolio
  createImageGroup(image?: PortfolioImage): FormGroup {
    console.log('Creazione FormGroup per immagine:', image);
    return this.fb.group({
      src: [image ? image.src : null], // src può essere null per nuove immagini non ancora caricate
      description: [image ? image.description : ''],
      alt: [image ? image.alt : ''],
      isNew: [image ? false : true] // isNew è true per le immagini aggiunte dall'utente
    });
  }

  // **MODIFICATO:** Gestisce la selezione di più file per la galleria
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Pulisci i file e le anteprime esistenti solo se non siamo in modalità editing o se l'utente sta sostituendo tutto
      // Per ora, aggiungiamo semplicemente i nuovi file
      // Se vuoi sostituire, dovresti clearare gli array qui:
      // this.selectedNewFiles = [];
      // this.allImagePreviews = [];
      // this.imagesFormArray.clear();

      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        this.selectedNewFiles.push(file); // Aggiungi il file all'array dei nuovi file

        const reader = new FileReader();
        reader.onload = () => {
          this.allImagePreviews.push(reader.result); // Aggiungi l'anteprima
          // Aggiungi un nuovo FormGroup al FormArray per ogni file selezionato
          this.imagesFormArray.push(this.createImageGroup({ src: reader.result as string, description: '', alt: '', isNew: true }));
          this.cdr.detectChanges(); // Forza la change detection
        };
        reader.readAsDataURL(file);
      }
      console.log('File selezionati per la galleria:', this.selectedNewFiles.map(f => f.name));
      console.log('imagesFormArray length dopo selezione file:', this.imagesFormArray.length);
    }
    // Resetta l'input file per permettere di selezionare gli stessi file più volte
    if (input) input.value = '';
  }

  // **MODIFICATO:** Rimuove un'immagine dal FormArray e dagli array ausiliari
  removeImage(index: number): void {
    console.log('Tentativo di rimuovere immagine all\'indice:', index);
    if (index >= 0 && index < this.imagesFormArray.length) {
      const removedControl = this.imagesFormArray.at(index);
      const isNewFile = removedControl.get('isNew')?.value;

      this.imagesFormArray.removeAt(index); // Rimuovi il FormGroup

      // Rimuovi l'anteprima
      if (this.allImagePreviews[index]) {
        this.allImagePreviews.splice(index, 1);
      }

      // Se era un nuovo file selezionato, rimuovilo anche da selectedNewFiles
      if (isNewFile && this.selectedNewFiles.length > 0) {
        // Trova e rimuovi il file corrispondente in selectedNewFiles
        // Questo è un po' più complesso perché l'indice potrebbe non corrispondere direttamente
        // Potremmo dover usare un ID univoco o un approccio più robusto se ci sono molti file.
        // Per ora, assumiamo che l'ordine sia mantenuto e l'indice corrisponda.
        // Un modo più sicuro sarebbe associare l'oggetto File al FormGroup.
        this.selectedNewFiles.splice(index, 1); // Assumendo che l'ordine sia lo stesso
      }

      console.log('Immagine rimossa all\'indice:', index);
      console.log('imagesFormArray length dopo remove:', this.imagesFormArray.length);
      console.log('selectedNewFiles length dopo remove:', this.selectedNewFiles.length);
      console.log('allImagePreviews length dopo remove:', this.allImagePreviews.length);
      this.cdr.detectChanges(); // Forza la change detection
    } else {
      console.warn('Tentativo di rimuovere un\'immagine con indice non valido:', index);
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

  // **MODIFICATO:** Logica di editing per caricare tutte le immagini esistenti
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
    this.allImagePreviews = []; // Resetta le anteprime
    this.selectedNewFiles = []; // Resetta i nuovi file selezionati

    console.log('FormArray e array immagini resettati per editing.');

    // Popola il FormArray e le anteprime con le immagini esistenti
    item.images.forEach(img => { // Assumiamo che item.images non sia undefined grazie al modello
      console.log('Aggiunta immagine esistente in editing:', img);
      this.imagesFormArray.push(this.createImageGroup(img));
      this.allImagePreviews.push(img.src || null); // Aggiungi l'URL come anteprima
    });

    console.log('imagesFormArray length dopo popolamento editing:', this.imagesFormArray.length);
    console.log('allImagePreviews length dopo popolamento editing:', this.allImagePreviews.length);

    this.cdr.detectChanges(); // Forza la change detection
  }

  clearForm(): void {
    console.log('Resetting form...');
    this.portfolioForm.reset();
    this.editingItem = null;
    this.selectedNewFiles = [];
    this.imagesFormArray.clear();
    this.allImagePreviews = [];
    if (this.galleryFileInput) this.galleryFileInput.nativeElement.value = ''; // Resetta l'input file
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

    // Se non ci sono immagini e non siamo in editing, il form è incompleto
    if (this.imagesFormArray.length === 0 && !this.editingItem) {
      this.errorMessage = 'Devi aggiungere almeno un\'immagine al portfolio.';
      this.snackBar.open(this.errorMessage, 'Chiudi', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.isUploading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const itemData = this.portfolioForm.value;
    // Prepara i dati delle immagini da inviare al backend
    const imagesDataToSend: PortfolioImage[] = itemData.images.map((img: PortfolioImage) => ({
      src: img.src, // Sarà null per i nuovi file, l'URL per gli esistenti
      description: img.description,
      alt: img.alt,
      isNew: img.isNew // Indica se è un nuovo file da caricare
    }));

    console.log('Dati del form da inviare:', itemData);
    console.log('Dati immagini da inviare:', imagesDataToSend);
    console.log('Nuovi file selezionati per la galleria:', this.selectedNewFiles.map(f => f.name));


    try {
      if (this.editingItem) {
        console.log('Aggiornamento elemento portfolio esistente:', this.editingItem.id);
        await this.portfolioService.updatePortfolioItem(
          this.editingItem.id,
          itemData,
          this.selectedNewFiles, // Passa solo i nuovi file da caricare
          imagesDataToSend // Passa tutti i metadati delle immagini (nuove ed esistenti)
        ).toPromise();
        this.successMessage = 'Elemento portfolio aggiornato con successo!';
        this.snackBar.open(this.successMessage, 'Chiudi', { duration: 3000 });
        console.log('Elemento portfolio aggiornato con successo!');
      } else {
        console.log('Aggiunta nuovo elemento portfolio.');
        if (this.selectedNewFiles.length === 0) {
          this.errorMessage = 'Devi selezionare almeno un\'immagine per un nuovo elemento.';
          this.snackBar.open(this.errorMessage, 'Chiudi', { duration: 3000 });
          this.loading = false;
          this.isUploading = false;
          console.error('Nessuna immagine selezionata per nuovo elemento.');
          return;
        }
        await this.portfolioService.addPortfolioItem(
          itemData,
          this.selectedNewFiles, // Passa tutti i file selezionati
          imagesDataToSend // Passa tutti i metadati delle immagini
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
