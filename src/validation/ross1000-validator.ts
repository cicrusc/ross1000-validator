/**
 * ISTAT ROSS 1000 - Test Suite di Validazione TXT
 * Versione: 4 - Data: 20/10/2022
 * 
 * Test automatici per verificare la conformità del file TXT generato
 * con le specifiche ufficiali ISTAT ROSS 1000 v.4
 */

import { ROSS1000_SCHEMA, EXPECTED_RECORD_LENGTH } from './ross1000-schema'

export interface ValidationError {
    recordNumber: number
    fieldNumber?: number
    fieldName?: string
    errorType: string
    message: string
    severity: 'CRITICAL' | 'ERROR' | 'WARNING'
}

export interface ValidationResult {
    valid: boolean
    totalRecords: number
    validRecords: number
    invalidRecords: number
    errors: ValidationError[]
    warnings: ValidationError[]
    fileMetrics: {
        totalLines: number
        lineEndingCorrect: boolean
        encoding: string
    }
}

/**
 * Validatore completo per file TXT ROSS 1000
 */
export class ROSS1000Validator {
    private errors: ValidationError[] = []
    private warnings: ValidationError[] = []

    /**
     * Valida un file TXT completo
     */
    public validateFile(content: string): ValidationResult {
        this.errors = []
        this.warnings = []

        // Test 1: Verifica line ending (CRLF)
        const lineEndingCorrect = this.validateLineEndings(content)

        // Split in record
        const records = content.split('\r\n').filter(line => line.length > 0)

        let validCount = 0
        let invalidCount = 0

        // Test 2: Valida ogni record
        records.forEach((record, index) => {
            const recordNumber = index + 1
            const isValid = this.validateRecord(record, recordNumber)

            if (isValid) {
                validCount++
            } else {
                invalidCount++
            }
        })

        const result: ValidationResult = {
            valid: this.errors.filter(e => e.severity === 'CRITICAL' || e.severity === 'ERROR').length === 0,
            totalRecords: records.length,
            validRecords: validCount,
            invalidRecords: invalidCount,
            errors: this.errors,
            warnings: this.warnings,
            fileMetrics: {
                totalLines: records.length,
                lineEndingCorrect,
                encoding: 'ASCII'
            }
        }

        return result
    }

    /**
     * Test 1: Verifica che tutti i line ending siano CRLF (chr(13)+chr(10))
     */
    private validateLineEndings(content: string): boolean {
        // Verifica che usi \r\n e non solo \n o \r
        const hasOnlyLF = content.includes('\n') && !content.includes('\r\n')
        const hasOnlyCR = content.includes('\r') && !content.includes('\r\n')

        if (hasOnlyLF) {
            this.errors.push({
                recordNumber: 0,
                errorType: 'INVALID_LINE_ENDING',
                message: 'File usa LF (\\n) invece di CRLF (\\r\\n). Richiesto: chr(13)+chr(10)',
                severity: 'CRITICAL'
            })
            return false
        }

        if (hasOnlyCR) {
            this.errors.push({
                recordNumber: 0,
                errorType: 'INVALID_LINE_ENDING',
                message: 'File usa CR (\\r) invece di CRLF (\\r\\n). Richiesto: chr(13)+chr(10)',
                severity: 'CRITICAL'
            })
            return false
        }

        return true
    }

    /**
     * Test 2: Valida singolo record
     */
    private validateRecord(record: string, recordNumber: number): boolean {
        let isValid = true

        // Test 2.1: Lunghezza totale record
        if (record.length !== EXPECTED_RECORD_LENGTH) {
            this.errors.push({
                recordNumber,
                errorType: 'INVALID_RECORD_LENGTH',
                message: `Record ha lunghezza ${record.length}, attesa ${EXPECTED_RECORD_LENGTH} caratteri`,
                severity: 'CRITICAL'
            })
            isValid = false
            // Non procedere con ulteriori test se la lunghezza è sbagliata
            return false
        }

        // Estrai tutti i campi
        const fields = this.extractFields(record)

        // Test 2.2: Valida ogni campo
        ROSS1000_SCHEMA.fields.forEach((fieldDef) => {
            const fieldValue = fields[fieldDef.order - 1]
            const fieldValid = this.validateField(fieldValue, fieldDef, fields, recordNumber)
            if (!fieldValid) {
                isValid = false
            }
        })

        // Test 2.3: Validazioni cross-field
        isValid = this.validateCrossFieldRules(fields, recordNumber) && isValid

        return isValid
    }

    /**
     * Estrae i 26 campi dal record
     */
    private extractFields(record: string): string[] {
        const fields: string[] = []
        let position = 0

        ROSS1000_SCHEMA.fields.forEach((fieldDef) => {
            const fieldValue = record.substring(position, position + fieldDef.length)
            fields.push(fieldValue)
            position += fieldDef.length
        })

        return fields
    }

    /**
     * Test 3: Valida singolo campo
     */
    private validateField(
        value: string,
        fieldDef: any,
        allFields: string[],
        recordNumber: number
    ): boolean {
        let isValid = true

        // Test 3.1: Lunghezza campo
        if (value.length !== fieldDef.length) {
            this.errors.push({
                recordNumber,
                fieldNumber: fieldDef.order,
                fieldName: fieldDef.name,
                errorType: 'INVALID_FIELD_LENGTH',
                message: `Campo "${fieldDef.name}" ha lunghezza ${value.length}, attesa ${fieldDef.length}`,
                severity: 'ERROR'
            })
            isValid = false
        }

        const trimmedValue = value.trim()
        const tipoAlloggiato = allFields[0].trim() // Campo 1

        // Test 3.2: Campi obbligatori
        if (fieldDef.required === 'SI' && !trimmedValue) {
            this.errors.push({
                recordNumber,
                fieldNumber: fieldDef.order,
                fieldName: fieldDef.name,
                errorType: 'REQUIRED_FIELD_EMPTY',
                message: `Campo obbligatorio "${fieldDef.name}" è vuoto`,
                severity: 'ERROR'
            })
            isValid = false
        }

        // Test 3.3: Campi che devono essere blank per certi tipi alloggiato
        if (fieldDef.blankFillForTypes) {
            if (fieldDef.blankFillForTypes.includes(tipoAlloggiato) && trimmedValue !== '') {
                this.errors.push({
                    recordNumber,
                    fieldNumber: fieldDef.order,
                    fieldName: fieldDef.name,
                    errorType: 'FIELD_SHOULD_BE_BLANK',
                    message: `Campo "${fieldDef.name}" deve essere vuoto per tipo alloggiato ${tipoAlloggiato}`,
                    severity: 'ERROR'
                })
                isValid = false
            }
        }

        // Test 3.4: Validazioni specifiche per campo
        isValid = this.validateFieldSpecificRules(fieldDef.order, value, trimmedValue, allFields, recordNumber) && isValid

        return isValid
    }

    /**
     * Test 4: Validazioni specifiche per campo
     */
    private validateFieldSpecificRules(
        fieldOrder: number,
        value: string,
        trimmedValue: string,
        allFields: string[],
        recordNumber: number
    ): boolean {
        let isValid = true

        switch (fieldOrder) {
            case 1: // Tipo Alloggiato
                if (trimmedValue && !ROSS1000_SCHEMA.allowedValues.tipoAlloggiato.includes(trimmedValue)) {
                    this.errors.push({
                        recordNumber,
                        fieldNumber: 1,
                        fieldName: 'Tipo Alloggiato',
                        errorType: 'INVALID_VALUE',
                        message: `Tipo Alloggiato "${trimmedValue}" non valido. Valori consentiti: ${ROSS1000_SCHEMA.allowedValues.tipoAlloggiato.join(', ')}`,
                        severity: 'ERROR'
                    })
                    isValid = false
                }
                break

            case 2: // Data di arrivo
            case 6: // Data di nascita
            case 18: // Data di partenza (se presente)
                if (trimmedValue && !this.isValidDate(trimmedValue)) {
                    this.errors.push({
                        recordNumber,
                        fieldNumber: fieldOrder,
                        fieldName: ROSS1000_SCHEMA.fields[fieldOrder - 1].name,
                        errorType: 'INVALID_DATE_FORMAT',
                        message: `Data "${trimmedValue}" non valida. Formato richiesto: gg/mm/aaaa`,
                        severity: 'ERROR'
                    })
                    isValid = false
                }
                break

            case 5: // Sesso
                if (trimmedValue && !ROSS1000_SCHEMA.allowedValues.sesso.includes(trimmedValue)) {
                    this.errors.push({
                        recordNumber,
                        fieldNumber: 5,
                        fieldName: 'Sesso',
                        errorType: 'INVALID_VALUE',
                        message: `Sesso "${trimmedValue}" non valido. Valori consentiti: 1 (maschio), 2 (femmina)`,
                        severity: 'ERROR'
                    })
                    isValid = false
                }
                break

            case 19: // Tipo Turismo
                if (trimmedValue && !ROSS1000_SCHEMA.allowedValues.tipoTurismo.includes(trimmedValue)) {
                    this.errors.push({
                        recordNumber,
                        fieldNumber: 19,
                        fieldName: 'Tipo Turismo',
                        errorType: 'INVALID_VALUE',
                        message: `Tipo Turismo "${trimmedValue}" non riconosciuto. Verificare lista valori consentiti`,
                        severity: 'ERROR'
                    })
                    isValid = false
                }
                break

            case 20: // Mezzo di Trasporto
                if (trimmedValue && !ROSS1000_SCHEMA.allowedValues.mezzoTrasporto.includes(trimmedValue)) {
                    this.errors.push({
                        recordNumber,
                        fieldNumber: 20,
                        fieldName: 'Mezzo di Trasporto',
                        errorType: 'INVALID_VALUE',
                        message: `Mezzo di Trasporto "${trimmedValue}" non riconosciuto. Verificare lista valori consentiti`,
                        severity: 'ERROR'
                    })
                    isValid = false
                }
                break

            case 21: // Camere occupate
            case 22: // Camere disponibili
            case 23: // Letti disponibili
                const tipoAlloggiato = allFields[0].trim()
                const requiresAccommodation = ['16', '17', '18'].includes(tipoAlloggiato)

                if (requiresAccommodation) {
                    if (!trimmedValue) {
                        this.errors.push({
                            recordNumber,
                            fieldNumber: fieldOrder,
                            fieldName: ROSS1000_SCHEMA.fields[fieldOrder - 1].name,
                            errorType: 'REQUIRED_FIELD_EMPTY',
                            message: `Campo obbligatorio per tipo alloggiato ${tipoAlloggiato}`,
                            severity: 'ERROR'
                        })
                        isValid = false
                    } else if (!/^\d+$/.test(trimmedValue)) {
                        this.errors.push({
                            recordNumber,
                            fieldNumber: fieldOrder,
                            fieldName: ROSS1000_SCHEMA.fields[fieldOrder - 1].name,
                            errorType: 'INVALID_NUMERIC_VALUE',
                            message: `Valore "${trimmedValue}" non numerico`,
                            severity: 'ERROR'
                        })
                        isValid = false
                    }
                }
                break

            case 24: // Tassa soggiorno
                if (trimmedValue && !ROSS1000_SCHEMA.allowedValues.tassaSoggiorno.includes(trimmedValue)) {
                    this.errors.push({
                        recordNumber,
                        fieldNumber: 24,
                        fieldName: 'Tassa soggiorno',
                        errorType: 'INVALID_VALUE',
                        message: `Tassa soggiorno "${trimmedValue}" non valida. Valori consentiti: 0 (no), 1 (sì), vuoto`,
                        severity: 'ERROR'
                    })
                    isValid = false
                }
                break

            case 25: // Codice identificativo posizione
                if (!trimmedValue) {
                    this.errors.push({
                        recordNumber,
                        fieldNumber: 25,
                        fieldName: 'Codice identificativo posizione',
                        errorType: 'REQUIRED_FIELD_EMPTY',
                        message: 'Codice identificativo posizione obbligatorio',
                        severity: 'CRITICAL'
                    })
                    isValid = false
                }
                break

            case 26: // Modalità
                if (trimmedValue && !ROSS1000_SCHEMA.allowedValues.modalita.includes(trimmedValue)) {
                    this.errors.push({
                        recordNumber,
                        fieldNumber: 26,
                        fieldName: 'Modalità',
                        errorType: 'INVALID_VALUE',
                        message: `Modalità "${trimmedValue}" non valida. Valori consentiti: 1 (Nuovo), 2 (Variazione), 3 (Eliminazione)`,
                        severity: 'CRITICAL'
                    })
                    isValid = false
                }
                break
        }

        return isValid
    }

    /**
     * Test 5: Validazioni cross-field (regole che coinvolgono più campi)
     */
    private validateCrossFieldRules(fields: string[], recordNumber: number): boolean {
        let isValid = true

        const modalita = fields[25].trim() // Campo 26
        const dataPartenza = fields[17].trim() // Campo 18
        const codiceStatoResidenza = fields[12].trim() // Campo 13
        const comuneResidenza = fields[10].trim() // Campo 11
        const siglaProvinciaResidenza = fields[11].trim() // Campo 12
        const tipoAlloggiato = fields[0].trim() // Campo 1

        // Test 5.1: Modalità 2 (Variazione) richiede Data di Partenza
        if (modalita === '2' && !dataPartenza) {
            this.errors.push({
                recordNumber,
                fieldNumber: 18,
                fieldName: 'Data di partenza',
                errorType: 'REQUIRED_FOR_MODALITA_2',
                message: 'Data di partenza obbligatoria per Modalità 2 (Variazione)',
                severity: 'ERROR'
            })
            isValid = false
        }

        // Test 5.2: Residenza in Italia richiede comune e provincia
        if (codiceStatoResidenza === '100000100' || codiceStatoResidenza.trim().startsWith('000')) {
            if (!comuneResidenza) {
                this.errors.push({
                    recordNumber,
                    fieldNumber: 11,
                    fieldName: 'Codice comune di residenza',
                    errorType: 'REQUIRED_FOR_ITALIAN_RESIDENCE',
                    message: 'Codice comune di residenza obbligatorio per residenti in Italia',
                    severity: 'ERROR'
                })
                isValid = false
            }

            if (!siglaProvinciaResidenza) {
                this.errors.push({
                    recordNumber,
                    fieldNumber: 12,
                    fieldName: 'Sigla provincia di residenza',
                    errorType: 'REQUIRED_FOR_ITALIAN_RESIDENCE',
                    message: 'Sigla provincia di residenza obbligatoria per residenti in Italia',
                    severity: 'ERROR'
                })
                isValid = false
            }
        }

        // Test 5.3: Camere occupate <= Camere disponibili
        const camereOccupate = parseInt(fields[20].trim()) || 0 // Campo 21
        const camereDisponibili = parseInt(fields[21].trim()) || 0 // Campo 22

        if (['16', '17', '18'].includes(tipoAlloggiato)) {
            if (camereOccupate > 0 && camereDisponibili > 0 && camereOccupate > camereDisponibili) {
                this.warnings.push({
                    recordNumber,
                    fieldNumber: 21,
                    fieldName: 'Camere occupate',
                    errorType: 'LOGICAL_INCONSISTENCY',
                    message: `Camere occupate (${camereOccupate}) superiori alle camere disponibili (${camereDisponibili})`,
                    severity: 'WARNING'
                })
            }
        }

        // Test 5.4: Data partenza > Data arrivo
        const dataArrivo = fields[1].trim() // Campo 2
        if (dataArrivo && dataPartenza) {
            const arrivo = this.parseDate(dataArrivo)
            const partenza = this.parseDate(dataPartenza)

            if (arrivo && partenza && partenza <= arrivo) {
                this.errors.push({
                    recordNumber,
                    fieldNumber: 18,
                    fieldName: 'Data di partenza',
                    errorType: 'INVALID_DATE_RANGE',
                    message: 'Data di partenza deve essere successiva alla data di arrivo',
                    severity: 'ERROR'
                })
                isValid = false
            }
        }

        return isValid
    }

    /**
     * Verifica formato data gg/mm/aaaa
     */
    private isValidDate(dateStr: string): boolean {
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/
        const match = dateStr.match(regex)

        if (!match) return false

        const day = parseInt(match[1])
        const month = parseInt(match[2])
        const year = parseInt(match[3])

        if (month < 1 || month > 12) return false
        if (day < 1 || day > 31) return false
        if (year < 1900 || year > 2100) return false

        return true
    }

    /**
     * Parse data in formato gg/mm/aaaa
     */
    private parseDate(dateStr: string): Date | null {
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/
        const match = dateStr.match(regex)

        if (!match) return null

        const day = parseInt(match[1])
        const month = parseInt(match[2]) - 1 // Month is 0-indexed
        const year = parseInt(match[3])

        return new Date(year, month, day)
    }

    /**
     * Formatta il report di validazione in formato leggibile
     */
    public formatReport(result: ValidationResult): string {
        let report = ''

        report += '═'.repeat(70) + '\n'
        report += '  REPORT VALIDAZIONE ISTAT ROSS 1000 v.4\n'
        report += '═'.repeat(70) + '\n\n'

        report += `RISULTATO: ${result.valid ? '✅ VALIDO' : '❌ NON VALIDO'}\n\n`

        report += `STATISTICHE:\n`
        report += `  Record totali: ${result.totalRecords}\n`
        report += `  Record validi: ${result.validRecords}\n`
        report += `  Record non validi: ${result.invalidRecords}\n`
        report += `  Errori critici: ${result.errors.filter(e => e.severity === 'CRITICAL').length}\n`
        report += `  Errori: ${result.errors.filter(e => e.severity === 'ERROR').length}\n`
        report += `  Avvertimenti: ${result.warnings.length}\n`
        report += `  Line ending: ${result.fileMetrics.lineEndingCorrect ? '✅ CRLF' : '❌ Non corretto'}\n\n`

        if (result.errors.length > 0) {
            report += '─'.repeat(70) + '\n'
            report += 'ERRORI:\n'
            report += '─'.repeat(70) + '\n'
            result.errors.forEach(error => {
                report += `\n[${error.severity}] Record ${error.recordNumber}`
                if (error.fieldNumber) {
                    report += ` - Campo ${error.fieldNumber} (${error.fieldName})`
                }
                report += `\n  ${error.errorType}: ${error.message}\n`
            })
        }

        if (result.warnings.length > 0) {
            report += '\n' + '─'.repeat(70) + '\n'
            report += 'AVVERTIMENTI:\n'
            report += '─'.repeat(70) + '\n'
            result.warnings.forEach(warning => {
                report += `\n[${warning.severity}] Record ${warning.recordNumber}`
                if (warning.fieldNumber) {
                    report += ` - Campo ${warning.fieldNumber} (${warning.fieldName})`
                }
                report += `\n  ${warning.errorType}: ${warning.message}\n`
            })
        }

        report += '\n' + '═'.repeat(70) + '\n'

        return report
    }
}

/**
 * Funzione helper per validare rapidamente un file
 */
export function validateROSS1000File(content: string): ValidationResult {
    const validator = new ROSS1000Validator()
    return validator.validateFile(content)
}

/**
 * Funzione helper per validare e stampare report
 */
export function validateAndPrintReport(content: string): void {
    const validator = new ROSS1000Validator()
    const result = validator.validateFile(content)
    const report = validator.formatReport(result)
    console.log(report)
}
