import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useShop } from '../context/ShopContext'

const formatMoney = (value) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value || 0)

const getDateSeed = () => {
  const today = new Date()
  const key = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
  let hash = 0
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) % 100000
  }
  return hash
}

const sectionOrder = ['veg-pickles', 'non-veg-pickles', 'seafood-pickles', 'dry-fruits']
const sectionLimits = {
  'veg-pickles': 20,
  'non-veg-pickles': 20,
  'seafood-pickles': 10,
  'dry-fruits': 15
}

function Home() {
  const { categories, products, loading, serviceUnavailable, serviceMessage } = useShop()
  const [slideIndex, setSlideIndex] = useState(0)

  const slides = useMemo(() => {
    const heroSlide = {
      title: 'Authentic Pickles From Andhra',
      subtitle: 'Fresh daily batches, traditional recipes, and premium ingredients.',
      image: 'https://dummyimage.com/1400x600/7c2d12/fff&text=Authentic+Pickles',
      to: '/shop',
      cta: 'Explore Products'
    }

    const activeProducts = products.filter((product) => product?.isActive !== false)
    const dealProducts = activeProducts.filter((product) => (product.discountPercentage || 0) > 0)
    const source = dealProducts.length > 0 ? dealProducts : activeProducts

    if (!source.length) return [heroSlide]

    const seed = getDateSeed()
    const count = Math.min(3, source.length)
    const dailySlides = Array.from({ length: count }).map((_, offset) => {
      const item = source[(seed + offset) % source.length]
      const discount = item.discountPercentage || 0
      return {
        title: discount > 0 ? `${discount}% OFF Daily Deal` : 'Today Special Deal',
        subtitle: `${item.name} - From Rs. ${formatMoney(item.price)}. Deal rotates every day.`,
        image: item.images?.[0]?.url || 'https://dummyimage.com/1400x600/f59e0b/ffffff&text=Today+Deal',
        to: '/deals',
        cta: 'View Deal'
      }
    })

    return [heroSlide, ...dailySlides]
  }, [products])

  useEffect(() => {
    if (slideIndex >= slides.length) {
      setSlideIndex(0)
    }
  }, [slideIndex, slides.length])

  const groupedBySlug = useMemo(() => {
    const map = {}
    categories.forEach((category) => {
      map[category.slug] = { category, items: [] }
    })
    products.forEach((product) => {
      const slug = product.category?.slug
      if (slug && map[slug]) {
        map[slug].items.push(product)
      }
    })
    return map
  }, [categories, products])

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <div className="pb-12">
      <section className="mx-auto mt-4 max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gray-900 text-white">
          <img src={slides[slideIndex].image} alt={slides[slideIndex].title} className="hero-slide-image h-64 w-full object-cover opacity-60 md:h-80" />
          <div className="absolute inset-0 flex flex-col justify-center px-5 md:px-10">
            <div className="hero-slide-content">
              <h1 className="max-w-xl text-3xl font-bold md:text-5xl">{slides[slideIndex].title}</h1>
              <p className="mt-3 max-w-lg text-sm md:text-lg">{slides[slideIndex].subtitle}</p>
            </div>
            <div className="mt-5">
              <Link to={slides[slideIndex].to} className="btn-primary">
                {slides[slideIndex].cta}
              </Link>
            </div>
          </div>
          <button
            type="button"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 px-3 py-1.5 text-xl"
            onClick={() => setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)}
          >
            {'<'}
          </button>
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 px-3 py-1.5 text-xl"
            onClick={() => setSlideIndex((prev) => (prev + 1) % slides.length)}
          >
            {'>'}
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`h-2 rounded-full transition-all duration-300 ${index === slideIndex ? 'w-8 bg-white' : 'w-2 bg-white/60'}`}
                onClick={() => setSlideIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/shop?category=${category.slug}`}
              className="category-tile rounded-xl border border-gray-200 bg-white p-3 text-center text-sm font-medium hover:border-orange-400"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-8">
        {serviceUnavailable ? (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {serviceMessage || 'Server is temporarily unavailable. Please try again in a moment.'}
          </div>
        ) : null}
        {loading ? (
          <p className="text-gray-600">Loading products...</p>
        ) : (
          sectionOrder.map((slug) => {
            const group = groupedBySlug[slug]
            if (!group?.items?.length) return null
            return (
              <div key={slug} className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{group.category.name}</h2>
                  <Link to={`/shop?category=${slug}`} className="text-sm font-medium text-orange-600">
                    View this category
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {group.items.slice(0, sectionLimits[slug] || 10).map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            )
          })
        )}
      </section>
    </div>
  )
}

export default Home
