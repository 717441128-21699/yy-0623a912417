import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { TemperatureReading } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SAMPLE_INTERVAL_MINUTES = 10

export function calculateOverLimitMinutes(
  readings: TemperatureReading[],
  tempMin: number,
  tempMax: number
): number {
  if (readings.length < 2) return 0

  let overLimitCount = 0
  for (const r of readings) {
    const vehicleOver = r.vehicleTemp > tempMax || r.vehicleTemp < tempMin
    const cabinOver = r.cabinTemp > tempMax || r.cabinTemp < tempMin
    if (vehicleOver || cabinOver) {
      overLimitCount++
    }
  }

  return overLimitCount * SAMPLE_INTERVAL_MINUTES
}

export function generateSensorIds(batchId: string): string[] {
  const num = batchId.replace(/\D/g, '').slice(-4).padStart(4, '0')
  return [`SN-VH${num}`, `SN-CB${num}`]
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
