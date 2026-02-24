import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useShop } from '../context/ShopContext'

const STATE_CITY_MAP = {
  Telangana: ['Hyderabad', 'Warangal', 'Karimnagar'],
  'Andhra Pradesh': ['Vijayawada', 'Visakhapatnam', 'Guntur'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Hubli'],
  TamilNadu: ['Chennai', 'Coimbatore', 'Madurai']
}

const PAYMENT_OPTIONS = [
  { key: 'cod', label: 'Cash on Delivery', hint: 'Pay when order arrives' },
  { key: 'upi', label: 'UPI', hint: 'Any UPI app' },
  { key: 'gpay', label: 'GPay', hint: 'Google Pay UPI' },
  { key: 'paytm', label: 'Paytm', hint: 'Paytm UPI' },
  { key: 'googlepay', label: 'Google Pay', hint: 'Google Pay handle' },
  { key: 'amazonpay', label: 'Amazon Pay', hint: 'Amazon Pay UPI' },
  { key: 'card', label: 'Card', hint: 'Credit / Debit card' },
  { key: 'netbanking', label: 'Net Banking', hint: 'Internet banking' }
]

const COUPON_MAP = {
  PICKLES10: 10,
  DEAL20: 20,
  WELCOME5: 5
}

function Checkout() {
  const navigate = useNavigate()
  const { cart, createOrder } = useShop()
  const [submitting, setSubmitting] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [form, setForm] = useState({
    address: '',
    city: '',
    state: '',
    country: 'India',
    pinCode: '',
    phoneNo: '',
    paymentMethod: '',
    upiId: '',
    cardLast4: '',
    bankName: '',
    couponCode: ''
  })

  const onChange = (event) => {
    const { name, value } = event.target
    if (name === 'state') {
      setForm((prev) => ({ ...prev, state: value, city: '' }))
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const cityOptions = useMemo(() => STATE_CITY_MAP[form.state] || [], [form.state])
  const isUpiMode = ['upi', 'gpay', 'paytm', 'googlepay', 'amazonpay'].includes(form.paymentMethod)
  const itemsPrice = useMemo(
    () => (cart?.items || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [cart]
  )
  const shippingPrice = itemsPrice > 999 ? 0 : 60
  const taxPrice = Math.round(itemsPrice * 0.05)
  const discountPrice = appliedCoupon ? Math.round((itemsPrice * appliedCoupon.percent) / 100) : 0
  const totalPrice = Math.max(0, itemsPrice + shippingPrice + taxPrice - discountPrice)

  const applyCoupon = () => {
    const normalized = String(couponInput || '').trim().toUpperCase()
    if (!normalized) {
      toast.error('Please enter coupon code')
      return
    }

    const percent = COUPON_MAP[normalized]
    if (!percent) {
      setAppliedCoupon(null)
      setForm((prev) => ({ ...prev, couponCode: '' }))
      toast.error('Enter valid coupon code')
      return
    }

    setAppliedCoupon({ code: normalized, percent })
    setForm((prev) => ({ ...prev, couponCode: normalized }))
    toast.success(`Coupon applied: ${normalized} (${percent}% OFF)`)
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput('')
    setForm((prev) => ({ ...prev, couponCode: '' }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!cart?.items?.length) {
      toast.error('Cart is empty')
      return
    }
    if (!/^\d{10}$/.test(form.phoneNo)) {
      toast.error('Enter valid 10-digit mobile number')
      return
    }
    if (!/^\d{6}$/.test(form.pinCode)) {
      toast.error('Enter valid 6-digit pin code')
      return
    }
    if (!form.paymentMethod) {
      toast.error('Please select payment method')
      return
    }
    if (isUpiMode && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(form.upiId.trim())) {
      toast.error('Please enter valid UPI ID')
      return
    }

    setSubmitting(true)
    try {
      const order = await createOrder({
        shippingInfo: {
          address: form.address,
          city: form.city,
          state: form.state,
          country: form.country,
          pinCode: Number(form.pinCode),
          phoneNo: Number(form.phoneNo)
        },
        paymentMethod: form.paymentMethod,
        upiId: form.upiId,
        couponCode: form.couponCode
      })
      toast.success('Order confirmed successfully')
      navigate(`/orders/${order._id}/tracking`)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
        <label className="text-sm">
          <span className="text-xs text-gray-600">Address</span>
          <input className="input-field mt-1 py-2" name="address" value={form.address} onChange={onChange} required />
        </label>

        <label className="text-sm">
          <span className="text-xs text-gray-600">State</span>
          <select className="input-field mt-1 py-2" name="state" value={form.state} onChange={onChange} required>
            <option value="">Select state</option>
            {Object.keys(STATE_CITY_MAP).map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="text-xs text-gray-600">City</span>
          <select className="input-field mt-1 py-2" name="city" value={form.city} onChange={onChange} required disabled={!form.state}>
            <option value="">Select city</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="text-xs text-gray-600">Country</span>
          <input className="input-field mt-1 py-2" name="country" value={form.country} onChange={onChange} required />
        </label>

        <label className="text-sm">
          <span className="text-xs text-gray-600">Pin code</span>
          <input className="input-field mt-1 py-2" name="pinCode" value={form.pinCode} onChange={onChange} placeholder="6-digit" required />
        </label>

        <label className="text-sm">
          <span className="text-xs text-gray-600">Mobile number</span>
          <input className="input-field mt-1 py-2" name="phoneNo" value={form.phoneNo} onChange={onChange} placeholder="10-digit" required />
        </label>

        <div className="md:col-span-2">
          <p className="mb-2 text-xs text-gray-600">Select payment method</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {PAYMENT_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                  form.paymentMethod === option.key
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-300 bg-white hover:border-orange-300'
                }`}
                onClick={() => setForm((prev) => ({ ...prev, paymentMethod: option.key }))}
              >
                <p className="font-semibold">{option.label}</p>
                <p className="text-[11px] text-gray-500">{option.hint}</p>
              </button>
            ))}
          </div>
        </div>

        {isUpiMode && (
          <input
            className="input-field md:col-span-2 py-2"
            name="upiId"
            value={form.upiId}
            onChange={onChange}
            placeholder="Enter UPI ID (example@bank)"
            required
          />
        )}

        {form.paymentMethod === 'card' && (
          <input
            className="input-field md:col-span-2 py-2"
            name="cardLast4"
            value={form.cardLast4}
            onChange={onChange}
            placeholder="Enter last 4 digits of card"
            required
          />
        )}

        {form.paymentMethod === 'netbanking' && (
          <input
            className="input-field md:col-span-2 py-2"
            name="bankName"
            value={form.bankName}
            onChange={onChange}
            placeholder="Enter bank name"
            required
          />
        )}

        <div className="md:col-span-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <p className="text-sm font-semibold">Coupon Code</p>
          <p className="mt-1 text-xs text-gray-600">Available: PICKLES10, DEAL20, WELCOME5</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              className="input-field py-2"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Enter coupon code"
            />
            <button type="button" className="btn-secondary" onClick={applyCoupon}>
              Apply Coupon
            </button>
            {appliedCoupon && (
              <button type="button" className="btn-danger" onClick={removeCoupon}>
                Remove
              </button>
            )}
          </div>
          {appliedCoupon && (
            <p className="mt-2 text-sm text-green-700">
              Applied coupon in payment: <span className="font-semibold">{appliedCoupon.code}</span> ({appliedCoupon.percent}% OFF)
            </p>
          )}
        </div>

        <div className="md:col-span-2 rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-lg font-semibold">Payment Summary</h3>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <p>Items: Rs. {itemsPrice}</p>
            <p>Shipping: Rs. {shippingPrice}</p>
            <p>Tax: Rs. {taxPrice}</p>
            <p>Coupon Discount: - Rs. {discountPrice}</p>
            {appliedCoupon && <p>Coupon Code: {appliedCoupon.code}</p>}
          </div>
          <p className="mt-3 text-xl font-bold">Total: Rs. {totalPrice}</p>
        </div>

        <button type="submit" className="btn-primary md:col-span-2" disabled={submitting}>
          {submitting ? 'Placing order...' : 'Confirm Order'}
        </button>
      </form>
    </section>
  )
}

export default Checkout
