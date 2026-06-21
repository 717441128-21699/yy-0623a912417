import { useState } from 'react'
import { Check, Clock, User, PhoneCall, FileText, Snowflake, Zap } from 'lucide-react'
import type { DisposalRecord } from '@/types'
import { cn, formatDateTime } from '@/lib/utils'
import { useStore } from '@/store'

const ACTION_LABELS: Record<string, string> = {
  add_ice: '补冰',
  connect_power: '接电',
  other: '其他',
}

const ACTION_ICONS: Record<string, typeof Snowflake> = {
  add_ice: Snowflake,
  connect_power: Zap,
  other: FileText,
}

interface DisposalDetailProps {
  record: DisposalRecord
}

export default function DisposalDetail({ record }: DisposalDetailProps) {
  const resolveDisposalRecord = useStore((s) => s.resolveDisposalRecord)
  const updateDisposalRecord = useStore((s) => s.updateDisposalRecord)
  const [editing, setEditing] = useState(false)
  const [editReason, setEditReason] = useState(record.reason)
  const [editOperator, setEditOperator] = useState(record.operatorName)
  const [resultNote, setResultNote] = useState(record.resultNote || '')
  const [resolveNote, setResolveNote] = useState('')

  function handleSaveEdit() {
    updateDisposalRecord(record.id, {
      reason: editReason,
      operatorName: editOperator,
      ...(!record.notifyDriverAt && record.status === 'pending'
        ? {
            notifyDriverAt: new Date().toISOString(),
            status: 'notified',
          }
        : {}),
    })
    setEditing(false)
  }

  function handleResolve() {
    resolveDisposalRecord(record.id, resolveNote || undefined)
    setResolveNote('')
  }

  const steps = [
    {
      title: '越界告警',
      completed: true,
      icon: Clock,
      content: (
        <div className="space-y-1.5">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="text-slate-500">告警时间:</span>
            <span className="font-mono text-slate-200">{formatDateTime(record.alertTime)}</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="text-slate-500">超限温度:</span>
            <span className="font-mono text-red-400 font-semibold">
              {record.overLimitTemp}°C
            </span>
          </div>
        </div>
      ),
    },
    {
      title: '原因填写',
      completed: !!record.reason || !!record.operatorName,
      icon: FileText,
      content: editing ? (
        <div className="space-y-2.5">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">值班员</label>
            <input
              type="text"
              value={editOperator}
              onChange={(e) => setEditOperator(e.target.value)}
              className="w-full rounded-md border border-slate-600/50 bg-slate-800 px-2.5 py-1.5 text-xs text-white focus:border-cold-accent focus:outline-none"
              placeholder="请输入值班员姓名"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">越界原因</label>
            <textarea
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-slate-600/50 bg-slate-800 px-2.5 py-1.5 text-xs text-white focus:border-cold-accent focus:outline-none resize-none"
              placeholder="请填写越界原因"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setEditing(false)
                setEditReason(record.reason)
                setEditOperator(record.operatorName)
              }}
              className="px-3 py-1 text-xs rounded-md text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1 text-xs rounded-md bg-cold-accent text-white hover:bg-cold-accent/80 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          {record.operatorName && (
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <User className="w-3 h-3 text-slate-500" />
              <span className="text-slate-500">值班员:</span>
              <span className="text-slate-200">{record.operatorName}</span>
            </div>
          )}
          {record.reason ? (
            <div className="text-xs text-slate-400 flex items-start gap-2">
              <FileText className="w-3 h-3 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-500">原因:</span>
                <span className="text-slate-200 ml-1">{record.reason}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">待填写</div>
          )}
          {record.status !== 'resolved' && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="mt-1 text-xs text-cold-accent hover:text-cold-accent/80"
            >
              {record.reason ? '编辑原因' : '填写原因'}
            </button>
          )}
        </div>
      ),
    },
    {
      title: '通知司机',
      completed: !!record.notifyDriverAt,
      icon: PhoneCall,
      content: record.notifyDriverAt ? (
        <div className="space-y-1.5">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            {(() => {
              const Icon = ACTION_ICONS[record.actionType] || FileText
              return <Icon className="w-3 h-3 text-slate-500" />
            })()}
            <span className="text-slate-500">处置方式:</span>
            <span
              className={cn(
                'px-2 py-0.5 rounded text-xs font-medium',
                record.actionType === 'add_ice'
                  ? 'bg-sky-500/20 text-sky-400'
                  : record.actionType === 'connect_power'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-slate-500/20 text-slate-400'
              )}
            >
              {ACTION_LABELS[record.actionType]}
            </span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="text-slate-500">通知时间:</span>
            <span className="font-mono text-slate-200">
              {formatDateTime(record.notifyDriverAt)}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-500">待通知</div>
      ),
    },
    {
      title: '处理确认',
      completed: !!record.resolvedAt,
      icon: Check,
      content: record.resolvedAt ? (
        <div className="space-y-1.5">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Check className="w-3 h-3 text-emerald-500" />
            <span className="text-slate-500">解决时间:</span>
            <span className="font-mono text-emerald-400">{formatDateTime(record.resolvedAt)}</span>
          </div>
          {record.resultNote && (
            <div className="text-xs text-slate-400 flex items-start gap-2">
              <FileText className="w-3 h-3 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-500">处理结果:</span>
                <span className="text-slate-200 ml-1">{record.resultNote}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={resolveNote}
            onChange={(e) => setResolveNote(e.target.value)}
            rows={2}
            placeholder="填写处理结果备注（可选）..."
            className="w-full rounded-md border border-slate-600/50 bg-slate-800 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cold-accent focus:outline-none resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handleResolve}
              className="px-3 py-1 text-xs rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              标记已解决
            </button>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="relative pl-7">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1

        return (
          <div key={step.title} className={cn('relative pb-6', isLast && 'pb-0')}>
            {!isLast && (
              <div
                className={cn(
                  'absolute left-[-25px] top-5 bottom-0 w-px',
                  step.completed ? 'bg-cold-accent/40' : 'bg-slate-700'
                )}
              />
            )}

            <div className="absolute left-[-32px] top-0.5">
              <div
                className={cn(
                  'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                  step.completed
                    ? 'border-cold-accent bg-cold-accent text-white'
                    : 'border-slate-600 bg-transparent'
                )}
              >
                {step.completed ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <step.icon className="w-3 h-3 text-slate-600" />
                )}
              </div>
            </div>

            <div>
              <div
                className={cn(
                  'text-sm font-title font-semibold mb-2',
                  step.completed ? 'text-slate-100' : 'text-slate-500'
                )}
              >
                {step.title}
              </div>
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-3">
                {step.content}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
