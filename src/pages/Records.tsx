import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import type { DisposalActionType, DisposalStatus } from '@/types'
import DisposalTimeline from '@/components/DisposalTimeline'

const ACTION_OPTIONS: { value: DisposalActionType | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'add_ice', label: '补冰' },
  { value: 'connect_power', label: '接电' },
  { value: 'other', label: '其他' },
]

const STATUS_OPTIONS: { value: DisposalStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
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

  return (
    <div className="h-full flex flex-col p-6">
      <h1 className="font-['DM_Sans'] text-xl font-bold text-white mb-5">
        处置记录
      </h1>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3 3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索批次号..."
            className="rounded-lg border border-[#2D3B4E] bg-[#1E2D3D] pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#0EA5E9] focus:outline-none w-[200px]"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as DisposalActionType | 'all')}
          className="rounded-lg border border-[#2D3B4E] bg-[#1E2D3D] px-3 py-2 text-sm text-white focus:border-[#0EA5E9] focus:outline-none"
        >
          {ACTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              处置方式: {opt.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DisposalStatus | 'all')}
          className="rounded-lg border border-[#2D3B4E] bg-[#1E2D3D] px-3 py-2 text-sm text-white focus:border-[#0EA5E9] focus:outline-none"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              状态: {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto">
        <DisposalTimeline records={filteredRecords} />
      </div>
    </div>
  )
}
