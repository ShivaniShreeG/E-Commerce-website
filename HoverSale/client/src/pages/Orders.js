import React, { useEffect, useState } from 'react';
import {
  FaFileInvoice, FaRedo, FaTimes, FaEnvelope,
  FaTruck, FaCalendarAlt, FaMapMarkerAlt, FaHashtag,
  FaRoute, FaCreditCard
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import BASE_URL from '../api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BASE_URL}/api/order/user/${userId}`)
      .then(res => res.json())
      .then(data => {
        const sorted = (data.orders || []).sort((a, b) =>
          new Date(b.order_date) - new Date(a.order_date)
        );
        setOrders(sorted);
      })
      .catch(err => console.error('Fetch error:', err));
  }, [userId]);

  useEffect(() => {
    setFilteredOrders(
      filter === 'All' ? orders : orders.filter(o => o.status === filter)
    );
    setCurrentPage(1);
  }, [filter, orders]);



  const cancelOrder = async (orderId) => {
    const confirm = await Swal.fire({
      title: 'Cancel this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${BASE_URL}/api/order/${orderId}/cancel`, {
        method: 'PATCH'
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(prev =>
          prev.map(o => o.id === orderId ? { ...o, status: 'Canceled' } : o)
        );
        Swal.fire('Canceled', data.message || 'Order canceled.', 'success');
      } else {
        Swal.fire('Error', data.error || 'Failed to cancel.', 'error');
      }
    } catch {
      Swal.fire('Error', 'Could not connect.', 'error');
    }
  };

  const reorder = (order) => {
    const allInStock = order.items.every(item => item.stock === undefined || item.stock > 0);
    if (!allInStock) {
      Swal.fire(
        'Some items are out of stock',
        'Please remove unavailable items from cart manually.',
        'warning'
      );
      return;
    }

    const reorderItems = order.items.map(item => ({
      product_id: item.product_id,
      productName: item.product_name,
      productImage: item.product_image,
      price: item.price,
      quantity: item.quantity,
      stock: item.stock || 1,
    }));

    navigate('/placeorder', {
      state: {
        fromReorder: true,
        user_id: userId,
        name: order.name,
        email: order.email,
        phone: order.phone,
        address: order.address,
        payment_method: 'Cash on Delivery',
        items: reorderItems,
        total_price: order.total_price,
      }
    });
  };

  const handlePayNow = (order) => {
    navigate('/razorpay-payment', {
      state: {
        amount: order.total_price,
        orderId: order.id,
        name: order.name,
        email: order.email,
        phone: order.phone
      }
    });
  };

  const sendInvoiceEmail = async (orderId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/order/email-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, userId }),
      });
      const data = await res.json();
      res.ok
        ? Swal.fire('Success', data.message || 'Invoice sent.', 'success')
        : Swal.fire('Error', data.error || 'Failed to send.', 'error');
    } catch {
      Swal.fire('Error', 'Network issue.', 'error');
    }
  };

  const toBase64 = (url) =>
    fetch(url)
      .then(res => res.blob())
      .then(blob => new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      }));

  const generateInvoicePDF = async (doc, order, margin, logoBase64) => {
    let y = margin;
    if (logoBase64) doc.addImage(logoBase64, 'PNG', margin, y, 30, 15);
    doc.setFontSize(16).text('HoverSale - Invoice', 200 - margin, y + 10, { align: 'right' });
    y += 25;
    doc.line(margin, y, 190, y);
    y += 10;
    doc.setFontSize(11).setTextColor(50).setFont('helvetica', 'normal');
    doc.text(`Order ID: ${order.id}`, margin, y); y += 6;
    doc.text(`Date: ${new Date(order.order_date).toLocaleString()}`, margin, y); y += 6;
    doc.text(`Status: ${order.status}`, margin, y); y += 6;
    doc.text('Delivery Address:', margin, y); y += 6;
    doc.text(doc.splitTextToSize(order.address, 160), margin + 5, y); y += 30;
    doc.setFontSize(12).setFont('helvetica', 'bold').setFillColor(230);
    doc.rect(margin, y, 170, 10, 'F');
    doc.setTextColor(0);
    doc.text('Product', margin + 2, y + 7);
    doc.text('Qty', margin + 85, y + 7);
    doc.text('Price', margin + 115, y + 7);
    doc.text('Total', margin + 150, y + 7);
    y += 12;
    doc.setFontSize(11).setFont('helvetica', 'normal');
    order.items?.forEach(i => {
      doc.text(i.product_name, margin + 2, y);
      doc.text(`${i.quantity}`, margin + 85, y);
      doc.text(`₹${i.price.toFixed(2)}`, margin + 115, y);
      doc.text(`₹${(i.quantity * i.price).toFixed(2)}`, margin + 150, y);
      y += 8;
    });
    y += 6;
    doc.line(margin, y, 190, y);
    y += 10;
    doc.setFont('helvetica', 'bold').text(`Total: ₹${order.total_price.toFixed(2)}`, margin + 130, y);
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
    <div className="min-h-screen bg-sky-100 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">📦 My Orders</h2>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {['All', 'Pending', 'Packed', 'Shipped', 'Delivered', 'Canceled'].map(status => (
  <button key={status} onClick={() => setFilter(status)}
    className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
      filter === status ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
    }`}>
    {status}
  </button>
))}
        </div>

        {currentOrders.map((order) => (
  <div key={order.id} className="bg-gray-100 relative rounded-lg p-4 mb-6 shadow-sm">
    {/* Top-right status + estimated delivery */}
    <div className="absolute top-3 right-3 text-right space-y-1">
      <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold
        ${order.status === 'Delivered' ? 'bg-green-100 text-green-700'
          : order.status === 'Shipped' ? 'bg-blue-100 text-blue-700'
          : order.status === 'Canceled' ? 'bg-gray-200 text-gray-700'
          : 'bg-yellow-100 text-yellow-700'}`}>
        {order.status === 'Pending' ? 'Placed' : order.status}
      </div>

      {order.estimated_delivery && (
        <div className="text-xs text-gray-600">
          📅 Est. Delivery: {new Date(order.estimated_delivery).toLocaleDateString()}
        </div>
      )}
    </div>

    {/* Order Info */}
    <p><FaHashtag className="inline mr-1" /> <strong>Order ID:</strong> {order.id}</p>
    <p><FaCalendarAlt className="inline mr-1" /> <strong>Date:</strong> {new Date(order.order_date).toLocaleString()}</p>
    <p><FaTruck className="inline mr-1" /> <strong>Status:</strong> {order.status}</p>
    <p><FaCreditCard className="inline mr-1" /> <strong>Payment:</strong> {order.payment_status || 'Unpaid'}</p>
    <p><FaMapMarkerAlt className="inline mr-1" /> <strong>Address:</strong> {order.address}</p>
    <p><FaRoute className="inline mr-1" /> <strong>Tracking ID:</strong> {order.tracking_id || 'Pending'}</p>

    {/* Items */}
    {order.items?.map((item, i) => (
      <div key={i} className="flex gap-4 bg-white rounded p-3 mt-3 shadow-sm">
        <img src={`${item.product_image}`} alt={item.product_name} className="w-20 h-20 object-cover rounded" />
        <div>
          <p className="font-semibold">{item.product_name}</p>
          <p>Qty: {item.quantity}</p>
          <p>Price: ₹{item.price}</p>
        </div>
      </div>
    ))}

    <p className="font-bold mt-4">Total: ₹{order.total_price}</p>

    {/* Buttons */}
    <div className="flex flex-wrap gap-3 mt-4">
      <button onClick={() => downloadInvoice(order)} className="bg-blue-500 text-white py-2 px-4 rounded flex items-center gap-2 hover:bg-blue-600"><FaFileInvoice /> Invoice</button>
      <button onClick={() => sendInvoiceEmail(order.id)} className="bg-yellow-500 text-white py-2 px-4 rounded flex items-center gap-2 hover:bg-yellow-600"><FaEnvelope /> Email</button>

      {order.status?.trim().toLowerCase() === 'pending' && (
        <button onClick={() => cancelOrder(order.id)} className="bg-red-500 text-white py-2 px-4 rounded flex items-center gap-2 hover:bg-red-600"><FaTimes /> Cancel</button>
      )}

      {order.status?.trim().toLowerCase() === 'canceled' && order.items.every(item => item.stock === undefined || item.stock > 0) && (
        <button onClick={() => reorder(order)} className="bg-green-600 text-white py-2 px-4 rounded flex items-center gap-2 hover:bg-green-700"><FaRedo /> Reorder</button>
      )}

      {order.payment_status !== 'Paid' && order.status!== 'Canceled' && order.payment_method === 'Online Payment (Razorpay)' && (
        <button onClick={() => handlePayNow(order)} className="bg-green-700 text-white py-2 px-4 rounded flex items-center gap-2 hover:bg-green-800">
          💳 Pay Now
        </button>
      )}

      {order.tracking_id && order.status !== 'Canceled' && (
        <button onClick={() => navigate(`/track-order/${order.tracking_id}`)} className="bg-indigo-600 text-white py-2 px-4 rounded flex items-center gap-2 hover:bg-indigo-700">
          <FaRoute /> Track Order
        </button>
      )}

      
    </div>
  </div>
))}


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
