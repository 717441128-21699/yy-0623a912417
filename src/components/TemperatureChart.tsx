import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { useStore } from '@/store'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function TemperatureChart({ batchId }: { batchId: string }) {
  const curve = useStore((s) => s.getCurveByBatchId(batchId))
  const batch = useStore((s) => s.getBatchById(batchId))

  const chartData = useMemo(() => {
    if (!curve || !batch) return null

    const step = Math.max(1, Math.floor(curve.readings.length / 60))
    const sampled = curve.readings.filter((_, i) => i % step === 0)

    const labels = sampled.map((r) => {
      const d = new Date(r.timestamp)
      return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    })

    const doorOpenPoints = sampled.map((r, i) => (r.doorOpen ? batch.tempRangeMax + 2 : null))

    return {
      labels,
      datasets: [
        {
          label: '车载温度计',
          data: sampled.map((r) => r.vehicleTemp),
          borderColor: '#0EA5E9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.3,
          fill: false,
          order: 1,
        },
        {
          label: '箱内记录仪',
          data: sampled.map((r) => r.cabinTemp),
          borderColor: '#34D399',
          backgroundColor: 'rgba(52, 211, 153, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.3,
          fill: false,
          order: 2,
        },
        {
          label: '允许温区',
          data: sampled.map(() => batch.tempRangeMax),
          borderColor: 'rgba(14, 165, 233, 0.4)',
          borderWidth: 1,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: {
            target: '+1',
            above: 'rgba(14, 165, 233, 0.06)',
          },
          order: 3,
        },
        {
          label: '温区下限',
          data: sampled.map(() => batch.tempRangeMin),
          borderColor: 'rgba(14, 165, 233, 0.4)',
          borderWidth: 1,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false,
          order: 4,
        },
        {
          label: '开门记录',
          data: doorOpenPoints,
          borderColor: '#FB923C',
          backgroundColor: '#FB923C',
          pointRadius: sampled.map((r) => (r.doorOpen ? 6 : 0)),
          pointHoverRadius: 8,
          pointStyle: 'triangle',
          showLine: false,
          fill: false,
          order: 0,
        },
      ],
    }
  }, [curve, batch])

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500 text-sm">
        暂无温度数据
      </div>
    )
  }

  return (
    <div className="h-[300px]">
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: '#94a3b8',
                font: { family: '"Noto Sans SC"', size: 11 },
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 12,
                filter: (item) => item.text !== '温区下限',
              },
            },
            tooltip: {
              backgroundColor: '#1e293b',
              titleColor: '#e2e8f0',
              bodyColor: '#cbd5e1',
              borderColor: '#334155',
              borderWidth: 1,
              titleFont: { family: '"Noto Sans SC"', size: 12 },
              bodyFont: { family: '"JetBrains Mono"', size: 11 },
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                label: (ctx) => {
                  if (ctx.dataset.label === '温区下限') return ''
                  if (ctx.dataset.label === '允许温区') return `允许上限: ${ctx.parsed.y}°C`
                  if (ctx.dataset.label === '开门记录') return ctx.raw !== null ? '开门事件' : ''
                  return `${ctx.dataset.label}: ${ctx.parsed.y}°C`
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                color: '#64748b',
                font: { family: '"JetBrains Mono"', size: 10 },
                maxRotation: 45,
                maxTicksLimit: 10,
              },
              grid: { color: '#1e293b' },
              border: { color: '#334155' },
            },
            y: {
              ticks: {
                color: '#64748b',
                font: { family: '"JetBrains Mono"', size: 10 },
                callback: (val) => `${val}°C`,
              },
              grid: { color: '#1e293b' },
              border: { color: '#334155' },
            },
          },
        }}
      />
    </div>
  )
}
