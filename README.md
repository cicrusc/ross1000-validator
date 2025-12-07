# 🚀 ROSS 1000 Validator - GitHub Pages Edition

Applicazione web statica per la validazione e formattazione di file ROSS 1000 secondo le specifiche ISTAT. Completamente client-side, funziona direttamente nel browser senza bisogno di server.

## 📋 Descrizione del Progetto

Questa applicazione permette agli operatori turistici (alberghi, strutture ricettive) di:
- **Caricare e validare** file TXT nel formato ROSS 1000
- **Correggere errori** in tempo reale attraverso un'interfaccia user-friendly
- **Scaricare file TXT corretti** conformi alle specifiche ISTAT
- **Visualizzare errori** con feedback immediato

**Caratteristiche:**
- ✅ Funziona completamente offline (dopo il primo caricamento)
- ✅ Nessun dato viene inviato a server esterni
- ✅ Privacy garantita - tutto elaborato nel browser
- ✅ Deployment gratuito su GitHub Pages

## ✨ Funzionalità Principali

### 🔍 Validazione Dati
- **Parsing intelligente** dei file ROSS 1000 (formato fisso 128 caratteri)
- **Validazione campi obbligatori** secondo specifiche ISTAT
- **Rilevamento automatico errori** di formato e dati mancanti
- **Interfaccia tabulata** per visualizzare record validi e invalidi separatamente

### ✏️ Correzione Inline
- **Editor integrato** per modificare record direttamente nella tabella
- **Validazione in tempo reale** durante la modifica
- **Feedback visivo** immediato su validità dei dati
- **Salvataggio automatico** delle correzioni

### 📥 Download File Corretti
- **Download immediato** file TXT validi
- **Download separato** file con solo errori (per revisione)
- **Generazione client-side** senza upload a server
- **Formato conforme** alle specifiche ROSS 1000

### 🎨 Interfaccia Utente Moderna
- **Design responsive** con Tailwind CSS
- **Componenti accessibili** con shadcn/ui
- **Tema chiaro/scuro** integrato
- **Notifiche toast** per feedback immediato
- **Esperienza utente fluida** e intuitiva

## 🛠️ Stack Tecnologico

### 🎯 Framework Core
- **⚡ Next.js 15** - Framework React con static export per GitHub Pages
- **📘 TypeScript 5** - JavaScript tipizzato per migliore developer experience
- **🎨 Tailwind CSS 4** - Framework CSS utility-first per UI rapido

### 🧩 Componenti UI
- **🧩 shadcn/ui** - Componenti accessibili basati su Radix UI
- **🎯 Lucide React** - Libreria icone consistente e moderna
- **🌈 Framer Motion** - Animazioni fluide per React
- **🎨 Next Themes** - Supporto tema chiaro/scuro

### 📋 Form e Validazione
- **🎯 React Hook Form** - Gestione form performante
- **✅ Zod** - Schema validation TypeScript-first per regole ROSS 1000

### 🔄 State Management
- **🐻 Zustand** - State management semplice e scalabile
- **📊 TanStack Table** - Tabelle interattive per visualizzazione dati

### 🌍 Utilità
- **📅 date-fns** - Manipolazione date JavaScript moderna
- **🔧 clsx** - Utility per gestione classi CSS condizionali

## 📍 Prerequisiti

Prima di iniziare, assicurati di avere installato:

- **Node.js** versione 18.0 o superiore
- **npm** versione 8.0 o superiore

### Verifica Installazione
```bash
node --version
npm --version
```

## 🚀 Installazione e Utilizzo Locale

1. **Clona il repository**
   ```bash
   git clone <repository-url>
   cd progetto-istat
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Avvia in modalità sviluppo**
   ```bash
   npm run dev
   ```
   L'applicazione sarà disponibile su `http://localhost:3000`

4. **Build per produzione (GitHub Pages)**
   ```bash
   npm run build
   ```
   I file statici verranno generati nella cartella `out/`

## 📜 Utilizzo

### Flusso di Lavoro

1. **Caricamento File**
   - Clicca su "Carica File ROSS 1000"
   - Seleziona un file TXT nel formato ROSS 1000 (128 caratteri per riga)
   - Attendi la validazione automatica

2. **Visualizzazione Risultati**
   - **Tab "Record Corretti"**: visualizza tutti i record validi
   - **Tab "Errori"**: visualizza record con problemi
   - Ogni errore mostra dettagli specifici per facilitare la correzione

3. **Correzione Errori** (opzionale)
   - Clicca sull'icona "✏️" per modificare un record
   - Correggi i campi problematici
   - Salva le modifiche
   - Il record viene rivalidato automaticamente

4. **Download File**
   - **"Download Record Corretti"**: scarica solo i record validi
   - **"Download Record con Errori"**: scarica solo i record problematici per revisione
   - I file vengono generati istantaneamente senza upload a server

## 📁 Struttura del Progetto

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Stili globali
│   ├── layout.tsx         # Layout principale
│   └── page.tsx           # Pagina principale validazione
├── components/            # Componenti React riutilizzabili
│   └── ui/               # Componenti shadcn/ui
└── lib/                  # Utilità e configurazioni
    └── utils.ts          # Funzioni helper
```

## 🚀 Deployment su GitHub Pages

### Preparazione Repository

1. **Crea repository su GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TUO-USERNAME/ross1000-validator.git
   git push -u origin main
   ```

2. **Verifica `next.config.ts`**
   ```typescript
   const nextConfig: NextConfig = {
     output: 'export',  // ← Essenziale per GitHub Pages
   };
   ```

3. **Build il progetto**
   ```bash
   npm run build
   ```
   Questo genera la cartella `out/` con i file statici

### Configurazione GitHub Pages

1. Vai su **Settings** → **Pages** nel tuo repository
2. In **Source**, seleziona:
   - **Branch**: `main`
   - **Folder**: `/root` (o crea un branch `gh-pages` con la cartella `out/`)
3. Clicca **Save**

### Deployment Automatico (GitHub Actions)

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v2
        with:
          path: ./out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v2
        id: deployment
```

### Accesso all'App

Dopo il deployment, l'app sarà disponibile su:
```
https://TUO-USERNAME.github.io/ross1000-validator/
```

## 🐛 Risoluzione Problemi

### Build Fallito
```bash
# Pulisci cache e riprova
rm -rf .next out node_modules
npm install
npm run build
```

### Pagina 404 su GitHub Pages
- Verifica che `output: 'export'` sia in `next.config.ts`
- Controlla che la cartella `out/` sia stata creata
- Assicurati di aver configurato correttamente GitHub Pages Settings

### File Non Si Scaricano
- Verifica la console browser per errori JavaScript
- Assicurati che il browser supporti Blob API (tutti i browser moderni)

## 🔒 Privacy e Sicurezza

**Vantaggi della Versione Statica:**
- ✅ **Privacy totale**: nessun dato lascia il browser
- ✅ **Nessun server**: nessun rischio di attacchi server-side
- ✅ **Audit trail**: tutto il codice è open source e verificabile
- ✅ **Offline-first**: funziona anche senza connessione internet

## 🤝 Contributi

Per contribuire al progetto:

1. Fork del repository
2. Crea un branch (`git checkout -b feature/nuova-feature`)
3. Commit delle modifiche (`git commit -am 'Aggiunta nuova feature'`)
4. Push del branch (`git push origin feature/nuova-feature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT.

## 📞 Supporto

Per problemi o domande:
- Controlla la documentazione in questo README
- Apri una [issue su GitHub](https://github.com/TUO-USERNAME/ross1000-validator/issues)
- Consulta la console browser per errori

---

**Sviluppato con ❤️ per il sistema informativo turistico italiano**
