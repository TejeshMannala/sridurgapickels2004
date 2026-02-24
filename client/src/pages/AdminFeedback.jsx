import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useShop } from '../context/ShopContext'

function AdminFeedback() {
  const { adminFeedback, fetchAdminFeedback, replyFeedback } = useShop()
  const [replyText, setReplyText] = useState({})

  useEffect(() => {
    fetchAdminFeedback()
  }, [])

  const submitReply = async (id) => {
    try {
      await replyFeedback(id, { adminReply: replyText[id] || '', status: 'replied' })
      toast.success('Reply saved')
      setReplyText((prev) => ({ ...prev, [id]: '' }))
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to reply')
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Admin Feedback</h1>
      <div className="mt-6 space-y-4">
        {adminFeedback.map((item) => (
          <article key={item._id} className="card p-4">
            <p className="font-semibold">{item.subject}</p>
            <p className="text-sm text-gray-500">
              By {item.user?.name} ({item.user?.email}) | Status: {item.status}
            </p>
            <p className="mt-2 text-gray-700">{item.message}</p>
            <textarea
              className="input-field mt-3 min-h-24"
              placeholder="Reply to customer"
              value={replyText[item._id] ?? item.adminReply ?? ''}
              onChange={(e) => setReplyText((prev) => ({ ...prev, [item._id]: e.target.value }))}
            />
            <button type="button" className="btn-primary mt-2" onClick={() => submitReply(item._id)}>
              Send Reply
            </button>
          </article>
        ))}
        {adminFeedback.length === 0 && <p className="text-gray-500">No feedback found.</p>}
      </div>
    </section>
  )
}

export default AdminFeedback
