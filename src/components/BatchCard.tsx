import { Thermometer, MapPin, Clock, Truck } from 'lucide-react'
import type { Batch } from '@/types'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<Batch['status'], { label: string; className: string }> = {
  in_transit: { label: '运输中', className: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  awaiting_declaration: { label: '待报关', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  customs_hold: { label: '海关扣留', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  cleared: { label: '已放行', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
}

function formatArrival(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function BatchCard({ batch }: { batch: Batch }) {
  const setSelectedBatchId = useStore((s) => s.setSelectedBatchId)
  const statusCfg = STATUS_CONFIG[batch.status]

  return (
    <div
      onClick={() => setSelectedBatchId(batch.id)}
      className={cn(
        'relative rounded-xl border bg-slate-800/60 backdrop-blur p-5 cursor-pointer transition-all hover:bg-slate-800/80 hover:shadow-lg hover:shadow-sky-500/5',
        batch.isOverLimit ? 'border-l-4 border-l-red-500 border-t border-r border-b border-slate-700/50' : 'border border-slate-700/50'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-title text-sm font-semibold text-slate-200">{batch.id}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{batch.billOfLading}</p>
        </div>
        <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', statusCfg.className)}>
          {statusCfg.label}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
        <Truck size={13} className="text-slate-500" />
        <span>{batch.licensePlate}</span>
        <span className="text-slate-600">·</span>
        <span>{batch.cargoCategory}</span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
        <MapPin size={13} className="text-slate-500" />
        <span>{batch.origin}</span>
        <span className="text-slate-600">→</span>
        <span>{batch.destinationPort}</span>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex items-center gap-1.5">
          <Thermometer size={16} className={batch.isOverLimit ? 'text-red-400' : 'text-sky-400'} />
          <span
            className={cn(
              'font-mono text-2xl font-bold tracking-tight',
              batch.isOverLimit ? 'text-red-400 animate-pulse-temp' : 'text-sky-400'
            )}
          >
            {batch.currentTemp}°C
          </span>
        </div>

        <div className="text-right space-y-1">
          <div className="text-xs text-slate-400">
            允许 {batch.tempRangeMin}°C ~ {batch.tempRangeMax}°C
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 justify-end">
            <Clock size={12} />
            <span>{formatArrival(batch.estimatedArrival)}</span>
          </div>
        </div>
      </div>

      {batch.isOverLimit && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      )}
    </div>
  )
}
