import { useEffect, useMemo, useState } from 'react'
import { Line, Pie } from 'react-chartjs-2'
import { ArcElement, Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { toast } from 'react-toastify'
import { api, authHeaders } from '../services/api'
import { useAuth } from '../context/AuthContext'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend)

function Revenue() {
  const { token } = useAuth()
  const [range, setRange] = useState('monthly')
  const [points, setPoints] = useState([])
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    const load = async () => {
      if (!token) return
      try {
        const [revenueRes, summaryRes] = await Promise.all([
          api.get(`/admin/dashboard/revenue?range=${range}`, authHeaders(token)),
          api.get('/admin/dashboard/summary', authHeaders(token))
        ])
        setPoints(revenueRes.data?.data || [])
        setSummary(summaryRes.data?.data || null)
      } catch (error) {
        setPoints([])
        setSummary(null)
        if (error?.response?.status !== 401) {
          toast.error(error?.response?.data?.message || 'Failed to load revenue data')
        }
      }
    }
    load()
  }, [range, token])

  const lineData = useMemo(
    () => ({
      labels: points.map((p) => p.label),
      datasets: [
        {
          label: 'Revenue',
          data: points.map((p) => p.value),
          borderColor: '#0f766e',
          backgroundColor: 'rgba(15,118,110,0.15)',
          tension: 0.35,
          fill: true
        }
      ]
    }),
    [points]
  )

  const paymentPieData = useMemo(
    () => ({
      labels: ['COD', 'UPI Family', 'Other Online'],
      datasets: [
        {
          data: [summary?.paymentBreakdown?.cod || 0, summary?.paymentBreakdown?.upi || 0, summary?.paymentBreakdown?.online || 0],
          backgroundColor: ['#f97316', '#22c55e', '#3b82f6'],
          borderWidth: 1
        }
      ]
    }),
    [summary]
  )

  const statusPieData = useMemo(
    () => ({
      labels: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
      datasets: [
        {
          data: [
            summary?.orderStatusBreakdown?.pending || 0,
            summary?.orderStatusBreakdown?.shipped || 0,
            summary?.orderStatusBreakdown?.delivered || 0,
            summary?.orderStatusBreakdown?.cancelled || 0
          ],
          backgroundColor: ['#f59e0b', '#38bdf8', '#10b981', '#ef4444'],
          borderWidth: 1
        }
      ]
    }),
    [summary]
  )

  const animatedPieOptions = {
    animation: { animateRotate: true, animateScale: true, duration: 1400 },
    plugins: { legend: { position: 'bottom' } }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Revenue Analytics</h2>
        <div className="flex gap-2">
          {['monthly', 'half-year', 'yearly'].map((key) => (
            <button
              key={key}
              className={`rounded border px-3 py-1 text-sm ${range === key ? 'bg-slate-900 text-white' : 'bg-white'}`}
              onClick={() => setRange(key)}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <Line data={lineData} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h3 className="mb-2 text-lg font-semibold">Payment Method Split</h3>
          <Pie data={paymentPieData} options={animatedPieOptions} />
        </div>
        <div className="rounded-xl border p-4">
          <h3 className="mb-2 text-lg font-semibold">Order Status Split</h3>
          <Pie data={statusPieData} options={animatedPieOptions} />
        </div>
      </div>
    </div>
  )
}

export default Revenue
