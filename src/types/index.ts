export interface Batch {
  id: string
  billOfLading: string
  licensePlate: string
  cargoCategory: string
  origin: string
  destinationPort: string
  tempRangeMin: number
  tempRangeMax: number
  estimatedArrival: string
  status: 'in_transit' | 'awaiting_declaration' | 'customs_hold' | 'cleared'
  isOverLimit: boolean
  currentTemp: number
  createdAt: string
}

export interface TemperatureReading {
  timestamp: string
  vehicleTemp: number
  cabinTemp: number
  doorOpen: boolean
}

export interface TemperatureCurve {
  batchId: string
  readings: TemperatureReading[]
}

export interface Certificate {
  id: string
  batchId: string
  timeRangeStart: string
  timeRangeEnd: string
  maxTemp: number
  minTemp: number
  overLimitMinutes: number
  sensorIds: string[]
  missingScreenshots: boolean
  missingSignatures: boolean
  status: 'complete' | 'pending_materials'
  generatedAt: string
}

export interface DisposalRecord {
  id: string
  batchId: string
  alertTime: string
  overLimitTemp: number
  overLimitDuration: number
  reason: string
  actionType: 'add_ice' | 'connect_power' | 'other'
  operatorName: string
  notifyDriverAt: string | null
  resolvedAt: string | null
  status: 'pending' | 'notified' | 'resolved'
}

export type BatchStatus = Batch['status']
export type DisposalActionType = DisposalRecord['actionType']
export type DisposalStatus = DisposalRecord['status']
export type CertificateStatus = Certificate['status']
