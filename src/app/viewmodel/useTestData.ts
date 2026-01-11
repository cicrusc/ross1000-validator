import { RossRecord } from '../model/types'

export const generateTestData = (): RossRecord[] => {
    const testRecords: RossRecord[] = [
        // Record 1: Ospite Singolo senza camere (dovrebbe essere errore)
        {
            field_1: '16'.padEnd(2, ' '),
            field_2: '01/01/2024',
            field_3: ' '.repeat(50),
            field_4: ' '.repeat(30),
            field_5: '1',
            field_6: '15/01/1990',
            field_7: ' '.repeat(9),
            field_8: ' '.repeat(2),
            field_9: '000', // Codice corretto per l'Italia
            field_10: '000', // Codice corretto per l'Italia
            field_11: ' '.repeat(9), // Dovrebbe essere errore: cittadino italiano senza comune residenza
            field_12: ' '.repeat(2), // Dovrebbe essere errore: cittadino italiano senza provincia
            field_13: '000', // Codice corretto per l'Italia
            field_14: ' '.repeat(50),
            field_15: ' '.repeat(5),
            field_16: ' '.repeat(20),
            field_17: ' '.repeat(9),
            field_18: ' '.repeat(10),
            field_19: 'Non Specificato'.padEnd(30, ' '),
            field_20: 'Non Specificato'.padEnd(30, ' '),
            field_21: ' '.repeat(3), // Dovrebbe essere errore: tipo 16 richiede camere occupate
            field_22: ' '.repeat(3), // Dovrebbe essere errore: tipo 16 richiede camere disponibili
            field_23: ' '.repeat(4), // Dovrebbe essere errore: tipo 16 richiede letti disponibili
            field_24: ' '.repeat(1),
            field_25: '1234567890',
            field_26: '1'
        },
        // Record 2: Cittadino straniero con dati incompleti
        {
            field_1: '17',
            field_2: '02/01/2024',
            field_3: ' '.repeat(50),
            field_4: ' '.repeat(30),
            field_5: '2',
            field_6: '20/02/1985',
            field_7: ' '.repeat(9),
            field_8: ' '.repeat(2),
            field_9: '987654321',
            field_10: '987654321', // Cittadinanza straniera
            field_11: ' '.repeat(9), // OK per cittadino straniero
            field_12: ' '.repeat(2), // OK per cittadino straniero
            field_13: '987654321',
            field_14: ' '.repeat(50),
            field_15: ' '.repeat(5),
            field_16: ' '.repeat(20),
            field_17: ' '.repeat(9),
            field_18: ' '.repeat(10),
            field_19: 'Non Specificato'.padEnd(30, ' '),
            field_20: 'Non Specificato'.padEnd(30, ' '),
            field_21: ' '.repeat(3), // Dovrebbe essere errore: tipo 17 richiede camere occupate
            field_22: ' '.repeat(3), // Dovrebbe essere errore: tipo 17 richiede camere disponibili
            field_23: ' '.repeat(4), // Dovrebbe essere errore: tipo 17 richiede letti disponibili
            field_24: ' '.repeat(1),
            field_25: '0987654321',
            field_26: '2' // Variazione senza data partenza - dovrebbe essere errore
        },
        // Record 3: Familiare con camere compilati (dovrebbe essere errore)
        {
            field_1: '19',
            field_2: '03/01/2024',
            field_3: ' '.repeat(50),
            field_4: ' '.repeat(30),
            field_5: '1',
            field_6: '25/03/1992',
            field_7: ' '.repeat(9),
            field_8: ' '.repeat(2),
            field_9: '123456789',
            field_10: '123456789',
            field_11: '123456789',
            field_12: 'RM',
            field_13: '000', // Codice corretto per l'Italia
            field_14: ' '.repeat(50),
            field_15: ' '.repeat(5),
            field_16: ' '.repeat(20),
            field_17: ' '.repeat(9),
            field_18: ' '.repeat(10),
            field_19: 'Non Specificato'.padEnd(30, ' '),
            field_20: 'Non Specificato'.padEnd(30, ' '),
            field_21: '2  ', // Dovrebbe essere errore: tipo 19 non deve avere camere
            field_22: '3  ', // Dovrebbe essere errore: tipo 19 non deve avere camere
            field_23: '4   ', // Dovrebbe essere errore: tipo 19 non deve avere letti
            field_24: ' '.repeat(1),
            field_25: '1122334455',
            field_26: '1'
        }
    ]

    return testRecords
}
