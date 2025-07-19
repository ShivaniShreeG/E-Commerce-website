import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BASE_URL from '../api';

function TrackingPage() {
  const { trackingId } = useParams();
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/order/track/${trackingId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.order) {
          setTrackingData(data.order);
        } else {
          setTrackingData(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [trackingId]);

  if (loading) return <div className="p-6 text-center bg-blue-50 min-h-screen">Loading...</div>;

  if (!trackingData)
    return (
      <div className="p-6 text-center text-red-600 font-semibold bg-blue-50 min-h-screen">
        Tracking information not found.
      </div>
    );

  const steps = ['Ordered', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
  const currentStepIndex = steps.indexOf(trackingData.status);

  return (
    <div className="bg-blue-50 min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">📦 Order Tracking</h2>

        {/* Order Info */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6 text-sm sm:text-base">
          <p><strong>Order ID:</strong> #{trackingData.id}</p>
          <p><strong>Status:</strong> {trackingData.status}</p>
          <p><strong>Tracking ID:</strong> {trackingData.tracking_id}</p>
          <p><strong>Estimated Delivery:</strong> {trackingData.estimated_delivery ? new Date(trackingData.estimated_delivery).toLocaleDateString() : 'TBD'}</p>
          <p><strong>Last Updated:</strong> {trackingData.status_updated_at ? new Date(trackingData.status_updated_at).toLocaleString() : 'N/A'}</p>
          <p><strong>Payment:</strong> {trackingData.payment_method} ({trackingData.payment_status})</p>
        </div>

        {/* Timeline */}
        <div className="flex items-center justify-between relative mb-8">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center w-1/5 relative">
              <div className={`w-6 h-6 rounded-full border-2 z-10 ${idx <= currentStepIndex ? 'bg-green-500 border-green-500' : 'bg-gray-300 border-gray-300'}`} />
              <span className={`text-xs mt-2 ${idx <= currentStepIndex ? 'text-green-600' : 'text-gray-400'}`}>{step}</span>
              {idx < steps.length - 1 && (
                <div className={`absolute top-3 left-1/2 transform -translate-x-0 w-full h-1 ${idx < currentStepIndex ? 'bg-green-500' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Items */}
        {trackingData.items && trackingData.items.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">🛒 Items in this Order</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {trackingData.items.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 border rounded-lg bg-gray-50 shadow-sm">
                  <img
                    src={`${item.product_image}`}
                    alt={item.product_name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div>
                    <p><strong>{item.product_name}</strong></p>
                    <p>Qty: {item.quantity}</p>
                    <p>Price: ₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Courier Info */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm text-sm text-gray-700">
          <p><strong>Courier:</strong> {trackingData.courier_name || 'Not Assigned'}</p>
          {trackingData.courier_tracking_url && (
            <p>
              <strong>External Link:</strong>{' '}
              <a
                href={trackingData.courier_tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Track Package
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrackingPage;
