# 🚀 Guida Deployment GitHub Pages - ROSS 1000 Validator

## ✅ Checklist Pre-Deployment

Tutto è pronto! Verifica che:
- ✅ `next.config.ts` ha `output: 'export'`
- ✅ Cartella `out/` è stata generata con il build
- ✅ File `.github/workflows/deploy.yml` è stato creato
- ✅ `.gitignore` NON ignora la cartella `out/`

## 📋 Prossimi Passi

### Opzione A: Deployment Automatico con GitHub Actions (Consigliato)

Questo metodo farà il deployment automatico ogni volta che fai push su `main`.

1. **Inizializza Git (se non già fatto)**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - GitHub Pages ready"
   ```

2. **Crea repository su GitHub**
   - Vai su https://github.com/new
   - Nome repository: `ross1000-validator` (o il nome che preferisci)
   - **NON** selezionare "Add README" o ".gitignore"
   - Clicca "Create repository"

3. **Collega e Push**
   ```bash
   git branch -M main
   git remote add origin https://github.com/TUO-USERNAME/ross1000-validator.git
   git push -u origin main
   ```

4. **Configura GitHub Pages**
   - Vai su **Settings** → **Pages** nel tuo repository
   - In **Source**, seleziona:
     - **Source**: GitHub Actions
   - La Action si avvierà automaticamente

5. **Attendi il Deployment**
   - Vai alla tab **Actions** per vedere il progresso
   - Dopo 2-3 minuti, l'app sarà live su:
     ```
     https://TUO-USERNAME.github.io/ross1000-validator/
     ```

### Opzione B: Deployment Manuale (Alternativa)

Se preferisci non usare GitHub Actions:

1. **Crea branch gh-pages**
   ```bash
   git checkout --orphan gh-pages
   git rm -rf .
   ```

2. **Copia contenuto di out/**
   ```bash
   xcopy /E /I ..\out\* .
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push -u origin gh-pages
   ```

3. **Configura GitHub Pages**
   - Settings → Pages
   - Source: Deploy from branch
   - Branch: `gh-pages` / `/ (root)`

## 🔍 Verifica Locale Prima del Deploy

Testa il build statico localmente:

```bash
# Installa un server statico
npm install -g serve

# Avvia il server sulla cartella out/
serve -s out -p 3000
```

Apri http://localhost:3000 e verifica che tutto funzioni.

## 🐛 Risoluzione Problemi

### Build Fallito su GitHub Actions
- Controlla i log nella tab **Actions**
- Verifica che `package.json` non abbia dependency mancanti
- Assicurati che `next.config.ts` abbia `output: 'export'`

### Pagina 404
- Verifica che GitHub Pages sia configurato su **GitHub Actions** come source
- Controlla che il workflow sia completato con successo
- Attendi qualche minuto per la propagazione

### CSS/JS Non Caricati
- Se usi un nome repository custom, potrebbe servire `basePath` in `next.config.ts`:
  ```typescript
  const nextConfig = {
    output: 'export',
    basePath: '/repository-name',
  };
  ```

## 🎉 Deployment Completato

Una volta live, condividi il link:
```
https://TUO-USERNAME.github.io/ross1000-validator/
```

L'applicazione:
- ✅ Funziona completamente offline
- ✅ Non invia dati a server esterni
- ✅ È gratuita da mantenere
- ✅ Si aggiorna automaticamente ad ogni push

## 📝 Aggiornamenti Futuri

Per aggiornare l'app:
```bash
# Fai modifiche al codice
git add .
git commit -m "Descrizione modifiche"
git push

# GitHub Actions farà il rebuild e deployment automatico!
```

---

**Buon deployment! 🚀**
