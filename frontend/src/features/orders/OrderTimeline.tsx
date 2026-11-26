import { formatDateTime } from '../../lib/format'
import type { OrderChange } from './api'
import { STATUS_LABEL } from './orderLabels'

interface OrderTimelineProps {
  createdAt: string
  history: OrderChange[]
  showActor?: boolean
}

export function OrderTimeline({ createdAt, history, showActor = false }: OrderTimelineProps) {
  return (
    <ol className="space-y-3 border-l-2 border-slate-200 pl-4 text-sm">
      <li>
        <p className="font-medium">Pedido creado</p>
        <p className="text-stone-500">{formatDateTime(createdAt)}</p>
      </li>
      {history.map((change) => (
        <li key={`${change.at}-${change.to}`}>
          <p className="font-medium">{STATUS_LABEL[change.to]}</p>
          <p className="text-stone-500">
            {formatDateTime(change.at)}
            {showActor && change.by ? ` · ${change.by}` : ''}
          </p>
        </li>
      ))}
    </ol>
  )
}