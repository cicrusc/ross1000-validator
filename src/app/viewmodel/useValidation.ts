import { RossRecord, ValidationResult, RecordValidationResult } from '../model/types'
import { ROSS_FIELDS, TIPOLOGIA_TURISMO, MEZZI_TRASPORTO } from '../model/constants'
import { getTrimmedValue, getFieldValue } from '../model/helpers'

// Funzione di validazione dettagliata per ogni campo secondo il tracciato ROSS 1000
export const validateField = (record: RossRecord, fieldId: number): { isValid: boolean; errorMessage?: string } => {
    const field = ROSS_FIELDS.find(f => f.id === fieldId)
    if (!field) return { isValid: true }

    const value = getTrimmedValue(record, `field_${fieldId}`)
    const rawValue = getFieldValue(record, `field_${fieldId}`)

    // Per i campi che devono essere lasciati vuoti, controlla solo la lunghezza
    if (field.blank) {
        if (rawValue.length !== field.length) {
            return { isValid: false, errorMessage: `${field.name}: lunghezza errata (attesa ${field.length}, trovata ${rawValue.length})` }
        }
        return { isValid: true }
    }

    // Controllo lunghezza fissa del campo
    if (rawValue.length !== field.length) {
        return { isValid: false, errorMessage: `${field.name}: lunghezza errata (attesa ${field.length}, trovata ${rawValue.length})` }
    }

    // Controllo campi obbligatori: non devono essere vuoti (dopo il trim)
    // Per i campi 11, 12, 21, 22, 23, la validazione viene gestita nella logica specifica
    if ((field.required === true || field.required === 'conditional') && !value && ![11, 12, 21, 22, 23].includes(fieldId)) {
        return { isValid: false, errorMessage: `${field.name}: obbligatorio` }
    }

    // Regex per la validazione delle date
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/

    // Regole di validazione specifiche per ogni campo

    switch (fieldId) {
        case 1: // Tipo Alloggiato
            if (!['16', '17', '18', '19', '20'].includes(value)) {
                return { isValid: false, errorMessage: "Tipo Alloggiato: valore non valido (16-20)" }
            }
            break

        case 2: // Data Arrivo
            if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
                return { isValid: false, errorMessage: "Data Arrivo: formato non valido (gg/mm/aaaa)" }
            }
            // Validazione data
            const match = value.match(dateRegex)
            if (match) {
                const day = parseInt(match[1])
                const month = parseInt(match[2])
                const year = parseInt(match[3])
                if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
                    return { isValid: false, errorMessage: "Data Arrivo: data non valida" }
                }
            }
            break

        case 5: // Sesso
            if (!['1', '2'].includes(value)) {
                return { isValid: false, errorMessage: "Sesso: valore non valido (1=maschio, 2=femmina)" }
            }
            break

        case 6: // Data Nascita
            if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
                return { isValid: false, errorMessage: "Data Nascita: formato non valido (gg/mm/aaaa)" }
            }
            // Validazione data
            const birthMatch = value.match(dateRegex)
            if (birthMatch) {
                const day = parseInt(birthMatch[1])
                const month = parseInt(birthMatch[2])
                const year = parseInt(birthMatch[3])
                if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
                    return { isValid: false, errorMessage: "Data Nascita: data non valida" }
                }
            }
            break

        case 9: // Codice Stato Nascita
            if (!/^\d+$/.test(value)) {
                return { isValid: false, errorMessage: "Codice Stato Nascita: deve essere numerico" }
            }
            break

        case 10: // Codice Cittadinanza
            if (!/^\d+$/.test(value)) {
                return { isValid: false, errorMessage: "Codice Cittadinanza: deve essere numerico" }
            }
            break

        case 11: // Codice Comune Residenza
            if (value) {
                // Se presente, deve essere numerico
                if (!/^\d+$/.test(value)) {
                    return { isValid: false, errorMessage: "Codice Comune Residenza: deve essere numerico" }
                }
            } else {
                // Obbligatorio solo se RESIDENZA in Italia (non cittadinanza!)
                const statoResidenza = getTrimmedValue(record, 'field_13')
                const isResidenteItalia = statoResidenza === '100000100' || statoResidenza.startsWith('000')
                if (isResidenteItalia) {
                    return { isValid: false, errorMessage: "Codice Comune Residenza: obbligatorio per residenti in Italia" }
                }
            }
            break


        case 12: // Sigla Provincia Residenza
            if (value) {
                // Se presente, deve essere alfanumerico di 2 caratteri
                if (!/^[A-Za-z]{2}$/.test(value)) {
                    return { isValid: false, errorMessage: "Sigla Provincia Residenza: deve essere 2 lettere" }
                }
            } else {
                // Obbligatorio solo se RESIDENZA in Italia (non cittadinanza!)
                const statoResidenza = getTrimmedValue(record, 'field_13')
                const isResidenteItalia = statoResidenza === '100000100' || statoResidenza.startsWith('000')
                if (isResidenteItalia) {
                    return { isValid: false, errorMessage: "Sigla Provincia Residenza: obbligatoria per residenti in Italia" }
                }
            }
            break

        case 13: // Codice Stato Residenza
            if (!value) {
                return { isValid: false, errorMessage: "Codice Stato Residenza: obbligatorio" }
            }
            if (!/^\d+$/.test(value)) {
                return { isValid: false, errorMessage: "Codice Stato Residenza: deve essere numerico" }
            }
            break

        case 18: // Data Partenza
            const modalita = getTrimmedValue(record, 'field_26')
            if (modalita === '2') { // Variazione
                if (!value) {
                    return { isValid: false, errorMessage: "Data Partenza: obbligatoria per modalità Variazione" }
                }
                if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
                    return { isValid: false, errorMessage: "Data Partenza: formato non valido (gg/mm/aaaa)" }
                }
                // Validazione data
                const departureMatch = value.match(dateRegex)
                if (departureMatch) {
                    const day = parseInt(departureMatch[1])
                    const month = parseInt(departureMatch[2])
                    const year = parseInt(departureMatch[3])
                    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
                        return { isValid: false, errorMessage: "Data Partenza: data non valida" }
                    }
                }
            }
            break

        case 19: // Tipo Turismo
            if (!TIPOLOGIA_TURISMO.includes(value)) {
                return { isValid: false, errorMessage: "Tipo Turismo: valore non valido" }
            }
            break

        case 20: // Mezzo Trasporto
            if (!MEZZI_TRASPORTO.includes(value)) {
                return { isValid: false, errorMessage: "Mezzo Trasporto: valore non valido" }
            }
            break

        case 21: // Camere Occupate
        case 22: // Camere Disponibili
        case 23: // Letti Disponibili
            const tipoAlloggiato = getTrimmedValue(record, 'field_1')
            const requiresAccommodation = ['16', '17', '18'].includes(tipoAlloggiato)

            if (requiresAccommodation) {
                // Per tipi 16, 17, 18: questi campi sono obbligatori e devono essere numerici
                // Usa il valore raw (con spazi) per controllare se è completamente vuoto
                if (!rawValue || rawValue.trim() === '') {
                    return { isValid: false, errorMessage: `${field.name}: obbligatorio per tipo alloggiato ${tipoAlloggiato}` }
                }
                // Usa il valore trimmato per la validazione numerica
                if (!/^\d+$/.test(value)) {
                    return { isValid: false, errorMessage: `${field.name}: deve essere numerico` }
                }
            } else {
                // Per tipi 19 e 20: questi campi devono essere vuoti (solo spazi)
                if (value.trim() !== '') {
                    return { isValid: false, errorMessage: `${field.name}: non deve essere compilato per tipo alloggiato ${tipoAlloggiato}` }
                }
            }
            break

        case 24: // Tassa Soggiorno
            if (value && !['0', '1'].includes(value)) {
                return { isValid: false, errorMessage: "Tassa Soggiorno: valore non valido (0=no, 1=sì)" }
            }
            break

        case 25: // Codice Identificativo Posizione
            break

        case 26: // Modalità
            if (!['1', '2', '3'].includes(value)) {
                return { isValid: false, errorMessage: "Modalità: valore non valido (1=Nuovo, 2=Variazione, 3=Eliminazione)" }
            }

            // Regole aggiuntive per modalità 3 (Eliminazione)
            if (value === '3') {
                const requiredFields = ['field_1', 'field_2', 'field_25']
                for (const fieldKey of requiredFields) {
                    const fieldValue = getTrimmedValue(record, fieldKey)
                    if (!fieldValue) {
                        const fieldName = ROSS_FIELDS.find(f => `field_${f.id}` === fieldKey)?.name || fieldKey
                        return { isValid: false, errorMessage: `Modalità Eliminazione: ${fieldName} obbligatorio` }
                    }
                }
            }
            break
    }

    return { isValid: true }
}

// Funzione di validazione avanzata con contesto intelligente
export const validateRecordAdvanced = (record: RossRecord, recordIndex: number): RecordValidationResult => {
    const result: RecordValidationResult = {
        errors: [],
        warnings: [],
        info: [],
        hasErrors: false,
        hasWarnings: false,
        hasInfo: false
    }

    const tipoAlloggiato = getTrimmedValue(record, 'field_1')
    const modalita = getTrimmedValue(record, 'field_26')
    const dataArrivo = getTrimmedValue(record, 'field_2')
    const dataPartenza = getTrimmedValue(record, 'field_18')
    const cittadinanza = getTrimmedValue(record, 'field_10')
    const statoResidenza = getTrimmedValue(record, 'field_13')
    const camereOccupate = getTrimmedValue(record, 'field_21')
    const camereDisponibili = getTrimmedValue(record, 'field_22')
    const lettiDisponibili = getTrimmedValue(record, 'field_23')

    // 1. Validazione contestuale basata sul tipo di alloggiato
    if (['16', '17', '18'].includes(tipoAlloggiato)) {
        // Per capi gruppo/famiglia e ospiti singoli, verificare la coerenza dei dati
        if (tipoAlloggiato === '17' || tipoAlloggiato === '18') {
            const codiceIdentificativo = getTrimmedValue(record, 'field_25')
            if (!codiceIdentificativo) {
                result.errors.push({
                    isValid: false,
                    level: 'error',
                    message: `Codice identificativo posizione obbligatorio per ${tipoAlloggiato === '17' ? 'Capo Famiglia' : 'Capo Gruppo'}`,
                    fieldId: 25
                })
            }
        }
    }

    // 2. Validazione cross-campi per date (sempre attiva quando entrambe le date sono presenti)
    if (dataArrivo && dataPartenza) {
        const parseDate = (dateStr: string) => {
            const [day, month, year] = dateStr.split('/').map(Number)
            return new Date(year, month - 1, day)
        }

        const arrivo = parseDate(dataArrivo)
        const partenza = parseDate(dataPartenza)

        // Controllo: Data Partenza deve essere successiva a Data Arrivo
        if (partenza <= arrivo) {
            result.errors.push({
                isValid: false,
                level: 'error',
                message: 'Data Partenza deve essere successiva a Data Arrivo',
                fieldId: 18
            })
        }

        // Warning per soggiorni molto lunghi
        if (partenza > arrivo) {
            const giorniSoggiorno = Math.ceil((partenza.getTime() - arrivo.getTime()) / (1000 * 60 * 60 * 24))
            if (giorniSoggiorno > 365) {
                result.warnings.push({
                    isValid: true,
                    level: 'warning',
                    message: `Soggiorno prolungato: ${giorniSoggiorno} giorni`,
                    fieldId: 18
                })
            }
        }
    }

    // 3. Validazione coerenza geografica
    if (cittadinanza === '000' && statoResidenza !== '000') {
        result.warnings.push({
            isValid: true,
            level: 'warning',
            message: 'Cittadino italiano con residenza all\'estero',
            fieldId: 13
        })
    }

    // 4. Validazione logica camere e letti
    // Regola ISTAT: Il numero delle camere e dei letti deve essere specificato 
    // solo in corrispondenza del Tipo Alloggiato 16, 17 o 18
    if (['16', '17', '18'].includes(tipoAlloggiato)) {
        const camereOcc = parseInt(camereOccupate) || 0
        const camereDisp = parseInt(camereDisponibili) || 0
        const lettiDisp = parseInt(lettiDisponibili) || 0
        const tipoLabel = tipoAlloggiato === '16' ? 'Ospite Singolo' : tipoAlloggiato === '17' ? 'Capo Famiglia' : 'Capo Gruppo'

        // Errore: camere occupate obbligatorie per tipi 16, 17, 18
        if (!camereOccupate || camereOcc === 0) {
            result.errors.push({
                isValid: false,
                level: 'error',
                message: `Camere Occupate obbligatorie per ${tipoLabel}`,
                fieldId: 21
            })
        }

        // Errore: camere disponibili obbligatorie per tipi 16, 17, 18
        if (!camereDisponibili || camereDisp === 0) {
            result.errors.push({
                isValid: false,
                level: 'error',
                message: `Camere Disponibili obbligatorie per ${tipoLabel}`,
                fieldId: 22
            })
        }

        // Errore: letti disponibili obbligatori per tipi 16, 17, 18
        if (!lettiDisponibili || lettiDisp === 0) {
            result.errors.push({
                isValid: false,
                level: 'error',
                message: `Letti Disponibili obbligatori per ${tipoLabel}`,
                fieldId: 23
            })
        }

        // Validazione ulteriore: camere occupate non possono superare camere disponibili
        if (camereOcc > camereDisp && camereDisp > 0) {
            result.errors.push({
                isValid: false,
                level: 'error',
                message: 'Camere occupate non possono superare camere disponibili',
                fieldId: 21
            })
        }

        // Warning: più camere occupate che letti disponibili
        if (camereOcc > 0 && lettiDisp > 0 && camereOcc > lettiDisp) {
            result.warnings.push({
                isValid: true,
                level: 'warning',
                message: 'Più camere occupate che letti disponibili',
                fieldId: 21
            })
        }
    }

    // 5. Validazione modalità eliminazione
    if (modalita === '3') {
        // Per eliminazione, solo campi chiave sono necessari
        const campiNecessari = ['field_1', 'field_2', 'field_25']
        campiNecessari.forEach(fieldKey => {
            const value = getTrimmedValue(record, fieldKey)
            if (!value) {
                const fieldId = parseInt(fieldKey.replace('field_', ''))
                result.errors.push({
                    isValid: false,
                    level: 'error',
                    message: `Campo obbligatorio per eliminazione: ${ROSS_FIELDS.find(f => f.id === fieldId)?.name}`,
                    fieldId
                })
            }
        })

        // Warning se altri campi sono compilati in modalità eliminazione
        const campiNonNecessari = ROSS_FIELDS.filter(f => ![1, 2, 25, 26].includes(f.id))
        campiNonNecessari.forEach(field => {
            const value = getTrimmedValue(record, `field_${field.id}`)
            if (value) {
                result.warnings.push({
                    isValid: true,
                    level: 'warning',
                    message: `Campo non necessario per eliminazione: ${field.name}`,
                    fieldId: field.id
                })
            }
        })
    }

    // 6. Validazione dati anagrafici coerenza
    const dataNascita = getTrimmedValue(record, 'field_6')
    if (dataArrivo && dataNascita) {
        const parseDate = (dateStr: string) => {
            const [day, month, year] = dateStr.split('/').map(Number)
            return new Date(year, month - 1, day)
        }

        const nascita = parseDate(dataNascita)
        const arrivo = parseDate(dataArrivo)
        const eta = arrivo.getFullYear() - nascita.getFullYear()

        if (eta < 0) {
            result.errors.push({
                isValid: false,
                level: 'error',
                message: 'Data di nascita posteriore alla data di arrivo',
                fieldId: 6
            })
        } else if (eta > 120) {
            result.warnings.push({
                isValid: true,
                level: 'warning',
                message: `Età anomala: ${eta} anni`,
                fieldId: 6
            })
        } else if (eta < 18 && !['19', '20'].includes(tipoAlloggiato)) {
            result.info.push({
                isValid: true,
                level: 'info',
                message: `Ospite minorenne: ${eta} anni`,
                fieldId: 6
            })
        }
    }

    // 7. Validazione codici fiscali e documenti
    const codiceComuneNascita = getTrimmedValue(record, 'field_7')
    const siglaProvinciaNascita = getTrimmedValue(record, 'field_8')
    const codiceStatoNascita = getTrimmedValue(record, 'field_9')

    if (cittadinanza === '000' && codiceStatoNascita === '000') {
        if (!codiceComuneNascita) {
            result.errors.push({
                isValid: false,
                level: 'error',
                message: 'Codice comune nascita obbligatorio per cittadini italiani nati in Italia',
                fieldId: 7
            })
        }
        if (!siglaProvinciaNascita) {
            result.errors.push({
                isValid: false,
                level: 'error',
                message: 'Sigla provincia nascita obbligatoria per cittadini italiani nati in Italia',
                fieldId: 8
            })
        }
    }

    // 8. Analisi pattern turismo e trasporto
    const tipoTurismo = getTrimmedValue(record, 'field_19')
    const mezzoTrasporto = getTrimmedValue(record, 'field_20')

    if (tipoTurismo === 'Balneare' && mezzoTrasporto === 'Aereo') {
        result.info.push({
            isValid: true,
            level: 'info',
            message: 'Combinazione turismo balneare con trasporto aereo',
            fieldId: 20
        })
    }

    if (tipoTurismo === 'Cicloturismo' && mezzoTrasporto === 'Auto') {
        result.info.push({
            isValid: true,
            level: 'info',
            message: 'Cicloturismo con trasporto auto (probabile trasporto bici)',
            fieldId: 20
        })
    }

    // Aggiorna i flag di stato
    result.hasErrors = result.errors.length > 0
    result.hasWarnings = result.warnings.length > 0
    result.hasInfo = result.info.length > 0

    return result
}
