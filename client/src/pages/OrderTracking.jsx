import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useShop } from '../context/ShopContext'

function OrderTracking() {
  const { id } = useParams()
  const { getOrderById } = useShop()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true)
      try {
        const response = await getOrderById(id)
        setOrder(response)
      } finally {
        setLoading(false)
      }
    }
    loadOrder()
  }, [id])

  if (loading) {
    return <section className="mx-auto max-w-4xl px-4 py-10">Loading tracking details...</section>
  }

  if (!order) {
    return <section className="mx-auto max-w-4xl px-4 py-10">Order not found.</section>
  }

  const statusOrder = ['Pending', 'Shipped', 'Delivered']
  const activeIndex =
    order.orderStatus === 'Cancelled' ? 0 : Math.max(0, statusOrder.findIndex((status) => status === order.orderStatus))

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Order Tracking</h1>
      <p className="mt-2 text-gray-600">
        Order #{order._id.slice(-6)} | Payment: {order.paymentMethod.toUpperCase()}
      </p>
      <div className="mt-6 card p-5">
        <p className="font-semibold">Current Status: {order.orderStatus}</p>
        <div className="mt-4">
          <div className="relative h-2 rounded bg-gray-200">
            <div
              className="tracking-progress absolute left-0 top-0 h-2 rounded bg-orange-500"
              style={{ width: `${order.orderStatus === 'Cancelled' ? 100 : ((activeIndex + 1) / statusOrder.length) * 100}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {statusOrder.map((status, index) => (
              <div
                key={status}
                className={`rounded-lg border p-2 text-center text-sm ${
                  index <= activeIndex && order.orderStatus !== 'Cancelled'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200'
                }`}
              >
                {status}
              </div>
            ))}
          </div>
          {order.orderStatus === 'Cancelled' && (
            <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-2 text-sm text-red-700">Order Cancelled</div>
          )}
        </div>
        <div className="mt-4 space-y-3">
          {(order.trackingHistory || []).map((entry, index) => (
            <div key={`${entry.status}-${index}`} className="border-l-2 border-orange-400 pl-3">
              <p className="font-medium">{entry.status}</p>
              <p className="text-sm text-gray-600">{entry.note}</p>
              <p className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default OrderTracking
