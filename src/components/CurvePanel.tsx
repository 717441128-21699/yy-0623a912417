import { X } from 'lucide-react'
import { useStore } from '@/store'
import TemperatureChart from '@/components/TemperatureChart'
import { cn } from '@/lib/utils'

const STATUS_LABEL: Record<string, string> = {
  in_transit: '运输中',
  awaiting_declaration: '待报关',
  customs_hold: '海关扣留',
  cleared: '已放行',
}

const STATUS_COLOR: Record<string, string> = {
  in_transit: 'text-sky-400',
  awaiting_declaration: 'text-amber-400',
  customs_hold: 'text-purple-400',
  cleared: 'text-emerald-400',
}

export default function CurvePanel() {
  const { selectedBatchId, showCurvePanel, setShowCurvePanel, getBatchById } = useStore()
  const batch = selectedBatchId ? getBatchById(selectedBatchId) : undefined

  return (
    <div
      className={cn(
        'fixed inset-y-0 right-0 z-40 w-full max-w-xl transform transition-transform duration-300 ease-in-out',
        showCurvePanel && selectedBatchId ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <div className="h-full bg-[#0F172A]/95 backdrop-blur-md border-l border-slate-700/50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          <h2 className="font-title text-base font-semibold text-slate-100">
            温度曲线 {batch ? `· ${batch.id}` : ''}
          </h2>
          <button
            onClick={() => setShowCurvePanel(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {batch && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <TemperatureChart batchId={batch.id} />

            <div className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-4 space-y-3">
              <h3 className="font-title text-sm font-semibold text-slate-200">批次详情</h3>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500 text-xs">当前温度</span>
                  <p className={cn('font-mono text-xl font-bold', batch.isOverLimit ? 'text-red-400' : 'text-sky-400')}>
                    {batch.currentTemp}°C
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">允许温区</span>
                  <p className="font-mono text-base font-medium text-slate-300">
                    {batch.tempRangeMin}°C ~ {batch.tempRangeMax}°C
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">状态</span>
                  <p className={cn('font-medium', STATUS_COLOR[batch.status])}>
                    {STATUS_LABEL[batch.status]}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">车牌号</span>
                  <p className="text-slate-300">{batch.licensePlate}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">提单号</span>
                  <p className="text-slate-300">{batch.billOfLading}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">货物品类</span>
                  <p className="text-slate-300">{batch.cargoCategory}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">启运地</span>
                  <p className="text-slate-300">{batch.origin}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">目的口岸</span>
                  <p className="text-slate-300">{batch.destinationPort}</p>
                </div>
              </div>

              {batch.isOverLimit && (
                <div className="mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                  ⚠ 当前温度超出允许温区
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
