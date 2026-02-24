import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useShop } from '../context/ShopContext'

function Support() {
  const { feedback, orders, submitFeedback, fetchMyFeedback } = useShop()
  const [form, setForm] = useState({ orderId: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchMyFeedback()

    const interval = setInterval(() => {
      fetchMyFeedback()
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const onSubmit = async (event) => {
    event.preventDefault()
      setLoading(true)
      try {
      await submitFeedback(form)
      setForm({ orderId: '', subject: '', message: '' })
      toast.success('Feedback sent to admin')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to send feedback')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Support</h1>
      <p className="mt-2 text-gray-600">Send feedback for a valid order only. Enter your order ID before submitting.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 card p-5">
        <select
          className="input-field"
          value={form.orderId}
          onChange={(e) => setForm((prev) => ({ ...prev, orderId: e.target.value }))}
          required
        >
          <option value="">Select your order</option>
          {orders.map((order) => (
            <option key={order._id} value={order._id}>
              {order._id} - {order.orderStatus}
            </option>
          ))}
        </select>
        <input
          className="input-field"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
          required
        />
        <textarea
          className="input-field min-h-28"
          placeholder="Write your feedback"
          value={form.message}
          onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
          required
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Sending...' : 'Send Feedback'}
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Your Feedback History</h2>
        <div className="mt-3 space-y-3">
          {feedback.map((item) => (
            <article key={item._id} className="card p-4">
              <p className="text-xs text-gray-500">Order ID: {item.order?._id || '-'}</p>
              <p className="font-semibold">{item.subject}</p>
              <p className="mt-1 text-sm text-gray-700">{item.message}</p>
              <p className="mt-2 text-xs text-gray-500">Status: {item.status}</p>
              {item.adminReply && (
                <div className="mt-3 rounded-lg bg-green-50 p-3">
                  <p className="text-sm font-semibold text-green-700"> Reply</p>
                  <p className="text-sm text-green-800">{item.adminReply}</p>
                </div>
              )}
            </article>
          ))}
          {feedback.length === 0 && <p className="text-sm text-gray-500">No feedback submitted yet.</p>}
        </div>
      </div>
    </section>
  )
}

export default Support
