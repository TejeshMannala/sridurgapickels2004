import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'react-toastify'
import { api, authHeaders } from '../services/api'
import { useAuth } from '../context/AuthContext'

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  price: 100,
  category: '',
  imageUrl: '',
  discountPercentage: 10,
  isActive: true
}

const PRODUCTS_PER_PAGE = 10
const MAX_PAGES = 8

function ManageProducts() {
  const { token } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [selectedFilePreview, setSelectedFilePreview] = useState('')
  const [editing, setEditing] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)

  const load = async () => {
    if (!token) return
    try {
      const [productRes, categoryRes] = await Promise.all([
        api.get('/admin/products', authHeaders(token)),
        api.get('/categories')
      ])
      setProducts(productRes.data?.data || [])
      setCategories(categoryRes.data?.data || [])
    } catch (error) {
      setProducts([])
      if (error?.response?.status !== 401) {
        toast.error(error?.response?.data?.message || 'Failed to load products')
      }
    }
  }

  useEffect(() => {
    load()
  }, [token])

  const pagedProducts = useMemo(() => {
    const cappedProducts = products.slice(0, PRODUCTS_PER_PAGE * MAX_PAGES)
    const pages = []

    for (let index = 0; index < cappedProducts.length; index += PRODUCTS_PER_PAGE) {
      pages.push(cappedProducts.slice(index, index + PRODUCTS_PER_PAGE))
    }

    return pages
  }, [products])

  useEffect(() => {
    if (currentPage >= pagedProducts.length) {
      setCurrentPage(0)
    }
  }, [currentPage, pagedProducts.length])

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const onFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const encoded = await fileToBase64(file)
    setSelectedFilePreview(encoded)
  }

  const createProduct = async (event) => {
    event.preventDefault()
    const image = selectedFilePreview || form.imageUrl || 'https://dummyimage.com/900x600/f59e0b/ffffff&text=Pickles'
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      description: form.description,
      price: Number(form.price),
      category: form.category,
      discountPercentage: Number(form.discountPercentage),
      images: [{ public_id: 'manual', url: image }],
      stock: 100,
      variants: [
        { packSize: '250g', price: Number(form.price), stock: 60 },
        { packSize: '500g', price: Math.round(Number(form.price) * 1.9), stock: 40 },
        { packSize: '1kg', price: Math.round(Number(form.price) * 3.6), stock: 20 }
      ],
      isActive: form.isActive
    }
    await api.post('/admin/products', payload, authHeaders(token))
    toast.success('Product created')
    setForm(emptyForm)
    setSelectedFilePreview('')
    load()
  }

  const openEdit = (product) => {
    setEditing({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category?._id || product.category,
      discountPercentage: product.discountPercentage || 0,
      isActive: Boolean(product.isActive),
      imageUrl: product.images?.[0]?.url || ''
    })
  }

  const saveEdit = async () => {
    if (!editing) return
    const payload = {
      name: editing.name,
      description: editing.description,
      price: Number(editing.price),
      category: editing.category,
      discountPercentage: Number(editing.discountPercentage),
      isActive: editing.isActive
    }

    if (String(editing.imageUrl || '').trim()) {
      payload.images = [{ public_id: 'manual', url: String(editing.imageUrl).trim() }]
    }

    await api.put(
      `/admin/products/${editing._id}`,
      payload,
      authHeaders(token)
    )
    toast.success('Product updated')
    setEditing(null)
    load()
  }

  const deleteProduct = async (product) => {
    const confirmed = window.confirm(`Delete ${product.name}? This will remove it from database.`)
    if (!confirmed) return
    await api.delete(`/admin/products/${product._id}`, authHeaders(token))
    toast.success('Product deleted from database')
    if (editing?._id === product._id) setEditing(null)
    load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Products</h2>
        <p className="text-sm text-gray-500">Create product with Image URL or upload image. Category changes are saved from edit panel.</p>
      </div>

      <form className="grid gap-3 rounded-xl border p-4 md:grid-cols-2" onSubmit={createProduct}>
        <input className="input-field" placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input-field" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <textarea className="input-field md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <input className="input-field" type="number" placeholder="Base price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <input className="input-field" type="number" placeholder="Discount %" value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} />
        <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <input className="input-field" placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        <input className="input-field md:col-span-2" type="file" accept="image/*" onChange={onFileChange} />
        {selectedFilePreview && <img src={selectedFilePreview} alt="preview" className="h-24 w-24 rounded-md object-cover" />}
        <button className="btn-primary md:col-span-2">Add Product</button>
      </form>

      {editing && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-lg font-semibold">Edit Product</h3>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <input className="input-field" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <input className="input-field" type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} />
            <select className="input-field" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              className="input-field"
              type="number"
              value={editing.discountPercentage}
              onChange={(e) => setEditing({ ...editing, discountPercentage: e.target.value })}
            />
            <input className="input-field md:col-span-2" value={editing.imageUrl} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })} />
            <textarea className="input-field md:col-span-2" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />
              Active product
            </label>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="btn-primary" onClick={saveEdit}>
              Save Changes
            </button>
            <button className="btn-secondary" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-gray-600"></p>
          {pagedProducts.length > 0 && (
            <p className="text-sm text-gray-600">
              Page {currentPage + 1} / {pagedProducts.length}
            </p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-3 py-2 text-left">Image</th>
              <th className="border px-3 py-2 text-left">Product</th>
              <th className="border px-3 py-2 text-left">Category</th>
              <th className="border px-3 py-2 text-left">Price</th>
              <th className="border px-3 py-2 text-left">Active</th>
              <th className="border px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {(pagedProducts[currentPage] || []).map((product) => (
              <tr key={product._id}>
                <td className="border px-3 py-2">
                  <img src={product.images?.[0]?.url} alt={product.name} className="h-16 w-16 rounded object-cover" />
                </td>
                <td className="border px-3 py-2">{product.name}</td>
                <td className="border px-3 py-2">{product.category?.name}</td>
                <td className="border px-3 py-2">Rs. {product.price}</td>
                <td className="border px-3 py-2">{product.isActive ? 'Active' : 'Inactive'}</td>
                <td className="border px-3 py-2">
                  <div className="flex gap-2">
                    <button className="btn-secondary" onClick={() => openEdit(product)}>
                      Edit
                    </button>
                    <button className="btn-danger" onClick={() => deleteProduct(product)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagedProducts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-1"
            onClick={() => setCurrentPage((prev) => (prev - 1 + pagedProducts.length) % pagedProducts.length)}
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          {pagedProducts.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`rounded-md border px-3 py-1 text-sm ${index === currentPage ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-slate-700'}`}
              onClick={() => setCurrentPage(index)}
            >
              {index + 1}
            </button>
          ))}
          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-1"
            onClick={() => setCurrentPage((prev) => (prev + 1) % pagedProducts.length)}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default ManageProducts
