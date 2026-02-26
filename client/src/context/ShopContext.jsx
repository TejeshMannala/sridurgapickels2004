import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api, authHeaders } from '../services/api'
import { useAuth } from './AuthContext'

const SHOP_CONTEXT_KEY = '__pickles_shop_context__'
const ShopContext = globalThis[SHOP_CONTEXT_KEY] || createContext(null)

if (!globalThis[SHOP_CONTEXT_KEY]) {
  globalThis[SHOP_CONTEXT_KEY] = ShopContext
}

export function ShopProvider({ children }) {
  const { auth, isAuthenticated } = useAuth()
  const token = auth?.token
  const inFlightRef = useRef({})
  const bootstrapTokenRef = useRef(null)

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState(null)
  const [wishlist, setWishlist] = useState(null)
  const [orders, setOrders] = useState([])
  const [feedback, setFeedback] = useState([])
  const [adminFeedback, setAdminFeedback] = useState([])
  const [loading, setLoading] = useState(false)
  const [serviceUnavailable, setServiceUnavailable] = useState(false)
  const [serviceMessage, setServiceMessage] = useState('')

  const markServiceUnavailable = (error) => {
    const status = error?.response?.status
    if (status === 503) {
      setServiceUnavailable(true)
      setServiceMessage(error?.response?.data?.message || 'Service is temporarily unavailable. Please try again shortly.')
      return true
    }
    return false
  }

  const runDeduped = (key, requestFn) => {
    if (inFlightRef.current[key]) return inFlightRef.current[key]

    const pending = (async () => {
      try {
        return await requestFn()
      } finally {
        delete inFlightRef.current[key]
      }
    })()

    inFlightRef.current[key] = pending
    return pending
  }

  const fetchCatalog = async () => {
    return runDeduped('catalog', async () => {
      setLoading(true)
      try {
        const [categoryRes, productRes] = await Promise.all([api.get('/categories'), api.get('/products')])
        setCategories(categoryRes.data?.data || [])
        setProducts(productRes.data?.data || [])
        setServiceUnavailable(false)
        setServiceMessage('')
      } catch (error) {
        setCategories([])
        setProducts([])
        markServiceUnavailable(error)
        console.error('Failed to fetch catalog', error)
      } finally {
        setLoading(false)
      }
    })
  }

  const fetchCart = async () => {
    if (!token || serviceUnavailable) return
    return runDeduped('cart', async () => {
      try {
        const response = await api.get('/cart', authHeaders(token))
        setCart(response.data?.data || null)
      } catch (error) {
        setCart(null)
        markServiceUnavailable(error)
        console.error('Failed to fetch cart', error)
      }
    })
  }

  const fetchWishlist = async () => {
    if (!token || serviceUnavailable) return
    return runDeduped('wishlist', async () => {
      try {
        const response = await api.get('/wishlist', authHeaders(token))
        setWishlist(response.data?.data || null)
      } catch (error) {
        setWishlist(null)
        markServiceUnavailable(error)
        console.error('Failed to fetch wishlist', error)
      }
    })
  }

  const fetchOrders = async () => {
    if (!token || serviceUnavailable) return
    return runDeduped('orders', async () => {
      try {
        const response = await api.get('/orders/mine', authHeaders(token))
        setOrders(response.data?.data || [])
        return response.data?.data || []
      } catch (error) {
        setOrders([])
        markServiceUnavailable(error)
        console.error('Failed to fetch orders', error)
        return []
      }
    })
  }

  const addToCart = async ({ productId, packSize, quantity = 1 }) => {
    if (!token) throw new Error('Login required')
    const response = await api.post('/cart', { productId, packSize, quantity }, authHeaders(token))
    setCart(response.data?.data || null)
    return response.data?.data
  }

  const updateCartItem = async (itemId, quantity) => {
    if (!token) throw new Error('Login required')
    const response = await api.put(`/cart/${itemId}`, { quantity }, authHeaders(token))
    setCart(response.data?.data || null)
  }

  const removeCartItem = async (itemId) => {
    if (!token) throw new Error('Login required')
    const response = await api.delete(`/cart/${itemId}`, authHeaders(token))
    setCart(response.data?.data || null)
  }

  const toggleWishlist = async (productId) => {
    if (!token) throw new Error('Login required')
    const response = await api.post('/wishlist/toggle', { productId }, authHeaders(token))
    setWishlist(response.data?.data || null)
  }

  const createOrder = async (payload) => {
    if (!token) throw new Error('Login required')
    const response = await api.post('/orders', payload, authHeaders(token))
    await fetchOrders()
    await fetchCart()
    return response.data?.data
  }

  const getOrderById = async (id) => {
    if (!token) throw new Error('Login required')
    const response = await api.get(`/orders/${id}`, authHeaders(token))
    return response.data?.data
  }

  const fetchMyFeedback = async () => {
    if (!token || serviceUnavailable) return []
    return runDeduped('support', async () => {
      try {
        const response = await api.get('/support', authHeaders(token))
        const list = response.data?.data || []
        setFeedback(list)
        return list
      } catch (error) {
        setFeedback([])
        markServiceUnavailable(error)
        console.error('Failed to fetch feedback', error)
        return []
      }
    })
  }

  const submitFeedback = async (payload) => {
    if (!token) throw new Error('Login required')
    await api.post('/support', payload, authHeaders(token))
    return fetchMyFeedback()
  }

  const fetchAdminFeedback = async () => {
    if (!token || serviceUnavailable) return []
    return runDeduped('adminSupport', async () => {
      try {
        const response = await api.get('/support/admin', authHeaders(token))
        const list = response.data?.data || []
        setAdminFeedback(list)
        return list
      } catch (error) {
        setAdminFeedback([])
        markServiceUnavailable(error)
        console.error('Failed to fetch admin feedback', error)
        return []
      }
    })
  }

  const replyFeedback = async (id, payload) => {
    if (!token) throw new Error('Login required')
    await api.put(`/support/admin/${id}/reply`, payload, authHeaders(token))
    return fetchAdminFeedback()
  }

  useEffect(() => {
    fetchCatalog()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      if (bootstrapTokenRef.current === token) return
      bootstrapTokenRef.current = token
      fetchCart()
      fetchWishlist()
      fetchOrders()
      fetchMyFeedback()
    } else {
      bootstrapTokenRef.current = null
      setCart(null)
      setWishlist(null)
      setOrders([])
      setFeedback([])
      setAdminFeedback([])
    }
  }, [isAuthenticated])

  const value = useMemo(
    () => ({
      categories,
      products,
      cart,
      wishlist,
      orders,
      feedback,
      adminFeedback,
      loading,
      serviceUnavailable,
      serviceMessage,
      fetchCatalog,
      fetchCart,
      fetchWishlist,
      fetchOrders,
      addToCart,
      updateCartItem,
      removeCartItem,
      toggleWishlist,
      createOrder,
      getOrderById,
      fetchMyFeedback,
      submitFeedback,
      fetchAdminFeedback,
      replyFeedback
    }),
    [categories, products, cart, wishlist, orders, feedback, adminFeedback, loading, serviceUnavailable, serviceMessage]
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used within ShopProvider')
  return ctx
}
