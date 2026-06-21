import type { Batch, TemperatureCurve, TemperatureReading, Certificate, DisposalRecord } from '@/types'

export const CARGO_CATEGORIES = [
  '冷冻肉类',
  '冷藏蔬果',
  '冰鲜水产',
  '乳制品',
  '疫苗药品',
  '冷冻面点',
  '冷藏饮品',
  '速冻食品',
]

export const ORIGINS = [
  '曼谷冷仓',
  '胡志明港冷库',
  '大阪保税仓',
  '悉尼冷链中心',
  '奥克兰码头仓',
  '釜山冷冻仓',
]

export const DESTINATION_PORTS = [
  '深圳盐田口岸',
  '上海洋山港',
  '广州南沙港',
  '天津新港',
  '宁波北仑港',
  '青岛前湾港',
]

export function generateTemperatureCurve(
  batchId: string,
  hours: number,
  minTemp: number,
  maxTemp: number,
  hasOverLimit: boolean = false
): TemperatureCurve {
  const readings: TemperatureReading[] = []
  const now = new Date()
  const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000)
  const midTemp = (minTemp + maxTemp) / 2
  const range = maxTemp - minTemp
  const sampleIntervalMinutes = 10
  const totalSamples = Math.floor((hours * 60) / sampleIntervalMinutes)

  for (let i = 0; i < totalSamples; i++) {
    const t = new Date(startTime.getTime() + i * sampleIntervalMinutes * 60 * 1000)
    const progress = i / totalSamples
    let vehicleBase = midTemp + (Math.sin(progress * Math.PI * 4) * range * 0.3)
    let cabinBase = midTemp + (Math.sin(progress * Math.PI * 3 + 0.5) * range * 0.25)

    if (hasOverLimit && progress > 0.4 && progress < 0.7) {
      vehicleBase += range * 0.4
      cabinBase += range * 0.35
    }

    const vehicleTemp = Math.round((vehicleBase + (Math.random() - 0.5) * 1.5) * 10) / 10
    const cabinTemp = Math.round((cabinBase + (Math.random() - 0.5) * 1.0) * 10) / 10
    const doorOpen = Math.random() < 0.03

    readings.push({
      timestamp: t.toISOString(),
      vehicleTemp,
      cabinTemp,
      doorOpen,
    })
  }

  return { batchId, readings }
}

export const MOCK_BATCHES: Batch[] = [
  {
    id: 'BTH-2026-001',
    billOfLading: 'BL-TK2026061501',
    licensePlate: '粤B·L89231',
    cargoCategory: '冷冻肉类',
    origin: '曼谷冷仓',
    destinationPort: '深圳盐田口岸',
    tempRangeMin: -18,
    tempRangeMax: -15,
    estimatedArrival: '2026-06-22T18:00:00',
    status: 'in_transit',
    isOverLimit: true,
    currentTemp: -12.3,
    createdAt: '2026-06-19T08:00:00',
  },
  {
    id: 'BTH-2026-002',
    billOfLading: 'BL-HC2026061602',
    licensePlate: '粤B·K77456',
    cargoCategory: '冷藏蔬果',
    origin: '胡志明港冷库',
    destinationPort: '广州南沙港',
    tempRangeMin: 2,
    tempRangeMax: 8,
    estimatedArrival: '2026-06-22T20:30:00',
    status: 'in_transit',
    isOverLimit: false,
    currentTemp: 4.7,
    createdAt: '2026-06-17T06:00:00',
  },
  {
    id: 'BTH-2026-003',
    billOfLading: 'BL-OS2026061703',
    licensePlate: '沪A·M33128',
    cargoCategory: '冰鲜水产',
    origin: '大阪保税仓',
    destinationPort: '上海洋山港',
    tempRangeMin: -2,
    tempRangeMax: 2,
    estimatedArrival: '2026-06-22T14:00:00',
    status: 'awaiting_declaration',
    isOverLimit: false,
    currentTemp: -0.5,
    createdAt: '2026-06-18T12:00:00',
  },
  {
    id: 'BTH-2026-004',
    billOfLading: 'BL-SY2026061804',
    licensePlate: '津C·N56890',
    cargoCategory: '乳制品',
    origin: '悉尼冷链中心',
    destinationPort: '天津新港',
    tempRangeMin: 0,
    tempRangeMax: 4,
    estimatedArrival: '2026-06-23T06:00:00',
    status: 'in_transit',
    isOverLimit: true,
    currentTemp: 6.2,
    createdAt: '2026-06-16T22:00:00',
  },
  {
    id: 'BTH-2026-005',
    billOfLading: 'BL-AK2026061905',
    licensePlate: '鲁D·P44521',
    cargoCategory: '疫苗药品',
    origin: '奥克兰码头仓',
    destinationPort: '青岛前湾港',
    tempRangeMin: 2,
    tempRangeMax: 8,
    estimatedArrival: '2026-06-22T22:00:00',
    status: 'in_transit',
    isOverLimit: false,
    currentTemp: 5.1,
    createdAt: '2026-06-18T04:00:00',
  },
  {
    id: 'BTH-2026-006',
    billOfLading: 'BL-BS2026062006',
    licensePlate: '浙E·Q21987',
    cargoCategory: '冷冻面点',
    origin: '釜山冷冻仓',
    destinationPort: '宁波北仑港',
    tempRangeMin: -20,
    tempRangeMax: -15,
    estimatedArrival: '2026-06-23T10:00:00',
    status: 'customs_hold',
    isOverLimit: false,
    currentTemp: -17.4,
    createdAt: '2026-06-20T10:00:00',
  },
  {
    id: 'BTH-2026-007',
    billOfLading: 'BL-TK2026061507',
    licensePlate: '粤F·R63782',
    cargoCategory: '冷藏饮品',
    origin: '曼谷冷仓',
    destinationPort: '深圳盐田口岸',
    tempRangeMin: 0,
    tempRangeMax: 5,
    estimatedArrival: '2026-06-22T16:00:00',
    status: 'awaiting_declaration',
    isOverLimit: false,
    currentTemp: 2.8,
    createdAt: '2026-06-19T14:00:00',
  },
  {
    id: 'BTH-2026-008',
    billOfLading: 'BL-HC2026061608',
    licensePlate: '粤G·S88134',
    cargoCategory: '速冻食品',
    origin: '胡志明港冷库',
    destinationPort: '广州南沙港',
    tempRangeMin: -22,
    tempRangeMax: -18,
    estimatedArrival: '2026-06-24T08:00:00',
    status: 'in_transit',
    isOverLimit: false,
    currentTemp: -19.6,
    createdAt: '2026-06-20T08:00:00',
  },
  {
    id: 'BTH-2026-009',
    billOfLading: 'BL-OS2026062109',
    licensePlate: '沪A·T45923',
    cargoCategory: '冰鲜水产',
    origin: '大阪保税仓',
    destinationPort: '上海洋山港',
    tempRangeMin: -2,
    tempRangeMax: 2,
    estimatedArrival: '2026-06-25T12:00:00',
    status: 'cleared',
    isOverLimit: false,
    currentTemp: 0.3,
    createdAt: '2026-06-21T06:00:00',
  },
  {
    id: 'BTH-2026-010',
    billOfLading: 'BL-SY2026061410',
    licensePlate: '津C·U77612',
    cargoCategory: '冷冻肉类',
    origin: '悉尼冷链中心',
    destinationPort: '天津新港',
    tempRangeMin: -18,
    tempRangeMax: -15,
    estimatedArrival: '2026-06-21T20:00:00',
    status: 'cleared',
    isOverLimit: false,
    currentTemp: -16.1,
    createdAt: '2026-06-14T18:00:00',
  },
]

export const MOCK_CURVES: TemperatureCurve[] = MOCK_BATCHES.map((b) =>
  generateTemperatureCurve(b.id, 72, b.tempRangeMin, b.tempRangeMax, b.isOverLimit)
)

export const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: 'CERT-2026-001',
    batchId: 'BTH-2026-009',
    timeRangeStart: '2026-06-21T06:00:00',
    timeRangeEnd: '2026-06-22T06:00:00',
    maxTemp: 2.1,
    minTemp: -1.8,
    overLimitMinutes: 0,
    sensorIds: ['SN-VH0031', 'SN-CB0031'],
    missingScreenshots: false,
    missingSignatures: false,
    status: 'complete',
    generatedAt: '2026-06-22T08:30:00',
  },
  {
    id: 'CERT-2026-002',
    batchId: 'BTH-2026-010',
    timeRangeStart: '2026-06-14T18:00:00',
    timeRangeEnd: '2026-06-21T18:00:00',
    maxTemp: -14.8,
    minTemp: -17.9,
    overLimitMinutes: 12,
    sensorIds: ['SN-VH0042', 'SN-CB0042'],
    missingScreenshots: true,
    missingSignatures: false,
    status: 'pending_materials',
    generatedAt: '2026-06-21T22:15:00',
  },
]

export const MOCK_DISPOSAL_RECORDS: DisposalRecord[] = [
  {
    id: 'DSP-2026-001',
    batchId: 'BTH-2026-001',
    alertTime: '2026-06-22T03:45:00',
    overLimitTemp: -12.3,
    overLimitDuration: 35,
    reason: '长途运输中途停靠，制冷机组短暂停机导致温升',
    actionType: 'connect_power',
    operatorName: '张伟',
    notifyDriverAt: '2026-06-22T03:50:00',
    resolvedAt: '2026-06-22T04:30:00',
    status: 'resolved',
  },
  {
    id: 'DSP-2026-002',
    batchId: 'BTH-2026-004',
    alertTime: '2026-06-22T07:20:00',
    overLimitTemp: 6.2,
    overLimitDuration: 48,
    reason: '港口等待通关时间过长，冰袋消耗殆尽',
    actionType: 'add_ice',
    operatorName: '李芳',
    notifyDriverAt: '2026-06-22T07:25:00',
    resolvedAt: null,
    status: 'notified',
  },
  {
    id: 'DSP-2026-003',
    batchId: 'BTH-2026-004',
    alertTime: '2026-06-21T22:10:00',
    overLimitTemp: 5.8,
    overLimitDuration: 22,
    reason: '通关延迟，冷链集装箱制冷不足',
    actionType: 'other',
    operatorName: '王磊',
    notifyDriverAt: null,
    resolvedAt: '2026-06-21T23:15:00',
    status: 'resolved',
  },
  {
    id: 'DSP-2026-004',
    batchId: 'BTH-2026-001',
    alertTime: '2026-06-22T09:15:00',
    overLimitTemp: -13.1,
    overLimitDuration: 18,
    reason: '',
    actionType: 'add_ice',
    operatorName: '',
    notifyDriverAt: null,
    resolvedAt: null,
    status: 'pending',
  },
]
