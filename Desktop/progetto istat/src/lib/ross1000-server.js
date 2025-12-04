// ============================================
// BACKEND API SERVER per ROSS 1000
// File: src/lib/ross1000-server.js
// ============================================

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());
app.use(cors());

// Configurazione
const JWT_SECRET = process.env.JWT_SECRET || 'ross1000-secret-key-change-in-production';
const PORT = process.env.ROSS_API_PORT || 3001;

// Database simulato - in produzione usa PostgreSQL/MongoDB
let users = [
  {
    id: 1,
    email: 'demo@hotel.com',
    passwordHash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
    codiceStruttura: '840',
    regione: 'lombardia',
    ross1000Username: 'demo_user',
    ross1000Password: 'demo_pass',
    nomeStruttura: 'Hotel Demo'
  }
];

let inviiLog = [];

// ============================================
// MIDDLEWARE DI AUTENTICAZIONE
// ============================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token mancante' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token non valido' });
    }
    req.user = user;
    next();
  });
}

// ============================================
// ENDPOINT: HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'ROSS 1000 API Server'
  });
});

// ============================================
// ENDPOINT: LOGIN
// ============================================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password sono obbligatorie' });
    }

    // Trova utente
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    // Verifica password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    // Genera JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        codiceStruttura: user.codiceStruttura,
        regione: user.regione
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      token,
      user: {
        email: user.email,
        codiceStruttura: user.codiceStruttura,
        regione: user.regione,
        nomeStruttura: user.nomeStruttura
      }
    });

  } catch (error) {
    console.error('Errore login:', error);
    res.status(500).json({ error: 'Errore durante il login' });
  }
});

// ============================================
// ENDPOINT: VERIFICA TOKEN
// ============================================

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'Utente non trovato' });
  }

  res.json({
    success: true,
    user: {
      email: user.email,
      codiceStruttura: user.codiceStruttura,
      regione: user.regione,
      nomeStruttura: user.nomeStruttura
    }
  });
});

// ============================================
// ENDPOINT: INVIO MOVIMENTAZIONE
// ============================================

app.post('/api/ross1000/invia', authenticateToken, async (req, res) => {
  try {
    const { xmlMovimenti } = req.body;
    
    if (!xmlMovimenti) {
      return res.status(400).json({ error: 'XML movimenti obbligatorio' });
    }

    // Recupera credenziali ROSS 1000 dell'utente
    const user = users.find(u => u.id === req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    console.log(`Invio movimentazione per utente: ${user.email}, struttura: ${user.codiceStruttura}`);

    // Chiama API ROSS 1000
    const result = await inviaMovimentazioneROSS1000(
      user.regione,
      user.ross1000Username,
      user.ross1000Password,
      xmlMovimenti
    );

    // Log dell'operazione
    const logEntry = {
      id: inviiLog.length + 1,
      userId: user.id,
      timestamp: new Date(),
      success: result.success,
      status: result.status,
      response: result,
      xmlSent: xmlMovimenti.substring(0, 500) + '...' // Log troncato per sicurezza
    };
    
    inviiLog.push(logEntry);
    console.log('Log invio:', logEntry);

    res.json({
      success: result.success,
      status: result.status,
      statusText: result.statusText,
      timestamp: result.timestamp,
      logId: logEntry.id
    });
    
  } catch (error) {
    console.error('Errore invio ROSS 1000:', error);
    res.status(500).json({ 
      success: false,
      error: 'Errore durante l\'invio',
      message: error.message 
    });
  }
});

// ============================================
// ENDPOINT: STORICO INVII
// ============================================

app.get('/api/ross1000/storico', authenticateToken, (req, res) => {
  try {
    const userInvii = inviiLog.filter(log => log.userId === req.user.userId);
    
    res.json({
      success: true,
      invii: userInvii.map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        success: log.success,
        status: log.status
      }))
    });
  } catch (error) {
    console.error('Errore recupero storico:', error);
    res.status(500).json({ error: 'Errore durante il recupero storico' });
  }
});

// ============================================
// FUNZIONE: INVIO A ROSS 1000 (BACKEND)
// ============================================

async function inviaMovimentazioneROSS1000(regione, username, password, xmlMovimenti) {
  const endpoints = {
    lombardia: 'https://www.flussituristici.servizirl.it/Turismo5/app/ws/checkinV2',
    veneto: 'https://flussituristici.regione.veneto.it/ws/checkinV2',
    piemonte: 'https://flussituristici.regione.piemonte.it/ws/checkinV2',
    liguria: 'https://turismo.regione.liguria.it/ws/checkinV2',
    emiliaromagna: 'https://servizi.turismo.regione.emr.it/ws/checkinV2',
    toscana: 'https://turismo.regione.toscana.it/ws/checkinV2',
    umbria: 'https://turismo.regione.umbria.it/ws/checkinV2',
    marche: 'https://turismo.regione.marche.it/ws/checkinV2',
    lazio: 'https://turismo.regione.lazio.it/ws/checkinV2',
    abruzzo: 'https://turismo.regione.abruzzo.it/ws/checkinV2',
    molise: 'https://turismo.regione.molise.it/ws/checkinV2',
    campania: 'https://turismo.regione.campania.it/ws/checkinV2',
    puglia: 'https://turismo.regione.puglia.it/ws/checkinV2',
    basilicata: 'https://turismo.regione.basilicata.it/ws/checkinV2',
    calabria: 'https://turismo.regione.calabria.it/ws/checkinV2',
    sicilia: 'https://turismo.regione.sicilia.it/ws/checkinV2',
    sardegna: 'https://turismo.regione.sardegna.it/ws/checkinV2',
    trentino: 'https://turismo.provincia.tn.it/ws/checkinV2',
    bolzano: 'https://turismo.provincia.bz.it/ws/checkinV2',
    valdaosta: 'https://turismo.regione.vda.it/ws/checkinV2',
    friuliveneziagiulia: 'https://turismo.regione.fvg.it/ws/checkinV2'
  };

  const endpoint = endpoints[regione.toLowerCase()];
  if (!endpoint) {
    throw new Error(`Regione non supportata: ${regione}`);
  }

  // Rimuovi dichiarazione XML
  const cleanXml = xmlMovimenti.replace(/<\?xml[^?]*\?>/g, '').trim();
  
  // Crea SOAP envelope
  const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
  <S:Body>
    <ns2:inviaMovimentazione xmlns:ns2="http://checkin.ws.service.turismo5.gies.it/">
      <movimentazione>${cleanXml}</movimentazione>
    </ns2:inviaMovimentazione>
  </S:Body>
</S:Envelope>`;

  // Autenticazione Basic
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');

  console.log(`Invio a ${endpoint} per regione ${regione}`);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Authorization': `Basic ${credentials}`,
        'SOAPAction': '""',
      },
      body: soapEnvelope,
      timeout: 30000 // 30 secondi timeout
    });

    const responseText = await response.text();

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      responseText: responseText,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Errore chiamata API ROSS 1000:', error);
    return {
      success: false,
      status: 0,
      statusText: 'Network Error',
      responseText: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================
// AVVIO SERVER
// ============================================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 ROSS 1000 API Server in ascolto sulla porta ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
    console.log(`📤 Invio endpoint: http://localhost:${PORT}/api/ross1000/invia`);
    
    // Credenziali demo:
    console.log(`👤 Demo credentials: demo@hotel.com / password`);
  });
}

export default app;