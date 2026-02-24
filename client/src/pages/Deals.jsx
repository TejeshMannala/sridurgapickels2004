import { useMemo } from 'react'
import ProductCard from '../components/ProductCard'
import { useShop } from '../context/ShopContext'

const getDateSeed = () => {
  const today = new Date()
  const key = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
  let hash = 0
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) % 100000
  }
  return hash
}

function Deals() {
  const { products } = useShop()

  const { todayDeals, moreDeals } = useMemo(() => {
    const activeProducts = products.filter((product) => product?.isActive !== false)
    const dealProducts = activeProducts.filter((product) => (product.discountPercentage || 0) > 0)
    const source = dealProducts.length ? dealProducts : activeProducts

    if (!source.length) {
      return { todayDeals: [], moreDeals: [] }
    }

    const seed = getDateSeed()
    const todayCount = Math.min(6, source.length)
    const pickedIds = new Set()
    const picked = []

    for (let offset = 0; offset < source.length && picked.length < todayCount; offset += 1) {
      const item = source[(seed + offset) % source.length]
      if (!pickedIds.has(item._id)) {
        pickedIds.add(item._id)
        picked.push(item)
      }
    }

    const rest = source.filter((item) => !pickedIds.has(item._id))
    return { todayDeals: picked, moreDeals: rest }
  }, [products])

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Today Deals</h1>
      <p className="mt-2 text-gray-600">These deals update daily. Grab them before they rotate tomorrow.</p>

      {todayDeals.length === 0 ? (
        <p className="mt-6 text-gray-600">No deals available right now.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {todayDeals.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {moreDeals.length > 0 && (
        <>
          <h2 className="mt-10 text-2xl font-semibold">More Deal Products</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {moreDeals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export default Deals
