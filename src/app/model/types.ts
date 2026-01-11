export interface RossRecord {
    [key: string]: string
}

export interface ValidationResult {
    isValid: boolean
    level: 'error' | 'warning' | 'info'
    message: string
    fieldId?: number
}

export interface RecordValidationResult {
    errors: ValidationResult[]
    warnings: ValidationResult[]
    info: ValidationResult[]
    hasErrors: boolean
    hasWarnings: boolean
    hasInfo: boolean
}
