import { useState } from 'react'
import { useStore } from '@/store'
import type { DisposalRecord } from '@/types'

export default function AlertOverlay() {
  const alertBatchIds = useStore((s) => s.alertBatchIds)
  const batches = useStore((s) => s.batches)
  const dismissAlert = useStore((s) => s.dismissAlert)
  const addDisposalRecord = useStore((s) => s.addDisposalRecord)

  const [reasonInputs, setReasonInputs] = useState<Record<string, string>>({})
  const [showReasonFor, setShowReasonFor] = useState<string | null>(null)

  const alertBatches = batches.filter((b) => alertBatchIds.includes(b.id))

  if (alertBatches.length === 0) return null

  function handleAction(batchId: string, actionType: DisposalRecord['actionType']) {
    const reason = reasonInputs[batchId] || ''
    const record: DisposalRecord = {
      id: `DSP-${Date.now()}`,
      batchId,
      alertTime: new Date().toISOString(),
      overLimitTemp: batches.find((b) => b.id === batchId)?.currentTemp ?? 0,
      overLimitDuration: 0,
      reason,
      actionType,
      operatorName: '',
      notifyDriverAt: actionType !== 'other' ? new Date().toISOString() : null,
      resolvedAt: null,
      status: actionType !== 'other' ? 'notified' : 'pending',
    }
    addDisposalRecord(record)
    dismissAlert(batchId)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
      {alertBatches.map((batch) => {
        const isEnteringReason = showReasonFor === batch.id

        return (
          <div
            key={batch.id}
            className="relative overflow-hidden rounded-xl border border-[#EF4444]/30 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="absolute inset-0 rounded-xl animate-pulse opacity-20 bg-gradient-to-r from-[#EF4444]/30 to-transparent pointer-events-none" />

            <div className="relative p-4">
              <button
                onClick={() => dismissAlert(batch.id)}
                className="absolute top-2 right-2 text-zinc-500 hover:text-white transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                </svg>
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#EF4444] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
                </span>
                <span className="font-['DM_Sans'] font-semibold text-sm text-white">
                  {batch.id}
                </span>
              </div>

              <div className="mb-3 text-xs text-zinc-400">
                当前温度:{' '}
                <span className="font-[JetBrains_Mono,monospace] text-[#EF4444] font-bold text-sm">
                  {batch.currentTemp}°C
                </span>
                <span className="ml-2 text-[#EF4444]">
                  超出范围 ({batch.tempRangeMin}°C ~ {batch.tempRangeMax}°C)
                </span>
              </div>

              {isEnteringReason && (
                <div className="mb-3">
                  <input
                    type="text"
                    value={reasonInputs[batch.id] || ''}
                    onChange={(e) =>
                      setReasonInputs((prev) => ({ ...prev, [batch.id]: e.target.value }))
                    }
                    placeholder="输入超限原因..."
                    className="w-full rounded-lg border border-[#2D3B4E] bg-[#1A2332] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#0EA5E9] focus:outline-none"
                    autoFocus
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setShowReasonFor(isEnteringReason ? null : batch.id)
                  }
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
                >
                  {isEnteringReason ? '确认原因' : '填写原因'}
                </button>
                <button
                  onClick={() => handleAction(batch.id, 'add_ice')}
                  className="rounded-lg bg-[#0EA5E9]/20 px-3 py-1.5 text-xs font-medium text-[#0EA5E9] hover:bg-[#0EA5E9]/30 transition-colors"
                >
                  补冰
                </button>
                <button
                  onClick={() => handleAction(batch.id, 'connect_power')}
                  className="rounded-lg bg-[#F59E0B]/20 px-3 py-1.5 text-xs font-medium text-[#F59E0B] hover:bg-[#F59E0B]/30 transition-colors"
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
