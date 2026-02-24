import ProductCard from '../components/ProductCard'
import { toast } from 'react-toastify'
import { useShop } from '../context/ShopContext'

function Wishlist() {
  const { wishlist, toggleWishlist } = useShop()
  const items = wishlist?.items || []

  const removeFromWishlist = async (productId) => {
    try {
      await toggleWishlist(productId)
      toast.success('Removed from wishlist')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to remove from wishlist')
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Wishlist</h1>
      {items.length === 0 ? (
        <p className="mt-4 text-gray-600">No items in wishlist.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {items.map((item) => (
            <div key={item.product._id} className="space-y-2">
              <ProductCard product={item.product} />
              <button type="button" className="btn-danger w-full py-2" onClick={() => removeFromWishlist(item.product._id)}>
                Remove from Wishlist
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default Wishlist
