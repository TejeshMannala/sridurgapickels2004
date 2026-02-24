import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BarChart3, Boxes, ClipboardList, LayoutDashboard, LogOut, MessageSquare, Users } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Boxes },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/revenue', label: 'Revenue', icon: BarChart3 },
  { to: '/admin/support', label: 'Support', icon: MessageSquare }
]

function AdminLayout() {
  const navigate = useNavigate()
  const { auth, logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <button className="rounded border border-slate-300 px-3 py-1 text-sm lg:hidden" onClick={() => setOpen((v) => !v)}>
            Menu
          </button>
          <h1 className="text-lg font-bold text-slate-900">SKD Admin Panel</h1>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-600 md:block">{auth?.name}</span>
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={() => {
                logout()
                navigate('/admin/login')
              }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[260px_1fr]">
        <aside className={`${open ? 'block' : 'hidden'} rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-900 to-slate-800 p-3 text-slate-100 lg:block`}>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                      isActive ? 'bg-white text-slate-900' : 'hover:bg-white/10'
                    }`
                  }
                >
                  <Icon size={15} />
                  {link.label}
                </NavLink>
              )
            })}
          </nav>
        </aside>
        <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
          <Outlet />
        </section>
      </div>
    </div>
  )
}

export default AdminLayout
