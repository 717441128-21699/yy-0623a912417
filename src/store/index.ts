import { create } from 'zustand'
import type { Batch, TemperatureCurve, Certificate, DisposalRecord } from '@/types'
import { MOCK_BATCHES, MOCK_CURVES, MOCK_CERTIFICATES, MOCK_DISPOSAL_RECORDS } from '@/data/mock'

interface AppState {
  batches: Batch[]
  curves: TemperatureCurve[]
  certificates: Certificate[]
  disposalRecords: DisposalRecord[]
  selectedBatchId: string | null
  searchQuery: string
  showBatchForm: boolean
  showCurvePanel: boolean
  alertBatchIds: string[]

  setSearchQuery: (q: string) => void
  setSelectedBatchId: (id: string | null) => void
  setShowBatchForm: (show: boolean) => void
  setShowCurvePanel: (show: boolean) => void
  addBatch: (batch: Batch) => void
  addCertificate: (cert: Certificate) => void
  addDisposalRecord: (record: DisposalRecord) => void
  updateDisposalRecord: (id: string, updates: Partial<DisposalRecord>) => void
  dismissAlert: (batchId: string) => void
  getBatchById: (id: string) => Batch | undefined
  getCurveByBatchId: (id: string) => TemperatureCurve | undefined
  getCertificatesByBatchId: (id: string) => Certificate[]
  getDisposalRecordsByBatchId: (id: string) => DisposalRecord[]
}

export const useStore = create<AppState>((set, get) => ({
  batches: [...MOCK_BATCHES],
  curves: [...MOCK_CURVES],
  certificates: [...MOCK_CERTIFICATES],
  disposalRecords: [...MOCK_DISPOSAL_RECORDS],
  selectedBatchId: null,
  searchQuery: '',
  showBatchForm: false,
  showCurvePanel: false,
  alertBatchIds: MOCK_BATCHES.filter((b) => b.isOverLimit).map((b) => b.id),

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSelectedBatchId: (id) => set({ selectedBatchId: id, showCurvePanel: !!id }),
  setShowBatchForm: (show) => set({ showBatchForm: show }),
  setShowCurvePanel: (show) => set({ showCurvePanel: show, selectedBatchId: show ? get().selectedBatchId : null }),

  addBatch: (batch) =>
    set((s) => ({
      batches: [batch, ...s.batches],
    })),

  addCertificate: (cert) =>
    set((s) => ({
      certificates: [cert, ...s.certificates],
    })),

  addDisposalRecord: (record) =>
    set((s) => ({
      disposalRecords: [record, ...s.disposalRecords],
    })),

  updateDisposalRecord: (id, updates) =>
    set((s) => ({
      disposalRecords: s.disposalRecords.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  dismissAlert: (batchId) =>
    set((s) => ({
      alertBatchIds: s.alertBatchIds.filter((id) => id !== batchId),
    })),

  getBatchById: (id) => get().batches.find((b) => b.id === id),
  getCurveByBatchId: (id) => get().curves.find((c) => c.batchId === id),
  getCertificatesByBatchId: (id) => get().certificates.filter((c) => c.batchId === id),
  getDisposalRecordsByBatchId: (id) => get().disposalRecords.filter((r) => r.batchId === id),
}))
