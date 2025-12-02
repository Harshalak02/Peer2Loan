import React, { useState } from 'react';
import { AlertCircle, CheckCircle, X, Loader, CreditCard } from 'lucide-react';
import { phonepePaymentService } from '../../services/api.js';

const PaymentModal = ({ isOpen, onClose, cycle, groupId, groupName, userName, userEmail, userId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const amount = cycle?.potAmount || 0;
      
      if (!amount || amount <= 0) {
        setError('Invalid payment amount');
        setLoading(false);
        return;
      }

      console.log('🔄 Initiating payment for cycle:', cycle?._id, 'group:', groupId);
      
      const response = await phonepePaymentService.initiatePayment({
        amount,
        groupId,
        cycleId: cycle._id,
        userId,
        userName,
        userEmail
      });

      console.log('📱 Payment response:', response);

      if (response.success && response.data?.instrumentResponse?.redirectInfo?.url) {
        console.log('✅ Redirecting to PhonePe:', response.data.instrumentResponse.redirectInfo.url);
        // Redirect to PhonePe payment page
        window.location.href = response.data.instrumentResponse.redirectInfo.url;
      } else {
        const errorMessage = response.message || 'Payment initiation failed. Please try again.';
        console.error('❌ Payment initiation failed:', errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('💥 Payment initiation error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred during payment initiation';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          <X size={24} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <CreditCard className="mr-3 text-blue-600" size={28} />
            Make Payment
          </h2>
          <div className="text-sm text-gray-600">
            <p><strong>Group:</strong> {groupName}</p>
            <p><strong>Cycle:</strong> {cycle?.cycleNumber || 'N/A'}</p>
            <p><strong>Amount:</strong> ₹{cycle?.potAmount || 0}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
            <AlertCircle size={20} className="mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
            <CheckCircle size={20} className="mr-2 flex-shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Payment Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>You will be redirected to PhonePe to complete the payment</p>
              <p>Amount: <span className="font-semibold text-gray-900">₹{cycle?.potAmount || 0}</span></p>
              <p className="text-xs text-gray-500 mt-2">
                Secure payment powered by PhonePe
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin mr-2" size={16} />
                  Processing...
                </>
              ) : (
                'Pay with PhonePe'
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          By proceeding, you agree to the payment terms and conditions
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
