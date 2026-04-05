/**
 * Script per analizzare i record e identificare quali la UI marca come invalidi
 * Usa la stessa logica di validazione dell'UI
 */

import { readFileSync } from 'fs';

const ROSS_FIELDS = [
    { id: 1, name: 'Tipo Alloggiato', length: 2, required: true },
    { id: 2, name: 'Data Arrivo', length: 10, required: true },
    { id: 3, name: 'Cognome', length: 50, required: false },
    { id: 4, name: 'Nome', length: 30, required: false },
    { id: 5, name: 'Sesso', length: 1, required: true },
    { id: 6, name: 'Data Nascita', length: 10, required: true },
    { id: 7, name: 'Codice Comune Nascita', length: 9, required: false },
    { id: 8, name: 'Sigla Provincia Nascita', length: 2, required: false },
    { id: 9, name: 'Codice Stato Nascita', length: 9, required: true },
    { id: 10, name: 'Codice Cittadinanza', length: 9, required: true },
    { id: 11, name: 'Codice Comune Residenza', length: 9, required: 'conditional' },
    { id: 12, name: 'Sigla Provincia Residenza', length: 2, required: 'conditional' },
    { id: 13, name: 'Codice Stato Residenza', length: 9, required: true },
    { id: 14, name: 'Documento Identificativo', length: 20, required: false },
    { id: 15, name: 'Luogo Rilascio Documento', length: 9, required: false },
    { id: 16, name: 'Codice Stato Rilascio Documento', length: 9, required: false },
    { id: 17, name: 'Numero Documento', length: 20, required: false },
    { id: 18, name: 'Data Partenza', length: 10, required: 'conditional' },
    { id: 19, name: 'Tipo Turismo', length: 30, required: true },
    { id: 20, name: 'Mezzo Trasporto', length: 30, required: true },
    { id: 21, name: 'Camere Occupate', length: 3, required: 'conditional' },
    { id: 22, name: 'Camere Disponibili', length: 4, required: 'conditional' },
    { id: 23, name: 'Letti Disponibili', length: 4, required: 'conditional' },
    { id: 24, name: 'Tassa Soggiorno', length: 1, required: false },
    { id: 25, name: 'Codice Identificativo Posizione', length: 10, required: true },
    { id: 26, name: 'Modalità', length: 1, required: true }
];

// Leggi il file
const filePath = 'C:\\Users\\rodav\\Desktop\\AvaiBook\\projects\\Istat\\ROSS1000_840-841_AGOSTO_ISTAT_2025-09-09.txt';
const content = readFileSync(filePath, 'utf-8');
const records = content.split('\r\n').filter(line => line.length > 0);

console.log(`Total records: ${records.length}\n`);

records.forEach((record, index) => {
    const recordNum = index + 1;
    let position = 0;
    const fields: any = {};

    // Estrai campi
    ROSS_FIELDS.forEach(fieldDef => {
        const value = record.substring(position, position + fieldDef.length);
        fields[fieldDef.id] = value.trim();
        position += fieldDef.length;
    });

    // Validazione UI
    const errors: string[] = [];

    // Campo 11 e 12: obbligatori se residente in Italia
    const statoResidenza = fields[13];
    const isResidenteItalia = statoResidenza === '100000100' || statoResidenza.startsWith('000');

    if (isResidenteItalia) {
        if (!fields[11]) {
            errors.push('Campo 11 (Comune Residenza) vuoto per residente Italia');
        }
        if (!fields[12]) {
            errors.push('Campo 12 (Provincia Residenza) vuota per residente Italia');
        }
    }

    // Campi 21, 22, 23: obbligatori per tipo 16, 17, 18
    const tipoAlloggiato = fields[1];
    if (['16', '17', '18'].includes(tipoAlloggiato)) {
        if (!fields[21]) errors.push('Campo 21 (Camere Occupate) vuoto');
        if (!fields[22]) errors.push('Campo 22 (Camere Disponibili) vuoto');
        if (!fields[23]) errors.push('Campo 23 (Letti Disponibili) vuoto');
    }

    // Campo 18: obbligatorio se modalità = 2
    if (fields[26] === '2' && !fields[18]) {
        errors.push('Campo 18 (Data Partenza) vuoto per modalità 2');
    }

    if (errors.length > 0) {
        console.log(`\n❌ Record ${recordNum} - INVALID`);
        console.log(`   Tipo: ${tipoAlloggiato}, Modalità: ${fields[26]}, Stato Res: ${statoResidenza}`);
        console.log(`   Campo 11: "${fields[11]}", Campo 12: "${fields[12]}"`);
        console.log(`   Campo 21: "${fields[21]}", Campo 22: "${fields[22]}", Campo 23: "${fields[23]}"`);
        errors.forEach(err => console.log(`   - ${err}`));
    }
});
