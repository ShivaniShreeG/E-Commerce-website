import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import BASE_URL from '../api';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BASE_URL}/api/cart/${userId}`)
      .then(res => res.json())
      .then(data => {
        setCartItems(data);
        const initialSelection = {};
        data.forEach(item => {
          if (item.stock > 0) initialSelection[item.product_id] = true;
        });
        setSelectedItems(initialSelection);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch cart error:", err);
        setLoading(false);
      });
  }, [userId]);

  const updateQuantity = (productId, delta, stock) => {
    setCartItems(prev =>
      prev.map(item =>
        item.product_id === productId
          ? { ...item, quantity: Math.min(Math.max(item.quantity + delta, 1), stock) }
          : item
      )
    );
  };

  const toggleSelect = (productId, stock) => {
    if (stock <= 0) return;
    setSelectedItems(prev => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleRemove = async (productId) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'Remove this item from your cart?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, remove it!'
    });

    if (confirm.isConfirmed) {
      fetch(`${BASE_URL}/api/cart`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId })
      })
        .then(() => {
          setCartItems(prev => prev.filter(item => item.product_id !== productId));
          setSelectedItems(prev => {
            const updated = { ...prev };
            delete updated[productId];
            return updated;
          });
          Swal.fire('Removed!', 'Item has been removed.', 'success');
        })
        .catch(err => {
          console.error("Remove error:", err);
          Swal.fire('Error!', 'Failed to remove item.', 'error');
        });
    }
  };

  const handleBuyNowSingle = async (item) => {
    const confirm = await Swal.fire({
      title: `Buy "${item.name}" now?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Buy Now',
      cancelButtonText: 'Cancel',
    });

    if (confirm.isConfirmed) {
      const itemWithExtras = {
        ...item,
        productName: item.name,
        productImage: item.image_url,
        productDescription: item.description || '',
      };

      navigate('/placeorder', {
        state: {
          cartItems: [itemWithExtras],
          fromCart: true
        }
      });
    }
  };

  const handleOrderNow = async () => {
    const itemsToOrder = cartItems
      .filter(item => selectedItems[item.product_id])
      .map(item => ({
        ...item,
        productName: item.name,
        productImage: item.image_url,
        productDescription: item.description || '',
      }));

    if (itemsToOrder.length === 0) {
      Swal.fire('No Items Selected', 'Please select at least one item to place an order.', 'info');
      return;
    }

    const confirm = await Swal.fire({
      title: 'Confirm Order',
      text: `Place order for ${itemsToOrder.length} item(s)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, place order',
      cancelButtonText: 'Cancel',
    });

    if (confirm.isConfirmed) {
      navigate('/placeorder', {
        state: {
          cartItems: itemsToOrder,
          fromCart: true
        }
      });
    }
  };

  const totalPrice = cartItems.reduce((acc, item) =>
    selectedItems[item.product_id] ? acc + item.price * item.quantity : acc, 0);

  if (loading) return <p className="p-16 text-center text-gray-600">Loading cart...</p>;

  return (
    <div className="bg-sky-100 py-20 px-4 min-h-screen">
      <h2 className="text-center text-2xl font-semibold text-gray-800 mb-8">🛒 Your Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <div className="text-center mt-10 text-gray-500">
          <img src="https://cdn-icons-png.flaticon.com/512/11329/11329460.png" alt="empty" className="w-44 mx-auto mb-4" />
          <p>No items in your cart.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 justify-center">
            {cartItems.map(item => (
              <div key={item.product_id} className="relative bg-white rounded-2xl shadow-lg p-4">
                {item.stock < 20 && item.stock > 0 && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded">
                    Only {item.stock} left!
                  </div>
                )}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <input
                    type="checkbox"
                    checked={!!selectedItems[item.product_id]}
                    disabled={item.stock <= 0}
                    onChange={() => toggleSelect(item.product_id, item.stock)}
                    className="w-4 h-4 self-start sm:self-center"
                  />
                  <img
                    src={`${item.image_url}`}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-700">Price: ₹{item.price}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                      <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => updateQuantity(item.product_id, -1, item.stock)}>-</button>
                      <span>{item.quantity}</span>
                      <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => updateQuantity(item.product_id, 1, item.stock)}>+</button>
                    </div>
                    {item.stock === 0 && <p className="text-red-600 font-semibold mt-1">Out of stock</p>}
                    <p className="mt-2">Subtotal: ₹{item.price * item.quantity}</p>
                    <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-3">
                      <button className="bg-green-600 text-white px-4 py-1 rounded" onClick={() => handleBuyNowSingle(item)}>Buy Now</button>
                      <button className="bg-red-600 text-white px-4 py-1 rounded" onClick={() => handleRemove(item.product_id)}>Remove</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded-xl shadow text-right">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Total Amount: ₹{totalPrice}</h3>
            <button onClick={handleOrderNow} className="bg-blue-600 text-white font-bold px-6 py-2 rounded hover:bg-blue-700 transition">
              Place Order
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
