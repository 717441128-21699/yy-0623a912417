import { useMemo } from 'react'
import { Search, Plus } from 'lucide-react'
import { useStore } from '@/store'
import BatchCard from '@/components/BatchCard'
import BatchFormModal from '@/components/BatchFormModal'
import CurvePanel from '@/components/CurvePanel'

export default function Batches() {
  const { batches, searchQuery, setSearchQuery, showBatchForm, setShowBatchForm } = useStore()

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return batches
    const q = searchQuery.toLowerCase()
    return batches.filter(
      (b) =>
        b.billOfLading.toLowerCase().includes(q) ||
        b.licensePlate.toLowerCase().includes(q)
    )
  }, [batches, searchQuery])

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="font-title text-2xl font-bold text-slate-100">批次管理</h1>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="搜索提单号 / 车牌号"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/40 font-body"
              />
            </div>
            <button
              onClick={() => setShowBatchForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium transition-colors whitespace-nowrap font-body"
            >
              <Plus size={16} />
              新增批次
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Search size={40} className="mb-3 opacity-30" />
            <p className="text-sm">未找到匹配的批次</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((batch) => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        )}
      </div>

      {showBatchForm && <BatchFormModal />}
      <CurvePanel />
    </div>
  )
}
