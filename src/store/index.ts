import { create } from 'zustand'
import type { Batch, TemperatureCurve, Certificate, DisposalRecord } from '@/types'
import {
  MOCK_BATCHES,
  MOCK_CURVES,
  MOCK_CERTIFICATES,
  MOCK_DISPOSAL_RECORDS,
  generateTemperatureCurve,
} from '@/data/mock'

const STORAGE_KEY = 'cold-chain-console-v1'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (e) {
    console.warn('Failed to load from localStorage:', e)
  }
  return null
}

function saveToStorage(state: {
  batches: Batch[]
  curves: TemperatureCurve[]
  certificates: Certificate[]
  disposalRecords: DisposalRecord[]
  alertBatchIds: string[]
}) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      batches: state.batches,
      curves: state.curves,
      certificates: state.certificates,
      disposalRecords: state.disposalRecords,
      alertBatchIds: state.alertBatchIds,
    }))
  } catch (e) {
    console.warn('Failed to save to localStorage:', e)
  }
}

const stored = loadFromStorage()

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
  currentOperator: string

  setSearchQuery: (q: string) => void
  setSelectedBatchId: (id: string | null) => void
  setShowBatchForm: (show: boolean) => void
  setShowCurvePanel: (show: boolean) => void
  setCurrentOperator: (name: string) => void
  addBatch: (batch: Batch) => void
  addCurve: (curve: TemperatureCurve) => void
  addCertificate: (cert: Certificate) => void
  addDisposalRecord: (record: DisposalRecord) => void
  updateDisposalRecord: (id: string, updates: Partial<DisposalRecord>) => void
  resolveDisposalRecord: (id: string, resultNote?: string) => void
  dismissAlert: (batchId: string) => void
  getBatchById: (id: string) => Batch | undefined
  getCurveByBatchId: (id: string) => TemperatureCurve | undefined
  getCertificatesByBatchId: (id: string) => Certificate[]
  getDisposalRecordsByBatchId: (id: string) => DisposalRecord[]
}

export const useStore = create<AppState>((set, get) => {
  const initialBatches = stored?.batches ?? MOCK_BATCHES
  const initialCurves = stored?.curves ?? MOCK_CURVES
  const initialCertificates = stored?.certificates ?? MOCK_CERTIFICATES
  const initialDisposalRecords = stored?.disposalRecords ?? MOCK_DISPOSAL_RECORDS
  const initialAlertBatchIds = stored?.alertBatchIds
    ?? MOCK_BATCHES.filter((b) => b.isOverLimit).map((b) => b.id)

  return {
    batches: initialBatches,
    curves: initialCurves,
    certificates: initialCertificates,
    disposalRecords: initialDisposalRecords,
    selectedBatchId: null,
    searchQuery: '',
    showBatchForm: false,
    showCurvePanel: false,
    alertBatchIds: initialAlertBatchIds,
    currentOperator: '',

    setSearchQuery: (q) => set({ searchQuery: q }),
    setSelectedBatchId: (id) => set({ selectedBatchId: id, showCurvePanel: !!id }),
    setShowBatchForm: (show) => set({ showBatchForm: show }),
    setShowCurvePanel: (show) =>
      set({ showCurvePanel: show, selectedBatchId: show ? get().selectedBatchId : null }),
    setCurrentOperator: (name) => set({ currentOperator: name }),

    addBatch: (batch) => {
      const hours = 24
      const curve = generateTemperatureCurve(
        batch.id,
        hours,
        batch.tempRangeMin,
        batch.tempRangeMax,
        batch.isOverLimit
      )
      set((s) => {
        const nextState = {
          batches: [batch, ...s.batches],
          curves: [curve, ...s.curves],
        }
        saveToStorage({
          batches: nextState.batches,
          curves: nextState.curves,
          certificates: s.certificates,
          disposalRecords: s.disposalRecords,
          alertBatchIds: s.alertBatchIds,
        })
        return nextState
      })
    },

    addCurve: (curve) =>
      set((s) => {
        const nextCurves = [curve, ...s.curves]
        saveToStorage({
          batches: s.batches,
          curves: nextCurves,
          certificates: s.certificates,
          disposalRecords: s.disposalRecords,
          alertBatchIds: s.alertBatchIds,
        })
        return { curves: nextCurves }
      }),

    addCertificate: (cert) =>
      set((s) => {
        const nextCerts = [cert, ...s.certificates]
        saveToStorage({
          batches: s.batches,
          curves: s.curves,
          certificates: nextCerts,
          disposalRecords: s.disposalRecords,
          alertBatchIds: s.alertBatchIds,
        })
        return { certificates: nextCerts }
      }),

    addDisposalRecord: (record) =>
      set((s) => {
        const nextRecords = [record, ...s.disposalRecords]
        saveToStorage({
          batches: s.batches,
          curves: s.curves,
          certificates: s.certificates,
          disposalRecords: nextRecords,
          alertBatchIds: s.alertBatchIds,
        })
        return { disposalRecords: nextRecords }
      }),

    updateDisposalRecord: (id, updates) =>
      set((s) => {
        const nextRecords = s.disposalRecords.map((r) =>
          r.id === id ? { ...r, ...updates } : r
        )
        saveToStorage({
          batches: s.batches,
          curves: s.curves,
          certificates: s.certificates,
          disposalRecords: nextRecords,
          alertBatchIds: s.alertBatchIds,
        })
        return { disposalRecords: nextRecords }
      }),

    resolveDisposalRecord: (id, resultNote) =>
      set((s) => {
        const nextRecords = s.disposalRecords.map((r) =>
          r.id === id
            ? {
                ...r,
                status: 'resolved' as const,
                resolvedAt: new Date().toISOString(),
                resultNote,
              }
            : r
        )
        saveToStorage({
          batches: s.batches,
          curves: s.curves,
          certificates: s.certificates,
          disposalRecords: nextRecords,
          alertBatchIds: s.alertBatchIds,
        })
        return { disposalRecords: nextRecords }
      }),

    dismissAlert: (batchId) =>
      set((s) => {
        const nextAlerts = s.alertBatchIds.filter((id) => id !== batchId)
        saveToStorage({
          batches: s.batches,
          curves: s.curves,
          certificates: s.certificates,
          disposalRecords: s.disposalRecords,
          alertBatchIds: nextAlerts,
        })
        return { alertBatchIds: nextAlerts }
      }),

    getBatchById: (id) => get().batches.find((b) => b.id === id),
    getCurveByBatchId: (id) => get().curves.find((c) => c.batchId === id),
    getCertificatesByBatchId: (id) => get().certificates.filter((c) => c.batchId === id),
    getDisposalRecordsByBatchId: (id) => get().disposalRecords.filter((r) => r.batchId === id),
  }
})
