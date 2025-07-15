// src/main.ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// Importa le funzioni Firebase necessarie
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Dichiarazioni globali per Firebase (se non sono già presenti nel tuo setup)
declare const __firebase_config: string;
declare const __app_id: string;
declare const __initial_auth_token: string;

async function initializeFirebaseAndBootstrap() {
  let firebaseConfig: any;
  let appId: string;
  let initialAuthToken: string | undefined;

  // Controlla se le variabili globali sono definite (usate dall'ambiente Canvas)
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    firebaseConfig = JSON.parse(__firebase_config);
  } else {
    console.warn('__firebase_config non definito. Utilizzo configurazione di fallback.');
    // *** LA TUA CONFIGURAZIONE FIREBASE REALE INCOLLATA QUI ***
    firebaseConfig = {
      apiKey: "AIzaSyCsoX4zG2srDJkrDBFB1MoK1vJbk9i_rCI",
      authDomain: "azzurra-makeup.firebaseapp.com",
      projectId: "azzurra-makeup",
      storageBucket: "azzurra-makeup.firebasestorage.app",
      messagingSenderId: "349821989197",
      appId: "1:349821989197:web:4211236f861b3681230704",
      measurementId: "G-EQ58MZ7D4L"
    };
    // *** FINE CONFIGURAZIONE DI FALLBACK ***
  }

  if (typeof __app_id !== 'undefined' && __app_id) {
    appId = __app_id;
  } else {
    console.warn('__app_id non definito. Utilizzo ID app di default.');
    appId = 'default-app-id'; // Questo ID è usato per i percorsi Firestore (artifacts/{appId}/...)
  }

  if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
    initialAuthToken = __initial_auth_token;
  } else {
    console.warn('__initial_auth_token non definito. Procedo con autenticazione anonima.');
    initialAuthToken = undefined;
  }

  // Inizializza Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Autenticazione: usa il token personalizzato se disponibile, altrimenti anonima
  try {
    if (initialAuthToken) {
      await signInWithCustomToken(auth, initialAuthToken);
      console.log('Firebase: Signed in with custom token.');
    } else {
      await signInAnonymously(auth);
      console.log('Firebase: Signed in anonymously.');
    }
  } catch (error) {
    console.error('Firebase authentication failed:', error);
  }

  // Rendi 'db', 'auth' e 'appId' disponibili globalmente per i servizi
  (window as any).firebaseApp = app;
  (window as any).db = db;
  (window as any).auth = auth;
  (window as any).appId = appId;

  // Avvia l'applicazione Angular basata su moduli
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
}

initializeFirebaseAndBootstrap();
