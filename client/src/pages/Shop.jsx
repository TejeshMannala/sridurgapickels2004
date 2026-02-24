import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useShop } from '../context/ShopContext'

function Shop() {
  const { categories, products } = useShop()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || 'all'
  const [activeSlug, setActiveSlug] = useState(initialCategory)

  const selectCategory = (slug) => {
    setActiveSlug(slug)
    if (slug === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ category: slug })
    }
  }

  const visibleProducts = useMemo(() => {
    if (activeSlug === 'all') return products
    return products.filter((product) => product.category?.slug === activeSlug)
  }, [products, activeSlug])

  const activeCategoryName =
    activeSlug === 'all' ? 'All Categories' : categories.find((category) => category.slug === activeSlug)?.name || 'Category'

  return (
    <section id="shop-top" className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Pickles & Dry Fruits Store</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          className={`category-filter-btn px-4 py-2 rounded-full border ${activeSlug === 'all' ? 'active bg-orange-600 text-white' : 'bg-white'}`}
          onClick={() => selectCategory('all')}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            type="button"
            className={`category-filter-btn px-4 py-2 rounded-full border ${
              activeSlug === category.slug ? 'active bg-orange-600 text-white' : 'bg-white'
            }`}
            onClick={() => selectCategory(category.slug)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold">{activeCategoryName}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {visibleProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Shop
