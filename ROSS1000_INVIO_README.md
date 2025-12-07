# 🚀 ROSS 1000 Invio Automatico

## 📋 **Panoramica**

Il sistema ora include un componente per l'invio automatico delle movimentazioni ROSS 1000 direttamente alle API regionali. Il sistema è sicuro, con autenticazione JWT e gestione multi-tenant.

## 🏗️ **Architettura**

```
[Frontend React] → [Backend API Server] → [API ROSS 1000 Regionali]
```

### **Componenti:**
1. **Frontend**: Componente React `Ross1000Sender` per login e invio
2. **Backend**: Server Node.js/Express per autenticazione e proxy sicuro
3. **Sicurezza**: JWT, credenziali criptate, audit log

## 🚀 **Avvio del Sistema**

### **1. Avvia il Server API**

```bash
# Metodo 1: Script dedicato
./start-ross-api.sh

# Metodo 2: NPM diretto
npm start

# Metodo 3: Sviluppo con auto-reload
npm run dev
```

Il server si avvierà su `http://localhost:3001`

### **2. Avvia l'Applicazione Principale**

```bash
npm run dev
```

L'applicazione principale sarà su `http://localhost:3000`

## 🔐 **Credenziali Demo**

Per testare il sistema, usa queste credenziali:

- **Email**: `demo@hotel.com`
- **Password**: `password`
- **Struttura**: Hotel Demo
- **Codice**: 840
- **Regione**: Lombardia

## 📖 **Utilizzo**

### **Flusso di Lavoro:**

1. **Carica e valida i file TXT** ROSS 1000
2. **Correggi gli errori** nell'interfaccia di validazione
3. **Genera l'XML** cliccando su "Genera XML"
4. **Accedi al sistema** di invio con le credenziali
5. **Invia a ROSS 1000** con il pulsante dedicato

### **Passo Passo:**

#### **1. Validazione Dati**
- Carica un file TXT ROSS 1000
- Correggi tutti gli errori evidenziati in rosso
- Assicurati che tutti i record siano nella scheda "Record Corretti"

#### **2. Generazione XML**
- Vai nella scheda "Record Corretti"
- Clicca su "Genera XML" (centrato in alto)
- Il file XML verrà scaricato e salvato nel sistema

#### **3. Invio a ROSS 1000**
- Dopo la generazione XML, apparirà il componente "Invio a ROSS 1000"
- Clicca su "Accedi" e inserisci le credenziali
- Clicca su "Invia Movimentazione a ROSS 1000"
- Attendi il feedback dell'invio

## 🔧 **Configurazione Produzione**

### **Variabili Ambiente**

Crea un file `.env` nella root del progetto:

```env
# Server API
ROSS_API_PORT=3001
JWT_SECRET=your-super-secret-key-change-this-in-production

# Database (quando implementato)
DATABASE_URL=postgresql://user:pass@localhost/ross1000
```

### **Aggiunta Nuovi Hotel**

Per aggiungere un nuovo hotel al sistema:

1. **Modifica il file `src/lib/ross1000-server.js`**
2. **Aggiungi un nuovo utente nell'array `users`:**

```javascript
{
  id: 2,
  email: 'hotel2@example.com',
  passwordHash: '$2b$10$...', // bcrypt hash della password
  codiceStruttura: '841',
  regione: 'veneto',
  ross1000Username: 'username_reale',
  ross1000Password: 'password_reale',
  nomeStruttura: 'Hotel Secondario'
}
```

### **Generazione Password Hash**

```javascript
const bcrypt = require('bcrypt');
const password = 'tua-password';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
```

## 🌍 **Regioni Supportate**

Il sistema supporta tutte le regioni italiane:

- Lombardia, Veneto, Piemonte, Liguria
- Emilia-Romagna, Toscana, Umbria, Marche
- Lazio, Abruzzo, Molise, Campania
- Puglia, Basilicata, Calabria, Sicilia, Sardegna
- Trentino, Bolzano, Valle d'Aosta, Friuli-Venezia Giulia

## 📊 **Monitoraggio e Logging**

### **Log Server**
Il server API genera log per:
- Tentativi di login (successo/fallimento)
- Invii movimentazioni (successo/fallimento)
- Errori di connessione alle API ROSS 1000

### **Storico Invii**
Gli utenti possono visualizzare il loro storico invii:
- Data e ora dell'invio
- Status HTTP della risposta
- Esito (successo/fallimento)

## 🔒 **Sicurezza**

### **Misure di Sicurezza:**
- ✅ **JWT Token** con scadenza 8 ore
- ✅ **Password criptate** con bcrypt
- ✅ **Credenziali ROSS 1000** mai esposte al client
- ✅ **Proxy server** per chiamate API
- ✅ **Audit log** completo
- ✅ **CORS configurato** per domini autorizzati

### **Best Practice:**
1. **Cambia il JWT_SECRET** in produzione
2. **Usa HTTPS** in produzione
3. **Implementa rate limiting**
4. **Usa variabili ambiente** per dati sensibili
5. **Monita i log** per attività sospette

## 🐛 **Troubleshooting**

### **Problemi Comuni:**

#### **1. Server non parte**
```bash
# Controlla le dipendenze
npm install

# Verifica che la porta 3001 sia libera
lsof -i :3001
```

#### **2. Login fallito**
- Verifica email e password
- Controlla che il server API sia attivo
- Controlla la console del browser per errori

#### **3. Invio fallito**
- Verifica le credenziali ROSS 1000
- Controlla la connessione a internet
- Verifica che l'XML sia stato generato correttamente

#### **4. Errori CORS**
- Assicurati che il frontend sia su `http://localhost:3000`
- Verifica la configurazione CORS nel server

## 📞 **Supporto**

Per problemi o domande:
1. Controlla i log del server API
2. Verifica la console del browser
3. Controlla la rete del browser per chiamate API fallite

---

## 🎯 **Prossimi Passi**

### **Enhancements Futuri:**
- [ ] Database PostgreSQL per gestione utenti
- [ ] Interfaccia admin per gestione hotel
- [ ] Invii batch multipli
- [ ] Notifiche email per esiti
- [ ] Dashboard statistiche
- [ ] Gestione automatica retry
- [ ] Supporto multi-file

---

**Sviluppato con ❤️ per il sistema ROSS 1000**