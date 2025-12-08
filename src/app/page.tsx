'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Upload, Download, FileText, AlertCircle, CheckCircle, RotateCcw, AlertTriangle, Edit, X } from 'lucide-react'

// ROSS 1000 Field definitions according to Tracciato Record di integrazione dati (v.4 – 20/10/2022)
// Note: Codice Italia = '000' secondo le tabelle ufficiali ISTAT
const ROSS_FIELDS = [
  { id: 1, name: 'Tipo Alloggiato', length: 2, type: 'numeric', required: true, category: 'identification' },
  { id: 2, name: 'Data Arrivo', length: 10, type: 'alphanumeric', required: true, category: 'dates' },
  { id: 3, name: 'Cognome', length: 50, type: 'alphanumeric', required: false, category: 'personal', blank: true },
  { id: 4, name: 'Nome', length: 30, type: 'alphanumeric', required: false, category: 'personal', blank: true },
  { id: 5, name: 'Sesso', length: 1, type: 'numeric', required: true, category: 'personal' },
  { id: 6, name: 'Data Nascita', length: 10, type: 'alphanumeric', required: true, category: 'personal' },
  { id: 7, name: 'Codice Comune Nascita', length: 9, type: 'numeric', required: false, category: 'birth' },
  { id: 8, name: 'Sigla Provincia Nascita', length: 2, type: 'alphanumeric', required: false, category: 'birth' },
  { id: 9, name: 'Codice Stato Nascita', length: 9, type: 'numeric', required: true, category: 'birth' },
  { id: 10, name: 'Codice Cittadinanza', length: 9, type: 'numeric', required: true, category: 'citizenship' },
  { id: 11, name: 'Codice Comune Residenza', length: 9, type: 'numeric', required: 'conditional', category: 'residence' },
  { id: 12, name: 'Sigla Provincia Residenza', length: 2, type: 'alphanumeric', required: 'conditional', category: 'residence' },
  { id: 13, name: 'Codice Stato Residenza', length: 9, type: 'numeric', required: true, category: 'residence' },
  { id: 14, name: 'Indirizzo', length: 50, type: 'alphanumeric', required: false, category: 'residence', blank: true },
  { id: 15, name: 'Codice Tipo Documento', length: 5, type: 'alphanumeric', required: false, category: 'document', blank: true },
  { id: 16, name: 'Numero Documento', length: 20, type: 'alphanumeric', required: false, category: 'document', blank: true },
  { id: 17, name: 'Luogo Rilascio Doc', length: 9, type: 'numeric', required: false, category: 'document', blank: true },
  { id: 18, name: 'Data Partenza', length: 10, type: 'alphanumeric', required: 'conditional', category: 'dates' },
  { id: 19, name: 'Tipo Turismo', length: 30, type: 'alphanumeric', required: true, category: 'tourism' },
  { id: 20, name: 'Mezzo Trasporto', length: 30, type: 'alphanumeric', required: true, category: 'transport' },
  { id: 21, name: 'Camere Occupate', length: 3, type: 'numeric', required: 'conditional', category: 'accommodation' },
  { id: 22, name: 'Camere Disponibili', length: 3, type: 'numeric', required: 'conditional', category: 'accommodation' },
  { id: 23, name: 'Letti Disponibili', length: 4, type: 'numeric', required: 'conditional', category: 'accommodation' },
  { id: 24, name: 'Tassa Soggiorno', length: 1, type: 'numeric', required: false, category: 'fees' },
  { id: 25, name: 'Codice Identificativo Posizione', length: 10, type: 'alphanumeric', required: true, category: 'identification' },
  { id: 26, name: 'Modalità', length: 1, type: 'numeric', required: true, category: 'identification' }
]

const TIPOLOGIA_TURISMO = [
  'Culturale', 'Balneare', 'Congressuale/Affari', 'Fieristico', 'Sportivo/Fitness',
  'Scolastico', 'Religioso', 'Sociale', 'Parchi Tematici', 'Termale/Trattamenti salute',
  'Enogastronomico', 'Cicloturismo', 'Escursionistico/Naturalistico', 'Altro motivo', 'Non Specificato'
]

const MEZZI_TRASPORTO = [
  'Auto', 'Aereo', 'Aereo+Pullman', 'Aereo+Navetta/Taxi/Auto', 'Aereo+Treno', 'Treno',
  'Pullman', 'Caravan/Autocaravan', 'Barca/Nave/Traghetto', 'Moto', 'Bicicletta',
  'A piedi', 'Altro mezzo', 'Non Specificato'
]

const TIPO_ALLOGGIATO = [
  { value: '16', label: 'Ospite Singolo' },
  { value: '17', label: 'Capo Famiglia' },
  { value: '18', label: 'Capo Gruppo' },
  { value: '19', label: 'Familiare' },
  { value: '20', label: 'Membro Gruppo' }
]

interface RossRecord {
  [key: string]: string
}

interface ValidationResult {
  isValid: boolean
  level: 'error' | 'warning' | 'info'
  message: string
  fieldId?: number
}

interface RecordValidationResult {
  errors: ValidationResult[]
  warnings: ValidationResult[]
  info: ValidationResult[]
  hasErrors: boolean
  hasWarnings: boolean
  hasInfo: boolean
}



export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [records, setRecords] = useState<RossRecord[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [validationErrors, setValidationErrors] = useState<{ [key: number]: string[] }>({})
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({})
  const [correctedFields, setCorrectedFields] = useState<{ [key: string]: boolean }>({}) // Traccia i campi corretti
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<number | null>(null)
  const [editingField, setEditingField] = useState<{ recordIndex: number, fieldId: string } | null>(null)
  const [editingValue, setEditingValue] = useState<string>('') // Stato locale per l'editing
  const [activeTab, setActiveTab] = useState<'valid' | 'invalid'>('valid') // Scheda attiva
  const [advancedValidation, setAdvancedValidation] = useState<{ [key: number]: RecordValidationResult }>({})
  const [generatedXml, setGeneratedXml] = useState<string>('') // XML generato per l'invio ROSS 1000
  const [showLogin, setShowLogin] = useState<boolean>(false) // Controlla la visibilità del menu di login
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false) // Controlla se l'utente ha effettuato il login
  const [loginCredentials, setLoginCredentials] = useState({
    email: '',
    password: '',
    regione: ''
  })

  // Elenco delle regioni italiane
  const regioni = [
    { value: '', label: 'Seleziona regione...' },
    { value: 'abruzzo', label: 'Abruzzo' },
    { value: 'basilicata', label: 'Basilicata' },
    { value: 'calabria', label: 'Calabria' },
    { value: 'campania', label: 'Campania' },
    { value: 'emilia-romagna', label: 'Emilia-Romagna' },
    { value: 'friuli-venezia-giulia', label: 'Friuli-Venezia Giulia' },
    { value: 'lazio', label: 'Lazio' },
    { value: 'liguria', label: 'Liguria' },
    { value: 'lombardia', label: 'Lombardia' },
    { value: 'marche', label: 'Marche' },
    { value: 'molise', label: 'Molise' },
    { value: 'piemonte', label: 'Piemonte' },
    { value: 'puglia', label: 'Puglia' },
    { value: 'sardegna', label: 'Sardegna' },
    { value: 'sicilia', label: 'Sicilia' },
    { value: 'toscana', label: 'Toscana' },
    { value: 'trentino-alto-adige', label: 'Trentino-Alto Adige' },
    { value: 'umbria', label: 'Umbria' },
    { value: "valle-d'aosta", label: "Valle d'Aosta" },
    { value: 'veneto', label: 'Veneto' }
  ]

  const resetAll = () => {
    setFile(null)
    setRecords([])
    setErrors([])
    setValidationErrors({})
    setFieldErrors({})
    setCorrectedFields({}) // Resetta anche i campi corretti
    setAdvancedValidation({})
    setGeneratedXml('') // Resetta l'XML generato
    setShowLogin(false) // Resetta la visibilità del login
    setIsLoggedIn(false) // Resetta lo stato del login
    setLoginCredentials({ email: '', password: '', regione: '' }) // Resetta le credenziali di login
    setActiveTab('valid') // Resetta la scheda attiva a 'valid'
    setSelectedRecord(null)
    setEditingField(null)
    setEditingValue('')
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const startInlineEdit = (recordIndex: number, fieldId: string) => {
    const initialValue = getTrimmedValue(records[recordIndex], fieldId)
    setEditingValue(initialValue)
    setEditingField({ recordIndex, fieldId })
  }

  const cancelInlineEdit = () => {
    setEditingField(null)
    setEditingValue('')
  }

  const saveInlineEdit = (recordIndex: number, fieldId: string, value: string) => {
    // Aggiorna il campo nel record
    updateRecordField(recordIndex, fieldId, value)

    // Chiudi l'editing e resetta i valori
    setEditingField(null)
    setEditingValue('')
  }

  const getFieldValue = (record: RossRecord, fieldId: string) => {
    const value = record[fieldId] || ''
    // Non fare trim qui per preservare la lunghezza fissa
    return value
  }

  // Funzioni di conversione per XML
  const convertDateForXML = (dateStr: string): string => {
    if (!dateStr || dateStr.trim() === '') return ''
    const parts = dateStr.split('/')
    if (parts.length !== 3) return dateStr
    const [day, month, year] = parts
    return `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`
  }

  const convertSexForXML = (sexStr: string): string => {
    if (sexStr === '1') return 'M'
    if (sexStr === '2') return 'F'
    return sexStr
  }

  const getTrimmedValue = (record: RossRecord, fieldId: string) => {
    const value = record[fieldId] || ''
    return value.trim()
  }

  const getDisplayValue = (record: RossRecord, fieldId: string) => {
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

  // Render field cell for table view - Vero inline editor standard
  const renderFieldCell = (recordIndex: number, fieldId: number) => {
    const field = ROSS_FIELDS.find(f => f.id === fieldId)
    if (!field) return null

    const isEditing = editingField?.recordIndex === recordIndex && editingField?.fieldId === `field_${fieldId}`
    const fieldKey = `${recordIndex}_${fieldId}`
    const hasError = fieldErrors[fieldKey] || false
    const isCorrected = correctedFields[fieldKey] || false

    return (
      <td
        key={fieldId}
        className={`px-3 py-2 text-sm border-r border-slate-200 whitespace-nowrap ${hasError ? 'bg-red-100 text-red-800' :
          isCorrected && activeTab === 'valid' ? 'bg-green-50 text-green-700' : ''
          }`}
      >
        {isEditing ? (
          <div className="flex items-center gap-1">
            {/* Campi Select */}
            {fieldId === 1 && (
              <Select value={editingValue} onValueChange={(newValue) => setEditingValue(newValue)}>
                <SelectTrigger className="h-7 text-xs w-full">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {TIPO_ALLOGGIATO.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {fieldId === 5 && (
              <Select value={editingValue} onValueChange={(newValue) => setEditingValue(newValue)}>
                <SelectTrigger className="h-7 text-xs w-20">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">M</SelectItem>
                  <SelectItem value="2">F</SelectItem>
                </SelectContent>
              </Select>
            )}
            {fieldId === 19 && (
              <Select value={editingValue} onValueChange={(newValue) => setEditingValue(newValue)}>
                <SelectTrigger className="h-7 text-xs w-full">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOLOGIA_TURISMO.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {fieldId === 20 && (
              <Select value={editingValue} onValueChange={(newValue) => setEditingValue(newValue)}>
                <SelectTrigger className="h-7 text-xs w-full">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {MEZZI_TRASPORTO.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {fieldId === 24 && (
              <Select value={editingValue} onValueChange={(newValue) => setEditingValue(newValue)}>
                <SelectTrigger className="h-7 text-xs w-20">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Sì</SelectItem>
                  <SelectItem value="0">No</SelectItem>
                </SelectContent>
              </Select>
            )}
            {fieldId === 26 && (
              <Select value={editingValue} onValueChange={(newValue) => setEditingValue(newValue)}>
                <SelectTrigger className="h-7 text-xs w-28">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Nuovo</SelectItem>
                  <SelectItem value="2">Variazione</SelectItem>
                  <SelectItem value="3">Eliminazione</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Campi Input standard */}
            {![1, 5, 19, 20, 24, 26].includes(fieldId) && (
              <Input
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                className="h-7 text-xs w-full"
                maxLength={field.length}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    let finalValue = editingValue
                    if (field.type === 'numeric' || [21, 22, 23].includes(field.id)) {
                      finalValue = editingValue.padStart(field.length, ' ').substring(0, field.length)
                    } else {
                      finalValue = editingValue.padEnd(field.length, ' ').substring(0, field.length)
                    }
                    saveInlineEdit(recordIndex, `field_${fieldId}`, finalValue)
                    e.currentTarget.blur()
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    cancelInlineEdit()
                  }
                }}
                onBlur={() => {
                  let finalValue = editingValue
                  if (field.type === 'numeric' || [21, 22, 23].includes(field.id)) {
                    finalValue = editingValue.padStart(field.length, ' ').substring(0, field.length)
                  } else {
                    finalValue = editingValue.padEnd(field.length, ' ').substring(0, field.length)
                  }
                  saveInlineEdit(recordIndex, `field_${fieldId}`, finalValue)
                }}
              />
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={cancelInlineEdit}
              className="h-5 w-5 p-0 flex-shrink-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div
            className="flex items-center justify-between gap-2 group cursor-pointer"
            onClick={() => ![3, 4, 14, 15, 16, 17].includes(fieldId) && startInlineEdit(recordIndex, `field_${fieldId}`)}
          >
            <span
              className="text-sm truncate"
              title={getDisplayValue(records[recordIndex], `field_${fieldId}`)}
            >
              {getDisplayValue(records[recordIndex], `field_${fieldId}`) || '-'}
            </span>
            {![3, 4, 14, 15, 16, 17].includes(fieldId) && (
              <Edit className="h-3 w-3 opacity-0 group-hover:opacity-50 flex-shrink-0" />
            )}
          </div>
        )}
      </td>
    )
  }

  // Funzione per generare dati di test con errori intenzionali
  const generateTestData = () => {
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

    setRecords(testRecords)
    setFile(null)
    setErrors([])
    setValidationErrors({})
    setFieldErrors({})
    setCorrectedFields({}) // Resetta i campi corretti quando genera dati di test

    // Esegui la validazione dopo un piccolo delay
    setTimeout(() => {
      testRecords.forEach((_, index) => {
        setTimeout(() => validateRecordCompletely(index), 100 * index)
      })
      setTimeout(() => runCompleteCheck(), 500)
    }, 100)
  }

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    const fileName = selectedFile.name.toLowerCase()
    if (!fileName.endsWith('.txt') && !fileName.endsWith('.xml')) {
      setErrors(['Per favore seleziona un file TXT o XML'])
      return
    }

    setFile(selectedFile)

    if (fileName.endsWith('.txt')) {
      parseTxtFile(selectedFile)
    } else if (fileName.endsWith('.xml')) {
      parseXmlFile(selectedFile)
    }
  }, [])

  const parseXmlFile = async (file: File) => {
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

  const parseTxtFile = async (file: File) => {
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

  const updateRecordField = (recordIndex: number, fieldId: string, value: string) => {
    setRecords(prev => {
      const newRecords = [...prev]
      const field = ROSS_FIELDS.find(f => `field_${f.id}` === fieldId)
      if (field) {
        let paddedValue: string

        // Per i campi numerici, usa padding a sinistra, per gli altri a destra
        if (field.type === 'numeric' || [21, 22, 23].includes(field.id)) {
          // Campi numerici: padding a sinistra con spazi
          paddedValue = value.toString().padStart(field.length, ' ').substring(0, field.length)
        } else {
          // Altri campi: padding a destra con spazi
          paddedValue = value.toString().padEnd(field.length, ' ').substring(0, field.length)
        }

        newRecords[recordIndex] = { ...newRecords[recordIndex], [fieldId]: paddedValue }

        // Esegui la validazione immediata con il record aggiornato
        setTimeout(() => {
          validateRecordWithUpdatedData(recordIndex, newRecords[recordIndex])
        }, 10)
      }
      return newRecords
    })
  }

  // Funzione di validazione che usa il record aggiornato
  const validateRecordWithUpdatedData = (recordIndex: number, updatedRecord: RossRecord) => {
    if (!updatedRecord) return

    // 1. Esegui la validazione completa del record aggiornato
    const recordErrors: string[] = []
    const newFieldErrors: { [key: string]: boolean } = {}
    const newCorrectedFields: { [key: string]: boolean } = {}

    ROSS_FIELDS.forEach(field => {
      const fieldKey = `${recordIndex}_${field.id}`
      const validation = validateField(updatedRecord, field.id)

      if (!validation.isValid) {
        if (validation.errorMessage) {
          recordErrors.push(validation.errorMessage)
        }
        newFieldErrors[fieldKey] = true
        // Rimuovi dai campi corretti se ora è invalido
        delete newCorrectedFields[fieldKey]
      } else {
        // Se il campo è valido e prima aveva un errore, aggiungilo ai campi corretti
        if (fieldErrors[fieldKey]) {
          newCorrectedFields[fieldKey] = true
        }
      }
    })

    // 2. Aggiorna tutti gli stati in modo sincronizzato
    setValidationErrors(prev => ({
      ...prev,
      [recordIndex]: recordErrors
    }))

    // 3. Aggiorna fieldErrors rimuovendo prima tutti gli errori per questo record
    setFieldErrors(prev => {
      const result = { ...prev }
      ROSS_FIELDS.forEach(field => {
        const fieldKey = `${recordIndex}_${field.id}`
        delete result[fieldKey]
      })
      return { ...result, ...newFieldErrors }
    })

    // 4. Aggiorna i campi corretti
    setCorrectedFields(prev => ({
      ...prev,
      ...newCorrectedFields
    }))

    // 5. Aggiorna la validazione avanzata
    const advancedResult = validateRecordAdvanced(updatedRecord, recordIndex)
    setAdvancedValidation(prev => ({
      ...prev,
      [recordIndex]: advancedResult
    }))

    // 6. Notifica che il record è stato validato (ma non forzare il cambio scheda)
    // L'utente manterrà il controllo sulla scheda attiva
  }

  // Funzione di validazione dettagliata per ogni campo secondo il tracciato ROSS 1000
  const validateField = (record: RossRecord, fieldId: number): { isValid: boolean; errorMessage?: string } => {
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
          // Obbligatorio solo se cittadinanza italiana
          const citizenship = getTrimmedValue(record, 'field_10')
          const isItalian = citizenship === '000' // Codice ufficiale per Italia
          if (isItalian) {
            return { isValid: false, errorMessage: "Codice Comune Residenza: obbligatorio per cittadini italiani" }
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
          // Obbligatorio solo se cittadinanza italiana
          const citizenship = getTrimmedValue(record, 'field_10')
          const isItalian = citizenship === '000' // Codice ufficiale per Italia
          if (isItalian) {
            return { isValid: false, errorMessage: "Sigla Provincia Residenza: obbligatoria per cittadini italiani" }
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

        console.log(`DEBUG ${field.name}: tipoAlloggiato=${tipoAlloggiato}, requiresAccommodation=${requiresAccommodation}, rawValue="${rawValue}", value="${value}"`)

        if (requiresAccommodation) {
          // Per tipi 16, 17, 18: questi campi sono obbligatori e devono essere numerici
          // Usa il valore raw (con spazi) per controllare se è completamente vuoto
          if (!rawValue || rawValue.trim() === '') {
            console.log(`DEBUG ${field.name}: ERRORE - Campo obbligatorio ma vuoto per tipo ${tipoAlloggiato}`)
            return { isValid: false, errorMessage: `${field.name}: obbligatorio per tipo alloggiato ${tipoAlloggiato}` }
          }
          // Usa il valore trimmato per la validazione numerica
          if (!/^\d+$/.test(value)) {
            console.log(`DEBUG ${field.name}: ERRORE - Valore non numerico: "${value}"`)
            return { isValid: false, errorMessage: `${field.name}: deve essere numerico` }
          }
          console.log(`DEBUG ${field.name}: VALIDO - Valore numerico corretto`)
        } else {
          // Per tipi 19 e 20: questi campi devono essere vuoti (solo spazi)
          if (value.trim() !== '') {
            console.log(`DEBUG ${field.name}: ERRORE - Dovrebbe essere vuoto per tipo ${tipoAlloggiato} ma contiene: "${value}"`)
            return { isValid: false, errorMessage: `${field.name}: non deve essere compilato per tipo alloggiato ${tipoAlloggiato}` }
          }
          console.log(`DEBUG ${field.name}: VALIDO - Correttamente vuoto per tipo ${tipoAlloggiato}`)
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
  const validateRecordAdvanced = (record: RossRecord, recordIndex: number): RecordValidationResult => {
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

    // 2. Validazione cross-campi per date
    if (dataArrivo && dataPartenza && modalita === '2') {
      const parseDate = (dateStr: string) => {
        const [day, month, year] = dateStr.split('/').map(Number)
        return new Date(year, month - 1, day)
      }

      const arrivo = parseDate(dataArrivo)
      const partenza = parseDate(dataPartenza)

      if (partenza <= arrivo) {
        result.errors.push({
          isValid: false,
          level: 'error',
          message: 'Data partenza deve essere successiva alla data arrivo',
          fieldId: 18
        })
      }

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

  // Funzione di validazione completa per un record
  const validateRecordCompletely = (recordIndex: number, recordToValidate?: RossRecord) => {
    const record = recordToValidate || records[recordIndex]
    if (!record) return

    const recordErrors: string[] = []
    const newFieldErrors: { [key: string]: boolean } = {}
    const newCorrectedFields: { [key: string]: boolean } = {}

    // Valida ogni campo con la validazione base
    ROSS_FIELDS.forEach(field => {
      const fieldKey = `${recordIndex}_${field.id}`
      const validation = validateField(record, field.id)

      if (!validation.isValid) {
        if (validation.errorMessage) {
          recordErrors.push(validation.errorMessage)
        }
        newFieldErrors[fieldKey] = true
        // Rimuovi dai campi corretti se ora è invalido
        delete newCorrectedFields[fieldKey]
      } else {
        // Se il campo è valido e prima aveva un errore, aggiungilo ai campi corretti
        if (fieldErrors[fieldKey]) {
          newCorrectedFields[fieldKey] = true
        }
      }
    })

    // Aggiorna gli stati di errore
    setValidationErrors(prev => ({
      ...prev,
      [recordIndex]: recordErrors
    }))

    // Aggiorna fieldErrors rimuovendo prima tutti gli errori per questo record e poi aggiungendo quelli nuovi
    setFieldErrors(prev => {
      const result = { ...prev }
      // Rimuovi tutti gli errori per questo record
      ROSS_FIELDS.forEach(field => {
        const fieldKey = `${recordIndex}_${field.id}`
        delete result[fieldKey]
      })
      // Aggiungi solo i nuovi errori
      return { ...result, ...newFieldErrors }
    })

    // Aggiorna i campi corretti
    setCorrectedFields(prev => ({
      ...prev,
      ...newCorrectedFields
    }))

    // Aggiorna anche la validazione avanzata
    const advancedResult = validateRecordAdvanced(record, recordIndex)
    setAdvancedValidation(prev => ({
      ...prev,
      [recordIndex]: advancedResult
    }))
  }

  // Funzione per eseguire il check completo su tutti i record
  const runCompleteCheck = () => {
    // Prima valida tutti i record
    records.forEach((record, index) => {
      validateRecordCompletely(index, record)
    })

    // Usa una setTimeout per garantire che gli stati siano aggiornati prima di raccogliere gli errori
    setTimeout(() => {
      const allErrors: string[] = []

      // Raccogli gli errori dagli stati aggiornati
      records.forEach((_, index) => {
        const recordErrors = validationErrors[index] || []
        allErrors.push(...recordErrors.map(error => `Record ${index + 1}: ${error}`))
      })

      setErrors(allErrors)
    }, 0)

    // Ritorna falso se ci sono record non validi (basato sulla validazione diretta)
    return !records.some((_, index) => {
      const record = records[index]
      if (!record) return false

      return ROSS_FIELDS.some(field => {
        const validation = validateField(record, field.id)
        return !validation.isValid
      })
    })
  }

  const validateRecordInRealTime = (recordIndex: number) => {
    // Usa la nuova funzione di validazione completa
    const record = records[recordIndex]
    validateRecordCompletely(recordIndex, record)
  }

  // Funzione per verificare se un record ha campi obbligatori mancanti
  const hasMissingRequiredFields = (recordIndex: number) => {
    const record = records[recordIndex]
    if (!record) return false

    // Controlla gli errori di validazione base
    const recordErrors = validationErrors[recordIndex] || []
    if (recordErrors.length > 0) {
      return true
    }

    // Controlla gli errori dalla validazione avanzata
    const advancedResult = advancedValidation[recordIndex]
    if (advancedResult?.hasErrors) {
      return true
    }

    // Fallback: controlla direttamente i campi obbligatori
    return ROSS_FIELDS.some(field => {
      if (field.required === true || field.required === 'conditional') {
        const validation = validateField(record, field.id)
        return !validation.isValid
      }
      return false
    })
  }

  const generateTxtFile = async (filterValid: boolean = true) => {
    console.log('🔄 Generating TXT file, filterValid:', filterValid)
    let content = ''

    // Filtra i record in base al parametro
    const recordsToInclude = records.filter((_, index) => {
      if (filterValid) {
        // Includi solo i record validi
        const isValid = !hasMissingRequiredFields(index) && (validationErrors[index] || []).length === 0
        console.log(`Record ${index + 1}: hasMissing=${hasMissingRequiredFields(index)}, errorsCount=${(validationErrors[index] || []).length}, isValid=${isValid}`)
        return isValid
      } else {
        // Includi solo i record NON validi
        const isInvalid = hasMissingRequiredFields(index) || (validationErrors[index] || []).length > 0
        return isInvalid
      }
    })

    console.log(`Found ${recordsToInclude.length} records to include`)

    if (recordsToInclude.length === 0) {
      alert('Nessun record da scaricare con i criteri selezionati')
      return
    }

    // Genera il contenuto del file
    for (const record of recordsToInclude) {
      for (const field of ROSS_FIELDS) {
        const value = getTrimmedValue(record, `field_${field.id}`)
        let paddedValue = ''

        // Applica il padding corretto in base al tipo di campo
        if (field.type === 'numeric' || [21, 22, 23].includes(field.id)) {
          // Campi numerici: padding a sinistra con spazi
          paddedValue = value.padStart(field.length, ' ').substring(0, field.length)
        } else {
          // Altri campi: padding a destra con spazi
          paddedValue = value.padEnd(field.length, ' ').substring(0, field.length)
        }

        content += paddedValue
      }
      content += '\r\n' // Terminatore di riga Windows
    }

    try {
      // Genera nome file
      const originalName = file ? file.name.replace(/\.(txt|xml)$/i, '') : 'ROSS1000'
      const suffix = filterValid ? '_VALIDI' : '_ERRORI'
      const fileName = `${originalName}${suffix}.txt`

      console.log('✅ Generating client-side Blob for:', fileName)

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

      console.log('✅ Download initiated')

    } catch (error) {
      console.error('❌ Download failed:', error)
      alert(`Errore durante il download: ${error}`)
    }
  }

  // Funzione per generare report di validazione dettagliato
  const generateValidationReport = () => {
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
  const generateXMLFile = async () => {
    console.log('🔄 Generating XML file')
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
    const getFieldValue = (record: RossRecord, fieldId: number): string => {
      return (record[`field_${fieldId}`] || '').trim()
    }

    // Funzione helper per verificare se un record è valido
    const isRecordValid = (recordIndex: number): boolean => {
      return !hasMissingRequiredFields(recordIndex) && (validationErrors[recordIndex] || []).length === 0
    }

    // Raggruppa record per data di arrivo (solo record validi)
    const arriviPerData: { [data: string]: RossRecord[] } = {}
    const partenzePerData: { [data: string]: RossRecord[] } = {}

    // Prima passata: raggruppiamo gli arrivi (solo record validi)
    validRecords.forEach(record => {
      const dataArrivo = getFieldValue(record, 2)
      if (dataArrivo) {
        if (!arriviPerData[dataArrivo]) {
          arriviPerData[dataArrivo] = []
        }
        arriviPerData[dataArrivo].push(record)
      }

      // Raccogliamo anche le partenze (solo se il record è valido)
      const dataPartenza = getFieldValue(record, 18)
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
      const tipoAlloggiato = getFieldValue(record, 1)
      const idswh = getFieldValue(record, 25)

      if ((tipoAlloggiato === '17' || tipoAlloggiato === '18') && idswh) {
        // Cerca i familiari/membri gruppo associati (solo tra record validi)
        validRecords.forEach(otherRecord => {
          const otherTipo = getFieldValue(otherRecord, 1)
          const otherIdswh = getFieldValue(otherRecord, 25)

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
        const tipo = getFieldValue(record, 1)
        const camere = parseInt(getFieldValue(record, 21)) || 0
        // Solo tipi 16, 17, 18 contribuiscono alle camere
        return total + (['16', '17', '18'].includes(tipo) ? camere : 0)
      }, 0)

      // Prendi i valori dal primo record di questa data
      const primoRecord = arriviQuestaData[0]
      const camereDisponibili = primoRecord ? parseInt(getFieldValue(primoRecord, 22)) || 0 : 0
      const lettiDisponibili = primoRecord ? parseInt(getFieldValue(primoRecord, 23)) || 0 : 0

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
          const modalita = getFieldValue(record, 26)
          // Solo record con modalità 1 (Nuovo) o 2 (Variazione) vanno negli arrivi
          if (modalita === '1' || modalita === '2') {
            xml += `      <arrivo>\n`

            // Campi obbligatori
            xml += `        <idswh>${getFieldValue(record, 25)}</idswh>\n`
            xml += `        <tipoalloggiato>${getFieldValue(record, 1)}</tipoalloggiato>\n`
            xml += `        <sesso>${convertSexForXML(getFieldValue(record, 5))}</sesso>\n`
            xml += `        <cittadinanza>${getFieldValue(record, 10)}</cittadinanza>\n`
            xml += `        <statoresidenza>${getFieldValue(record, 13)}</statoresidenza>\n`
            xml += `        <datanascita>${convertDateForXML(getFieldValue(record, 6))}</datanascita>\n`
            xml += `        <tipoturismo>${getFieldValue(record, 19)}</tipoturismo>\n`
            xml += `        <mezzotrasporto>${getFieldValue(record, 20)}</mezzotrasporto>\n`

            // Campi condizionali
            const statoResidenza = getFieldValue(record, 13)
            if (statoResidenza === CODICE_ITALIA) {
              xml += `        <luogoresidenza>${getFieldValue(record, 11)}</luogoresidenza>\n`
            } else {
              xml += `        <luogoresidenza></luogoresidenza>\n`
            }

            const statoNascita = getFieldValue(record, 9)
            if (statoNascita === CODICE_ITALIA) {
              xml += `        <comunenascita>${getFieldValue(record, 7)}</comunenascita>\n`
            } else {
              xml += `        <comunenascita></comunenascita>\n`
            }
            xml += `        <statonascita>${statoNascita}</statonascita>\n`

            // idcapo per tipi 19/20
            const tipoAlloggiato = getFieldValue(record, 1)
            const idswh = getFieldValue(record, 25)
            if (tipoAlloggiato === '19' || tipoAlloggiato === '20') {
              xml += `        <idcapo>${capogruppoMap[idswh] || ''}</idcapo>\n`
            } else {
              xml += `        <idcapo></idcapo>\n`
            }

            // Campi opzionali (possono essere vuoti)
            xml += `        <cognome>${getFieldValue(record, 3)}</cognome>\n`
            xml += `        <nome>${getFieldValue(record, 4)}</nome>\n`
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
          xml += `        <idswh>${getFieldValue(record, 25)}</idswh>\n`
          xml += `        <tipoalloggiato>${getFieldValue(record, 1)}</tipoalloggiato>\n`
          xml += `        <arrivo>${convertDateForXML(getFieldValue(record, 2))}</arrivo>\n`
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
      console.log('📤 Sending XML download request to server:', xmlFileName)
      console.log('📊 XML Content size:', xml.length, 'characters')

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

        console.log('✅ Large XML content download request successful')

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

        console.log('✅ XML download request successful')

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

  // Funzione per gestire il login dal popup
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : ''
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginCredentials)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login fallito')
      }

      // Login successful - close popup, reset credentials, and set logged in state
      setShowLogin(false)
      setLoginCredentials({ email: '', password: '', regione: '' })
      setIsLoggedIn(true)

      // Show success message
      alert('Login effettuato con successo! Ora puoi inviare l\'XML a ROSS 1000.')

    } catch (error: any) {
      alert(`Errore login: ${error.message}`)
    }
  }

  const validateRecords = () => {
    // Usa il nuovo sistema di validazione completo
    return runCompleteCheck()
  }

  const handleDownload = async () => {
    console.log('🎯 Download button clicked')
    const validationResult = validateRecords()
    console.log('✅ Validation result:', validationResult)
    if (validationResult) {
      console.log('🚀 Starting TXT file generation')
      await generateTxtFile()
    } else {
      console.log('❌ Validation failed, not generating file')
      alert('La validazione dei record è fallita. Correggi gli errori prima di scaricare.')
    }
  }

  // Componente per l'invio ROSS 1000 (visibile solo se ci sono record validi)
  const hasValidRecords = records.some((_, index) =>
    !hasMissingRequiredFields(index) && (validationErrors[index] || []).length === 0
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo e Titolo */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                  R
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-800">ROSS 1000</h1>
                  <p className="text-xs text-slate-500">Validazione File TXT/XML</p>
                </div>
              </div>
            </div>

            {/* Azioni Header */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={resetAll}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800 border-slate-300"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Upload Section */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Upload Card - Compact */}
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 hover:border-teal-400 transition-all duration-300 px-4 py-3 relative group cursor-pointer hover:shadow-md">
              <Input
                id="file-upload"
                type="file"
                accept=".txt,.xml"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex items-center gap-3 pointer-events-none">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-teal-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Upload className="h-5 w-5 text-teal-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-800">Carica File</h3>
                  {file ? (
                    <div className="flex items-center gap-1 text-teal-600 text-xs font-medium truncate">
                      <CheckCircle className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">TXT o XML</p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Card - Record Totali */}
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{records.length}</div>
                  <div className="text-xs text-slate-500">Record Totali</div>
                </div>
              </div>
            </div>

            {/* Stats Card - Errori */}
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">
                    {Object.values(validationErrors).reduce((total, errors) => total + errors.length, 0)}
                  </div>
                  <div className="text-xs text-slate-500">Errori Rilevati</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Errors Alert */}
        {errors.length > 0 && (
          <Alert className="mb-6 bg-red-50 border-red-200" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Data Table Section */}
        {records.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Tabs in Header */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'valid' | 'invalid')}>
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  {/* Tabs on the left */}
                  <TabsList className="bg-transparent p-0 gap-6 h-auto">
                    <TabsTrigger
                      value="valid"
                      className="px-0 py-0 h-auto bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none text-slate-400 data-[state=active]:text-teal-600 hover:text-slate-600 transition-colors font-medium"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Record Validi ({records.filter((_, index) => !hasMissingRequiredFields(index) && (validationErrors[index] || []).length === 0).length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="invalid"
                      className="px-0 py-0 h-auto bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none text-slate-400 data-[state=active]:text-red-600 hover:text-slate-600 transition-colors font-medium"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Record Non Validi ({records.filter((_, index) => hasMissingRequiredFields(index) || (validationErrors[index] || []).length > 0).length})
                    </TabsTrigger>
                  </TabsList>

                  {/* Download Button on the right */}
                  <div className="flex items-center gap-2">
                    {activeTab === 'valid' && (
                      <Button
                        onClick={() => generateTxtFile(true)}
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow-md transition-all"
                        disabled={records.filter((_, index) => !hasMissingRequiredFields(index) && (validationErrors[index] || []).length === 0).length === 0}
                      >
                        <Download className="h-4 w-4" />
                        Scarica TXT Valido
                      </Button>
                    )}
                    {activeTab === 'invalid' && (
                      <Button
                        onClick={() => generateTxtFile(false)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md transition-all"
                        disabled={records.filter((_, index) => hasMissingRequiredFields(index) || (validationErrors[index] || []).length > 0).length === 0}
                      >
                        <Download className="h-4 w-4" />
                        Scarica TXT Non Valido
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <TabsContent value="valid" className="mt-0 p-0">
                <div className="overflow-x-auto -mt-px">
                  <div className="overflow-y-auto" style={{ maxHeight: '65vh' }}>
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 z-20">
                        <tr className="bg-teal-600 text-white">
                          <th className="px-3 py-3 text-left font-semibold text-xs uppercase tracking-wider border-r border-teal-500/30 sticky left-0 z-30 bg-teal-600 w-12">
                            #
                          </th>
                          {ROSS_FIELDS.map(field => (
                            <th
                              key={field.id}
                              className="px-3 py-3 text-left font-semibold text-xs uppercase tracking-wider border-r border-teal-500/30 whitespace-nowrap"
                            >
                              {field.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {records.map((_, recordIndex) => {
                          const hasMissingRequired = hasMissingRequiredFields(recordIndex)
                          const hasErrors = (validationErrors[recordIndex] || []).length > 0
                          const advancedResult = advancedValidation[recordIndex]

                          if (hasMissingRequired || hasErrors) return null

                          return (
                            <tr
                              key={recordIndex}
                              className="hover:bg-teal-50/50 transition-colors"
                            >
                              <td className="px-3 py-3 font-medium text-slate-600 border-r border-slate-100 sticky left-0 z-10 bg-white w-12">
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold">
                                    {recordIndex + 1}
                                  </span>
                                  {advancedResult?.hasWarnings && (
                                    <div className="w-2 h-2 bg-amber-400 rounded-full" title="Avvertimenti"></div>
                                  )}
                                </div>
                              </td>
                              {ROSS_FIELDS.map(field => renderFieldCell(recordIndex, field.id))}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="invalid" className="mt-0 p-0">
                <div className="overflow-x-auto -mt-px">
                  <div className="overflow-y-auto" style={{ maxHeight: '65vh' }}>
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 z-20">
                        <tr className="bg-red-600 text-white">
                          <th className="px-3 py-3 text-left font-semibold text-xs uppercase tracking-wider border-r border-red-500/30 sticky left-0 z-30 bg-red-600 w-12">
                            #
                          </th>
                          {ROSS_FIELDS.map(field => (
                            <th
                              key={field.id}
                              className="px-3 py-3 text-left font-semibold text-xs uppercase tracking-wider border-r border-red-500/30 whitespace-nowrap"
                            >
                              {field.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {records.map((_, recordIndex) => {
                          const hasMissingRequired = hasMissingRequiredFields(recordIndex)
                          const hasErrors = (validationErrors[recordIndex] || []).length > 0
                          const advancedResult = advancedValidation[recordIndex]

                          if (!hasMissingRequired && !hasErrors) return null

                          return (
                            <tr
                              key={recordIndex}
                              className="hover:bg-red-50/50 transition-colors bg-red-50/30"
                            >
                              <td className="px-3 py-3 font-medium text-slate-600 border-r border-slate-100 sticky left-0 z-10 bg-red-50/30 w-12">
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                    {recordIndex + 1}
                                  </span>
                                  {advancedResult?.hasWarnings && (
                                    <div className="w-2 h-2 bg-amber-400 rounded-full" title="Avvertimenti"></div>
                                  )}
                                </div>
                              </td>
                              {ROSS_FIELDS.map(field => renderFieldCell(recordIndex, field.id))}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Loading State */}
        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 font-medium">Elaborazione file in corso...</p>
          </div>
        )}

        {/* Empty State */}
        {!isProcessing && records.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Nessun file caricato</h3>
            <p className="text-slate-500 max-w-md">
              Carica un file TXT o XML per iniziare la validazione dei dati ROSS 1000
            </p>
          </div>
        )}
      </main>

      {/* Login Modal */}
      {showLogin && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowLogin(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 w-[380px] shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                R
              </div>
              <h3 className="text-xl font-semibold text-slate-800">
                Accedi per inviare
              </h3>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Regione
                </label>
                <select
                  value={loginCredentials.regione}
                  onChange={(e) => setLoginCredentials({ ...loginCredentials, regione: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                >
                  {regioni.map((regione) => (
                    <option key={regione.value} value={regione.value}>
                      {regione.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={loginCredentials.email}
                  onChange={(e) => setLoginCredentials({ ...loginCredentials, email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="email@hotel.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginCredentials.password}
                  onChange={(e) => setLoginCredentials({ ...loginCredentials, password: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="********"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-4 py-3 rounded-xl font-medium transition-all shadow-lg shadow-teal-200"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}