import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { useStore } from '@/store'
import { CARGO_CATEGORIES, ORIGINS, DESTINATION_PORTS } from '@/data/mock'
import type { Batch } from '@/types'

const FIELD_CLASS = 'w-full rounded-lg bg-slate-700/60 border border-slate-600/50 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 font-body'
const LABEL_CLASS = 'block text-xs font-medium text-slate-400 mb-1 font-body'

export default function BatchFormModal() {
  const { addBatch, setShowBatchForm } = useStore()

  const [form, setForm] = useState({
    billOfLading: '',
    licensePlate: '',
    cargoCategory: CARGO_CATEGORIES[0],
    origin: ORIGINS[0],
    destinationPort: DESTINATION_PORTS[0],
    tempRangeMin: -18,
    tempRangeMax: -15,
    estimatedArrival: '',
  })

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const id = `BTH-${new Date().getFullYear()}-${String(useStore.getState().batches.length + 1).padStart(3, '0')}`
    const batch: Batch = {
      id,
      billOfLading: form.billOfLading,
      licensePlate: form.licensePlate,
      cargoCategory: form.cargoCategory,
      origin: form.origin,
      destinationPort: form.destinationPort,
      tempRangeMin: form.tempRangeMin,
      tempRangeMax: form.tempRangeMax,
      estimatedArrival: form.estimatedArrival,
      status: 'in_transit',
      isOverLimit: false,
      currentTemp: (form.tempRangeMin + form.tempRangeMax) / 2,
      createdAt: new Date().toISOString(),
    }
    addBatch(batch)
    setShowBatchForm(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowBatchForm(false)} />
      <div className="relative w-full max-w-lg mx-4 bg-slate-800 border border-slate-700/60 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-title text-lg font-semibold text-slate-100">新增批次</h2>
          <button
            onClick={() => setShowBatchForm(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={LABEL_CLASS}>提单号</label>
            <input
              type="text"
              required
              value={form.billOfLading}
              onChange={(e) => update('billOfLading', e.target.value)}
              className={FIELD_CLASS}
              placeholder="BL-XXXXXXXX"
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>车牌号</label>
            <input
              type="text"
              required
              value={form.licensePlate}
              onChange={(e) => update('licensePlate', e.target.value)}
              className={FIELD_CLASS}
              placeholder="粤B·XXXXX"
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>货物品类</label>
            <select
              value={form.cargoCategory}
              onChange={(e) => update('cargoCategory', e.target.value)}
              className={FIELD_CLASS}
            >
              {CARGO_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>启运地</label>
              <select
                value={form.origin}
                onChange={(e) => update('origin', e.target.value)}
                className={FIELD_CLASS}
              >
                {ORIGINS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>目的口岸</label>
              <select
                value={form.destinationPort}
                onChange={(e) => update('destinationPort', e.target.value)}
                className={FIELD_CLASS}
              >
                {DESTINATION_PORTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>允许温区下限 (°C)</label>
              <input
                type="number"
                step="0.1"
                required
                value={form.tempRangeMin}
                onChange={(e) => update('tempRangeMin', Number(e.target.value))}
                className={FIELD_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>允许温区上限 (°C)</label>
              <input
                type="number"
                step="0.1"
                required
                value={form.tempRangeMax}
                onChange={(e) => update('tempRangeMax', Number(e.target.value))}
                className={FIELD_CLASS}
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>预计到港时间</label>
            <input
              type="datetime-local"
              required
              value={form.estimatedArrival}
              onChange={(e) => update('estimatedArrival', e.target.value)}
              className={FIELD_CLASS}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowBatchForm(false)}
              className="px-4 py-2 text-sm rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors font-body"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium transition-colors font-body"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
