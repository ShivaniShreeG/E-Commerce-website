
import React, { useEffect, useState, useMemo } from 'react';
import BASE_URL from '../api';
import AdminLayout from '../components/AdminLayout';
import Swal from 'sweetalert2';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [editedOrders, setEditedOrders] = useState({});
  const [stats, setStats] = useState({});
  const [pending, setPending] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    await Promise.all([fetchOrders(), fetchStats(), fetchPending()]);
  };

  const fetchOrders = async () => {
    const res = await fetch(`${BASE_URL}/api/admin/orders/orders-with-items`);
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
  };

  const fetchStats = async () => {
    const res = await fetch(`${BASE_URL}/api/admin/orders/stats`);
    const data = await res.json();
    setStats(data || {});
  };

  const updatePaymentStatus = async (orderId, payment_status) => {
    try {
      await fetch(`${BASE_URL}/api/admin/orders/${orderId}/payment-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status }),
      });
      Swal.fire('Success', 'Payment status updated', 'success');
      fetchOrders();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to update payment status', 'error');
    }
  };

  const fetchPending = async () => {
    const res = await fetch(`${BASE_URL}/api/admin/orders/pending`);
    const data = await res.json();
    setPending(data);
  };

  const updateOrder = async (id, status, tracking_id, estimated_delivery, courier_name, courier_tracking_url) => {
    try {
      await fetch(`${BASE_URL}/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          tracking_id,
          estimated_delivery,
          courier_name,
          courier_tracking_url,
        }),
      });
      Swal.fire('Updated!', 'Order updated successfully.', 'success');
      fetchAll();
    } catch {
      Swal.fire('Error', 'Failed to update order.', 'error');
    }
  };

  const handleOrderFieldChange = (orderId, field, value) => {
    setEditedOrders(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value
      }
    }));
  };

  const handleSaveOrder = async (order) => {
    const updates = editedOrders[order.id];
    if (!updates) return;

    await updateOrder(
      order.id,
      updates.status || order.status,
      updates.tracking_id ?? order.tracking_id,
      updates.estimated_delivery ?? order.estimated_delivery,
      updates.courier_name ?? order.courier_name,
      updates.courier_tracking_url ?? order.courier_tracking_url
    );

    setEditedOrders(prev => {
      const copy = { ...prev };
      delete copy[order.id];
      return copy;
    });
  };

  const filtered = useMemo(() =>
    orders.filter(o => {
      if (filterStatus !== 'All' && o.status !== filterStatus) return false;
      if (dateFrom && new Date(o.order_date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(o.order_date) > new Date(dateTo)) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return o.name.toLowerCase().includes(term) || o.id.toString().includes(term);
      }
      return true;
    }), [orders, filterStatus, dateFrom, dateTo, searchTerm]);

  const chartData = useMemo(() =>
    Object.entries(stats).map(([status, count]) => ({ status, count })), [stats]);

  return (
    <AdminLayout>
      <h1 className="text-2xl mb-4">Order Dashboard</h1>
      <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-6 items-start md:items-end">
              <div>
                <label>Status:</label>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border ml-2 px-2 py-1 rounded w-full md:w-auto">
                  {['All', 'Pending', 'Packed', 'Shipped', 'Delivered', 'Canceled'].map(s =>
                    <option key={s} value={s}>{s}</option>
                  )}
                </select>
              </div>
              <div>
                <label>From:</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border ml-2 px-2 py-1 rounded w-full md:w-auto" />
              </div>
              <div>
                <label>To:</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border ml-2 px-2 py-1 rounded w-full md:w-auto" />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search ID or name..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                />
              </div>
              <button
  onClick={() => {
    const csvContent = [
      ['Order ID', 'Customer Name', 'Status', 'Payment', 'Total Price', 'Date'].join(','),
      ...filtered.map(o => [
        o.id,
        `"${o.name}"`,
        o.status,
        o.payment_status,
        o.total_price,
        new Date(o.order_date).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }}
  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
>
  Export CSV
</button>

              
            </div>
      
            {/* Stats */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
              {['Pending', 'Packed', 'Shipped', 'Delivered', 'Canceled'].map(s =>
                <div key={s} className="bg-white p-4 shadow rounded w-full sm:w-40">
                  <h3 className="text-sm font-medium">{s}</h3>
                  <p className="text-xl font-bold">{stats[s] || 0}</p>
                </div>
              )}
            </div>
      
            {/* Chart */}
            <div className="h-64 mb-8 bg-white p-4 shadow rounded w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3182ce" />
                </BarChart>
              </ResponsiveContainer>
            </div>
      
            {/* Pending Summary */}
            <div className="bg-yellow-50 p-4 mb-8 rounded shadow">
              <h2 className="font-semibold mb-2">Recent Pending Orders</h2>
              <ul className="list-disc pl-5 text-sm">
                {pending.length > 0
                  ? pending.map(o =>
                    <li key={o.id}>
                      <strong>Order #{o.id}</strong> — ₹{o.total_price} — {new Date(o.order_date).toLocaleString()}
                    </li>
                  )
                  : <li>No pending orders</li>
                }
              </ul>
            </div>
      {/* Filters */}
      {/* ... (keep existing filters and stats/chart layout) */}

      <div className="space-y-6">
        {filtered.map(order => (
          <div key={order.id} className="bg-white p-6 rounded shadow">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
              <div>
                <p><strong>Order #{order.id}</strong> — ₹{order.total_price}</p>
                <p className="text-sm text-gray-500">{new Date(order.order_date).toLocaleString()}</p>
                <p><strong>Customer:</strong> {order.name}</p>
                <p><strong>Payment:</strong> {order.payment_method}</p>

                {order.status === 'Canceled' ? (
  <div className="mt-2">
    <label className="font-semibold">Payment Status:</label>
    <span className="ml-2 text-red-600 font-semibold">
      {order.payment_status || 'Unpaid'} (Locked due to cancellation)
    </span>
  </div>
) : (
  <div className="mt-2 flex gap-2 items-center">
    <label className="font-semibold">Payment Status:</label>
    <select
      value={order.payment_status || 'Unpaid'}
      onChange={(e) => {
        const newStatus = e.target.value;
        setOrders(prev =>
          prev.map(o =>
            o.id === order.id ? { ...o, payment_status: newStatus } : o
          )
        );
      }}
      className="border px-2 py-1 rounded"
    >
      <option value="Unpaid">Unpaid</option>
      <option value="Paid">Paid</option>
    </select>
    <button
      onClick={() => updatePaymentStatus(order.id, order.payment_status || 'Unpaid')}
      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
    >
      Save
    </button>
  </div>
)}


                {order.payment_method !== 'Cash on Delivery' && order.razorpay_payment_id && (
                  <p><strong>Razorpay ID:</strong> {order.razorpay_payment_id}</p>
                )}
              </div>

              <div className="text-left md:text-right space-y-2">
  <label className="font-semibold">Status:</label>
  {order.status === 'Canceled' ? (
    <p className="text-red-600 font-bold">Canceled</p>
  ) : (
    <>
      <select
        value={editedOrders[order.id]?.status || order.status}
        onChange={e => handleOrderFieldChange(order.id, 'status', e.target.value)}
        className="border px-2 py-1 rounded"
      >
        <option value="Pending">Pending</option>
        <option value="Packed">Packed</option>
        <option value="Shipped">Shipped</option>
        <option value="Delivered">Delivered</option>
      </select>

      <input
        type="text"
        placeholder="Tracking ID"
        value={editedOrders[order.id]?.tracking_id ?? order.tracking_id ?? ''}
        onChange={e => handleOrderFieldChange(order.id, 'tracking_id', e.target.value)}
        className="border px-2 py-1 rounded w-full md:w-40"
      />
      <input
        type="text"
        placeholder="Courier Name"
        value={editedOrders[order.id]?.courier_name ?? order.courier_name ?? ''}
        onChange={e => handleOrderFieldChange(order.id, 'courier_name', e.target.value)}
        className="border px-2 py-1 rounded w-full md:w-40"
      />
      <input
        type="text"
        placeholder="Courier URL"
        value={editedOrders[order.id]?.courier_tracking_url ?? order.courier_tracking_url ?? ''}
        onChange={e => handleOrderFieldChange(order.id, 'courier_tracking_url', e.target.value)}
        className="border px-2 py-1 rounded w-full md:w-40"
      />
      <label className="font-semibold">Estimated Delivery:</label>
      <input
        type="date"
        value={
          editedOrders[order.id]?.estimated_delivery ??
          (order.estimated_delivery && !isNaN(new Date(order.estimated_delivery))
            ? new Date(order.estimated_delivery).toISOString().split('T')[0]
            : '')
        }
        onChange={e => handleOrderFieldChange(order.id, 'estimated_delivery', e.target.value)}
        className="border px-2 py-1 rounded w-full md:w-40"
      />

      <button
        onClick={() => handleSaveOrder(order)}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Save
      </button>
    </>
  )}
</div>

            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
