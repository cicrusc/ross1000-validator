/**
 * ISTAT ROSS 1000 - Test di Esempio
 * 
 * Questo file mostra come usare il validatore per testare
 * il file TXT generato dall'applicazione
 */

import { validateROSS1000File, validateAndPrintReport, ROSS1000Validator } from './ross1000-validator'
import { ROSS1000_SCHEMA, EXPECTED_RECORD_LENGTH } from './ross1000-schema'
import { generateTxtFile } from '../app/viewmodel/useFileGeneration'
import { RossRecord } from '../app/model/types'

/**
 * Test 1: Verifica record di esempio conforme
 */
export function testValidRecord() {
    console.log('\n📋 TEST 1: Record Valido Conforme\n')

    // Record conforme alle specifiche (328 caratteri + \r\n)
    const validRecord =
        '16' +                                                    // 1. Tipo Alloggiato (2)
        '15/01/2024' +                                            // 2. Data arrivo (10)
        'Rossi'.padEnd(50, ' ') +                                 // 3. Cognome (50)
        'Mario'.padEnd(30, ' ') +                                 // 4. Nome (30)
        '1' +                                                     // 5. Sesso (1)
        '01/01/1980' +                                            // 6. Data nascita (10)
        '054032'.padEnd(9, ' ') +                                 // 7. Comune nascita (9)
        'RM' +                                                    // 8. Sigla provincia nascita (2)
        '100000100' +                                             // 9. Stato nascita (9)
        '100000100' +                                             // 10. Cittadinanza (9)
        '054032'.padEnd(9, ' ') +                                 // 11. Comune residenza (9)
        'RM' +                                                    // 12. Sigla provincia residenza (2)
        '100000100' +                                             // 13. Stato residenza (9)
        ''.padEnd(50, ' ') +                                      // 14. Indirizzo (50)
        ''.padEnd(5, ' ') +                                       // 15. Tipo documento (5)
        ''.padEnd(20, ' ') +                                      // 16. Numero documento (20)
        ''.padEnd(9, ' ') +                                       // 17. Luogo rilascio (9)
        '20/01/2024' +                                            // 18. Data partenza (10)
        'Culturale'.padEnd(30, ' ') +                             // 19. Tipo turismo (30)
        'Auto'.padEnd(30, ' ') +                                  // 20. Mezzo trasporto (30)
        '1'.padStart(3, ' ') +                                    // 21. Camere occupate (3)
        '50'.padStart(3, ' ') +                                   // 22. Camere disponibili (3)
        '100'.padStart(4, ' ') +                                  // 23. Letti disponibili (4)
        '1' +                                                     // 24. Tassa soggiorno (1)
        'POS0000001' +                                            // 25. Codice identificativo (10)
        '1' +                                                     // 26. Modalità (1)
        '\r\n'

    console.log(`Lunghezza record (senza \\r\\n): ${validRecord.length - 2} caratteri`)
    console.log(`Attesa: ${EXPECTED_RECORD_LENGTH} caratteri\n`)

    const result = validateROSS1000File(validRecord)

    if (result.valid) {
        console.log('✅ Record VALIDO - Conforme alle specifiche ISTAT\n')
    } else {
        console.log('❌ Record NON VALIDO - Trovati errori:\n')
        result.errors.forEach(err => {
            console.log(`   - ${err.message}`)
        })
    }

    return result
}

/**
 * Test 2: Verifica record con errori comuni
 */
export function testInvalidRecords() {
    console.log('\n📋 TEST 2: Record con Errori Comuni\n')

    const validator = new ROSS1000Validator()

    // Errore 1: Lunghezza sbagliata
    console.log('Test 2.1: Lunghezza record sbagliata')
    const shortRecord = '16' + '15/01/2024' + '\r\n'
    let result = validator.validateFile(shortRecord)
    console.log(`   Errori trovati: ${result.errors.length}`)
    console.log(`   Primo errore: ${result.errors[0]?.message}\n`)

    // Errore 2: Tipo alloggiato non valido
    console.log('Test 2.2: Tipo alloggiato non valido')
    const invalidType = '99' + createValidRecordBody() + '\r\n'
    result = validator.validateFile(invalidType)
    console.log(`   Errori trovati: ${result.errors.length}`)
    console.log(`   Primo errore: ${result.errors[0]?.message}\n`)

    // Errore 3: Data formato sbagliato
    console.log('Test 2.3: Data in formato sbagliato')
    const invalidDate = '16' + '2024-01-15' + createValidRecordBody().substring(10) + '\r\n'
    result = validator.validateFile(invalidDate)
    console.log(`   Errori trovati: ${result.errors.length}\n`)

    // Errore 4: Camere occupate > disponibili
    console.log('Test 2.4: Camere occupate > camere disponibili')
    const invalidCamere = createRecordWithCamere('16', 100, 50, 100) + '\r\n'
    result = validator.validateFile(invalidCamere)
    console.log(`   Avvertimenti trovati: ${result.warnings.length}`)
    if (result.warnings.length > 0) {
        console.log(`   Avvertimento: ${result.warnings[0]?.message}\n`)
    }
}

/**
 * Test 3: Verifica regole per tipo alloggiato 16-17-18
 */
export function testAccommodationTypes_16_17_18() {
    console.log('\n📋 TEST 3: Tipo Alloggiato 16-17-18 (Con Camere)\n')

    const validator = new ROSS1000Validator()

    // Test 3.1: Tipo 16 con camere (VALIDO)
    console.log('Test 3.1: Tipo 16 con camere specificate')
    const validType16 = createRecordWithCamere('16', 1, 50, 100) + '\r\n'
    let result = validator.validateFile(validType16)
    console.log(`   Risultato: ${result.valid ? '✅ VALIDO' : '❌ NON VALIDO'}`)

    // Test 3.2: Tipo 17 senza camere (ERRORE)
    console.log('Test 3.2: Tipo 17 senza camere (dovrebbe dare errore)')
    const invalidType17 = createRecordWithCamere('17', 0, 0, 0) + '\r\n'
    result = validator.validateFile(invalidType17)
    console.log(`   Risultato: ${result.valid ? '✅ VALIDO' : '❌ NON VALIDO'}`)
    console.log(`   Errori: ${result.errors.length}`)

    // Test 3.3: Tipo 18 con tutte le camere
    console.log('Test 3.3: Tipo 18 (Capo Gruppo) con camere')
    const validType18 = createRecordWithCamere('18', 5, 50, 120) + '\r\n'
    result = validator.validateFile(validType18)
    console.log(`   Risultato: ${result.valid ? '✅ VALIDO' : '❌ NON VALIDO'}\n`)
}

/**
 * Test 4: Verifica regole per tipo alloggiato 19-20
 */
export function testAccommodationTypes_19_20() {
    console.log('\n📋 TEST 4: Tipo Alloggiato 19-20 (Senza Camere)\n')

    const validator = new ROSS1000Validator()

    // Test 4.1: Tipo 19 senza camere (VALIDO)
    console.log('Test 4.1: Tipo 19 senza camere')
    const validType19 = createRecordWithCamere('19', 0, 0, 0, true) + '\r\n'
    let result = validator.validateFile(validType19)
    console.log(`   Risultato: ${result.valid ? '✅ VALIDO' : '❌ NON VALIDO'}`)

    // Test 4.2: Tipo 20 con camere (ERRORE)
    console.log('Test 4.2: Tipo 20 con camere (dovrebbe dare errore)')
    const invalidType20 = createRecordWithCamere('20', 1, 50, 100) + '\r\n'
    result = validator.validateFile(invalidType20)
    console.log(`   Risultato: ${result.valid ? '✅ VALIDO' : '❌ NON VALIDO'}`)
    console.log(`   Errori: ${result.errors.length}\n`)
}

/**
 * Test 5: Verifica modalità (Nuovo, Variazione, Eliminazione)
 */
export function testModalities() {
    console.log('\n📋 TEST 5: Modalità Operazioni\n')

    const validator = new ROSS1000Validator()

    // Test 5.1: Modalità 1 (Nuovo) - OK
    console.log('Test 5.1: Modalità 1 (Nuovo)')
    const mode1 = createRecordWithMode('1', '') + '\r\n'
    let result = validator.validateFile(mode1)
    console.log(`   Risultato: ${result.valid ? '✅ VALIDO' : '❌ NON VALIDO'}`)

    // Test 5.2: Modalità 2 (Variazione) senza data partenza - ERRORE
    console.log('Test 5.2: Modalità 2 (Variazione) senza data partenza')
    const mode2Invalid = createRecordWithMode('2', '') + '\r\n'
    result = validator.validateFile(mode2Invalid)
    console.log(`   Risultato: ${result.valid ? '✅ VALIDO' : '❌ NON VALIDO'}`)
    console.log(`   Errori: ${result.errors.length}`)

    // Test 5.3: Modalità 2 (Variazione) con data partenza - OK
    console.log('Test 5.3: Modalità 2 (Variazione) con data partenza')
    const mode2Valid = createRecordWithMode('2', '20/01/2024') + '\r\n'
    result = validator.validateFile(mode2Valid)
    console.log(`   Risultato: ${result.valid ? '✅ VALIDO' : '❌ NON VALIDO'}`)

    // Test 5.4: Modalità 3 (Eliminazione)
    console.log('Test 5.4: Modalità 3 (Eliminazione)')
    const mode3 = createRecordWithMode('3', '') + '\r\n'
    result = validator.validateFile(mode3)
    console.log(`   Risultato: ${result.valid ? '✅ VALIDO' : '❌ NON VALIDO'}\n`)
}

/**
 * Test 6: Verifica line ending
 */
export function testLineEndings() {
    console.log('\n📋 TEST 6: Line Ending (CRLF)\n')

    const validator = new ROSS1000Validator()

    // Test 6.1: CRLF corretto
    console.log('Test 6.1: Line ending CRLF (corretto)')
    const crlfRecord = createValidRecord() + '\r\n'
    let result = validator.validateFile(crlfRecord)
    console.log(`   Line ending: ${result.fileMetrics.lineEndingCorrect ? '✅ CRLF corretto' : '❌ Non corretto'}`)

    // Test 6.2: Solo LF (sbagliato)
    console.log('Test 6.2: Line ending LF (sbagliato)')
    const lfRecord = createValidRecord() + '\n'
    result = validator.validateFile(lfRecord)
    console.log(`   Line ending: ${result.fileMetrics.lineEndingCorrect ? '✅ CRLF corretto' : '❌ Non corretto'}`)
    console.log(`   Errori critici: ${result.errors.filter(e => e.severity === 'CRITICAL').length}\n`)
}

/**
 * Test 7: Verifica file multi-record
 */
export function testMultipleRecords() {
    console.log('\n📋 TEST 7: File Multi-Record\n')

    const record1 = createRecordWithCamere('16', 1, 50, 100) + '\r\n'
    const record2 = createRecordWithCamere('17', 2, 50, 100) + '\r\n'
    const record3 = createRecordWithCamere('19', 0, 0, 0, true) + '\r\n'
    const record4Invalid = '99' + createValidRecordBody() + '\r\n' // Record non valido

    const multiRecordFile = record1 + record2 + record3 + record4Invalid

    const validator = new ROSS1000Validator()
    const result = validator.validateFile(multiRecordFile)

    console.log(`Record totali: ${result.totalRecords}`)
    console.log(`Record validi: ${result.validRecords}`)
    console.log(`Record non validi: ${result.invalidRecords}`)
    console.log(`File valido: ${result.valid ? '✅ SI' : '❌ NO'}`)
    console.log(`\nErrori trovati: ${result.errors.length}\n`)

    // Stampa report completo
    const report = validator.formatReport(result)
    console.log(report)
}

/**
 * Esegue tutti i test
 */
export function runAllTests() {
    console.log('═'.repeat(70))
    console.log('  TEST SUITE COMPLETA - ISTAT ROSS 1000 v.4')
    console.log('═'.repeat(70))

    testValidRecord()
    testInvalidRecords()
    testAccommodationTypes_16_17_18()
    testAccommodationTypes_19_20()
    testModalities()
    testLineEndings()
    testMultipleRecords()

    console.log('═'.repeat(70))
    console.log('  TEST COMPLETATI')
    console.log('═'.repeat(70))
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createValidRecordBody(): string {
    return '15/01/2024' +                                         // 2. Data arrivo (10)
        'Rossi'.padEnd(50, ' ') +                                 // 3. Cognome (50)
        'Mario'.padEnd(30, ' ') +                                 // 4. Nome (30)
        '1' +                                                     // 5. Sesso (1)
        '01/01/1980' +                                            // 6. Data nascita (10)
        '054032'.padEnd(9, ' ') +                                 // 7. Comune nascita (9)
        'RM' +                                                    // 8. Sigla provincia nascita (2)
        '100000100' +                                             // 9. Stato nascita (9)
        '100000100' +                                             // 10. Cittadinanza (9)
        '054032'.padEnd(9, ' ') +                                 // 11. Comune residenza (9)
        'RM' +                                                    // 12. Sigla provincia residenza (2)
        '100000100' +                                             // 13. Stato residenza (9)
        ''.padEnd(50, ' ') +                                      // 14. Indirizzo (50)
        ''.padEnd(5, ' ') +                                       // 15. Tipo documento (5)
        ''.padEnd(20, ' ') +                                      // 16. Numero documento (20)
        ''.padEnd(9, ' ') +                                       // 17. Luogo rilascio (9)
        '20/01/2024' +                                            // 18. Data partenza (10)
        'Culturale'.padEnd(30, ' ') +                             // 19. Tipo turismo (30)
        'Auto'.padEnd(30, ' ') +                                  // 20. Mezzo trasporto (30)
        '1'.padStart(3, ' ') +                                    // 21. Camere occupate (3)
        '50'.padStart(3, ' ') +                                   // 22. Camere disponibili (3)
        '100'.padStart(4, ' ') +                                  // 23. Letti disponibili (4)
        '1' +                                                     // 24. Tassa soggiorno (1)
        'POS0000001' +                                            // 25. Codice identificativo (10)
        '1'                                                       // 26. Modalità (1)
}

function createValidRecord(): string {
    return '16' + createValidRecordBody()
}

function createRecordWithCamere(
    tipoAlloggiato: string,
    camereOcc: number,
    camereDisp: number,
    lettiDisp: number,
    blankCamere: boolean = false
): string {
    const camOcc = blankCamere ? ''.padStart(3, ' ') : camereOcc.toString().padStart(3, ' ')
    const camDisp = blankCamere ? ''.padStart(3, ' ') : camereDisp.toString().padStart(3, ' ')
    const lettDisp = blankCamere ? ''.padStart(4, ' ') : lettiDisp.toString().padStart(4, ' ')

    return tipoAlloggiato +
        '15/01/2024' +
        'Rossi'.padEnd(50, ' ') +
        'Mario'.padEnd(30, ' ') +
        '1' +
        '01/01/1980' +
        '054032'.padEnd(9, ' ') +
        'RM' +
        '100000100' +
        '100000100' +
        '054032'.padEnd(9, ' ') +
        'RM' +
        '100000100' +
        ''.padEnd(50, ' ') +
        ''.padEnd(5, ' ') +
        ''.padEnd(20, ' ') +
        ''.padEnd(9, ' ') +
        '20/01/2024' +
        'Culturale'.padEnd(30, ' ') +
        'Auto'.padEnd(30, ' ') +
        camOcc +
        camDisp +
        lettDisp +
        '1' +
        'POS0000001' +
        '1'
}

function createRecordWithMode(modalita: string, dataPartenza: string): string {
    const dataPart = dataPartenza ? dataPartenza : ''.padEnd(10, ' ')

    return '16' +
        '15/01/2024' +
        'Rossi'.padEnd(50, ' ') +
        'Mario'.padEnd(30, ' ') +
        '1' +
        '01/01/1980' +
        '054032'.padEnd(9, ' ') +
        'RM' +
        '100000100' +
        '100000100' +
        '054032'.padEnd(9, ' ') +
        'RM' +
        '100000100' +
        ''.padEnd(50, ' ') +
        ''.padEnd(5, ' ') +
        ''.padEnd(20, ' ') +
        ''.padEnd(9, ' ') +
        dataPart +
        'Culturale'.padEnd(30, ' ') +
        'Auto'.padEnd(30, ' ') +
        '1'.padStart(3, ' ') +
        '50'.padStart(3, ' ') +
        '100'.padStart(4, ' ') +
        '1' +
        'POS0000001' +
        modalita
}
