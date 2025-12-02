import React, { useState } from 'react'import React, { useState } from 'react';

import { X, Upload, Send } from 'lucide-react'import { AlertCircle, CheckCircle, X, Loader, CreditCard } from 'lucide-react';

import { paymentService } from '../../services/api'import { phonepePaymentService } from '../../services/api.js';

import { useMutation } from '@tanstack/react-query'

const PaymentModal = ({ isOpen, onClose, cycle, groupId, groupName, userName, userEmail, userId }) => {

const PaymentModal = ({  const [loading, setLoading] = useState(false);

  isOpen,  const [error, setError] = useState('');

  onClose,  const [success, setSuccess] = useState('');

  cycle,

  groupId,  if (!isOpen) return null;

  groupName,

  userName,  // In your handlePayment function in PaymentModal.jsx

  userEmail,const handlePayment = async () => {

  userId  setLoading(true);

}) => {  setError('');

  const [proof, setProof] = useState(null)  setSuccess('');

  const [notes, setNotes] = useState('')

  const [loading, setLoading] = useState(false)  try {

  const [error, setError] = useState(null)    const amount = cycle?.potAmount || 0;

  const [success, setSuccess] = useState(false)

    if (!amount || amount <= 0) {

  const recordPaymentMutation = useMutation({      setError('Invalid payment amount');

    mutationFn: (formData) => paymentService.recordPayment(formData),      setLoading(false);

    onSuccess: () => {      return;

      setSuccess(true)    }

      setTimeout(() => {

        setProof(null)    console.log('🔄 Initiating payment for cycle:', cycle?._id, 'group:', groupId);

        setNotes('')

        setError(null)    const response = await phonepePaymentService.createPayment({

        setSuccess(false)      cycleId: cycle?._id,

        onClose()      groupId: groupId

        window.location.reload()    });

      }, 2000)

    },    console.log('✅ Payment API response:', response.data);

    onError: (error) => {

      setError(error.message || 'Failed to record payment')    if (response.data.success) {

    }      // IMMEDIATELY redirect to PhonePe, don't wait

  })      console.log('🔗 Redirecting to:', response.data.data.redirectUrl);

      window.location.href = response.data.data.redirectUrl;

  const handleSubmit = async (e) => {    } else {

    e.preventDefault()      throw new Error(response.data.message || 'Payment initiation failed');

    if (!cycle) return    }



    try {  } catch (err) {

      setLoading(true)    console.error('❌ Payment error:', err);

      setError(null)    const errorMsg = err.response?.data?.message || 'Payment initiation failed. Please try again.';

    setError(errorMsg);

      const formData = new FormData()    setLoading(false);

      formData.append('cycleId', cycle._id)  }

      formData.append('amount', cycle.potAmount || 0)  // Note: No finally block since we redirect immediately on success

      formData.append('notes', notes)};

      if (proof) {

        formData.append('proof', proof)  return (

      }    <>

      {/* Overlay */}

      recordPaymentMutation.mutate(formData)      <div 

    } catch (err) {        className="fixed inset-0 bg-black bg-opacity-50 z-40"

      setError(err.message)        onClick={onClose}

      setLoading(false)      />

    }

  }      {/* Modal */}

      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">

  if (!isOpen || !cycle) return null        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">

          {/* Header */}

  return (          <div className="flex items-center justify-between p-6 border-b border-gray-200">

    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">            <div className="flex items-center gap-3">

      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">              <CreditCard className="h-6 w-6 text-indigo-600" />

        {/* Header */}              <h2 className="text-xl font-bold text-gray-800">Make Payment</h2>

        <div className="flex justify-between items-center p-6 border-b">            </div>

          <h2 className="text-xl font-bold text-slate-900">Record Payment</h2>            <button

          <button              onClick={onClose}

            onClick={onClose}              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"

            className="text-slate-400 hover:text-slate-600"            >

          >              <X className="h-5 w-5 text-gray-500" />

            <X className="h-6 w-6" />            </button>

          </button>          </div>

        </div>

          {/* Body */}

        {/* Content */}          <div className="p-6 space-y-4">

        <div className="p-6">            {/* Group Info */}

          {success ? (            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">

            <div className="text-center py-4">              <p className="text-xs text-blue-600 uppercase tracking-wide font-semibold mb-1">

              <div className="text-green-600 text-4xl mb-2">✓</div>                Group Name

              <p className="text-green-600 font-semibold">Payment recorded successfully!</p>              </p>

              <p className="text-sm text-slate-600 mt-2">Your payment proof has been submitted for verification.</p>              <p className="text-lg font-semibold text-gray-800">{groupName}</p>

            </div>            </div>

          ) : (

            <form onSubmit={handleSubmit} className="space-y-4">            {/* Cycle Info */}

              {/* Group and Cycle Info */}            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">

              <div className="bg-slate-50 p-4 rounded-lg">              <div className="flex justify-between items-center mb-3">

                <p className="text-sm text-slate-600">Group</p>                <div>

                <p className="font-semibold text-slate-900">{groupName}</p>                  <p className="text-xs text-indigo-600 uppercase tracking-wide font-semibold">

                <p className="text-sm text-slate-600 mt-2">Cycle {cycle.cycleNumber}</p>                    Cycle Number

                <p className="font-semibold text-indigo-600 text-lg">₹{cycle.potAmount || 0}</p>                  </p>

              </div>                  <p className="text-2xl font-bold text-gray-800">

                    {cycle?.cycleNumber || 'N/A'}

              {/* User Info */}                  </p>

              <div className="text-sm text-slate-600">                </div>

                <p>Payment from: <span className="font-semibold text-slate-900">{userName}</span></p>                <div className="text-right">

                <p>Email: <span className="font-semibold text-slate-900">{userEmail}</span></p>                  <p className="text-xs text-indigo-600 uppercase tracking-wide font-semibold">

              </div>                    Payment Amount

                  </p>

              {/* File Upload */}                  <p className="text-2xl font-bold text-indigo-600">

              <div>                    ₹{cycle?.potAmount || 0}

                <label className="block text-sm font-medium text-slate-700 mb-2">                  </p>

                  Upload Payment Proof                </div>

                </label>              </div>

                <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-500 transition">              <div className="text-sm text-indigo-700">

                  <div className="flex items-center space-x-2">                <p>

                    <Upload className="h-5 w-5 text-slate-400" />                  Dates: {new Date(cycle?.startDate).toLocaleDateString()} - {' '}

                    <span className="text-sm text-slate-600">                  {new Date(cycle?.endDate).toLocaleDateString()}

                      {proof ? proof.name : 'Click to upload proof'}                </p>

                    </span>              </div>

                  </div>            </div>

                  <input

                    type="file"            {/* User Info */}

                    onChange={(e) => setProof(e.target.files[0])}            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">

                    className="hidden"              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-2">

                    accept="image/*,application/pdf"                Payment Details

                  />              </p>

                </label>              <div className="space-y-2 text-sm">

              </div>                <div className="flex justify-between">

                  <span className="text-gray-600">Name:</span>

              {/* Notes */}                  <span className="font-semibold text-gray-800">{userName}</span>

              <div>                </div>

                <label className="block text-sm font-medium text-slate-700 mb-2">                <div className="flex justify-between">

                  Notes (Optional)                  <span className="text-gray-600">Email:</span>

                </label>                  <span className="font-semibold text-gray-800 truncate">{userEmail}</span>

                <textarea                </div>

                  value={notes}              </div>

                  onChange={(e) => setNotes(e.target.value)}            </div>

                  placeholder="Add any notes about this payment..."

                  rows="3"            {/* Error Message */}

                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"            {error && (

                />              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">

              </div>                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />

                <p className="text-red-700 text-sm">{error}</p>

              {/* Error Message */}              </div>

              {error && (            )}

                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">

                  <p className="text-sm text-red-600">{error}</p>            {/* Success Message */}

                </div>            {success && (

              )}              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">

                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />

              {/* Submit Button */}                <p className="text-green-700 text-sm">{success}</p>

              <button              </div>

                type="submit"            )}

                disabled={loading || !proof}

                className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition font-semibold"            {/* Info Text */}

              >            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">

                <Send className="h-4 w-4" />              <p className="text-sm text-amber-800">

                <span>{loading ? 'Submitting...' : 'Submit Payment'}</span>                ⚠️ You will be redirected to PhonePe for secure payment processing. Please do not close this window.

              </button>              </p>

            </div>

              {!proof && (          </div>

                <p className="text-xs text-slate-600 text-center">Please upload payment proof to proceed</p>

              )}          {/* Footer */}

            </form>          <div className="p-6 border-t border-gray-200 flex gap-3">

          )}            <button

        </div>              onClick={onClose}

      </div>              disabled={loading}

    </div>              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"

  )            >

}              Cancel

            </button>

export default PaymentModal            <button

              onClick={handlePayment}
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Proceed to Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentModal;
