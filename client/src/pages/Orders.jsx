import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useShop } from '../context/ShopContext'

function Orders() {
  const { orders, fetchOrders } = useShop()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadOrders = async () => {
      try {
        await fetchOrders()
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadOrders()
    const interval = setInterval(loadOrders, 15000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">My Orders</h1>
      <div className="mt-6 space-y-4">
        {loading && <p className="text-gray-600">Loading orders...</p>}
        {orders.length === 0 && <p className="text-gray-600">No orders found.</p>}
        {orders.map((order) => (
          <article key={order._id} className="card p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">Order #{order._id.slice(-6)}</p>
              <p className="text-sm text-gray-600">
                Status: {order.orderStatus} | Total: Rs. {order.totalPrice}
              </p>
            </div>
            <Link to={`/orders/${order._id}/tracking`} className="btn-secondary">
              Track
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Orders
