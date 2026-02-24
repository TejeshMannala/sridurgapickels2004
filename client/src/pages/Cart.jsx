import { Link } from 'react-router-dom'
import { useShop } from '../context/ShopContext'

function Cart() {
  const { cart, updateCartItem, removeCartItem } = useShop()

  const items = cart?.items || []
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Cart</h1>
      {items.length === 0 ? (
        <p className="mt-4 text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item._id} className="card p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{item.product?.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.packSize} | Rs. {item.price}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary" onClick={() => updateCartItem(item._id, item.quantity - 1)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button className="btn-secondary" onClick={() => updateCartItem(item._id, item.quantity + 1)}>
                    +
                  </button>
                  <button className="btn-danger" onClick={() => removeCartItem(item._id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <aside className="card p-5 h-fit">
            <h2 className="text-xl font-semibold">Summary</h2>
            <p className="mt-3">Subtotal: Rs. {subtotal}</p>
            <Link to="/checkout" className="btn-primary mt-4 inline-block w-full text-center">
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      )}
    </section>
  )
}

export default Cart
