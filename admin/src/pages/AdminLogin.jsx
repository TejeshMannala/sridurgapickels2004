import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

function AdminLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Admin login successful')
      navigate('/admin/dashboard')
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto mt-20 max-w-md rounded-xl border bg-white p-6">
      <h2 className="text-2xl font-bold">Admin Login</h2>
      <form className="mt-5 space-y-3" onSubmit={onSubmit}>
        <input className="input-field" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input-field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

export default AdminLogin
