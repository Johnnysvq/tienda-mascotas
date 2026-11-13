const priceFormatter = new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
})

export function formatPrice(value: number): string {
    return priceFormatter.format(value)
}

const dateTimeFormatter = new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'medium',
    timeStyle: 'short',
})
  
export function formatDateTime(value: string): string {
    return dateTimeFormatter.format(new Date(value))
}