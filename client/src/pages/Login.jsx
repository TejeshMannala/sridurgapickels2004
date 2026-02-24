import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Login successful')
      navigate('/shop')
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">User Login</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="input-field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input-field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        New user?{' '}
        <Link className="text-orange-600" to="/register">
          Create account
        </Link>
      </p>
    </section>
  )
}

export default Login
