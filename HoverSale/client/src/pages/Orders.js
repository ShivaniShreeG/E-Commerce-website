import React, { useEffect, useState } from 'react';
import { FaFileInvoice, FaRedo, FaTimes, FaEnvelope } from 'react-icons/fa';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const userId = localStorage.getItem('userId');
  const [reorderData, setReorderData] = useState(null);
  const [showReorderForm, setShowReorderForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/api/order/user/${userId}`)
      .then(res => res.json())
      .then(data => {
        const sortedOrders = (data.orders || []).sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
        setOrders(sortedOrders);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching orders:', err);
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    setFilteredOrders(filter === 'All' ? orders : orders.filter(o => o.status === filter));
    setCurrentPage(1);
  }, [filter, orders]);

  const cancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to cancel this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:5000/api/order/${orderId}/cancel`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Canceled' } : o));
        Swal.fire('Canceled!', data.message || 'Order has been canceled.', 'success');
      } else {
        Swal.fire('Error', data.error || data.message, 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Something went wrong while cancelling the order.', 'error');
    }
  };

  const reorder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return Swal.fire('Error', 'Order not found.', 'error');
    const selectedItems = order.items.map(item => ({
      ...item,
      selected: true,
      newQuantity: item.quantity
    }));
    setReorderData({
      orderId: order.id,
      name: order.name,
      email: order.email,
      phone: order.phone,
      address: order.address,
      payment_method: 'Cash on Delivery',
      items: selectedItems
    });
    setShowReorderForm(true);
  };

  const submitReorder = async () => {
    const { name, email, phone, address, payment_method, items } = reorderData;

    const filteredItems = items
      .filter(i => i.selected !== false)
      .map(i => ({
        product_id: i.product_id,
        quantity: parseInt(i.newQuantity),
        price: i.price
      }));

    if (filteredItems.length === 0)
      return Swal.fire('Warning', 'Please select at least one item.', 'warning');

    const totalPrice = filteredItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

    try {
      const res = await fetch(`http://localhost:5000/api/order/reorder-custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          name,
          email,
          phone,
          address,
          payment_method,
          total_price: totalPrice,
          items: filteredItems
        })
      });

      const data = await res.json();
      if (!res.ok || data.error)
        return Swal.fire('Error', data.error || 'Reorder failed', 'error');

      setShowReorderForm(false);
      Swal.fire('Success', data.message || 'Reorder placed successfully.', 'success');

      if (payment_method === 'UPI' || payment_method === 'Credit Card') {
        setTimeout(() => {
          navigate('/razorpay-payment', {
            state: {
              amount: totalPrice,
              orderId: data.orderId,
              name,
              email,
              phone,
            }
          });
        }, 1500);
      }
    } catch (err) {
      console.error('Reorder failed:', err);
      Swal.fire('Error', 'Something went wrong during reorder.', 'error');
    }
  };

  const sendInvoiceEmail = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/order/email-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, userId })
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire('Success', data.message || 'Invoice sent to email.', 'success');
      } else {
        Swal.fire('Error', data.error || 'Failed to send invoice.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Something went wrong.', 'error');
    }
  };

  const toBase64 = (url) => fetch(url).then(res => res.blob()).then(blob => new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  }));

  const generateInvoicePDF = async (doc, order, margin, logoBase64) => {
    let y = margin;
    if (logoBase64) doc.addImage(logoBase64, 'PNG', margin, y, 30, 15);
    doc.setFontSize(16);
    doc.text('HoverSale - Invoice', 200 - margin, y + 10, { align: 'right' });
    y += 25;
    doc.setDrawColor(200);
    doc.line(margin, y, 190, y);
    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order ID: ${order.id}`, margin, y);
    y += 6;
    doc.text(`Date: ${new Date(order.order_date).toLocaleString()}`, margin, y);
    y += 6;
    doc.text(`Status: ${order.status}`, margin, y);
    y += 6;
    doc.text('Delivery Address:', margin, y);
    y += 6;
    const addressLines = doc.splitTextToSize(order.address, 160);
    doc.text(addressLines, margin + 5, y);
    y += addressLines.length * 6 + 6;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(230);
    doc.rect(margin, y, 170, 10, 'F');
    doc.setTextColor(0);
    doc.text('Product', margin + 2, y + 7);
    doc.text('Qty', margin + 85, y + 7);
    doc.text('Price (Rs.)', margin + 115, y + 7);
    doc.text('Total (Rs.)', margin + 150, y + 7);
    y += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setDrawColor(220);
    if (Array.isArray(order.items)) {
      order.items.forEach((item) => {
        const total = item.quantity * item.price;
        doc.text(item.product_name, margin + 2, y);
        doc.text(`${item.quantity}`, margin + 85, y);
        doc.text(`Rs. ${item.price.toFixed(2)}`, margin + 115, y);
        doc.text(`Rs. ${total.toFixed(2)}`, margin + 150, y);
        doc.line(margin, y + 2, 190, y + 2);
        y += 8;
      });
    } else {
      doc.text('No items available.', margin, y);
      y += 10;
    }
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setDrawColor(200);
    doc.line(margin, y, 190, y);
    y += 10;
    doc.text(`Total Price: Rs. ${order.total_price.toFixed(2)}`, margin + 130, y);
    y += 20;
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text('Thank you for shopping with HoverSale!', margin, y);
    doc.text('For help, contact hoversale521@gmail.com', margin, y + 6);
  };

  const downloadInvoice = async (order) => {
    const doc = new jsPDF();
    const logoBase64 = await toBase64('/logo1.png');
    await generateInvoicePDF(doc, order, 20, logoBase64);
    doc.save(`invoice_order_${order.id}.pdf`);
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-400 to-orange-300 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">My Orders</h2>

        <div className="flex justify-center mb-6 flex-wrap gap-2">
          {['All', 'Pending', 'Shipped', 'Delivered', 'Canceled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md font-medium ${
                filter === status ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {currentOrders.map((order) => (
          <div key={order.id} className="bg-gray-100 rounded-lg shadow-sm p-4 mb-6">
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Date:</strong> {new Date(order.order_date).toLocaleString()}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Delivery Address:</strong> {order.address}</p>

            {Array.isArray(order.items) && (
              <div className="mt-4 grid gap-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 bg-white rounded-md p-3 shadow">
                    <img src={`http://localhost:5000/${item.product_image}`} alt={item.product_name} className="w-20 h-20 object-cover rounded" />
                    <div>
                      <p className="font-semibold">{item.product_name}</p>
                      <p>Qty: {item.quantity}</p>
                      <p>Price: ₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="font-bold mt-4">Total: ₹{order.total_price}</p>

            <div className="flex flex-wrap gap-3 mt-4">
              <button onClick={() => downloadInvoice(order)} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center gap-2"><FaFileInvoice /> Invoice</button>
              <button onClick={() => sendInvoiceEmail(order.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded flex items-center gap-2"><FaEnvelope /> Email</button>
              {order.status !== 'Canceled' && (
                <button onClick={() => cancelOrder(order.id)} className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center gap-2"><FaTimes /> Cancel</button>
              )}
              {order.status === 'Canceled' && (
                <button onClick={() => reorder(order.id)} className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center gap-2"><FaRedo /> Reorder</button>
              )}
            </div>
          </div>
        ))}

        {showReorderForm && reorderData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg overflow-y-auto max-h-[90vh]">
              <h3 className="text-xl font-semibold mb-4 text-center">Reorder Details</h3>
              <input type="text" className="w-full mb-2 p-2 border rounded" value={reorderData.name} onChange={e => setReorderData({ ...reorderData, name: e.target.value })} placeholder="Name" />
              <input type="email" className="w-full mb-2 p-2 border rounded" value={reorderData.email} onChange={e => setReorderData({ ...reorderData, email: e.target.value })} placeholder="Email" />
              <input type="tel" className="w-full mb-2 p-2 border rounded" value={reorderData.phone} onChange={e => setReorderData({ ...reorderData, phone: e.target.value })} placeholder="Phone" />
              <textarea className="w-full mb-2 p-2 border rounded" value={reorderData.address} onChange={e => setReorderData({ ...reorderData, address: e.target.value })} placeholder="Address" />
              <select className="w-full mb-4 p-2 border rounded" value={reorderData.payment_method} onChange={e => setReorderData({ ...reorderData, payment_method: e.target.value })}>
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
              </select>
              <div className="mb-4">
                {reorderData.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center mb-2">
                    <div>{item.product_name}</div>
                    <input type="number" className="w-16 border p-1 rounded" min="1" value={item.newQuantity} onChange={e => {
                      const newItems = [...reorderData.items];
                      newItems[idx].newQuantity = e.target.value;
                      setReorderData({ ...reorderData, items: newItems });
                    }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-4">
                <button onClick={submitReorder} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">Confirm</button>
                <button onClick={() => setShowReorderForm(false)} className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center items-center gap-4 mt-6">
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">Prev</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}

export default Orders;
