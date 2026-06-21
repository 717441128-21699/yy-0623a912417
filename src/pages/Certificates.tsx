import { useState } from 'react'
import { FileCheck, Calendar, AlertTriangle } from 'lucide-react'
import { useStore } from '@/store'
import type { Certificate } from '@/types'
import { calculateOverLimitMinutes, generateSensorIds, formatDateTime, cn } from '@/lib/utils'

export default function Certificates() {
  const certificates = useStore((s) => s.certificates)
  const batches = useStore((s) => s.batches)
  const getCurveByBatchId = useStore((s) => s.getCurveByBatchId)
  const addCertificate = useStore((s) => s.addCertificate)

  const [selectedCertId, setSelectedCertId] = useState<string | null>(null)
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [timeStart, setTimeStart] = useState('')
  const [timeEnd, setTimeEnd] = useState('')
  const [generatedCert, setGeneratedCert] = useState<Certificate | null>(null)

  const eligibleBatches = batches.filter(
    (b) => b.status === 'awaiting_declaration' || b.status === 'customs_hold'
  )

  const previewCert = generatedCert
    || (selectedCertId ? certificates.find((c) => c.id === selectedCertId) : null)
    || null

  const previewBatch = previewCert
    ? batches.find((b) => b.id === previewCert.batchId)
    : null

  function handleGenerate() {
    if (!selectedBatchId || !timeStart || !timeEnd) return

    const curve = getCurveByBatchId(selectedBatchId)
    const batch = batches.find((b) => b.id === selectedBatchId)
    if (!curve || !batch) return

    const start = new Date(timeStart).getTime()
    const end = new Date(timeEnd).getTime()

    const filtered = curve.readings.filter((r) => {
      const t = new Date(r.timestamp).getTime()
      return t >= start && t <= end
    })

    if (filtered.length === 0) return

    const allTemps = filtered.flatMap((r) => [r.vehicleTemp, r.cabinTemp])
    const maxTemp = Math.max(...allTemps)
    const minTemp = Math.min(...allTemps)

    const overLimitMinutes = calculateOverLimitMinutes(
      filtered,
      batch.tempRangeMin,
      batch.tempRangeMax
    )

    const sensorIds = generateSensorIds(selectedBatchId)

    const missingScreenshots = Math.random() > 0.65
    const missingSignatures = Math.random() > 0.75

    const cert: Certificate = {
      id: `CERT-${Date.now()}`,
      batchId: selectedBatchId,
      timeRangeStart: timeStart,
      timeRangeEnd: timeEnd,
      maxTemp: Math.round(maxTemp * 10) / 10,
      minTemp: Math.round(minTemp * 10) / 10,
      overLimitMinutes,
      sensorIds,
      missingScreenshots,
      missingSignatures,
      status: missingScreenshots || missingSignatures ? 'pending_materials' : 'complete',
      generatedAt: new Date().toISOString(),
    }

    addCertificate(cert)
    setGeneratedCert(cert)
    setSelectedCertId(cert.id)
  }

  return (
    <div className="flex flex-col h-full gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileCheck className="w-6 h-6 text-cold-accent" />
          <h1 className="font-title text-xl font-bold text-white">温控凭证</h1>
        </div>
        <span className="text-xs text-slate-500">
          共 {certificates.length} 条凭证
        </span>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        <div className="w-80 flex-shrink-0 flex flex-col bg-slate-800/40 rounded-xl border border-cold-border">
          <div className="px-4 py-3 border-b border-cold-border">
            <h2 className="font-title text-sm font-semibold text-slate-200">凭证列表</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                onClick={() => {
                  setSelectedCertId(cert.id)
                  setGeneratedCert(null)
                }}
                className={cn(
                  'rounded-lg border p-3 cursor-pointer transition-all',
                  selectedCertId === cert.id
                    ? 'border-cold-accent/50 bg-cold-accent/10'
                    : 'border-cold-border bg-slate-800/40 hover:border-cold-accent/30 hover:bg-slate-800/60'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-sm font-semibold text-slate-200">
                    {cert.id}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        cert.status === 'complete' ? 'bg-emerald-400' : 'bg-amber-400'
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs',
                        cert.status === 'complete' ? 'text-emerald-400' : 'text-amber-400'
                      )}
                    >
                      {cert.status === 'complete' ? '完整' : '待补'}
                    </span>
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  批次: {cert.batchId}
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  {formatDateTime(cert.generatedAt)}
                </div>
              </div>
            ))}

            {certificates.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-sm">
                暂无凭证
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="rounded-xl border border-cold-border bg-slate-800/40 p-5">
            <h3 className="font-title text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cold-accent" />
              凭证生成器
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">选择批次</label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full rounded-lg border border-cold-border bg-slate-900/60 px-3 py-2 text-sm text-slate-200 focus:border-cold-accent focus:outline-none font-body"
                >
                  <option value="">请选择批次</option>
                  {eligibleBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.id} · {b.cargoCategory}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">起始时间</label>
                <input
                  type="datetime-local"
                  value={timeStart}
                  onChange={(e) => setTimeStart(e.target.value)}
                  className="w-full rounded-lg border border-cold-border bg-slate-900/60 px-3 py-2 text-sm text-slate-200 font-mono focus:border-cold-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">结束时间</label>
                <input
                  type="datetime-local"
                  value={timeEnd}
                  onChange={(e) => setTimeEnd(e.target.value)}
                  className="w-full rounded-lg border border-cold-border bg-slate-900/60 px-3 py-2 text-sm text-slate-200 font-mono focus:border-cold-accent focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={!selectedBatchId || !timeStart || !timeEnd}
                className="flex items-center gap-1.5 rounded-lg bg-cold-accent px-5 py-2 text-sm font-medium text-white hover:bg-cold-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FileCheck className="w-4 h-4" />
                生成凭证
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto rounded-xl border border-cold-border bg-slate-800/40 p-5">
            <h3 className="font-title text-sm font-semibold text-slate-200 mb-4">
              凭证预览
            </h3>

            {previewCert ? (
              <div className="flex justify-center">
                <div className="w-full max-w-[580px] bg-white rounded-lg shadow-2xl p-8 text-slate-800">
                  <div className="text-center mb-6 pb-4 border-b border-slate-200">
                    <div className="font-title text-xl font-bold text-slate-800">
                      冷链运输温度凭证
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Cold Chain Temperature Certificate
                    </div>
                  </div>

                  {previewBatch && (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm mb-6">
                      <div>
                        <span className="text-slate-500 text-xs">凭证编号</span>
                        <div className="font-mono font-semibold text-slate-800 text-sm mt-0.5">
                          {previewCert.id}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs">批次号</span>
                        <div className="font-semibold text-slate-800 text-sm mt-0.5">
                          {previewCert.batchId}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs">货物品类</span>
                        <div className="text-slate-800 text-sm mt-0.5">
                          {previewBatch.cargoCategory}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs">运输车牌</span>
                        <div className="text-slate-800 text-sm mt-0.5">
                          {previewBatch.licensePlate}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 text-xs">起止时段</span>
                        <div className="font-mono text-slate-800 text-sm mt-0.5">
                          {formatDateTime(previewCert.timeRangeStart)}
                          <span className="mx-2 text-slate-400">—</span>
                          {formatDateTime(previewCert.timeRangeEnd)}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs">允许温区</span>
                        <div className="font-mono text-slate-800 text-sm mt-0.5">
                          {previewBatch.tempRangeMin}°C ~ {previewBatch.tempRangeMax}°C
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs">超限分钟数</span>
                        <div
                          className={cn(
                            'font-mono font-bold text-lg mt-0.5',
                            previewCert.overLimitMinutes > 0
                              ? 'text-red-500'
                              : 'text-emerald-500'
                          )}
                        >
                          {previewCert.overLimitMinutes}
                          <span className="text-xs font-normal text-slate-500 ml-1">
                            分钟
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-slate-500 mb-1">最高温</div>
                      <div className="font-mono font-bold text-red-500 text-lg">
                        {previewCert.maxTemp}°C
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-slate-500 mb-1">最低温</div>
                      <div className="font-mono font-bold text-sky-500 text-lg">
                        {previewCert.minTemp}°C
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-slate-500 mb-1">采样数</div>
                      <div className="font-mono font-bold text-slate-700 text-lg">
                        {Math.round(previewCert.overLimitMinutes / 10) +
                          Math.round(
                            ((new Date(previewCert.timeRangeEnd).getTime() -
                              new Date(previewCert.timeRangeStart).getTime()) /
                              60000 -
                              previewCert.overLimitMinutes) /
                              10
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <div className="text-xs text-slate-500 mb-1.5">传感器编号</div>
                    <div className="font-mono text-slate-700 text-sm">
                      {previewCert.sensorIds.join('  /  ')}
                    </div>
                  </div>

                  {(previewCert.missingScreenshots || previewCert.missingSignatures) && (
                    <div className="mt-5 space-y-2">
                      {previewCert.missingScreenshots && (
                        <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-600">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>缺少温度截图，请补充后重新生成</span>
                        </div>
                      )}
                      {previewCert.missingSignatures && (
                        <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-600">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>缺少签章，请确认负责人签字后再提交</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      disabled={previewCert.status === 'pending_materials'}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                        previewCert.status === 'pending_materials'
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-cold-accent text-white hover:bg-cold-accent/80'
                      )}
                    >
                      <FileCheck className="w-4 h-4" />
                      打印凭证
                    </button>
                  </div>

                  <div className="mt-4 text-right text-xs text-slate-400">
                    生成时间: {formatDateTime(previewCert.generatedAt)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 text-sm">
                <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                选择或生成凭证以预览
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
