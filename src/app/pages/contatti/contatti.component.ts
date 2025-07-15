// src/app/pages/contatti/contatti.component.ts
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-contatti',
  templateUrl: './contatti.component.html',
  styleUrls: ['./contatti.component.scss']
})
export class ContattiComponent implements OnInit {
  contactForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.contactForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      cellulare: ['', [Validators.pattern(/^(\+?\d{1,3}[- ]?)?\d{6,14}$/)]],
      messaggio: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void { }

  onSubmit() {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.contactForm.valid) {
      this.isLoading = true; // Imposta isLoading a true all'inizio della richiesta
      const formData = this.contactForm.value;

      console.log('Invio dati:', formData);

      // Assicurati che environment.apiUrl sia definito nel tuo file environment.ts
      this.http.post(`${environment.firebaseConfig}/contatti`, formData).subscribe({
        next: () => {
          this.successMessage = 'Messaggio inviato con successo!';

          // --- LOGICA DI RESET DEFINITIVA E FORZATA ---
          this.contactForm.reset({
            nome: '',
            email: '',
            cellulare: '',
            messaggio: ''
          });

          setTimeout(() => {
            Object.keys(this.contactForm.controls).forEach(key => {
              const control = this.contactForm.get(key);
              control?.markAsPristine();
              control?.markAsUntouched();
              control?.updateValueAndValidity({ emitEvent: false });
            });
            this.contactForm.markAsPristine();
            this.contactForm.markAsUntouched();
            this.contactForm.updateValueAndValidity({ emitEvent: false });
          }, 0);

          setTimeout(() => this.successMessage = '', 5000);
        },
        error: (error) => {
          console.error('Errore invio messaggio:', error);
          this.errorMessage = 'Errore durante l\'invio del messaggio. Riprova.';
          this.snackBar.open('Errore durante l\'invio. Riprova.', 'Chiudi', { duration: 5000 });
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.contactForm.markAllAsTouched();
    }
  }
}