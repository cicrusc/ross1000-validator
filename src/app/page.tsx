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
import { Upload, Download, FileText, AlertCircle, CheckCircle, RotateCcw, AlertTriangle, Edit, X, Info, ChevronDown } from 'lucide-react'

// Model imports
import { RossRecord, RecordValidationResult } from './model/types'
import { ROSS_FIELDS, TIPOLOGIA_TURISMO, MEZZI_TRASPORTO, TIPO_ALLOGGIATO, regioni } from './model/constants'
import { getTrimmedValue, getFieldValue, getDisplayValue } from './model/helpers'

// ViewModel imports
import { validateField, validateRecordAdvanced } from './viewmodel/useValidation'
import { parseXmlFile, parseTxtFile } from './viewmodel/useFileParsing'
import { generateTxtFile, generateValidationReport, generateXMLFile } from './viewmodel/useFileGeneration'
import { generateTestData } from './viewmodel/useTestData'



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
  const [errorsExpanded, setErrorsExpanded] = useState<boolean>(false) // Controlla espansione lista errori
  const [loginCredentials, setLoginCredentials] = useState({
    email: '',
    password: '',
    regione: ''
  })

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
    setErrorsExpanded(false) // Resetta espansione lista errori
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
              <Select value={editingValue} onValueChange={(newValue) => {
                const paddedValue = newValue.padEnd(field.length, ' ').substring(0, field.length)
                saveInlineEdit(recordIndex, `field_${fieldId}`, paddedValue)
              }}>
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
              <Select value={editingValue} onValueChange={(newValue) => {
                const paddedValue = newValue.padEnd(field.length, ' ').substring(0, field.length)
                saveInlineEdit(recordIndex, `field_${fieldId}`, paddedValue)
              }}>
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
              <Select value={editingValue} onValueChange={(newValue) => {
                const paddedValue = newValue.padEnd(field.length, ' ').substring(0, field.length)
                saveInlineEdit(recordIndex, `field_${fieldId}`, paddedValue)
              }}>
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
              <Select value={editingValue} onValueChange={(newValue) => {
                const paddedValue = newValue.padEnd(field.length, ' ').substring(0, field.length)
                saveInlineEdit(recordIndex, `field_${fieldId}`, paddedValue)
              }}>
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
              <Select value={editingValue} onValueChange={(newValue) => {
                const paddedValue = newValue.padEnd(field.length, ' ').substring(0, field.length)
                saveInlineEdit(recordIndex, `field_${fieldId}`, paddedValue)
              }}>
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
              <Select value={editingValue} onValueChange={(newValue) => {
                const paddedValue = newValue.padEnd(field.length, ' ').substring(0, field.length)
                saveInlineEdit(recordIndex, `field_${fieldId}`, paddedValue)
              }}>
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

  // Wrapper per generateTestData che aggiunge la logica di state
  const handleGenerateTestData = () => {
    const testRecords = generateTestData()

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
      parseTxtFile(
        selectedFile,
        setIsProcessing,
        setErrors,
        setCorrectedFields,
        setRecords,
        validateRecordCompletely,
        runCompleteCheck,
        setActiveTab,
        validateField
      )
    } else if (fileName.endsWith('.xml')) {
      parseXmlFile(
        selectedFile,
        setIsProcessing,
        setErrors,
        setCorrectedFields,
        setRecords,
        validateRecordCompletely,
        runCompleteCheck,
        setActiveTab
      )
    }
  }, [])

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

    // 2. Esegui la validazione avanzata PRIMA di aggiornare gli stati
    const advancedResult = validateRecordAdvanced(updatedRecord, recordIndex)

    // Aggiungi gli errori dalla validazione avanzata a newFieldErrors
    if (advancedResult.hasErrors) {
      advancedResult.errors.forEach(error => {
        if (error.fieldId) {
          const fieldKey = `${recordIndex}_${error.fieldId}`
          newFieldErrors[fieldKey] = true
          // Rimuovi dai campi corretti se ora è invalido
          delete newCorrectedFields[fieldKey]
          // Aggiungi anche il messaggio di errore
          if (error.message) {
            recordErrors.push(error.message)
          }
        }
      })
    }

    // 3. Aggiorna tutti gli stati in modo sincronizzato
    setValidationErrors(prev => ({
      ...prev,
      [recordIndex]: recordErrors
    }))

    // 4. Aggiorna fieldErrors in un UNICO update (base + avanzati)
    setFieldErrors(prev => {
      const result = { ...prev }
      ROSS_FIELDS.forEach(field => {
        const fieldKey = `${recordIndex}_${field.id}`
        delete result[fieldKey]
      })
      return { ...result, ...newFieldErrors }
    })

    // 5. Aggiorna i campi corretti
    setCorrectedFields(prev => ({
      ...prev,
      ...newCorrectedFields
    }))

    // 6. Aggiorna la validazione avanzata
    setAdvancedValidation(prev => ({
      ...prev,
      [recordIndex]: advancedResult
    }))
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

    // Esegui la validazione avanzata PRIMA di aggiornare gli stati
    const advancedResult = validateRecordAdvanced(record, recordIndex)

    // Aggiungi gli errori dalla validazione avanzata a newFieldErrors
    if (advancedResult.hasErrors) {
      advancedResult.errors.forEach(error => {
        if (error.fieldId) {
          const fieldKey = `${recordIndex}_${error.fieldId}`
          newFieldErrors[fieldKey] = true
          // Rimuovi dai campi corretti se ora è invalido
          delete newCorrectedFields[fieldKey]
          // Aggiungi anche il messaggio di errore
          if (error.message) {
            recordErrors.push(error.message)
          }
        }
      })
    }

    // Aggiorna gli stati di errore
    setValidationErrors(prev => ({
      ...prev,
      [recordIndex]: recordErrors
    }))

    // Aggiorna fieldErrors in un UNICO update (base + avanzati)
    setFieldErrors(prev => {
      const result = { ...prev }
      // Rimuovi tutti gli errori per questo record
      ROSS_FIELDS.forEach(field => {
        const fieldKey = `${recordIndex}_${field.id}`
        delete result[fieldKey]
      })
      // Aggiungi tutti i nuovi errori (base + avanzati)
      return { ...result, ...newFieldErrors }
    })

    // Aggiorna i campi corretti
    setCorrectedFields(prev => ({
      ...prev,
      ...newCorrectedFields
    }))

    // Aggiorna la validazione avanzata
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

  // Wrapper per gestire il login dal popup
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
      await generateTxtFile(true, records, hasMissingRequiredFields, validationErrors, file)
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
                  <p className="text-xs text-slate-500">Validazione File TXT</p>
                </div>
              </div>
            </div>

            {/* Azioni Header */}
            <div className="flex items-center gap-3">
              {/* Info Button with Tooltip */}
              <div className="relative group">
                <button
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all"
                >
                  <Info className="h-4 w-4" />
                </button>
                <div className="absolute right-0 top-10 w-72 bg-slate-800 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl">
                  <p className="font-semibold mb-2">ROSS 1000 Validator</p>
                  <p className="mb-2">Strumento per la validazione dei file TXT secondo il tracciato ROSS 1000 (v.4 – 20/10/2022).</p>
                  <p className="mb-1"><strong>Come usare:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>Carica un file TXT</li>
                    <li>Visualizza i record validi/non validi</li>
                    <li>Modifica i campi cliccandoci sopra</li>
                    <li>Scarica il file corretto</li>
                  </ul>
                  <div className="absolute -top-2 right-4 w-3 h-3 bg-slate-800 rotate-45"></div>
                </div>
              </div>
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
                    {records.filter((_, index) => hasMissingRequiredFields(index) || (validationErrors[index] || []).length > 0).length}
                  </div>
                  <div className="text-xs text-slate-500">Record con Errori</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Errors Alert - Collapsible */}
        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setErrorsExpanded(!errorsExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-red-100/50 transition-colors"
            >
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">{errors.length} errori di parsing rilevati</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-red-500 transition-transform duration-200 ${errorsExpanded ? 'rotate-180' : ''}`} />
            </button>
            {errorsExpanded && (
              <div className="px-4 pb-3 pt-0 border-t border-red-200">
                <div className="space-y-1 text-sm text-red-700 mt-2 max-h-48 overflow-y-auto">
                  {errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
                        onClick={() => generateTxtFile(true, records, hasMissingRequiredFields, validationErrors, file)}
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow-md transition-all"
                        disabled={records.filter((_, index) => !hasMissingRequiredFields(index) && (validationErrors[index] || []).length === 0).length === 0}
                      >
                        <Download className="h-4 w-4" />
                        Scarica TXT
                      </Button>
                    )}
                    {activeTab === 'invalid' && (
                      <Button
                        onClick={() => generateTxtFile(false, records, hasMissingRequiredFields, validationErrors, file)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md transition-all"
                        disabled={records.filter((_, index) => hasMissingRequiredFields(index) || (validationErrors[index] || []).length > 0).length === 0}
                      >
                        <Download className="h-4 w-4" />
                        Scarica TXT
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
                          <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wider border-r border-teal-500/30 sticky left-0 z-30 bg-teal-600 w-12">
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
                          <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wider border-r border-red-500/30 sticky left-0 z-30 bg-red-600 w-12">
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
                              <td className="px-3 py-3 font-medium text-slate-600 border-r border-slate-100 sticky left-0 z-10 bg-[#fffbfb] w-12">
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
              Carica un file TXT per iniziare la validazione dei dati ROSS 1000
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