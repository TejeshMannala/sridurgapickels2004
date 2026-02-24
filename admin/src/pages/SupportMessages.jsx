import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { api, authHeaders } from '../services/api'
import { useAuth } from '../context/AuthContext'

function SupportMessages() {
  const { token } = useAuth()
  const [messages, setMessages] = useState([])
  const [replyText, setReplyText] = useState({})
  const [sendingReply, setSendingReply] = useState({})

  const load = async () => {
    const response = await api.get('/admin/support', authHeaders(token))
    setMessages(response.data?.data || [])
  }

  useEffect(() => {
    load()
  }, [token])

  const reply = async (id) => {
    const message = messages.find((item) => item._id === id)
    const alreadyReplied = message?.status === 'replied' || Boolean(String(message?.adminReply || '').trim())
    if (alreadyReplied) {
      toast.info('Reply already sent for this message')
      return
    }

    const text = (replyText[id] ?? message?.adminReply ?? '').trim()
    if (!text) {
      toast.error('Please enter a reply message')
      return
    }

    try {
      setSendingReply((prev) => ({ ...prev, [id]: true }))
      await api.put(`/admin/support/${id}/reply`, { adminReply: text, status: 'replied' }, authHeaders(token))
      toast.success('Reply sent successfully')
      await load()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send reply')
    } finally {
      setSendingReply((prev) => ({ ...prev, [id]: false }))
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Support Messages</h2>
      <div className="mt-4 space-y-3">
        {messages.map((message) => (
          <article key={message._id} className="rounded-lg border p-4">
            {(() => {
              const alreadyReplied = message.status === 'replied' || Boolean(String(message.adminReply || '').trim())
              const isSending = Boolean(sendingReply[message._id])
              return (
                <>
            <p className="font-semibold">{message.subject}</p>
            <p className="text-sm text-gray-500">
              {message.user?.name} ({message.user?.email})
            </p>
            <p className="text-xs text-gray-500">Order ID: {message.order?._id || '-'}</p>
            <p className="mt-2 text-sm">{message.message}</p>
            <textarea
              className="input-field mt-3 min-h-20"
              value={replyText[message._id] ?? message.adminReply ?? ''}
              onChange={(e) => setReplyText((prev) => ({ ...prev, [message._id]: e.target.value }))}
              disabled={alreadyReplied || isSending}
            />
            <button
              className="btn-primary mt-2 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => reply(message._id)}
              disabled={alreadyReplied || isSending}
            >
              {alreadyReplied ? 'Reply Sent' : isSending ? 'Sending...' : 'Send Reply'}
            </button>
                </>
              )
            })()}
          </article>
        ))}
        {messages.length === 0 && <p className="text-sm text-gray-500">No support messages available.</p>}
      </div>
    </div>
  )
}

export default SupportMessages
