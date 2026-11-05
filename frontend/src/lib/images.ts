const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined

// f_auto: WebP/AVIF según el navegador; q_auto: compresión automática;
// c_fill + ar_1:1: recorte cuadrado, igual que la tarjeta del catálogo
export function productImage(key: string | null, width: number): string | undefined {
  if (!key || !CLOUD_NAME) return undefined
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,c_fill,ar_1:1,w_${width}/${key}`
}

export function productImageSrcSet(key: string | null): string | undefined {
  if (!key || !CLOUD_NAME) return undefined
  return [320, 480, 640].map((w) => `${productImage(key, w)} ${w}w`).join(', ')
}