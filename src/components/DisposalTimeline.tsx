import { useState } from 'react'
import type { DisposalRecord } from '@/types'
import { cn } from '@/lib/utils'
import DisposalDetail from './DisposalDetail'

const STATUS_COLORS: Record<string, string> = {
  pending: '#EF4444',
  notified: '#F59E0B',
  resolved: '#22C55E',
}

const ACTION_LABELS: Record<string, string> = {
  add_ice: '补冰',
  connect_power: '接电',
  other: '其他',
}

const ACTION_COLORS: Record<string, string> = {
  add_ice: 'bg-sky-500/20 text-sky-400',
  connect_power: 'bg-amber-500/20 text-amber-400',
  other: 'bg-zinc-500/20 text-zinc-400',
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface DisposalTimelineProps {
  records: DisposalRecord[]
}

export default function DisposalTimeline({ records }: DisposalTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="relative pl-6">
      {records.map((record, idx) => {
        const isLast = idx === records.length - 1
        const isExpanded = expandedId === record.id

        return (
          <div key={record.id} className="relative pb-6 last:pb-0">
            {!isLast && (
              <div
                className="absolute left-[7px] top-6 bottom-0 w-px"
                style={{ backgroundColor: '#2D3B4E' }}
              />
            )}

            <div className="flex items-start gap-4">
              <div
                className="absolute left-0 top-1.5 h-[14px] w-[14px] rounded-full border-2"
                style={{
                  borderColor: STATUS_COLORS[record.status],
                  backgroundColor: STATUS_COLORS[record.status],
                }}
              />

              <div className="ml-6 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-[JetBrains_Mono,monospace] mb-1">
                  {formatTime(record.alertTime)}
                </div>

                <div
                  className={cn(
                    'rounded-lg border border-[#2D3B4E] bg-[#1E2D3D] p-4 cursor-pointer transition-colors',
                    'hover:border-[#0EA5E9]/40',
                    isExpanded && 'border-[#0EA5E9]/40'
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : record.id)}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-['DM_Sans'] font-semibold text-sm text-white">
                        {record.batchId}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          ACTION_COLORS[record.actionType]
                        )}
                      >
                        {ACTION_LABELS[record.actionType]}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                      <span>
                        超限{' '}
                        <span className="text-[#EF4444] font-[JetBrains_Mono,monospace]">
                          {record.overLimitTemp}°C
                        </span>
                      </span>
                      <span>
                        持续{' '}
                        <span className="font-[JetBrains_Mono,monospace] text-zinc-300">
                          {record.overLimitDuration}min
                        </span>
                      </span>
                    </div>
                  </div>

                  {record.operatorName && (
                    <div className="mt-2 text-xs text-zinc-500">
                      操作人: {record.operatorName}
                    </div>
                  )}

                  {record.reason && (
                    <div className="mt-1 text-xs text-zinc-400 truncate">
                      {record.reason}
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-3 ml-2">
                    <DisposalDetail record={record} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {records.length === 0 && (
        <div className="py-12 text-center text-zinc-500 text-sm">
          暂无处置记录
        </div>
      )}
    </div>
  )
}
