import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { api, authHeaders } from '../services/api'
import { useAuth } from '../context/AuthContext'

function ManageOrders() {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [statusDraft, setStatusDraft] = useState({})

  const load = async () => {
    if (!token) return
    try {
      const response = await api.get('/admin/orders', authHeaders(token))
      const list = response.data?.data || []
      setOrders(list)
      const draft = {}
      list.forEach((order) => {
        draft[order._id] = order.orderStatus
      })
      setStatusDraft(draft)
    } catch (error) {
      setOrders([])
      setStatusDraft({})
      if (error?.response?.status !== 401) {
        toast.error(error?.response?.data?.message || 'Failed to load orders')
      }
    }
  }

  useEffect(() => {
    load()
  }, [token])

  const saveStatus = async (order) => {
    const nextStatus = statusDraft[order._id]
    await api.put(
      `/admin/orders/${order._id}/status`,
      { status: nextStatus, note: `Status changed to ${nextStatus}` },
      authHeaders(token)
    )
    toast.success(`Order #${order._id.slice(-6)} saved as ${nextStatus}`)
    load()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Orders</h2>
      <p className="mt-1 text-sm text-gray-500">Select status (Pending / Shipped / Delivered / Cancelled) and click Save.</p>
      <div className="mt-4 space-y-3">
        {orders.map((order) => (
          <article key={order._id} className="rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Order #{order._id.slice(-6)}</p>
                <p className="text-sm text-gray-600">
                  {order.user?.name} | {order.paymentMethod.toUpperCase()} | Rs. {order.totalPrice}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="input-field w-44"
                  value={statusDraft[order._id] || order.orderStatus}
                  onChange={(e) => setStatusDraft((prev) => ({ ...prev, [order._id]: e.target.value }))}
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button className="btn-primary" onClick={() => saveStatus(order)}>
                  Save
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default ManageOrders
