/**
 * ISTAT ROSS 1000 - Schema di Validazione TXT
 * Versione: 4 - Data: 20/10/2022
 * 
 * Schema completo basato sul tracciato ufficiale ISTAT per la rilevazione
 * del movimento turistico negli esercizi ricettivi.
 */

export interface ROSS1000Schema {
    // Metadata
    version: '4'
    date: '20/10/2022'

    // Specifiche formato file
    fileFormat: {
        encoding: 'ASCII'
        lineEnding: '\r\n' // chr(13) + chr(10)
        recordLength: 328 // Somma di tutti i campi
        fieldCount: 26
    }

    // Definizione campi
    fields: FieldDefinition[]

    // Valori consentiti
    allowedValues: {
        tipoAlloggiato: ['16', '17', '18', '19', '20']
        sesso: ['1', '2']
        tassaSoggiorno: ['0', '1', '']
        modalita: ['1', '2', '3']
        tipoTurismo: string[]
        mezzoTrasporto: string[]
    }

    // Regole di validazione
    validationRules: ValidationRules
}

export interface FieldDefinition {
    order: number
    name: string
    length: number
    type: 'Numerico' | 'Alfanumerico'
    required: 'SI' | 'NO' | 'CONDITIONAL'
    condition?: string
    description: string
    blankFillForTypes?: string[] // Tipi alloggiato per cui deve essere blank
}

export interface ValidationRules {
    // Regole per tipo alloggiato 16, 17, 18
    types_16_17_18: {
        camereOccupate: { required: true, mustBeNumeric: true }
        camereDisponibili: { required: true, mustBeNumeric: true }
        lettiDisponibili: { required: true, mustBeNumeric: true }
    }

    // Regole per tipo alloggiato 19, 20
    types_19_20: {
        camereOccupate: { mustBeBlank: true }
        camereDisponibili: { mustBeBlank: true }
        lettiDisponibili: { mustBeBlank: true }
    }

    // Regole per modalità
    modalita: {
        nuovo: { code: '1', description: 'Nuovo inserimento o sovrascrittura' }
        variazione: { code: '2', description: 'Aggiornamento posizione esistente', requiresDataPartenza: true }
        eliminazione: { code: '3', description: 'Eliminazione posizione', onlyRequires: [1, 2, 25] }
    }

    // Regole per residenza italiana
    residenzaItalia: {
        codiceStatoResidenza: '100000100' // Codice Italia
        requiresComuneResidenza: true
        requiresSiglaProvinciaResidenza: true
    }
}

/**
 * Schema completo ROSS 1000 v.4 (20/10/2022)
 */
export const ROSS1000_SCHEMA: ROSS1000Schema = {
    version: '4',
    date: '20/10/2022',

    fileFormat: {
        encoding: 'ASCII',
        lineEnding: '\r\n',
        recordLength: 328,
        fieldCount: 26
    },

    fields: [
        {
            order: 1,
            name: 'Tipo Alloggiato',
            length: 2,
            type: 'Numerico',
            required: 'SI',
            description: '16=Ospite Singolo, 17=Capo Famiglia, 18=Capo Gruppo, 19=Famigliare, 20=Membro Gruppo'
        },
        {
            order: 2,
            name: 'Data di arrivo',
            length: 10,
            type: 'Alfanumerico',
            required: 'SI',
            description: 'Formato: gg/mm/aaaa'
        },
        {
            order: 3,
            name: 'Cognome',
            length: 50,
            type: 'Alfanumerico',
            required: 'NO',
            description: 'Riempire blank'
        },
        {
            order: 4,
            name: 'Nome',
            length: 30,
            type: 'Alfanumerico',
            required: 'NO',
            description: 'Riempire blank'
        },
        {
            order: 5,
            name: 'Sesso',
            length: 1,
            type: 'Numerico',
            required: 'SI',
            description: '1=maschio, 2=femmina'
        },
        {
            order: 6,
            name: 'Data di nascita',
            length: 10,
            type: 'Alfanumerico',
            required: 'SI',
            description: 'Formato: gg/mm/aaaa'
        },
        {
            order: 7,
            name: 'Codice comune di nascita',
            length: 9,
            type: 'Numerico',
            required: 'NO',
            description: 'Codice ISTAT comune di nascita'
        },
        {
            order: 8,
            name: 'Sigla provincia di nascita',
            length: 2,
            type: 'Alfanumerico',
            required: 'NO',
            description: 'Sigla a 2 lettere'
        },
        {
            order: 9,
            name: 'Codice stato di nascita',
            length: 9,
            type: 'Numerico',
            required: 'SI',
            description: 'Codice ISTAT stato di nascita'
        },
        {
            order: 10,
            name: 'Codice cittadinanza',
            length: 9,
            type: 'Numerico',
            required: 'SI',
            description: 'Codice ISTAT cittadinanza'
        },
        {
            order: 11,
            name: 'Codice comune di residenza',
            length: 9,
            type: 'Numerico',
            required: 'CONDITIONAL',
            condition: 'Obbligatorio se residente in Italia',
            description: 'Codice ISTAT comune di residenza'
        },
        {
            order: 12,
            name: 'Sigla provincia di residenza',
            length: 2,
            type: 'Alfanumerico',
            required: 'CONDITIONAL',
            condition: 'Obbligatorio se residente in Italia',
            description: 'Sigla a 2 lettere'
        },
        {
            order: 13,
            name: 'Codice stato di residenza',
            length: 9,
            type: 'Numerico',
            required: 'SI',
            description: 'Codice ISTAT stato di residenza'
        },
        {
            order: 14,
            name: 'Indirizzo',
            length: 50,
            type: 'Alfanumerico',
            required: 'NO',
            description: 'Riempire blank'
        },
        {
            order: 15,
            name: 'Codice tipo documento di identità',
            length: 5,
            type: 'Alfanumerico',
            required: 'NO',
            description: 'Riempire blank'
        },
        {
            order: 16,
            name: 'Numero documento di identità',
            length: 20,
            type: 'Alfanumerico',
            required: 'NO',
            description: 'Riempire blank'
        },
        {
            order: 17,
            name: 'Luogo o Stato rilascio documento',
            length: 9,
            type: 'Numerico',
            required: 'NO',
            description: 'Riempire blank'
        },
        {
            order: 18,
            name: 'Data di partenza',
            length: 10,
            type: 'Alfanumerico',
            required: 'CONDITIONAL',
            condition: 'Obbligatorio se modalità = 2 (Variazione)',
            description: 'Formato: gg/mm/aaaa'
        },
        {
            order: 19,
            name: 'Tipo Turismo',
            length: 30,
            type: 'Alfanumerico',
            required: 'SI',
            description: 'Vedi lista valori consentiti'
        },
        {
            order: 20,
            name: 'Mezzo di Trasporto',
            length: 30,
            type: 'Alfanumerico',
            required: 'SI',
            description: 'Vedi lista valori consentiti'
        },
        {
            order: 21,
            name: 'Camere occupate',
            length: 3,
            type: 'Numerico',
            required: 'CONDITIONAL',
            condition: 'Obbligatorio per tipi 16-17-18, blank per tipi 19-20',
            description: 'Numero totale camere occupate dal gruppo/famiglia',
            blankFillForTypes: ['19', '20']
        },
        {
            order: 22,
            name: 'Camere disponibili',
            length: 3,
            type: 'Numerico',
            required: 'CONDITIONAL',
            condition: 'Obbligatorio per tipi 16-17-18, blank per tipi 19-20',
            description: 'Totale camere disponibili nella struttura',
            blankFillForTypes: ['19', '20']
        },
        {
            order: 23,
            name: 'Letti disponibili',
            length: 4,
            type: 'Numerico',
            required: 'CONDITIONAL',
            condition: 'Obbligatorio per tipi 16-17-18, blank per tipi 19-20',
            description: 'Totale letti disponibili nella struttura',
            blankFillForTypes: ['19', '20']
        },
        {
            order: 24,
            name: 'Tassa soggiorno',
            length: 1,
            type: 'Numerico',
            required: 'NO',
            description: '1=sì, 0=no'
        },
        {
            order: 25,
            name: 'Codice identificativo posizione',
            length: 10,
            type: 'Alfanumerico',
            required: 'SI',
            description: 'Identificativo univoco della posizione, invariato per tutta la vita della posizione'
        },
        {
            order: 26,
            name: 'Modalità',
            length: 1,
            type: 'Numerico',
            required: 'SI',
            description: '1=Nuovo, 2=Variazione, 3=Eliminazione'
        }
    ],

    allowedValues: {
        tipoAlloggiato: ['16', '17', '18', '19', '20'],
        sesso: ['1', '2'],
        tassaSoggiorno: ['0', '1', ''],
        modalita: ['1', '2', '3'],
        tipoTurismo: [
            'Culturale',
            'Balneare',
            'Congressuale/Affari',
            'Fieristico',
            'Sportivo/Fitness',
            'Scolastico',
            'Religioso',
            'Sociale',
            'Parchi Tematici',
            'Termale/Trattamenti salute',
            'Enogastronomico',
            'Cicloturismo',
            'Escursionistico/Naturalistico',
            'Altro motivo',
            'Non Specificato'
        ],
        mezzoTrasporto: [
            'Auto',
            'Aereo',
            'Aereo+Pullman',
            'Aereo+Navetta/Taxi/Auto',
            'Aereo+Treno',
            'Treno',
            'Pullman',
            'Caravan/Autocaravan',
            'Barca/Nave/Traghetto',
            'Moto',
            'Bicicletta',
            'A piedi',
            'Altro mezzo',
            'Non Specificato'
        ]
    },

    validationRules: {
        types_16_17_18: {
            camereOccupate: { required: true, mustBeNumeric: true },
            camereDisponibili: { required: true, mustBeNumeric: true },
            lettiDisponibili: { required: true, mustBeNumeric: true }
        },
        types_19_20: {
            camereOccupate: { mustBeBlank: true },
            camereDisponibili: { mustBeBlank: true },
            lettiDisponibili: { mustBeBlank: true }
        },
        modalita: {
            nuovo: { code: '1', description: 'Nuovo inserimento o sovrascrittura' },
            variazione: { code: '2', description: 'Aggiornamento posizione esistente', requiresDataPartenza: true },
            eliminazione: { code: '3', description: 'Eliminazione posizione', onlyRequires: [1, 2, 25] }
        },
        residenzaItalia: {
            codiceStatoResidenza: '100000100',
            requiresComuneResidenza: true,
            requiresSiglaProvinciaResidenza: true
        }
    }
}

/**
 * Calcola la lunghezza totale attesa del record
 */
export const EXPECTED_RECORD_LENGTH = ROSS1000_SCHEMA.fields.reduce(
    (sum, field) => sum + field.length,
    0
)
