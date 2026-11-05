const priceFormatter = new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
})

export function formatPrice(value: number): string {
    return priceFormatter.format(value)
}