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
    setFilteredOrders(
      filter === 'All' ? orders : orders.filter(o => o.status === filter)
    );
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
    if (!order) return alert("Order not found.");
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
  payment_method: "Cash on Delivery",
  items: selectedItems
});

    setShowReorderForm(true);
  };
  


  const submitReorder = async () => {
  const { name, email, phone, address, payment_method, items } = reorderData;
  const filteredItems = items.filter(i => i.selected).map(i => ({
    product_id: i.product_id,
    quantity: parseInt(i.newQuantity),
    price: i.price
  }));

  if (filteredItems.length === 0) {
    return Swal.fire('Warning', 'Please select at least one item.', 'warning');
  }

  try {
    const res = await fetch(`http://localhost:5000/api/order/reorder-custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, name, email, phone, address, payment_method, items: filteredItems })
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      return Swal.fire('Error', data.error || 'Reorder failed', 'error');
    }

    setShowReorderForm(false);
    await Swal.fire('Success', data.message || 'Reorder placed successfully.', 'success');

    if (payment_method === 'UPI') {
      const amount = filteredItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
      navigate('/upi-payment', {
        state: {
          amount,
          orderId: data.orderId || 'TEMP',
          name,
          email,
          phone
        }
      });
    }

  } catch (err) {
    console.error("Reorder failed:", err);
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


  const toBase64 = (url) =>
    fetch(url).then(res => res.blob()).then(blob => new Promise(resolve => {
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
    doc.setFont("helvetica", "normal");
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
    doc.setFont("helvetica", "bold");
    doc.setFillColor(230);
    doc.rect(margin, y, 170, 10, 'F');
    doc.setTextColor(0);
    doc.text('Product', margin + 2, y + 7);
    doc.text('Qty', margin + 85, y + 7);
    doc.text('Price (Rs.)', margin + 115, y + 7);
    doc.text('Total (Rs.)', margin + 150, y + 7);
    y += 12;
    doc.setFont("helvetica", "normal");
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
    doc.setFont("helvetica", "bold");
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
    <div style={{ background: "linear-gradient(to right, #ff758c, #ffb88c)",}}>
    <div style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>My Orders</h2>

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        {['All', 'Pending', 'Shipped', 'Delivered', 'Canceled'].map((status) => (
          <button key={status} onClick={() => setFilter(status)} style={{
            padding: '8px 12px', marginRight: '10px',
            backgroundColor: filter === status ? '#007bff' : '#ccc',
            color: filter === status ? '#fff' : '#000',
            border: 'none', borderRadius: '5px', cursor: 'pointer'
          }}>{status}</button>
        ))}
      </div>

      {currentOrders.map((order) => (
        <div key={order.id} style={cardStyle}>
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Date:</strong> {new Date(order.order_date).toLocaleString()}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Delivery Address:</strong> {order.address}</p>

          {Array.isArray(order.items) && order.items.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              {order.items.map((item, index) => (
                <div key={index} style={itemStyle}>
                  <img src={`http://localhost:5000/${item.product_image}`} alt={item.product_name} style={imageStyle} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{item.product_name}</p>
                    <p style={{ margin: '2px 0' }}>Qty: {item.quantity}</p>
                    <p style={{ margin: '2px 0' }}>Price: ₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p style={{ fontWeight: 'bold', marginTop: '10px' }}>Total: ₹{order.total_price}</p>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
            <button onClick={() => downloadInvoice(order)} style={buttonStyle}><FaFileInvoice style={iconStyle} /> Invoice</button>
            <button onClick={() => sendInvoiceEmail(order.id)} style={buttonStyle}><FaEnvelope style={iconStyle} /> Email</button>
            {order.status !== 'Canceled' && <button onClick={() => cancelOrder(order.id)} style={{ ...buttonStyle, backgroundColor: '#dc3545' }}><FaTimes style={iconStyle} /> Cancel</button>}
            {order.status === 'Canceled' && <button onClick={() => reorder(order.id)} style={{ ...buttonStyle, backgroundColor: '#28a745' }}><FaRedo style={iconStyle} /> Reorder</button>}
          </div>
        </div>
      ))}

      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} style={paginationBtn}>Prev</button>
        <span style={{ margin: '0 10px' }}>Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} style={paginationBtn}>Next</button>
      </div>

      {showReorderForm && reorderData && (
  <div style={overlayStyle}>
    <div style={modalStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '15px', color: '#007bff' }}>Reorder Form</h2>

      <label style={labelStyle}>Full Name</label>
      <input
        type="text"
        value={reorderData.name}
        onChange={e => setReorderData(prev => ({ ...prev, name: e.target.value }))}
        style={inputStyle}
      />

      <label style={labelStyle}>Email</label>
      <input
        type="email"
        value={reorderData.email}
        onChange={e => setReorderData(prev => ({ ...prev, email: e.target.value }))}
        style={inputStyle}
      />

      <label style={labelStyle}>Phone</label>
      <input
        type="text"
        value={reorderData.phone}
        onChange={e => setReorderData(prev => ({ ...prev, phone: e.target.value }))}
        style={inputStyle}
      />

      <label style={labelStyle}>Delivery Address</label>
      <textarea
        value={reorderData.address}
        onChange={e => setReorderData(prev => ({ ...prev, address: e.target.value }))}
        rows={3}
        style={textareaStyle}
      />

      <label style={labelStyle}>Payment Method</label>
      <select
        value={reorderData.payment_method}
        onChange={e => setReorderData(prev => ({ ...prev, payment_method: e.target.value }))}
        style={selectStyle}
      >
        <option>Cash on Delivery</option>
        <option>UPI</option>
        <option>Card</option>
        <option>Net Banking</option>
      </select>

      <h4 style={{ marginTop: '20px' }}>Select Items:</h4>
      <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '20px' }}>
        {reorderData.items.map((item, index) => (
          <div key={index} style={itemRowStyle}>
            <input
              type="checkbox"
              checked={item.selected}
              onChange={(e) => {
                const updatedItems = [...reorderData.items];
                updatedItems[index].selected = e.target.checked;
                setReorderData(prev => ({ ...prev, items: updatedItems }));
              }}
            />
            <span style={{ marginLeft: '10px', fontWeight: 'bold', flex: 1 }}>{item.product_name}</span>
            <input
              type="number"
              min={1}
              value={item.newQuantity}
              onChange={(e) => {
                const updatedItems = [...reorderData.items];
                updatedItems[index].newQuantity = e.target.value;
                setReorderData(prev => ({ ...prev, items: updatedItems }));
              }}
              style={qtyInputStyle}
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button onClick={submitReorder} style={buttonStyle}>Place Order</button>
        <button onClick={() => setShowReorderForm(false)} style={cancelButtonStyle}>Cancel</button>
      </div>
    </div>
  </div>
)}

    </div>
    </div>
  );
}

// Styles
const cardStyle = { border: '1px solid #ccc', borderRadius: '10px', padding: '20px', marginBottom: '25px', backgroundColor: '#f9f9f9', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };
const itemStyle = { display: 'flex', gap: '15px', marginBottom: '10px', backgroundColor: '#fff', padding: '10px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' };
const imageStyle = { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' };
const buttonStyle = { padding: '8px 14px', border: 'none', borderRadius: '5px', backgroundColor: '#007bff', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' };
const iconStyle = { fontSize: '14px' };
const paginationBtn = { padding: '6px 10px', margin: '0 5px', border: '1px solid #007bff', borderRadius: '4px', backgroundColor: '#007bff', color: '#fff', cursor: 'pointer', minWidth: '60px' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle = { background: '#fff', padding: '25px', borderRadius: '8px', width: '400px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' };
const labelStyle = { fontWeight: 'bold', marginBottom: '6px', display: 'block', color: '#333' };
const inputStyle = { width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '12px' };
const textareaStyle = { ...inputStyle, resize: 'vertical' };
const selectStyle = { ...inputStyle };
const itemRowStyle = { display: 'flex', alignItems: 'center', marginBottom: '10px', background: '#f1f1f1', padding: '8px', borderRadius: '6px' };
const qtyInputStyle = { width: '60px', padding: '6px', marginLeft: '10px', borderRadius: '5px', border: '1px solid #ccc' };
const cancelButtonStyle = { ...buttonStyle, backgroundColor: '#6c757d' };

export default Orders;
