import { useState, useMemo } from 'react'
import { ClipboardList, Search, Filter } from 'lucide-react'
import { useStore } from '@/store'
import type { DisposalActionType, DisposalStatus } from '@/types'
import DisposalTimeline from '@/components/DisposalTimeline'

const ACTION_OPTIONS: { value: DisposalActionType | 'all'; label: string }[] = [
  { value: 'all', label: '全部方式' },
  { value: 'add_ice', label: '补冰' },
  { value: 'connect_power', label: '接电' },
  { value: 'other', label: '其他' },
]

const STATUS_OPTIONS: { value: DisposalStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待处理' },
  { value: 'notified', label: '已通知' },
  { value: 'resolved', label: '已解决' },
]

export default function Records() {
  const disposalRecords = useStore((s) => s.disposalRecords)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState<DisposalActionType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<DisposalStatus | 'all'>('all')

  const filteredRecords = useMemo(() => {
    return disposalRecords.filter((r) => {
      if (searchQuery && !r.batchId.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      if (actionFilter !== 'all' && r.actionType !== actionFilter) {
        return false
      }
      if (statusFilter !== 'all' && r.status !== statusFilter) {
        return false
      }
      return true
    })
  }, [disposalRecords, searchQuery, actionFilter, statusFilter])

  const pendingCount = disposalRecords.filter((r) => r.status === 'pending').length
  const notifiedCount = disposalRecords.filter((r) => r.status === 'notified').length
  const resolvedCount = disposalRecords.filter((r) => r.status === 'resolved').length

  return (
    <div className="flex flex-col h-full gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-cold-accent" />
          <h1 className="font-title text-xl font-bold text-white">处置记录</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            <span className="text-slate-400">待处理</span>
            <span className="font-mono font-semibold text-slate-200">{pendingCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-slate-400">已通知</span>
            <span className="font-mono font-semibold text-slate-200">{notifiedCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">已解决</span>
            <span className="font-mono font-semibold text-slate-200">{resolvedCount}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索批次号..."
            className="rounded-lg border border-cold-border bg-slate-800/40 pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-cold-accent focus:outline-none w-56"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as DisposalActionType | 'all')}
            className="rounded-lg border border-cold-border bg-slate-800/40 px-3 py-2 text-sm text-slate-200 focus:border-cold-accent focus:outline-none"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DisposalStatus | 'all')}
            className="rounded-lg border border-cold-border bg-slate-800/40 px-3 py-2 text-sm text-slate-200 focus:border-cold-accent focus:outline-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 text-right text-xs text-slate-500">
          共 {filteredRecords.length} 条记录
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-800/30 rounded-xl border border-cold-border p-5">
        <DisposalTimeline records={filteredRecords} />
      </div>
    </div>
  )
}
