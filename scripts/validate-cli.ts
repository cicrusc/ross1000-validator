#!/usr/bin/env tsx

/**
 * Script CLI per testare il validatore ISTAT ROSS 1000 da console
 * 
 * Usage:
 *   npm run validate              # Esegue tutti i test
 *   npm run validate:file <path>  # Valida un file specifico
 */

import { runAllTests, testValidRecord, testMultipleRecords } from '../src/validation/ross1000-tests'
import { validateROSS1000File, ROSS1000Validator } from '../src/validation/ross1000-validator'
import * as fs from 'fs'
import * as path from 'path'

const args = process.argv.slice(2)
const command = args[0]

console.log('\n🔍 ISTAT ROSS 1000 Validator - Console Tool\n')

switch (command) {
    case 'test':
    case undefined:
        // Esegue tutti i test
        console.log('Esecuzione test suite completa...\n')
        runAllTests()
        break

    case 'quick':
        // Test rapido
        console.log('Esecuzione test rapidi...\n')
        testValidRecord()
        break

    case 'file':
        // Valida un file specifico
        const filePath = args[1]
        if (!filePath) {
            console.error('❌ Errore: Specifica il path del file da validare')
            console.log('Usage: npm run validate:file <path-to-file.txt>')
            process.exit(1)
        }

        validateFile(filePath)
        break

    case 'demo':
        // Demo completo
        console.log('Esecuzione demo completo...\n')
        testMultipleRecords()
        break

    case 'help':
    default:
        console.log('Comandi disponibili:')
        console.log('  npm run validate              # Test suite completa')
        console.log('  npm run validate quick        # Test rapido')
        console.log('  npm run validate file <path>  # Valida file specifico')
        console.log('  npm run validate demo         # Demo completo')
        console.log('  npm run validate help         # Mostra questo help')
        break
}

/**
 * Valida un file TXT dal filesystem
 */
function validateFile(filePath: string) {
    console.log(`📄 Validazione file: ${filePath}\n`)

    // Verifica che il file esista
    if (!fs.existsSync(filePath)) {
        console.error(`❌ File non trovato: ${filePath}`)
        process.exit(1)
    }

    // Leggi il contenuto
    const content = fs.readFileSync(filePath, 'utf-8')

    console.log(`📊 File stats:`)
    console.log(`   Dimensione: ${content.length} bytes`)
    console.log(`   Righe: ${content.split(/\r?\n/).length - 1}`)
    console.log()

    // Valida
    const validator = new ROSS1000Validator()
    const result = validator.validateFile(content)

    // Stampa report
    const report = validator.formatReport(result)
    console.log(report)

    // Exit code basato sul risultato
    process.exit(result.valid ? 0 : 1)
}
