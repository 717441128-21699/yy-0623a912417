import { useState } from 'react'
import type { DisposalRecord } from '@/types'
import { cn, formatDateTime } from '@/lib/utils'
import DisposalDetail from './DisposalDetail'
import { Check, Clock, AlertTriangle } from 'lucide-react'

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  pending: { color: '#EF4444', bgColor: 'bg-red-500', label: '待处理' },
  notified: { color: '#F59E0B', bgColor: 'bg-amber-500', label: '已通知' },
  resolved: { color: '#22C55E', bgColor: 'bg-emerald-500', label: '已解决' },
}

const ACTION_LABELS: Record<string, string> = {
  add_ice: '补冰',
  connect_power: '接电',
  other: '其他',
}

const ACTION_COLORS: Record<string, string> = {
  add_ice: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  connect_power: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  other: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
}

interface DisposalTimelineProps {
  records: DisposalRecord[]
}

export default function DisposalTimeline({ records }: DisposalTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="relative pl-4">
      {records.map((record, idx) => {
        const isLast = idx === records.length - 1
        const isExpanded = expandedId === record.id
        const statusCfg = STATUS_CONFIG[record.status]

        return (
          <div key={record.id} className="relative pb-6 last:pb-0">
            {!isLast && (
              <div
                className="absolute left-[11px] top-6 bottom-0 w-px"
                style={{ backgroundColor: '#334155' }}
              />
            )}

            <div className="flex items-start gap-4">
              <div
                className="absolute left-0 top-2 h-[22px] w-[22px] rounded-full border-2 z-10 flex items-center justify-center"
                style={{
                  borderColor: statusCfg.color,
                  backgroundColor: record.status === 'resolved' ? statusCfg.color : 'transparent',
                }}
              >
                {record.status === 'resolved' ? (
                  <Check className="w-3 h-3 text-white" />
                ) : record.status === 'pending' ? (
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                ) : (
                  <Clock className="w-3 h-3 text-amber-400" />
                )}
              </div>

              <div className="ml-9 flex-1 min-w-0">
                <div className="flex items-center gap-3 text-xs mb-1.5">
                  <span className="font-mono text-slate-500">
                    {formatDateTime(record.alertTime)}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${statusCfg.color}20`,
                      color: statusCfg.color,
                    }}
                  >
                    {statusCfg.label}
                  </span>
                </div>

                <div
                  className={cn(
                    'rounded-xl border bg-slate-800/40 p-4 cursor-pointer transition-all',
                    'hover:border-cold-accent/40 hover:bg-slate-800/60',
                    isExpanded && 'border-cold-accent/40 bg-slate-800/60'
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : record.id)}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-semibold text-sm text-slate-100">
                        {record.batchId}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border',
                          ACTION_COLORS[record.actionType]
                        )}
                      >
                        {ACTION_LABELS[record.actionType]}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-400">
                        超限{' '}
                        <span className="font-mono text-red-400 font-semibold">
                          {record.overLimitTemp}°C
                        </span>
                      </span>
                      {record.operatorName && (
                        <span className="text-slate-500">
                          操作人: <span className="text-slate-300">{record.operatorName}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {record.reason && (
                    <div className="mt-2 text-xs text-slate-400 line-clamp-2">
                      {record.reason}
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      {record.notifyDriverAt && (
                        <span className="mr-3">
                          通知: <span className="font-mono text-slate-400">{formatDateTime(record.notifyDriverAt)}</span>
                        </span>
                      )}
                      {record.resolvedAt && (
                        <span>
                          解决: <span className="font-mono text-emerald-400">{formatDateTime(record.resolvedAt)}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {isExpanded ? '收起详情 ▲' : '查看详情 ▼'}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 ml-1">
                    <DisposalDetail record={record} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {records.length === 0 && (
        <div className="py-16 text-center text-slate-500 text-sm">
          暂无处置记录
        </div>
      )}
    </div>
  )
}
