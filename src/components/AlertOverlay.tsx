import { useState } from 'react'
import { X, AlertTriangle, User, FileText } from 'lucide-react'
import { useStore } from '@/store'
import type { DisposalRecord } from '@/types'
import { cn } from '@/lib/utils'

export default function AlertOverlay() {
  const alertBatchIds = useStore((s) => s.alertBatchIds)
  const batches = useStore((s) => s.batches)
  const dismissAlert = useStore((s) => s.dismissAlert)
  const addDisposalRecord = useStore((s) => s.addDisposalRecord)

  const [reasonInputs, setReasonInputs] = useState<Record<string, string>>({})
  const [operatorInputs, setOperatorInputs] = useState<Record<string, string>>({})
  const [showFormFor, setShowFormFor] = useState<string | null>(null)

  const alertBatches = batches.filter((b) => alertBatchIds.includes(b.id))

  if (alertBatches.length === 0) return null

  function handleAction(batchId: string, actionType: DisposalRecord['actionType']) {
    const reason = reasonInputs[batchId] || ''
    const operatorName = operatorInputs[batchId] || ''
    const batch = batches.find((b) => b.id === batchId)

    const now = new Date().toISOString()
    const record: DisposalRecord = {
      id: `DSP-${Date.now()}`,
      batchId,
      alertTime: now,
      overLimitTemp: batch?.currentTemp ?? 0,
      overLimitDuration: 0,
      reason,
      actionType,
      operatorName,
      notifyDriverAt: actionType !== 'other' ? now : null,
      resolvedAt: null,
      status: actionType !== 'other' ? 'notified' : 'pending',
    }
    addDisposalRecord(record)
    dismissAlert(batchId)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-80">
      {alertBatches.map((batch) => {
        const expanded = showFormFor === batch.id

        return (
          <div
            key={batch.id}
            className="relative overflow-hidden rounded-xl border border-red-500/40 shadow-2xl bg-gradient-to-br from-red-500/20 via-slate-900/90 to-slate-900/95 backdrop-blur-md"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0 animate-pulse" />

            <div className="relative p-4">
              <button
                onClick={() => dismissAlert(batch.id)}
                className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2 pr-6">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
                <span className="font-mono font-semibold text-sm text-white">
                  {batch.id}
                </span>
              </div>

              <div className="mb-3 text-xs text-slate-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>
                  当前温度:{' '}
                  <span className="font-mono text-red-400 font-bold text-sm">
                    {batch.currentTemp}°C
                  </span>
                </span>
              </div>

              <div className="text-xs text-slate-500 mb-3">
                允许范围: {batch.tempRangeMin}°C ~ {batch.tempRangeMax}°C
                <span className="ml-2 text-red-400/80">超限告警</span>
              </div>

              {expanded && (
                <div className="space-y-2.5 mb-3 border-t border-slate-700/50 pt-3">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <User className="w-3 h-3" />
                      值班员
                    </label>
                    <input
                      type="text"
                      value={operatorInputs[batch.id] || ''}
                      onChange={(e) =>
                        setOperatorInputs((prev) => ({
                          ...prev,
                          [batch.id]: e.target.value,
                        }))
                      }
                      placeholder="请输入值班员姓名"
                      className="w-full rounded-lg border border-slate-700/50 bg-slate-800/60 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cold-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <FileText className="w-3 h-3" />
                      超限原因
                    </label>
                    <textarea
                      value={reasonInputs[batch.id] || ''}
                      onChange={(e) =>
                        setReasonInputs((prev) => ({
                          ...prev,
                          [batch.id]: e.target.value,
                        }))
                      }
                      placeholder="请简要描述越界原因..."
                      rows={2}
                      className="w-full rounded-lg border border-slate-700/50 bg-slate-800/60 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cold-accent focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowFormFor(expanded ? null : batch.id)}
                  className={cn(
                    'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    expanded
                      ? 'bg-slate-700 text-slate-200'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  )}
                >
                  {expanded ? '收起详情' : '填写详情'}
                </button>
                <button
                  onClick={() => handleAction(batch.id, 'add_ice')}
                  className="flex-1 rounded-lg bg-cold-accent/20 px-3 py-1.5 text-xs font-medium text-cold-accent hover:bg-cold-accent/30 transition-colors"
                >
                  补冰
                </button>
                <button
                  onClick={() => handleAction(batch.id, 'connect_power')}
                  className="flex-1 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/30 transition-colors"
                >
                  接电
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
