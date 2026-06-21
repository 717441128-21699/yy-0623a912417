import type { DisposalRecord } from '@/types'
import { cn } from '@/lib/utils'

const ACTION_LABELS: Record<string, string> = {
  add_ice: '补冰',
  connect_power: '接电',
  other: '其他',
}

function formatTime(iso: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

interface Step {
  title: string
  completed: boolean
  content: React.ReactNode
}

interface DisposalDetailProps {
  record: DisposalRecord
}

export default function DisposalDetail({ record }: DisposalDetailProps) {
  const steps: Step[] = [
    {
      title: '越界告警',
      completed: true,
      content: (
        <div className="space-y-1">
          <div className="text-xs text-zinc-400">
            告警时间:{' '}
            <span className="font-[JetBrains_Mono,monospace] text-zinc-300">
              {formatTime(record.alertTime)}
            </span>
          </div>
          <div className="text-xs text-zinc-400">
            超限温度:{' '}
            <span className="font-[JetBrains_Mono,monospace] text-[#EF4444]">
              {record.overLimitTemp}°C
            </span>
          </div>
        </div>
      ),
    },
    {
      title: '原因填写',
      completed: !!record.reason,
      content: record.reason ? (
        <div className="space-y-1">
          <div className="text-xs text-zinc-400">
            原因: <span className="text-zinc-300">{record.reason}</span>
          </div>
          {record.operatorName && (
            <div className="text-xs text-zinc-400">
              操作人: <span className="text-zinc-300">{record.operatorName}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs text-zinc-500">待填写</div>
      ),
    },
    {
      title: '通知司机',
      completed: !!record.notifyDriverAt,
      content: record.notifyDriverAt ? (
        <div className="space-y-1">
          <div className="text-xs text-zinc-400">
            处置方式:{' '}
            <span className="text-[#0EA5E9]">
              {ACTION_LABELS[record.actionType]}
            </span>
          </div>
          <div className="text-xs text-zinc-400">
            通知时间:{' '}
            <span className="font-[JetBrains_Mono,monospace] text-zinc-300">
              {formatTime(record.notifyDriverAt)}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-xs text-zinc-500">待通知</div>
      ),
    },
    {
      title: '处理确认',
      completed: !!record.resolvedAt,
      content: record.resolvedAt ? (
        <div className="text-xs text-zinc-400">
          解决时间:{' '}
          <span className="font-[JetBrains_Mono,monospace] text-[#22C55E]">
            {formatTime(record.resolvedAt)}
          </span>
        </div>
      ) : (
        <div className="text-xs text-zinc-500">待确认</div>
      ),
    },
  ]

  return (
    <div className="relative pl-6">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1

        return (
          <div key={step.title} className={cn('relative pb-6 last:pb-0')}>
            {!isLast && (
              <div
                className={cn(
                  'absolute left-[-21px] top-5 bottom-0 w-px',
                  step.completed ? 'bg-[#0EA5E9]/40' : 'bg-[#2D3B4E]'
                )}
              />
            )}

            <div className="absolute left-[-28px] top-0.5">
              <div
                className={cn(
                  'h-[14px] w-[14px] rounded-full border-2',
                  step.completed
                    ? 'border-[#0EA5E9] bg-[#0EA5E9]'
                    : 'border-[#2D3B4E] bg-transparent'
                )}
              >
                {step.completed && (
                  <svg
                    viewBox="0 0 14 14"
                    className="h-full w-full text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M3.5 7L6 9.5L10.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>

            <div>
              <div
                className={cn(
                  'text-sm font-["DM_Sans"] font-semibold mb-2',
                  step.completed ? 'text-white' : 'text-zinc-500'
                )}
              >
                {step.title}
              </div>
              <div className="rounded-lg border border-[#2D3B4E] bg-[#1A2332] p-3">
                {step.content}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
