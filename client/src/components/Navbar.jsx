import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Heart, Menu, Moon, ShoppingCart, Sun, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useShop } from '../context/ShopContext'

function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth()
  const { cart, wishlist } = useShop()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => localStorage.getItem('pickles_theme') === 'dark')

  const cartCount = (cart?.items || []).reduce((sum, item) => sum + item.quantity, 0)
  const wishlistCount = (wishlist?.items || []).length

  const links = useMemo(() => {
    const base = [
      { to: '/', label: 'Home' },
      { to: '/shop', label: 'Shop' },
      { to: '/about', label: 'About' },
      { to: '/support', label: 'Support' }
    ]
    if (isAuthenticated) base.push({ to: '/orders', label: 'Orders' })
    if (isAdmin) base.push({ to: '/admin/feedback', label: 'Admin Feedback' })
    return base
  }, [isAuthenticated, isAdmin])

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-mode')
      localStorage.setItem('pickles_theme', 'dark')
    } else {
      document.body.classList.remove('dark-mode')
      localStorage.setItem('pickles_theme', 'light')
    }
  }, [isDark])

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-orange-600">
          SKD Pickles
        </Link>

        <div className="flex-1" />

        <div className="hidden items-center gap-5 lg:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className="text-sm text-gray-700 hover:text-orange-600">
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button type="button" className="rounded-lg border border-gray-200 p-2" onClick={() => setIsDark((v) => !v)}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <NavLink to="/wishlist" className="relative rounded-lg border border-gray-200 p-2">
            <Heart size={16} />
            <span className="absolute -right-1 -top-1 rounded-full bg-orange-600 px-1 text-[10px] text-white">{wishlistCount}</span>
          </NavLink>
          <NavLink to="/cart" className="relative rounded-lg border border-gray-200 p-2">
            <ShoppingCart size={16} />
            <span className="absolute -right-1 -top-1 rounded-full bg-orange-600 px-1 text-[10px] text-white">{cartCount}</span>
          </NavLink>
          {isAuthenticated ? (
            <button type="button" onClick={logout} className="btn-secondary">
              Logout
            </button>
          ) : (
            <Link to="/login" className="btn-primary">
              Login
            </Link>
          )}
        </div>

        <button type="button" className="ml-auto rounded border p-2 md:hidden" onClick={() => setMobileOpen((prev) => !prev)}>
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="space-y-3 border-t border-gray-200 bg-white px-4 py-3 md:hidden">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className="block text-gray-700" onClick={() => setMobileOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/wishlist" className="block text-gray-700" onClick={() => setMobileOpen(false)}>
            Wishlist ({wishlistCount})
          </NavLink>
          <button type="button" className="btn-secondary w-full" onClick={() => setIsDark((v) => !v)}>
            {isDark ? 'Day Mode' : 'Night Mode'}
          </button>
          <NavLink to="/cart" className="block text-gray-700" onClick={() => setMobileOpen(false)}>
            Cart ({cartCount})
          </NavLink>
          {isAuthenticated ? (
            <button
              type="button"
              className="btn-secondary w-full"
              onClick={() => {
                logout()
                setMobileOpen(false)
              }}
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="btn-primary block text-center" onClick={() => setMobileOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  )
}

export default Navbar
