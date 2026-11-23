import React, { useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCart } from '../redux/cartSlice';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: '', street: '', city: '', postalCode: '', country: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.qty ?? item.quantity ?? 0),
    0
  );

  const saveOrder = async (paymentId) => {
    const saveOrderRes = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({
        items: cartItems.map((item) => ({
          productId: item.productId || item._id,
          quantity: Number(item.qty ?? item.quantity ?? 1),
          price: Number(item.price)
        })),
        totalAmount: totalPrice,
        address,
        paymentId
      })
    });
    const data = await saveOrderRes.json().catch(() => ({}));

    if (!saveOrderRes.ok) {
      throw new Error(data.message || data.error || 'Could not save your order. Please try again.');
    }

    dispatch(clearCart());
    navigate('/ordersuccess');
  };

  const bypassPayment = () => saveOrder(`student-bypass-${Date.now()}`);

  const handlePayment = async () => {
    try {
      const orderRes = await fetch('/api/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalPrice })
      });
      const orderData = await orderRes.json().catch(() => ({}));

      if (!orderRes.ok) {
        throw new Error(orderData.message || 'Payment could not be initialized. Click Pay Now and confirm Student Test Mode to place a test order.');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ShopNest',
        description: 'Test Transaction',
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response)
            });

            if (!verifyRes.ok) {
              const verifyData = await verifyRes.json().catch(() => ({}));
              throw new Error(verifyData.message || 'Payment verification failed.');
            }

            await saveOrder(response.razorpay_payment_id);
          } catch (paymentError) {
            setError(paymentError.message || 'Unable to complete your order.');
            setSubmitting(false);
          }
        },
        prefill: {
          name: address.fullName,
          email: user?.email,
          contact: '9999999999'
        },
        theme: {
          color: '#f97316'
        },
        modal: { ondismiss: () => setSubmitting(false) }
      };

      if (!window.Razorpay) {
        throw new Error('Razorpay checkout did not load. Click Pay Now and confirm Student Test Mode to place a test order.');
      }
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', (event) => {
        setError(event.error?.description || 'Payment failed. Click Pay Now and confirm Student Test Mode to place a test order.');
        setSubmitting(false);
      });
      rzp1.open();
    } catch (error) {
      console.error(error);
      setError(error.message || 'Unable to initialize payment.');
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in before placing your order.');
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      setError('Your cart is empty. Add products before checking out.');
      return;
    }
    setError('');
    setSubmitting(true);

    const useStudentTestMode = window.confirm(
      'Razorpay Test Mode: choose OK to place a student test order without a real charge. Choose Cancel to continue to Razorpay payment.'
    );

    if (useStudentTestMode) {
      try {
        await bypassPayment();
      } catch (orderError) {
        console.error(orderError);
        setError(orderError.message || 'Could not place the test order. Please try again.');
        setSubmitting(false);
      }
      return;
    }

    handlePayment();
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="shipping-form">
          <h3>Shipping Address</h3>
          {error && <p role="alert" style={{ color: '#ef4444' }}>{error}</p>}
          <input type="text" placeholder="Full Name" required value={address.fullName} onChange={(e) => setAddress({...address, fullName: e.target.value})} />
          <input type="text" placeholder="Street" required value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} />
          <input type="text" placeholder="City" required value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} />
          <input type="text" placeholder="Postal Code" required value={address.postalCode} onChange={(e) => setAddress({...address, postalCode: e.target.value})} />
          <input type="text" placeholder="Country" required value={address.country} onChange={(e) => setAddress({...address, country: e.target.value})} />
          <div className="checkout-summary">
            <h4>Total to Pay: ₹{totalPrice.toFixed(2)}</h4>
            <button type="submit" className="btn" disabled={submitting || cartItems.length === 0}>
              {submitting ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;