// ROSS 1000 Field definitions according to Tracciato Record di integrazione dati (v.4 – 20/10/2022)
// Note: Codice Italia = '000' secondo le tabelle ufficiali ISTAT
export const ROSS_FIELDS = [
    { id: 1, name: 'Tipo Alloggiato', length: 2, type: 'numeric', required: true, category: 'identification' },
    { id: 2, name: 'Data Arrivo', length: 10, type: 'alphanumeric', required: true, category: 'dates' },
    { id: 3, name: 'Cognome', length: 50, type: 'alphanumeric', required: false, category: 'personal', blank: true },
    { id: 4, name: 'Nome', length: 30, type: 'alphanumeric', required: false, category: 'personal', blank: true },
    { id: 5, name: 'Sesso', length: 1, type: 'numeric', required: true, category: 'personal' },
    { id: 6, name: 'Data Nascita', length: 10, type: 'alphanumeric', required: true, category: 'personal' },
    { id: 7, name: 'Codice Comune Nascita', length: 9, type: 'numeric', required: false, category: 'birth' },
    { id: 8, name: 'Sigla Provincia Nascita', length: 2, type: 'alphanumeric', required: false, category: 'birth' },
    { id: 9, name: 'Codice Stato Nascita', length: 9, type: 'numeric', required: true, category: 'birth' },
    { id: 10, name: 'Codice Cittadinanza', length: 9, type: 'numeric', required: true, category: 'citizenship' },
    { id: 11, name: 'Codice Comune Residenza', length: 9, type: 'numeric', required: 'conditional', category: 'residence' },
    { id: 12, name: 'Sigla Provincia Residenza', length: 2, type: 'alphanumeric', required: 'conditional', category: 'residence' },
    { id: 13, name: 'Codice Stato Residenza', length: 9, type: 'numeric', required: true, category: 'residence' },
    { id: 14, name: 'Indirizzo', length: 50, type: 'alphanumeric', required: false, category: 'residence', blank: true },
    { id: 15, name: 'Codice Tipo Documento', length: 5, type: 'alphanumeric', required: false, category: 'document', blank: true },
    { id: 16, name: 'Numero Documento', length: 20, type: 'alphanumeric', required: false, category: 'document', blank: true },
    { id: 17, name: 'Luogo Rilascio Doc', length: 9, type: 'numeric', required: false, category: 'document', blank: true },
    { id: 18, name: 'Data Partenza', length: 10, type: 'alphanumeric', required: 'conditional', category: 'dates' },
    { id: 19, name: 'Tipo Turismo', length: 30, type: 'alphanumeric', required: true, category: 'tourism' },
    { id: 20, name: 'Mezzo Trasporto', length: 30, type: 'alphanumeric', required: true, category: 'transport' },
    { id: 21, name: 'Camere Occupate', length: 3, type: 'numeric', required: 'conditional', category: 'accommodation' },
    { id: 22, name: 'Camere Disponibili', length: 3, type: 'numeric', required: 'conditional', category: 'accommodation' },
    { id: 23, name: 'Letti Disponibili', length: 4, type: 'numeric', required: 'conditional', category: 'accommodation' },
    { id: 24, name: 'Tassa Soggiorno', length: 1, type: 'numeric', required: false, category: 'fees' },
    { id: 25, name: 'Codice Identificativo Posizione', length: 10, type: 'alphanumeric', required: true, category: 'identification' },
    { id: 26, name: 'Modalità', length: 1, type: 'numeric', required: true, category: 'identification' }
]

export const TIPOLOGIA_TURISMO = [
    'Culturale', 'Balneare', 'Congressuale/Affari', 'Fieristico', 'Sportivo/Fitness',
    'Scolastico', 'Religioso', 'Sociale', 'Parchi Tematici', 'Termale/Trattamenti salute',
    'Enogastronomico', 'Cicloturismo', 'Escursionistico/Naturalistico', 'Altro motivo', 'Non Specificato'
]

export const MEZZI_TRASPORTO = [
    'Auto', 'Aereo', 'Aereo+Pullman', 'Aereo+Navetta/Taxi/Auto', 'Aereo+Treno', 'Treno',
    'Pullman', 'Caravan/Autocaravan', 'Barca/Nave/Traghetto', 'Moto', 'Bicicletta',
    'A piedi', 'Altro mezzo', 'Non Specificato'
]

export const TIPO_ALLOGGIATO = [
    { value: '16', label: 'Ospite Singolo' },
    { value: '17', label: 'Capo Famiglia' },
    { value: '18', label: 'Capo Gruppo' },
    { value: '19', label: 'Familiare' },
    { value: '20', label: 'Membro Gruppo' }
]

// Elenco delle regioni italiane
export const regioni = [
    { value: '', label: 'Seleziona regione...' },
    { value: 'abruzzo', label: 'Abruzzo' },
    { value: 'basilicata', label: 'Basilicata' },
    { value: 'calabria', label: 'Calabria' },
    { value: 'campania', label: 'Campania' },
    { value: 'emilia-romagna', label: 'Emilia-Romagna' },
    { value: 'friuli-venezia-giulia', label: 'Friuli-Venezia Giulia' },
    { value: 'lazio', label: 'Lazio' },
    { value: 'liguria', label: 'Liguria' },
    { value: 'lombardia', label: 'Lombardia' },
    { value: 'marche', label: 'Marche' },
    { value: 'molise', label: 'Molise' },
    { value: 'piemonte', label: 'Piemonte' },
    { value: 'puglia', label: 'Puglia' },
    { value: 'sardegna', label: 'Sardegna' },
    { value: 'sicilia', label: 'Sicilia' },
    { value: 'toscana', label: 'Toscana' },
    { value: 'trentino-alto-adige', label: 'Trentino-Alto Adige' },
    { value: 'umbria', label: 'Umbria' },
    { value: "valle-d'aosta", label: "Valle d'Aosta" },
    { value: 'veneto', label: 'Veneto' }
]
