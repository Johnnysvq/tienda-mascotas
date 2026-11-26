import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router'
import { TextAreaField } from '../../components/TextAreaField'
import { TextField } from '../../components/TextField'
import { ApiError } from '../../lib/api'
import { errorMessage } from '../../lib/errors'
import { formatPrice } from '../../lib/format'
import { phoneOnly } from '../../lib/inputFilters'
import { usePageTitle } from '../../lib/usePageTitle'
import { useCartQuote } from '../cart/api'
import { cartActions, useCart } from '../cart/cartStore'
import { usePlaceOrder, type OrderInput, type PaymentMethod } from './api'
import { checkoutSchema, type CheckoutFormValues } from './checkoutSchema'
import { PAYMENT_LABEL } from './orderLabels'

const serverFields = ['recipientName', 'phoneNumber', 'address', 'notes', 'paymentMethod'] as const

export default function CheckoutPage() {
  usePageTitle('Finalizar compra')
  const { items } = useCart()
  const { data: quote, isPending: quotePending } = useCartQuote(items, true)
  const placeOrder = usePlaceOrder()
  const navigate = useNavigate()

  // Una clave por intento de compra: si se reenvía (doble clic, reintento), el servidor no duplica el pedido
  const [idempotencyKey] = useState(() => crypto.randomUUID())

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      recipientName: '',
      phoneNumber: '',
      address: '',
      notes: '',
      paymentMethod: 'CASH_ON_DELIVERY',
    },
  })

  if (items.length === 0) return <Navigate to="/cart" replace />

  const hasProblems = quote?.items.some((line) => line.status !== 'OK') ?? false

  function handleServerError(error: unknown) {
    if (error instanceof ApiError && error.status === 400 && error.errors) {
      for (const field of serverFields) {
        const message = error.errors[field]
        if (message) setError(field, { message })
      }
    }
  }

  function onSubmit(values: CheckoutFormValues) {
    const input: OrderInput = {
      items,
      recipientName: values.recipientName,
      phoneNumber: values.phoneNumber,
      address: values.address,
      notes: values.notes === '' ? null : values.notes,
      paymentMethod: values.paymentMethod,
    }
    placeOrder.mutate(
      { input, idempotencyKey },
      {
        onSuccess: (order) => {
          // Primero se navega y luego se vacía el carrito: así esta página no redirige al carrito vacío
          navigate(`/orders/${order.id}`, { replace: true, state: { placed: true } })
          cartActions.clear()
        },
        onError: handleServerError,
      },
    )
  }

  const stockConflict = placeOrder.error instanceof ApiError && placeOrder.error.status === 409
  const generalError =
    placeOrder.isError && Object.keys(errors).length === 0 ? errorMessage(placeOrder.error) : null

  return (
    <main className="page-container py-6 text-stone-900">
      <h1 className="mb-6 text-2xl font-bold">Finalizar compra</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <form
          id="checkout-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold">Datos de entrega</h2>

          <TextField
            id="checkout-name"
            label="Nombre de quien recibe"
            autoComplete="name"
            error={errors.recipientName}
            registration={register('recipientName')}
          />
          <TextField
            id="checkout-phone"
            label="Teléfono de contacto"
            type="tel"
            autoComplete="tel"
            sanitize={phoneOnly}
            error={errors.phoneNumber}
            registration={register('phoneNumber')}
          />
          <TextAreaField
            id="checkout-address"
            label="Dirección de entrega"
            autoComplete="street-address"
            hint="Provincia, cantón, distrito y señas."
            error={errors.address}
            registration={register('address')}
          />
          <TextAreaField
            id="checkout-notes"
            label="Notas (opcional)"
            error={errors.notes}
            registration={register('notes')}
          />

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-700">Método de pago</legend>
            {(Object.keys(PAYMENT_LABEL) as PaymentMethod[]).map((method) => (
              <label
                key={method}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 p-3 text-sm"
              >
                <input type="radio" value={method} {...register('paymentMethod')} />
                {PAYMENT_LABEL[method]}
              </label>
            ))}
            <p className="text-xs text-stone-500">No se cobra nada en línea: el pago se coordina al atender tu pedido.</p>
            {errors.paymentMethod && (
              <p role="alert" className="text-sm text-red-600">
                {errors.paymentMethod.message}
              </p>
            )}
          </fieldset>

          {generalError && (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <p>{generalError}</p>
              {stockConflict && (
                <Link to="/cart" className="mt-1 inline-block font-medium underline">
                  Revisar el carrito
                </Link>
              )}
            </div>
          )}
        </form>

        <aside
          aria-label="Resumen del pedido"
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24"
        >
          <h2 className="text-lg font-semibold">Resumen</h2>

          {quotePending && <p className="text-sm text-slate-500">Calculando…</p>}

          {quote && (
            <>
              <ul className="space-y-2 text-sm">
                {quote.items.map((line) => (
                  <li key={line.productId} className="flex justify-between gap-3">
                    <span className="min-w-0">
                      {line.description ?? 'Producto no disponible'}
                      {line.quantity > 0 && <span className="text-stone-500"> × {line.quantity}</span>}
                    </span>
                    {line.subtotal !== null && line.quantity > 0 && (
                      <span className="shrink-0 font-medium">{formatPrice(line.subtotal)}</span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="flex items-baseline justify-between border-t border-slate-200 pt-3">
                <span>Total</span>
                <span className="text-2xl font-bold">{formatPrice(quote.total)}</span>
              </p>
            </>
          )}

          {hasProblems && (
            <p role="status" className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Algunos productos cambiaron de disponibilidad.{' '}
              <Link to="/cart" className="font-medium underline">
                Ajusta el carrito
              </Link>{' '}
              para continuar.
            </p>
          )}

          <button
            type="submit"
            form="checkout-form"
            disabled={placeOrder.isPending || quotePending || hasProblems}
            className="w-full cursor-pointer rounded-full bg-brand-700 px-6 py-3 font-medium text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placeOrder.isPending ? 'Enviando pedido…' : 'Confirmar pedido'}
          </button>

          <Link to="/cart" className="block text-center text-sm font-medium text-brand-700 hover:underline">
            Volver al carrito
          </Link>
        </aside>
      </div>
    </main>
  )
}