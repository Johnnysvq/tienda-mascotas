// Stock: solo dígitos (máximo 9, igual que el esquema)
export function digitsOnly(value: string): string {
    return value.replace(/\D/g, '').slice(0, 9)
  }
  
  // Precio: dígitos y un único separador decimal (punto o coma),
  // con máximo 8 enteros y 2 decimales, igual que el backend
  export function decimalOnly(value: string): string {
    const cleaned = value.replace(/[^\d.,]/g, '')
    const separatorIndex = cleaned.search(/[.,]/)
    if (separatorIndex === -1) return cleaned.slice(0, 8)
  
    const integer = cleaned.slice(0, separatorIndex).slice(0, 8)
    const decimals = cleaned.slice(separatorIndex + 1).replace(/[.,]/g, '').slice(0, 2)
    return `${integer}${cleaned[separatorIndex]}${decimals}`
  }