import { useEffect, useState } from 'react'
import { Activity, Boxes, IndianRupee, MessageSquare, ShoppingBag, Users } from 'lucide-react'
import { toast } from 'react-toastify'
import { api, authHeaders } from '../services/api'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const { token } = useAuth()
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    const load = async () => {
      if (!token) return
      try {
        const response = await api.get('/admin/dashboard/summary', authHeaders(token))
        setSummary(response.data?.data || null)
      } catch (error) {
        setSummary(null)
        if (error?.response?.status !== 401) {
          toast.error(error?.response?.data?.message || 'Failed to load dashboard data')
        }
      }
    }
    load()
  }, [token])

  if (!summary) return <p>Loading dashboard...</p>

  const cards = [
    { label: 'Revenue', value: `Rs. ${summary.revenue}`, icon: IndianRupee },
    { label: 'Orders', value: summary.totalOrders, icon: ShoppingBag },
    { label: 'Users', value: summary.totalUsers, icon: Users },
    { label: 'Active Users (24h)', value: summary.activeUsers, icon: Activity },
    { label: 'Products', value: summary.totalProducts, icon: Boxes },
    { label: 'Support Messages', value: summary.supportCount, icon: MessageSquare }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Admin Dashboard</h2>
        <p className="text-sm text-slate-500">Overview of orders, users, revenue and support status.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{card.label}</p>
                <Icon size={18} className="text-blue-600" />
              </div>
              <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Dashboard
