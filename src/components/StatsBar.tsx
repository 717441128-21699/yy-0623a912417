import { Truck, AlertTriangle, FileText, Wrench } from 'lucide-react'
import { useStore } from '@/store'

export default function StatsBar() {
  const batches = useStore((s) => s.batches)
  const certificates = useStore((s) => s.certificates)
  const disposalRecords = useStore((s) => s.disposalRecords)

  const inTransitCount = batches.filter((b) => b.status === 'in_transit').length
  const overLimitCount = batches.filter((b) => b.isOverLimit).length
  const awaitingCount = certificates.filter((c) => c.status === 'pending_materials').length

  const today = new Date().toISOString().slice(0, 10)
  const todayDisposalCount = disposalRecords.filter((r) =>
    r.alertTime.startsWith(today)
  ).length

  const metrics = [
    { icon: Truck, label: '在途批次', value: inTransitCount, color: 'text-cold-accent' },
    { icon: AlertTriangle, label: '越界告警', value: overLimitCount, color: 'text-cold-alert' },
    { icon: FileText, label: '待生成凭证', value: awaitingCount, color: 'text-amber-400' },
    { icon: Wrench, label: '今日处置', value: todayDisposalCount, color: 'text-emerald-400' },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="flex items-center gap-3 bg-cold-bg border border-cold-border rounded-lg px-4 py-3"
        >
          <div className={`${m.color}`}>
            <m.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="font-body text-xs text-slate-400">{m.label}</p>
            <p className={`font-mono text-2xl font-semibold text-white ${m.color}`}>
              {m.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
