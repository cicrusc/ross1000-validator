/**
 * Script di debug per testare il validatore ISTAT
 * Questo script simula la validazione per capire quali errori vengono rilevati
 */

import { ROSS1000Validator } from './src/validation/ross1000-validator'

// Test 1: Record con camere = 0
console.log('\n=== TEST 1: Record con camere = 0 ===')
const record1 =
    '16' +                                    // 1. Tipo Alloggiato (2)
    '15/01/2024' +                            // 2. Data arrivo (10)
    'Rossi'.padEnd(50, ' ') +                 // 3. Cognome (50)
    'Mario'.padEnd(30, ' ') +                 // 4. Nome (30)
    '1' +                                     // 5. Sesso (1)
    '01/01/1980' +                            // 6. Data nascita (10)
    '054032'.padEnd(9, ' ') +                 // 7. Comune nascita (9)
    'RM' +                                    // 8. Sigla provincia nascita (2)
    '100000100' +                             // 9. Stato nascita (9)
    '100000100' +                             // 10. Cittadinanza (9)
    '054032'.padEnd(9, ' ') +                 // 11. Comune residenza (9)
    'RM' +                                    // 12. Sigla provincia residenza (2)
    '100000100' +                             // 13. Stato residenza (9)
    ''.padEnd(50, ' ') +                      // 14. Indirizzo (50)
    ''.padEnd(5, ' ') +                       // 15. Tipo documento (5)
    ''.padEnd(20, ' ') +                      // 16. Numero documento (20)
    ''.padEnd(9, ' ') +                       // 17. Luogo rilascio (9)
    '20/01/2024' +                            // 18. Data partenza (10)
    'Culturale'.padEnd(30, ' ') +             // 19. Tipo turismo (30)
    'Auto'.padEnd(30, ' ') +                  // 20. Mezzo trasporto (30)
    '0'.padStart(3, ' ') +                    // 21. Camere occupate = 0 (3) !!!
    '50'.padStart(3, ' ') +                   // 22. Camere disponibili (3)
    '100'.padStart(4, ' ') +                  // 23. Letti disponibili (4)
    '1' +                                     // 24. Tassa soggiorno (1)
    'POS0000001' +                            // 25. Codice identificativo (10)
    '1' +                                     // 26. Modalità (1)
    '\r\n'

let validator = new ROSS1000Validator()
let result = validator.validateFile(record1)
console.log(`Errori trovati: ${result.errors.length}`)
result.errors.forEach((err, i) => {
    console.log(`${i + 1}. [Campo ${err.fieldNumber}] ${err.message}`)
})

// Test 2: Record con italiano nato in Italia senza comune/provincia nascita
console.log('\n=== TEST 2: Italiano nato in Italia senza comune nascita ===')
const record2 =
    '16' +                                    // 1. Tipo Alloggiato (2)
    '15/01/2024' +                            // 2. Data arrivo (10)
    'Rossi'.padEnd(50, ' ') +                 // 3. Cognome (50)
    'Mario'.padEnd(30, ' ') +                 // 4. Nome (30)
    '1' +                                     // 5. Sesso (1)
    '01/01/1980' +                            // 6. Data nascita (10)
    ''.padEnd(9, ' ') +                       // 7. Comune nascita VUOTO (9) !!!
    ''.padEnd(2, ' ') +                       // 8. Provincia nascita VUOTA (2) !!!
    '100000100' +                             // 9. Stato nascita Italia (9)
    '100000100' +                             // 10. Cittadinanza Italia (9)
    '054032'.padEnd(9, ' ') +                 // 11. Comune residenza (9)
    'RM' +                                    // 12. Sigla provincia residenza (2)
    '100000100' +                             // 13. Stato residenza (9)
    ''.padEnd(50, ' ') +                      // 14. Indirizzo (50)
    ''.padEnd(5, ' ') +                       // 15. Tipo documento (5)
    ''.padEnd(20, ' ') +                      // 16. Numero documento (20)
    ''.padEnd(9, ' ') +                       // 17. Luogo rilascio (9)
    '20/01/2024' +                            // 18. Data partenza (10)
    'Culturale'.padEnd(30, ' ') +             // 19. Tipo turismo (30)
    'Auto'.padEnd(30, ' ') +                  // 20. Mezzo trasporto (30)
    '1'.padStart(3, ' ') +                    // 21. Camere occupate (3)
    '50'.padStart(3, ' ') +                   // 22. Camere disponibili (3)
    '100'.padStart(4, ' ') +                  // 23. Letti disponibili (4)
    '1' +                                     // 24. Tassa soggiorno (1)
    'POS0000001' +                            // 25. Codice identificativo (10)
    '1' +                                     // 26. Modalità (1)
    '\r\n'

validator = new ROSS1000Validator()
result = validator.validateFile(record2)
console.log(`Errori trovati: ${result.errors.length}`)
result.errors.forEach((err, i) => {
    console.log(`${i + 1}. [Campo ${err.fieldNumber}] ${err.message}`)
})

// Test 3: Data nascita posteriore a data arrivo
console.log('\n=== TEST 3: Data nascita posteriore a data arrivo ===')
const record3 =
    '16' +                                    // 1. Tipo Alloggiato (2)
    '15/01/2024' +                            // 2. Data arrivo (10)
    'Rossi'.padEnd(50, ' ') +                 // 3. Cognome (50)
    'Mario'.padEnd(30, ' ') +                 // 4. Nome (30)
    '1' +                                     // 5. Sesso (1)
    '01/01/2025' +                            // 6. Data nascita FUTURA (10) !!!
    '054032'.padEnd(9, ' ') +                 // 7. Comune nascita (9)
    'RM' +                                    // 8. Sigla provincia nascita (2)
    '100000100' +                             // 9. Stato nascita (9)
    '100000100' +                             // 10. Cittadinanza (9)
    '054032'.padEnd(9, ' ') +                 // 11. Comune residenza (9)
    'RM' +                                    // 12. Sigla provincia residenza (2)
    '100000100' +                             // 13. Stato residenza (9)
    ''.padEnd(50, ' ') +                      // 14. Indirizzo (50)
    ''.padEnd(5, ' ') +                       // 15. Tipo documento (5)
    ''.padEnd(20, ' ') +                      // 16. Numero documento (20)
    ''.padEnd(9, ' ') +                       // 17. Luogo rilascio (9)
    '20/01/2024' +                            // 18. Data partenza (10)
    'Culturale'.padEnd(30, ' ') +             // 19. Tipo turismo (30)
    'Auto'.padEnd(30, ' ') +                  // 20. Mezzo trasporto (30)
    '1'.padStart(3, ' ') +                    // 21. Camere occupate (3)
    '50'.padStart(3, ' ') +                   // 22. Camere disponibili (3)
    '100'.padStart(4, ' ') +                  // 23. Letti disponibili (4)
    '1' +                                     // 24. Tassa soggiorno (1)
    'POS0000001' +                            // 25. Codice identificativo (10)
    '1' +                                     // 26. Modalità (1)
    '\r\n'

validator = new ROSS1000Validator()
result = validator.validateFile(record3)
console.log(`Errori trovati: ${result.errors.length}`)
result.errors.forEach((err, i) => {
    console.log(`${i + 1}. [Campo ${err.fieldNumber}] ${err.message}`)
})

console.log('\n=== RIEPILOGO ===')
console.log('Se il validatore è stato migliorato correttamente, dovremmo vedere:')
console.log('- Test 1: 1 errore (camere = 0)')
console.log('- Test 2: 2 errori (comune e provincia nascita mancanti)')
console.log('- Test 3: 1 errore (data nascita posteriore)')
