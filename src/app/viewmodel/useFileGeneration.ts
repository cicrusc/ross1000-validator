import { RossRecord, RecordValidationResult } from '../model/types'
import { ROSS_FIELDS } from '../model/constants'
import { getTrimmedValue, convertDateForXML, convertSexForXML } from '../model/helpers'

export const generateTxtFile = async (
    filterValid: boolean,
    records: RossRecord[],
    hasMissingRequiredFields: (index: number) => boolean,
    validationErrors: { [key: number]: string[] },
    file: File | null
) => {
    let content = ''

    // Filtra i record in base al parametro
    const recordsToInclude = records.filter((_, index) => {
        if (filterValid) {
            // Includi solo i record validi
            return !hasMissingRequiredFields(index) && (validationErrors[index] || []).length === 0
        } else {
            // Includi solo i record NON validi
            return hasMissingRequiredFields(index) || (validationErrors[index] || []).length > 0
        }
    })

    if (recordsToInclude.length === 0) {
        alert('Nessun record da scaricare con i criteri selezionati')
        return
    }

    // Genera il contenuto del file
    for (const record of recordsToInclude) {
        let recordContent = ''

        for (const field of ROSS_FIELDS) {
            const value = getTrimmedValue(record, `field_${field.id}`)

            // Applica il padding corretto: tutti i campi usano padding a destra (valori allineati a sinistra)
            // Usa trim() per rimuovere solo spazi iniziali/finali, preservando spazi interni (es: "Non Specificato")
            const cleanValue = value.trim()
            let paddedValue = cleanValue.padEnd(field.length, ' ')

            // Tronca se troppo lungo (sicurezza aggiuntiva)
            paddedValue = paddedValue.substring(0, field.length)

            recordContent += paddedValue
        }

        content += recordContent
        content += '\r\n' // Terminatore di riga Windows
    }

    try {
        // Genera nome file
        const originalName = file ? file.name.replace(/\.(txt|xml)$/i, '') : 'ROSS1000'
        const suffix = filterValid ? '_VALIDI' : '_ERRORI'
        const fileName = `${originalName}${suffix}.txt`

        // Crea il Blob direttamente nel browser
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)

        // Crea link per il download
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

    } catch (error) {
        console.error('❌ Download failed:', error)
        alert(`Errore durante il download: ${error}`)
    }
}

// Funzione per generare report di validazione dettagliato
export const generateValidationReport = (
    records: RossRecord[],
    hasMissingRequiredFields: (index: number) => boolean,
    validationErrors: { [key: number]: string[] },
    advancedValidation: { [key: number]: RecordValidationResult },
    file: File | null
) => {
    let report = `REPORT DI VALIDAZIONE ROSS1000 - ISTAT\n`
    report += `=====================================\n\n`
    report += `Data generazione: ${new Date().toLocaleString('it-IT')}\n`
    report += `File elaborato: ${file ? file.name : 'Nessun file caricato'}\n`
    report += `Totale record: ${records.length}\n\n`

    const validRecords = records.filter((_, index) =>
        !hasMissingRequiredFields(index) && (validationErrors[index] || []).length === 0
    ).length

    const invalidRecords = records.length - validRecords

    report += `RIEPILOGO:\n`
    report += `----------\n`
    report += `Record validi: ${validRecords}\n`
    report += `Record non validi: ${invalidRecords}\n`
    report += `Tasso di validità: ${((validRecords / records.length) * 100).toFixed(1)}%\n\n`

    // Analisi avanzata
    let totalErrors = 0
    let totalWarnings = 0
    let totalInfo = 0

    report += `ANALISI DETTAGLIATA:\n`
    report += `-------------------\n\n`

    records.forEach((record, index) => {
        const advancedResult = advancedValidation[index]
        const recordErrors = validationErrors[index] || []

        report += `RECORD ${index + 1}:\n`
        report += `------------\n`

        if (recordErrors.length === 0 && !advancedResult?.hasErrors && !advancedResult?.hasWarnings && !advancedResult?.hasInfo) {
            report += `Stato: VALIDO ✅\n\n`
        } else {
            report += `Stato: NON VALIDO ❌\n`

            if (recordErrors.length > 0) {
                report += `Errori di base:\n`
                recordErrors.forEach(error => {
                    report += `  - ${error}\n`
                    totalErrors++
                })
            }

            if (advancedResult?.hasErrors) {
                report += `Errori avanzati:\n`
                advancedResult.errors.forEach(error => {
                    report += `  - ${error.message}\n`
                    totalErrors++
                })
            }

            if (advancedResult?.hasWarnings) {
                report += `Avvertimenti:\n`
                advancedResult.warnings.forEach(warning => {
                    report += `  - ${warning.message}\n`
                    totalWarnings++
                })
            }

            if (advancedResult?.hasInfo) {
                report += `Informazioni:\n`
                advancedResult.info.forEach(info => {
                    report += `  - ${info.message}\n`
                    totalInfo++
                })
            }

            report += `\n`
        }
    })

    report += `STATISTICHE FINALI:\n`
    report += `------------------\n`
    report += `Totale errori: ${totalErrors}\n`
    report += `Totale avvertimenti: ${totalWarnings}\n`
    report += `Totale informazioni: ${totalInfo}\n\n`

    // Analisi per tipo di errore
    report += `ANALISI PER TIPOLOGIA:\n`
    report += `----------------------\n`

    const errorByField: { [key: number]: number } = {}
    const warningByField: { [key: number]: number } = {}

    Object.values(advancedValidation).forEach(result => {
        result.errors.forEach(error => {
            if (error.fieldId) {
                errorByField[error.fieldId] = (errorByField[error.fieldId] || 0) + 1
            }
        })
        result.warnings.forEach(warning => {
            if (warning.fieldId) {
                warningByField[warning.fieldId] = (warningByField[warning.fieldId] || 0) + 1
            }
        })
    })

    if (Object.keys(errorByField).length > 0) {
        report += `Campi con più errori:\n`
        Object.entries(errorByField)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .forEach(([fieldId, count]) => {
                const fieldName = ROSS_FIELDS.find(f => f.id === parseInt(fieldId))?.name || fieldId
                report += `  - ${fieldName}: ${count} errori\n`
            })
    }

    if (Object.keys(warningByField).length > 0) {
        report += `\nCampi con più avvertimenti:\n`
        Object.entries(warningByField)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .forEach(([fieldId, count]) => {
                const fieldName = ROSS_FIELDS.find(f => f.id === parseInt(fieldId))?.name || fieldId
                report += `  - ${fieldName}: ${count} avvertimenti\n`
            })
    }

    // Genera il file di report
    const fileName = file ? `${file.name.replace(/\.txt$/i, '')}_REPORT_VALIDAZIONE.txt` : 'ROSS1000_REPORT_VALIDAZIONE.txt'
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

// Funzione per generare file XML secondo le specifiche ROSS 1000
export const generateXMLFile = async (
    records: RossRecord[],
    hasMissingRequiredFields: (index: number) => boolean,
    validationErrors: { [key: number]: string[] },
    file: File | null,
    setGeneratedXml: (xml: string) => void
) => {
    if (records.length === 0) {
        alert('Nessun record da elaborare')
        return
    }

    // Filtra solo i record validi (come in generateTxtFile(true))
    const validRecords = records.filter((_, index) =>
        !hasMissingRequiredFields(index) && (validationErrors[index] || []).length === 0
    )

    if (validRecords.length === 0) {
        alert('Nessun record valido da elaborare. Correggere gli errori prima di generare l\'XML.')
        return
    }

    // Costanti
    const CODICE_ITALIA = '100000100'
    const SOFTWARE_NAME = 'ROSS1000-ISTAT-Processor'

    // Estraiamo il codice struttura dal nome del file se disponibile
    let codiceStruttura = 'STRUTTURA001'
    if (file && file.name) {
        const match = file.name.match(/^([A-Za-z0-9]+)/)
        if (match) {
            codiceStruttura = match[1]
        }
    }

    // Funzione helper per ottenere valore pulito da un campo
    const getFieldValueLocal = (record: RossRecord, fieldId: number): string => {
        return (record[`field_${fieldId}`] || '').trim()
    }

    // Raggruppa record per data di arrivo (solo record validi)
    const arriviPerData: { [data: string]: RossRecord[] } = {}
    const partenzePerData: { [data: string]: RossRecord[] } = {}

    // Prima passata: raggruppiamo gli arrivi (solo record validi)
    validRecords.forEach(record => {
        const dataArrivo = getFieldValueLocal(record, 2)
        if (dataArrivo) {
            if (!arriviPerData[dataArrivo]) {
                arriviPerData[dataArrivo] = []
            }
            arriviPerData[dataArrivo].push(record)
        }

        // Raccogliamo anche le partenze (solo se il record è valido)
        const dataPartenza = getFieldValueLocal(record, 18)
        if (dataPartenza) {
            if (!partenzePerData[dataPartenza]) {
                partenzePerData[dataPartenza] = []
            }
            partenzePerData[dataPartenza].push(record)
        }
    })

    // Crea mappa dei capogruppo per tipi 19/20 (solo tra record validi)
    const capogruppoMap: { [idswh: string]: string } = {}
    validRecords.forEach(record => {
        const tipoAlloggiato = getFieldValueLocal(record, 1)
        const idswh = getFieldValueLocal(record, 25)

        if ((tipoAlloggiato === '17' || tipoAlloggiato === '18') && idswh) {
            // Cerca i familiari/membri gruppo associati (solo tra record validi)
            validRecords.forEach(otherRecord => {
                const otherTipo = getFieldValueLocal(otherRecord, 1)
                const otherIdswh = getFieldValueLocal(otherRecord, 25)

                if ((otherTipo === '19' || otherTipo === '20') && otherIdswh) {
                    // Logica semplice: assumiamo che i membri gruppo seguano subito il capogruppo
                    // In un caso reale, servirebbe una logica più sofisticata
                    capogruppoMap[otherIdswh] = idswh
                }
            })
        }
    })

    // Genera XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<movimenti>\n`
    xml += `  <codice>${codiceStruttura}</codice>\n`
    xml += `  <prodotto>${SOFTWARE_NAME}</prodotto>\n`

    // Processa tutte le date uniche (arrivi + partenze)
    const tutteLeDate = new Set([
        ...Object.keys(arriviPerData),
        ...Object.keys(partenzePerData)
    ])

    const dateOrdinate = Array.from(tutteLeDate).sort()

    dateOrdinate.forEach(dataStr => {
        const dataXML = convertDateForXML(dataStr)
        xml += `  <movimento>\n`
        xml += `    <data>${dataXML}</data>\n`

        // Struttura
        const arriviQuestaData = arriviPerData[dataStr] || []
        const camereOccupate = arriviQuestaData.reduce((total, record) => {
            const tipo = getFieldValueLocal(record, 1)
            const camere = parseInt(getFieldValueLocal(record, 21)) || 0
            // Solo tipi 16, 17, 18 contribuiscono alle camere
            return total + (['16', '17', '18'].includes(tipo) ? camere : 0)
        }, 0)

        // Prendi i valori dal primo record di questa data
        const primoRecord = arriviQuestaData[0]
        const camereDisponibili = primoRecord ? parseInt(getFieldValueLocal(primoRecord, 22)) || 0 : 0
        const lettiDisponibili = primoRecord ? parseInt(getFieldValueLocal(primoRecord, 23)) || 0 : 0

        xml += `    <struttura>\n`
        xml += `      <apertura>SI</apertura>\n`
        xml += `      <camereoccupate>${camereOccupate}</camereoccupate>\n`
        xml += `      <cameredisponibili>${camereDisponibili}</cameredisponibili>\n`
        xml += `      <lettidisponibili>${lettiDisponibili}</lettidisponibili>\n`
        xml += `    </struttura>\n`

        // Arrivi
        if (arriviQuestaData.length > 0) {
            xml += `    <arrivi>\n`

            arriviQuestaData.forEach(record => {
                const modalita = getFieldValueLocal(record, 26)
                // Solo record con modalità 1 (Nuovo) o 2 (Variazione) vanno negli arrivi
                if (modalita === '1' || modalita === '2') {
                    xml += `      <arrivo>\n`

                    // Campi obbligatori
                    xml += `        <idswh>${getFieldValueLocal(record, 25)}</idswh>\n`
                    xml += `        <tipoalloggiato>${getFieldValueLocal(record, 1)}</tipoalloggiato>\n`
                    xml += `        <sesso>${convertSexForXML(getFieldValueLocal(record, 5))}</sesso>\n`
                    xml += `        <cittadinanza>${getFieldValueLocal(record, 10)}</cittadinanza>\n`
                    xml += `        <statoresidenza>${getFieldValueLocal(record, 13)}</statoresidenza>\n`
                    xml += `        <datanascita>${convertDateForXML(getFieldValueLocal(record, 6))}</datanascita>\n`
                    xml += `        <tipoturismo>${getFieldValueLocal(record, 19)}</tipoturismo>\n`
                    xml += `        <mezzotrasporto>${getFieldValueLocal(record, 20)}</mezzotrasporto>\n`

                    // Campi condizionali
                    const statoResidenza = getFieldValueLocal(record, 13)
                    if (statoResidenza === CODICE_ITALIA) {
                        xml += `        <luogoresidenza>${getFieldValueLocal(record, 11)}</luogoresidenza>\n`
                    } else {
                        xml += `        <luogoresidenza></luogoresidenza>\n`
                    }

                    const statoNascita = getFieldValueLocal(record, 9)
                    if (statoNascita === CODICE_ITALIA) {
                        xml += `        <comunenascita>${getFieldValueLocal(record, 7)}</comunenascita>\n`
                    } else {
                        xml += `        <comunenascita></comunenascita>\n`
                    }
                    xml += `        <statonascita>${statoNascita}</statonascita>\n`

                    // idcapo per tipi 19/20
                    const tipoAlloggiato = getFieldValueLocal(record, 1)
                    const idswh = getFieldValueLocal(record, 25)
                    if (tipoAlloggiato === '19' || tipoAlloggiato === '20') {
                        xml += `        <idcapo>${capogruppoMap[idswh] || ''}</idcapo>\n`
                    } else {
                        xml += `        <idcapo></idcapo>\n`
                    }

                    // Campi opzionali (possono essere vuoti)
                    xml += `        <cognome>${getFieldValueLocal(record, 3)}</cognome>\n`
                    xml += `        <nome>${getFieldValueLocal(record, 4)}</nome>\n`
                    xml += `        <canaleprenotazione></canaleprenotazione>\n`
                    xml += `        <titolostudio></titolostudio>\n`
                    xml += `        <professione></professione>\n`
                    xml += `        <esenzioneimposta></esenzioneimposta>\n`

                    xml += `      </arrivo>\n`
                }
            })

            xml += `    </arrivi>\n`
        } else {
            xml += `    <arrivi></arrivi>\n`
        }

        // Partenze
        const partenzeQuestaData = partenzePerData[dataStr] || []
        if (partenzeQuestaData.length > 0) {
            xml += `    <partenze>\n`

            partenzeQuestaData.forEach(record => {
                xml += `      <partenza>\n`
                xml += `        <idswh>${getFieldValueLocal(record, 25)}</idswh>\n`
                xml += `        <tipoalloggiato>${getFieldValueLocal(record, 1)}</tipoalloggiato>\n`
                xml += `        <arrivo>${convertDateForXML(getFieldValueLocal(record, 2))}</arrivo>\n`
                xml += `      </partenza>\n`
            })

            xml += `    </partenze>\n`
        } else {
            xml += `    <partenze></partenze>\n`
        }

        xml += `  </movimento>\n`
    })

    xml += `</movimenti>\n`

    // Usa il server backend per il download (risolve problema Chrome)
    const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : ''
    const xmlFileName = `${codiceStruttura}_movimenti_${new Date().toISOString().split('T')[0]}.xml`

    try {
        // Verifica se il contenuto è troppo grande per JSON (limite circa 50MB per alcuni browser)
        const MAX_JSON_SIZE = 25 * 1024 * 1024 // 25MB limite sicuro

        if (xml.length > MAX_JSON_SIZE) {
            console.log('⚠️ XML Content too large for JSON, using FormData instead')

            // Usa FormData per contenuti molto grandi
            const formData = new FormData()
            formData.append('content', xml)
            formData.append('fileName', xmlFileName)

            const response = await fetch(`${API_BASE}/api/download/xml`, {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || `HTTP ${response.status}`)
            }

            // Il browser gestirà automaticamente il download con gli header corretti
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = xmlFileName
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

        } else {
            // Usa JSON per contenuti normali
            const response = await fetch(`${API_BASE}/api/download/xml`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: xml,
                    fileName: xmlFileName
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || `HTTP ${response.status}`)
            }

            // Il browser gestirà automaticamente il download con gli header corretti
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = xmlFileName
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }

    } catch (error) {
        console.error('❌ XML download failed:', error)
        alert(`Errore durante il download XML: ${error}`)
    }

    // Salva l'XML generato nello stato per l'invio ROSS 1000
    setGeneratedXml(xml)
}
