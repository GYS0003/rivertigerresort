/* --- components/CancelRefundModal.jsx --------------------- */
'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export default function CancelStayModel({ isOpen, onClose, booking }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  /* reset when modal toggles */
  useEffect(() => { if (!isOpen) { setReason(''); setError(''); } }, [isOpen]);

  /* figure out refund % from days-left */
  const refundSlab = (() => {
    const daysLeft = Math.ceil(
      (new Date(booking?.eventDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft >= 7) return 100;
    if (daysLeft === 6) return 75;
    if (daysLeft === 5) return 50;
    if (daysLeft === 4) return 25;
    return 0;                     // <3 days
  })();

  async function handleSubmit() {
    if (!reason.trim()) return setError('Reason is required');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payment/refund/applied', {
        method : 'POST',
        headers: {
          'Content-Type' : 'application/json',
          Authorization  : `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingID       : booking._id,
          refundPercentage: refundSlab,
          refundAmount    : (refundSlab / 100) * booking.totalAmount,
          reason,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Request failed');
      onClose(true);               // parent will reload list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => onClose(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"   enterFrom="opacity-0"
          enterTo="opacity-100"          leave="ease-in duration-150"
          leaveFrom="opacity-100"        leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        {/* card */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200 scale-95"
            enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-150 scale-95"
            leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <Dialog.Title className="text-lg font-bold mb-4">
                Cancel Booking
              </Dialog.Title>

              {/* refund policy slab */}
              <div className="border rounded-lg p-4 mb-5 bg-amber-50">
                <p className="font-semibold mb-2">Refund Policy</p>
                {[
                  { d:'7+ days', p:100 },
                  { d:'6 days',  p:75  },
                  { d:'5 days',  p:50  },
                  { d:'4 days',  p:25  },
                  { d:'≤3 days', p:0   },
                ].map(({d,p}) => (
                  <div key={d} className="flex justify-between text-sm">
                    <span>{d}:</span>
                    <span className={p? (p>=50?'text-green-600':'text-orange-600') : 'text-red-600'}>
                      {p? `${p}%` : 'No refund'}
                    </span>
                  </div>
                ))}
              </div>

              {/* reason textarea */}
              <label className="block text-sm font-medium mb-1">
                Reason for Cancellation<span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                maxLength={200}
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full border rounded-lg p-2 mb-4"
                placeholder="Please tell us why you're cancelling…"
              />

              {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

              {/* actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => onClose(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                  disabled={loading}
                >
                  Go Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !reason.trim()}
                  className={`px-4 py-2 rounded-lg ${
                    loading || !reason.trim()
                      ? 'bg-emerald-400 text-white opacity-60'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {loading ? 'Processing…' : 'Confirm Cancellation'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
