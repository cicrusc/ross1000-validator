import { RossRecord } from '../model/types'
import { ROSS_FIELDS } from '../model/constants'
import { getTrimmedValue } from '../model/helpers'

export const parseXmlFile = async (
    file: File,
    setIsProcessing: (val: boolean) => void,
    setErrors: (val: string[]) => void,
    setCorrectedFields: (val: { [key: string]: boolean }) => void,
    setRecords: (val: RossRecord[]) => void,
    validateRecordCompletely: (index: number, record?: RossRecord) => void,
    runCompleteCheck: () => boolean,
    setActiveTab: (val: 'valid' | 'invalid') => void
) => {
    setIsProcessing(true)
    setErrors([])
    setCorrectedFields({}) // Resetta i campi corretti quando carica un nuovo file

    try {
        const text = await file.text()
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(text, "text/xml")

        // Controlla se ci sono errori di parsing XML
        const parserError = xmlDoc.querySelector("parsererror")
        if (parserError) {
            setErrors(['Errore nel parsing del file XML: formato non valido'])
            setIsProcessing(false)
            return
        }

        const parsedRecords: RossRecord[] = []

        // Estrai tutti i movimenti
        const movimenti = xmlDoc.querySelectorAll("movimento")

        if (movimenti.length === 0) {
            setErrors(['Nessun movimento trovato nel file XML'])
            setIsProcessing(false)
            return
        }

        // Genera un ID progressivo per i record
        let recordIdCounter = 1

        movimenti.forEach((movimento) => {
            const dataMovimento = movimento.querySelector("data")?.textContent || ""

            // Converti data da YYYYMMDD a DD/MM/YYYY
            const formattedData = dataMovimento.length === 8 ?
                `${dataMovimento.substring(6, 8)}/${dataMovimento.substring(4, 6)}/${dataMovimento.substring(0, 4)}` :
                dataMovimento

            // Estrai dati della struttura
            const struttura = movimento.querySelector("struttura")
            const camereOccupate = struttura?.querySelector("camereoccupate")?.textContent || "0"
            const camereDisponibili = struttura?.querySelector("cameredisponibili")?.textContent || "0"
            const lettiDisponibili = struttura?.querySelector("lettidisponibili")?.textContent || "0"

            // Processa gli arrivi
            const arrivi = movimento.querySelectorAll("arrivi > arrivo")
            arrivi.forEach((arrivo) => {
                const record: RossRecord = {}

                // Estrai i dati dall'arrivo
                const idswh = arrivo.querySelector("idswh")?.textContent || ""
                const tipoAlloggiato = arrivo.querySelector("tipoalloggiato")?.textContent || "16"
                const idCapo = arrivo.querySelector("idcapo")?.textContent || ""
                const sesso = arrivo.querySelector("sesso")?.textContent || "1"
                const cittadinanza = arrivo.querySelector("cittadinanza")?.textContent || ""
                const statoResidenza = arrivo.querySelector("statoresidenza")?.textContent || ""
                const luogoResidenza = arrivo.querySelector("luogoresidenza")?.textContent || ""
                const dataNascita = arrivo.querySelector("datanascita")?.textContent || ""
                const statoNascita = arrivo.querySelector("statonascita")?.textContent || ""
                const comuneNascita = arrivo.querySelector("comunenascita")?.textContent || ""
                const tipoTurismo = arrivo.querySelector("tipoturismo")?.textContent || "NON SPECIFICATO"
                const mezzoTrasporto = arrivo.querySelector("mezzotrasporto")?.textContent || "NON SPECIFICATO"

                // Converti data di nascita da YYYYMMDD a DD/MM/YYYY
                const formattedDataNascita = dataNascita.length === 8 ?
                    `${dataNascita.substring(6, 8)}/${dataNascita.substring(4, 6)}/${dataNascita.substring(0, 4)}` :
                    dataNascita

                // Popola i campi ROSS 1000
                record.field_1 = tipoAlloggiato.padEnd(2, ' ')
                record.field_2 = formattedData.padEnd(10, ' ') // Data arrivo
                record.field_3 = ''.padEnd(50, ' ') // Cognome - vuoto
                record.field_4 = ''.padEnd(30, ' ') // Nome - vuoto
                record.field_5 = (sesso === 'M' ? '1' : sesso === 'F' ? '2' : '1').padEnd(1, ' ')
                record.field_6 = formattedDataNascita.padEnd(10, ' ')
                record.field_7 = (comuneNascita || '').padEnd(9, ' ')
                record.field_8 = ''.padEnd(2, ' ') // Sigla provincia nascita
                record.field_9 = (statoNascita || cittadinanza).padEnd(9, ' ')
                record.field_10 = cittadinanza.padEnd(9, ' ')
                record.field_11 = (luogoResidenza || '').padEnd(9, ' ')
                record.field_12 = ''.padEnd(2, ' ') // Sigla provincia residenza
                record.field_13 = statoResidenza.padEnd(9, ' ')
                record.field_14 = ''.padEnd(50, ' ') // Indirizzo - vuoto
                record.field_15 = ''.padEnd(5, ' ') // Codice tipo documento - vuoto
                record.field_16 = ''.padEnd(20, ' ') // Numero documento - vuoto
                record.field_17 = ''.padEnd(9, ' ') // Luogo rilascio doc - vuoto
                record.field_18 = ''.padEnd(10, ' ') // Data partenza - da calcolare
                record.field_19 = tipoTurismo.padEnd(30, ' ')
                record.field_20 = mezzoTrasporto.padEnd(30, ' ')
                record.field_21 = camereOccupate.padEnd(3, ' ')
                record.field_22 = camereDisponibili.padEnd(3, ' ')
                record.field_23 = lettiDisponibili.padEnd(4, ' ')
                record.field_24 = ''.padEnd(1, ' ') // Tassa soggiorno
                record.field_25 = idswh.padEnd(10, ' ') // Usa IDSWH come identificativo
                record.field_26 = '1'.padEnd(1, ' ') // Modalità: Nuovo

                parsedRecords.push(record)
                recordIdCounter++
            })

            // Processa anche le prenotazioni come arrivi futuri
            const prenotazioni = movimento.querySelectorAll("prenotazioni > prenotazione")
            prenotazioni.forEach((prenotazione) => {
                const arrivoPrenotazione = prenotazione.querySelector("arrivo")?.textContent || ""
                const partenzaPrenotazione = prenotazione.querySelector("partenza")?.textContent || ""
                const ospiti = parseInt(prenotazione.querySelector("ospiti")?.textContent || "0")

                // Converti date
                const formattedArrivo = arrivoPrenotazione.length === 8 ?
                    `${arrivoPrenotazione.substring(6, 8)}/${arrivoPrenotazione.substring(4, 6)}/${arrivoPrenotazione.substring(0, 4)}` :
                    arrivoPrenotazione

                // Crea un record per la prenotazione (solo se ci sono ospiti)
                if (ospiti > 0) {
                    const record: RossRecord = {}

                    record.field_1 = '16'.padEnd(2, ' ') // Ospite singolo
                    record.field_2 = formattedArrivo.padEnd(10, ' ')
                    record.field_3 = ''.padEnd(50, ' ')
                    record.field_4 = ''.padEnd(30, ' ')
                    record.field_5 = '1'.padEnd(1, ' ')
                    record.field_6 = ''.padEnd(10, ' ') // Data nascita non disponibile
                    record.field_7 = ''.padEnd(9, ' ')
                    record.field_8 = ''.padEnd(2, ' ')
                    record.field_9 = ''.padEnd(9, ' ')
                    record.field_10 = ''.padEnd(9, ' ')
                    record.field_11 = ''.padEnd(9, ' ')
                    record.field_12 = ''.padEnd(2, ' ')
                    record.field_13 = ''.padEnd(9, ' ')
                    record.field_14 = ''.padEnd(50, ' ')
                    record.field_15 = ''.padEnd(5, ' ')
                    record.field_16 = ''.padEnd(20, ' ')
                    record.field_17 = ''.padEnd(9, ' ')
                    record.field_18 = partenzaPrenotazione.length === 8 ?
                        `${partenzaPrenotazione.substring(6, 8)}/${partenzaPrenotazione.substring(4, 6)}/${partenzaPrenotazione.substring(0, 4)}`.padEnd(10, ' ') :
                        ''.padEnd(10, ' ')
                    record.field_19 = 'NON SPECIFICATO'.padEnd(30, ' ')
                    record.field_20 = 'NON SPECIFICATO'.padEnd(30, ' ')
                    record.field_21 = '1'.padEnd(3, ' ')
                    record.field_22 = camereDisponibili.padEnd(3, ' ')
                    record.field_23 = lettiDisponibili.padEnd(4, ' ')
                    record.field_24 = ''.padEnd(1, ' ')
                    record.field_25 = prenotazione.querySelector("idswh")?.textContent?.padEnd(10, ' ') || `PREN${recordIdCounter}`.padEnd(10, ' ')
                    record.field_26 = '1'.padEnd(1, ' ')

                    parsedRecords.push(record)
                    recordIdCounter++
                }
            })
        })

        if (parsedRecords.length === 0) {
            setErrors(['Nessun record valido trovato nel file XML'])
            setIsProcessing(false)
            return
        }

        setRecords(parsedRecords)

        // Validazione iniziale per tutti i record
        setTimeout(() => {
            parsedRecords.forEach((record, index) => {
                validateRecordCompletely(index, record)
            })

            // Esegui il check completo e imposta la scheda corretta
            setTimeout(() => {
                const isValid = runCompleteCheck()

                // Mantieni sempre la scheda 'valid' come default dopo il caricamento
                setActiveTab('valid')
            }, 100)
        }, 100)

    } catch (error) {
        setErrors(['Errore durante la lettura del file XML: ' + (error as Error).message])
    } finally {
        setIsProcessing(false)
    }
}

export const parseTxtFile = async (
    file: File,
    setIsProcessing: (val: boolean) => void,
    setErrors: (val: string[]) => void,
    setCorrectedFields: (val: { [key: string]: boolean }) => void,
    setRecords: (val: RossRecord[]) => void,
    validateRecordCompletely: (index: number, record?: RossRecord) => void,
    runCompleteCheck: () => boolean,
    setActiveTab: (val: 'valid' | 'invalid') => void,
    validateField: (record: RossRecord, fieldId: number) => { isValid: boolean; errorMessage?: string }
) => {
    setIsProcessing(true)
    setErrors([])
    setCorrectedFields({}) // Resetta i campi corretti quando carica un nuovo file

    try {
        const text = await file.text()
        // Gestisci sia \r\n che \n come separatori di riga
        const lines = text.split(/\r?\n/).filter(line => line.trim())
        const parsedRecords: RossRecord[] = []

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            const record: RossRecord = {}
            let position = 0

            for (const field of ROSS_FIELDS) {
                // Estrai il valore senza fare trim per preservare gli spazi nel formato a lunghezza fissa
                const value = line.substring(position, position + field.length)
                record[`field_${field.id}`] = value
                position += field.length
            }

            // Applica valori di default per campi specifici se completamente vuoti (solo spazi)
            const tipoTurismo = getTrimmedValue(record, 'field_19')
            if (!tipoTurismo) {
                record.field_19 = 'Non Specificato'.padEnd(30, ' ')
            }

            const mezzoTrasporto = getTrimmedValue(record, 'field_20')
            if (!mezzoTrasporto) {
                record.field_20 = 'Non Specificato'.padEnd(30, ' ')
            }

            parsedRecords.push(record)
        }

        setRecords(parsedRecords)

        // Validazione iniziale per tutti i record
        setTimeout(() => {
            parsedRecords.forEach((record, index) => {
                validateRecordCompletely(index, record)
            })

            // Esegui il check completo e imposta la scheda corretta
            setTimeout(() => {
                const isValid = runCompleteCheck()

                // Conta i record validi e non validi
                const validCount = parsedRecords.filter((_, index) => {
                    const record = parsedRecords[index]
                    if (!record) return false
                    return !ROSS_FIELDS.some(field => {
                        const validation = validateField(record, field.id)
                        return !validation.isValid
                    })
                }).length

                const invalidCount = parsedRecords.length - validCount

                // Mantieni sempre la scheda 'valid' come default dopo il caricamento
                setActiveTab('valid')
            }, 100)
        }, 100)

    } catch (error) {
        setErrors(['Errore durante la lettura del file: ' + (error as Error).message])
    } finally {
        setIsProcessing(false)
    }
}
