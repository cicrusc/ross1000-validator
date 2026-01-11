import { RossRecord } from './types'
import { ROSS_FIELDS, TIPO_ALLOGGIATO } from './constants'

// Funzioni di conversione per XML
export const convertDateForXML = (dateStr: string): string => {
    if (!dateStr || dateStr.trim() === '') return ''
    const parts = dateStr.split('/')
    if (parts.length !== 3) return dateStr
    const [day, month, year] = parts
    return `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`
}

export const convertSexForXML = (sexStr: string): string => {
    if (sexStr === '1') return 'M'
    if (sexStr === '2') return 'F'
    return sexStr
}

export const getTrimmedValue = (record: RossRecord, fieldId: string) => {
    const value = record[fieldId] || ''
    return value.trim()
}

export const getFieldValue = (record: RossRecord, fieldId: string) => {
    const value = record[fieldId] || ''
    // Non fare trim qui per preservare la lunghezza fissa
    return value
}

export const getDisplayValue = (record: RossRecord, fieldId: string) => {
    const field = ROSS_FIELDS.find(f => `field_${f.id}` === fieldId)
    if (!field) return ''

    const value = getTrimmedValue(record, fieldId)

    // Campi che devono essere mostrati come "-" (non popolabili)
    const blankFields = [3, 4, 14, 15, 16, 17]
    if (blankFields.includes(field.id)) {
        return '-'
    }

    // Handle special display values
    if (field.id === 1) {
        const tipo = TIPO_ALLOGGIATO.find(t => t.value === value)
        return tipo ? tipo.label : value
    }
    if (field.id === 5) {
        return value === '1' ? 'M' : value === '2' ? 'F' : value
    }
    if (field.id === 24) {
        return value === '1' ? 'Sì' : value === '0' ? 'No' : value
    }
    if (field.id === 26) {
        return value === '1' ? 'Nuovo' : value === '2' ? 'Variazione' : value === '3' ? 'Eliminazione' : value
    }

    return value
}
