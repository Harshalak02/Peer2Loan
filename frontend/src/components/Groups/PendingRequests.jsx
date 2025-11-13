import React from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Users, Mail, Clock, Check, X, AlertCircle } from 'lucide-react'
import api from '../../services/api.js'

const PendingRequests = ({ groupId, isOrganizer }) => {
  const { data: requestsData, isLoading, error, refetch } = useQuery({
    queryKey: ['pendingJoinRequests', groupId],
    queryFn: async () => {
      const response = await api.get(`/join-requests/group/${groupId}/pending`);
      return response.data.data;
    },
    enabled: isOrganizer && !!groupId
  })


  const approveMutation = useMutation({
    mutationFn: (requestId) => api.post(`/join-requests/${requestId}/approve`),
    onSuccess: () => {
      alert('Request approved! User has been added to the group.');
      refetch();
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to approve request');
    }
  })

  const rejectMutation = useMutation({
    mutationFn: (requestId) => api.post(`/join-requests/${requestId}/reject`, { reason: 'Request rejected by organizer' }),
    onSuccess: () => {
      alert('Request rejected.');
      refetch();
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to reject request');
    }
  })

  // Debug logging to see the actual response structure
  console.log('PendingRequests - requestsData:', requestsData)

  // Safe data extraction - handle different response structures
  let requests = []
  
  if (Array.isArray(requestsData)) {
    requests = requestsData
  }

  console.log('PendingRequests - final requests array:', requests)

  if (!isOrganizer) return null;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Join Requests</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Join Requests</h2>
        <div className="text-center py-8 text-red-600">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>Failed to load requests</p>
        </div>
      </div>
    );
  }

  // Don't render anything if there are no requests
  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Pending Join Requests</h2>
        </div>
        <div className="text-center py-8">
          <Check className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No pending join requests</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Pending Join Requests</h2>
        <p className="text-gray-600 text-sm mt-1">Approve or reject member requests</p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {request.invitedUser?.name || request.user?.name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {request.invitedUser?.email || request.user?.email || request.email || 'No email'}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Pending
                </span>
              </div>

              {request.requestMessage && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{request.requestMessage}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>Invited by: {request.invitedBy?.name || 'Organizer'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => approveMutation.mutate(request._id)}
                    disabled={approveMutation.isLoading || rejectMutation.isLoading}
                    className="flex items-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => rejectMutation.mutate(request._id)}
                    disabled={approveMutation.isLoading || rejectMutation.isLoading}
                    className="flex items-center space-x-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PendingRequests