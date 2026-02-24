import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Plus } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { useShop } from '../context/ShopContext'

function ProductCard({ product }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart, wishlist, toggleWishlist } = useShop()
  const [packSize, setPackSize] = useState(product.variants?.[0]?.packSize || '250g')

  const wishlistIds = new Set((wishlist?.items || []).map((item) => item.product?._id || item.product))
  const isWishlisted = wishlistIds.has(product._id)

  const selectedVariant = (product.variants || []).find((variant) => variant.packSize === packSize)
  const mrpPrice = selectedVariant?.price || product.price
  const discount = product.discountPercentage || 0
  const unitPrice = Math.max(1, Math.round(mrpPrice * (1 - discount / 100)))

  const handleAddCart = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to add items to cart')
      navigate('/login')
      return
    }
    try {
      await addToCart({ productId: product._id, packSize, quantity: 1 })
      toast.success('Added to cart')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to add product')
    }
  }

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to use wishlist')
      navigate('/login')
      return
    }
    try {
      await toggleWishlist(product._id)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to update wishlist')
    }
  }

  return (
    <article className="w-full rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative rounded-md bg-gray-100 p-2">
        <img
          src={product.images?.[0]?.url || 'https://dummyimage.com/600x400/f59e0b/ffffff&text=Pickles'}
          alt={product.name}
          className="h-44 w-full object-contain"
        />
        <button
          type="button"
          className="absolute bottom-2 right-2 rounded-full bg-yellow-400 p-2 text-black shadow"
          onClick={handleAddCart}
          aria-label={`Add ${product.name} to cart`}
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        {discount > 0 ? (
          <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">{discount}% off</span>
        ) : (
          <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">Deal</span>
        )}
        <span className="text-sm font-semibold text-red-700">Limited time deal</span>
      </div>

      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-3xl font-bold text-gray-900">Rs. {unitPrice}</p>
        {discount > 0 && <p className="text-sm text-gray-500 line-through">M.R.P: Rs. {mrpPrice}</p>}
      </div>

      <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-gray-900">{product.name}</h3>

      <div className="mt-2">
        <select className="input-field py-1 text-xs" value={packSize} onChange={(e) => setPackSize(e.target.value)}>
          {(product.variants || []).map((variant) => (
            <option key={variant.packSize} value={variant.packSize}>
              {variant.packSize}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <Link to={`/products/${product._id}`} className="text-base font-semibold text-blue-700 hover:underline">
          View details
        </Link>
        <button
          type="button"
          className={`rounded-full border p-1.5 ${isWishlisted ? 'bg-orange-100 border-orange-400' : 'bg-white border-gray-300'}`}
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} />
        </button>
      </div>
    </article>
  )
}

export default ProductCard
