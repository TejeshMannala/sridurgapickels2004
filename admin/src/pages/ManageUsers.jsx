import { useEffect, useState } from 'react'
import { api, authHeaders } from '../services/api'
import { useAuth } from '../context/AuthContext'

function ManageUsers() {
  const { token } = useAuth()
  const [users, setUsers] = useState([])

  useEffect(() => {
    const load = async () => {
      const response = await api.get('/admin/users', authHeaders(token))
      setUsers(response.data?.data || [])
    }
    load()
  }, [token])

  return (
    <div>
      <h2 className="text-2xl font-bold">Users</h2>
      <p className="mt-1 text-sm text-gray-500">Total members/signup: {users.length}</p>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-3 py-2 text-left">Name</th>
              <th className="border px-3 py-2 text-left">Email</th>
              <th className="border px-3 py-2 text-left">Role</th>
              <th className="border px-3 py-2 text-left">Login Count</th>
              <th className="border px-3 py-2 text-left">Last Login</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="border px-3 py-2">{user.name}</td>
                <td className="border px-3 py-2">{user.email}</td>
                <td className="border px-3 py-2">{user.role}</td>
                <td className="border px-3 py-2">{user.loginCount || 0}</td>
                <td className="border px-3 py-2">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ManageUsers
