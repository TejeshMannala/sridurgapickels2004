import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { useShop } from '../context/ShopContext'

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { products, addToCart } = useShop()

  const product = useMemo(() => products.find((item) => item._id === id), [products, id])
  const [packSize, setPackSize] = useState(product?.variants?.[0]?.packSize || '250g')
  const [quantity, setQuantity] = useState(1)

  if (!product) {
    return <section className="mx-auto max-w-5xl px-4 py-10">Product not found.</section>
  }

  const selected = (product.variants || []).find((variant) => variant.packSize === packSize)
  const discount = product.discountPercentage || 0
  const unitPrice = Math.max(1, Math.round((selected?.price || product.price) * (1 - discount / 100)))
  const totalPrice = unitPrice * Math.max(1, quantity)

  const handleAdd = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to add product')
      navigate('/login')
      return
    }
    try {
      await addToCart({ productId: product._id, packSize, quantity })
      toast.success('Product added to cart')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to add product')
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Back
      </button>
      <div className="grid gap-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-2">
        <div className="rounded-xl bg-gray-100 p-4">
          <img
            src={product.images?.[0]?.url || 'https://dummyimage.com/800x600/f59e0b/fff&text=Pickles'}
            alt={product.name}
            className="h-[24rem] w-full object-contain md:h-[28rem]"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {discount > 0 ? (
              <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">{discount}% off</span>
            ) : (
              <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">Deal</span>
            )}
            <span className="text-sm font-semibold text-red-700">Limited time deal</span>
          </div>

          <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
          <p className="mt-3 text-gray-600">{product.description}</p>
          <p className="mt-2 text-sm text-gray-500">Category: {product.category?.name}</p>

          <div className="mt-4 flex items-baseline gap-2">
            <p className="text-4xl font-bold text-gray-900">Rs. {totalPrice}</p>
            {discount > 0 && <p className="text-base text-gray-500 line-through">M.R.P: Rs. {selected?.price || product.price}</p>}
          </div>
          <p className="mt-1 text-sm text-gray-500">Available quantity: {selected?.stock ?? product.stock}</p>

          <div className="mt-5 max-w-xs">
            <label className="text-sm font-medium">Select pack size</label>
            <select className="input-field mt-2" value={packSize} onChange={(e) => setPackSize(e.target.value)}>
              {(product.variants || []).map((variant) => (
                <option key={variant.packSize} value={variant.packSize}>
                  {variant.packSize}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 max-w-xs">
            <label className="text-sm font-medium">Quantity</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 1)}
              className="input-field mt-2"
            />
          </div>
          <button type="button" className="btn-primary mt-5 w-fit px-6" onClick={handleAdd}>
            Add to Cart
          </button>
        </div>
      </div>
    </section>
  )
}

export default ProductDetails
