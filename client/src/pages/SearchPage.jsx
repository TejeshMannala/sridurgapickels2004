import { useState } from 'react'

function SearchPage() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(query.trim())
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-gray-900">Search Pickles</h2>
        <p className="mt-2 text-gray-600">Search bar is centered in the middle of this page.</p>
        <form className="mt-8 flex gap-3" onSubmit={handleSubmit}>
          <input
            className="input-field"
            type="search"
            placeholder="Search product..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>
        {submitted && <p className="mt-4 text-sm text-gray-700">Search for: {submitted}</p>}
      </div>
    </section>
  )
}

export default SearchPage
