import { useState } from 'react'
import { useStore } from '@/store'
import type { Certificate } from '@/types'

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

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

    let overLimitMinutes = 0
    for (const r of filtered) {
      if (
        r.vehicleTemp > batch.tempRangeMax ||
        r.vehicleTemp < batch.tempRangeMin ||
        r.cabinTemp > batch.tempRangeMax ||
        r.cabinTemp < batch.tempRangeMin
      ) {
        overLimitMinutes++
      }
    }
    overLimitMinutes = Math.round(overLimitMinutes * (10 / 60))

    const batchNum = selectedBatchId.replace(/\D/g, '')
    const sensorIds = [`SN-VH${batchNum}`, `SN-CB${batchNum}`]

    const missingScreenshots = Math.random() > 0.6
    const missingSignatures = Math.random() > 0.7

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
    <div className="flex h-full gap-6 p-6">
      <div className="w-[340px] flex-shrink-0 flex flex-col">
        <h2 className="font-['DM_Sans'] text-lg font-bold text-white mb-4">
          凭证列表
        </h2>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              onClick={() => {
                setSelectedCertId(cert.id)
                setGeneratedCert(null)
              }}
              className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                selectedCertId === cert.id
                  ? 'border-[#0EA5E9]/60 bg-[#0EA5E9]/10'
                  : 'border-[#2D3B4E] bg-[#1E2D3D] hover:border-[#0EA5E9]/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-['DM_Sans'] font-semibold text-sm text-white">
                  {cert.id}
                </span>
                <span className="flex items-center gap-1.5 text-xs">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      cert.status === 'complete' ? 'bg-[#22C55E]' : 'bg-[#F59E0B]'
                    }`}
                  />
                  <span
                    className={
                      cert.status === 'complete' ? 'text-[#22C55E]' : 'text-[#F59E0B]'
                    }
                  >
                    {cert.status === 'complete' ? '完整' : '待补'}
                  </span>
                </span>
              </div>

              <div className="text-xs text-zinc-400">
                批次: {cert.batchId}
              </div>
              <div className="text-xs text-zinc-500 font-[JetBrains_Mono,monospace] mt-0.5">
                {formatTime(cert.generatedAt)}
              </div>
            </div>
          ))}

          {certificates.length === 0 && (
            <div className="py-12 text-center text-zinc-500 text-sm">
              暂无凭证
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <div className="rounded-xl border border-[#2D3B4E] bg-[#1E2D3D] p-5">
          <h3 className="font-['DM_Sans'] text-base font-bold text-white mb-4">
            凭证生成器
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">选择批次</label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full rounded-lg border border-[#2D3B4E] bg-[#1A2332] px-3 py-2 text-sm text-white focus:border-[#0EA5E9] focus:outline-none"
              >
                <option value="">请选择批次</option>
                {eligibleBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} - {b.cargoCategory}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">起始时间</label>
              <input
                type="datetime-local"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                className="w-full rounded-lg border border-[#2D3B4E] bg-[#1A2332] px-3 py-2 text-sm text-white font-[JetBrains_Mono,monospace] focus:border-[#0EA5E9] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">结束时间</label>
              <input
                type="datetime-local"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                className="w-full rounded-lg border border-[#2D3B4E] bg-[#1A2332] px-3 py-2 text-sm text-white font-[JetBrains_Mono,monospace] focus:border-[#0EA5E9] focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={!selectedBatchId || !timeStart || !timeEnd}
              className="rounded-lg bg-[#0EA5E9] px-5 py-2 text-sm font-medium text-white hover:bg-[#0EA5E9]/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              生成凭证
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <h3 className="font-['DM_Sans'] text-base font-bold text-white mb-4">
            凭证预览
          </h3>

          {previewCert ? (
            <div className="flex justify-center">
              <div className="w-[680px] bg-white rounded-lg shadow-2xl p-10 text-[#1A2332]">
                <div className="text-center mb-6">
                  <div className="font-['DM_Sans'] text-xl font-bold text-[#1A2332]">
                    冷链运输温度凭证
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Cold Chain Temperature Certificate
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  <div>
                    <span className="text-gray-500">凭证编号</span>
                    <div className="font-['DM_Sans'] font-bold text-[#1A2332] font-[JetBrains_Mono,monospace]">
                      {previewCert.id}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">批次号</span>
                    <div className="font-['DM_Sans'] font-bold text-[#1A2332]">
                      {previewCert.batchId}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">时间段</span>
                    <div className="font-[JetBrains_Mono,monospace] text-[#1A2332]">
                      {formatTime(previewCert.timeRangeStart)} — {formatTime(previewCert.timeRangeEnd)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">最高温</span>
                    <div className="font-[JetBrains_Mono,monospace] text-[#EF4444] font-bold text-lg">
                      {previewCert.maxTemp}°C
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">最低温</span>
                    <div className="font-[JetBrains_Mono,monospace] text-[#0EA5E9] font-bold text-lg">
                      {previewCert.minTemp}°C
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">超限分钟数</span>
                    <div className="font-[JetBrains_Mono,monospace] font-bold text-lg">
                      {previewCert.overLimitMinutes}
                      <span className="text-sm font-normal text-gray-500 ml-1">min</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">传感器编号</span>
                    <div className="font-[JetBrains_Mono,monospace] text-sm">
                      {previewCert.sensorIds.join(' / ')}
                    </div>
                  </div>
                </div>

                {(previewCert.missingScreenshots || previewCert.missingSignatures) && (
                  <div className="mt-6 space-y-2">
                    {previewCert.missingScreenshots && (
                      <div className="flex items-center gap-2 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-3 py-2 text-xs text-[#F59E0B]">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zM8 11.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                        </svg>
                        缺少温度截图
                      </div>
                    )}
                    {previewCert.missingSignatures && (
                      <div className="flex items-center gap-2 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-3 py-2 text-xs text-[#F59E0B]">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zM8 11.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                        </svg>
                        缺少签章
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  <button
                    disabled={previewCert.status === 'pending_materials'}
                    className="rounded-lg bg-[#0EA5E9] px-5 py-2 text-sm font-medium text-white hover:bg-[#0EA5E9]/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    打印凭证
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-zinc-500 text-sm">
              选择或生成凭证以预览
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
