'use client';

import { useEffect, useState } from 'react';

/**
 * Admin page that lists refund requests
 * and lets you approve each pending item.
 *
 * • GET  /api/event/payment/refund           → list (pending + processed)
 * • POST /api/event/payment/refund/approved  → approve one booking
 */
export default function Refund() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [busyId,  setBusyId]  = useState('');

  /* helpers -------------------------------------------------------- */
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';

  const loadRefunds = async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/event/payment/refund', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Fetch failed');
      const data = await res.json();
      setRefunds(data.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const approveRefund = async (bookingID) => {
    if (!confirm('Approve and process this refund?')) return;
    setBusyId(bookingID);
    try {
      const res = await fetch('/api/event/payment/refund/approved', {
        method : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization : `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingID }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Approval failed');
      await loadRefunds();     // refresh table
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId('');
    }
  };

  /* fetch once */
  useEffect(() => { loadRefunds(); }, []);

  /* loading / error */
  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="h-12 w-12 border-t-2 border-b-2 border-emerald-500 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="max-w-lg mx-auto mt-10 text-center text-red-600">
      {error}
    </div>
  );

  /* table ---------------------------------------------------------- */
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Event Refund Requests</h1>

      {refunds.length === 0 ? (
        <p className="text-gray-600">No pending or processed refunds.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm border border-gray-200">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-2 py-2 border-b">Booking&nbsp;ID</th>
                <th className="px-2 py-2 border-b">Email</th>
                <th className="px-2 py-2 border-b">Event</th>
                <th className="px-2 py-2 border-b text-right">Amount&nbsp;(₹)</th>
                <th className="px-2 py-2 border-b">Refund&nbsp;ID</th>
                <th className="px-2 py-2 border-b text-right">Refund&nbsp;₹</th>
                <th className="px-2 py-2 border-b">Status</th>
                <th className="px-2 py-2 border-b text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {refunds.map((b, idx) => (
                <tr key={b._id} className={idx % 2 ? 'bg-gray-50' : ''}>
                  <td className="px-2 py-2 border-b">{b._id}</td>

                  <td className="px-2 py-2 border-b">{b.userEmail}</td>

                  <td className="px-2 py-2 border-b">
                    {b.items?.title || '—'}
                  </td>

                  <td className="px-2 py-2 border-b text-right font-medium text-emerald-700">
                    {b.totalAmount?.toLocaleString()}
                  </td>

                  <td className="px-2 py-2 border-b">
                    {b.refund.razorpay_refund_id || '—'}
                  </td>

                  <td className="px-2 py-2 border-b text-right font-medium text-emerald-700">
                    {b.refund.amount?.toLocaleString()}
                  </td>

                  <td className="px-2 py-2 border-b">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        b.refund.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                      {b.refund.status}
                    </span>
                  </td>

                  <td className="px-2 py-2 border-b text-center">
                    {b.refund.status === 'pending' ? (
                      <button
                        onClick={() => approveRefund(b._id)}
                        disabled={busyId === b._id}
                        className={`px-2 py-1 rounded text-white text-xs font-medium ${
                          busyId === b._id
                            ? 'bg-emerald-400 cursor-wait'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        {busyId === b._id ? 'Approving…' : 'Approve'}
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
