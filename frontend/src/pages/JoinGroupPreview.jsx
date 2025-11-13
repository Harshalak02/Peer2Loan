import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { AlertCircle, Check, Clock, Users, IndianRupee, Calendar } from 'lucide-react'
import api from '../services/api.js'

const JoinGroupPreview = () => {
  const { accessCode } = useParams()
  const navigate = useNavigate()
  const [requestSubmitted, setRequestSubmitted] = useState(false)

  // Fetch group preview data
  const { data: previewData, isLoading, error } = useQuery({
    queryKey: ['groupPreview', accessCode],
    queryFn: async () => {
      const response = await api.post('/join-requests/preview', { accessCode });
      return response.data.data;
    },
    enabled: !!accessCode
  })

  // Mutation to submit join request
  const joinRequestMutation = useMutation({
    mutationFn: async () => {
      return api.post('/join-requests/request', { accessCode });
    },
    onSuccess: () => {
      setRequestSubmitted(true);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to submit join request');
    }
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading group details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <AlertCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-red-800">Invalid Access Code</h2>
              <p className="text-red-700 mt-1">{error.response?.data?.message || 'The access code is not valid or has expired'}</p>
              <button
                onClick={() => navigate('/join-group')}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Back to Join
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const group = previewData?.group;
  if (!group) return null;

  if (requestSubmitted) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <Check className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Request Submitted!</h2>
          <p className="text-green-700 mb-6">
            Your request to join <strong>{group.name}</strong> has been sent to the organizer.
          </p>
          <p className="text-gray-600 mb-6">
            The organizer will review your request and notify you. You can view the group details and rules while you wait.
          </p>
          <button
            onClick={() => navigate('/groups')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Go to My Groups
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Group Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{group.name}</h1>
            <p className="text-gray-600 mt-2">{group.description}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Organizer</p>
            <p className="font-semibold text-gray-800">{group.organizer?.name}</p>
            <p className="text-sm text-gray-600">{group.organizer?.email}</p>
          </div>
        </div>

        {/* Key Group Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div>
            <div className="flex items-center space-x-2 text-gray-600 mb-1">
              <IndianRupee className="h-4 w-4" />
              <span className="text-sm">Monthly Contribution</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">₹{group.monthlyContribution}</p>
          </div>
          <div>
            <div className="flex items-center space-x-2 text-gray-600 mb-1">
              <Users className="h-4 w-4" />
              <span className="text-sm">Group Size</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{group.currentMembers}/{group.groupSize}</p>
          </div>
          <div>
            <div className="flex items-center space-x-2 text-gray-600 mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Duration</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{group.duration} months</p>
          </div>
          <div>
            <div className="flex items-center space-x-2 text-gray-600 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Slots Available</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{group.groupSize - group.currentMembers}</p>
          </div>
        </div>
      </div>

      {/* Rules and Regulations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Group Rules & Regulations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Turn Order Policy */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Turn Order Policy</h3>
            <p className="text-gray-600 capitalize bg-gray-50 p-3 rounded-lg">
              {group.rules?.turnOrderPolicy || 'Fixed Order'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {group.rules?.turnOrderPolicy === 'fixed' 
                ? 'Members take turns in a predetermined order' 
                : group.rules?.turnOrderPolicy === 'random'
                ? 'Turn order is randomly assigned'
                : 'Organizer decides turn order based on need'}
            </p>
          </div>

          {/* Payment Window */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Payment Window</h3>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
              Day {group.rules?.paymentWindow?.startDay || 1} - Day {group.rules?.paymentWindow?.endDay || 7} of each month
            </p>
            <p className="text-xs text-gray-500 mt-2">All payments must be submitted within this window</p>
          </div>

          {/* Penalty Rules */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Penalty Rules</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-600">
                Late Fee: ₹{group.rules?.penaltyRules?.lateFee || 0}
              </p>
              <p className="text-gray-600">
                Grace Period: {group.rules?.penaltyRules?.gracePeriod || 0} days
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">Applied after grace period expires</p>
          </div>

          {/* Auto-Apply Penalty */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Auto-Apply Penalty</h3>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
              {group.rules?.penaltyRules?.autoApply ? '✓ Enabled' : '✗ Disabled'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {group.rules?.penaltyRules?.autoApply
                ? 'Penalties are automatically applied'
                : 'Penalties require manual approval'}
            </p>
          </div>
        </div>
      </div>

      {/* Join Request Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div className="flex items-center space-x-4">
          <Clock className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-800">Ready to Join?</h3>
            <p className="text-blue-700 text-sm mt-1">
              Click below to submit your request. The organizer will review and approve or reject your request.
            </p>
          </div>
          <button
            onClick={() => joinRequestMutation.mutate()}
            disabled={joinRequestMutation.isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold whitespace-nowrap"
          >
            {joinRequestMutation.isLoading ? 'Submitting...' : 'Request to Join'}
          </button>
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/join-group')}
        className="text-blue-600 hover:text-blue-700 font-medium"
      >
        ← Back to Join Group
      </button>
    </div>
  )
}

export default JoinGroupPreview
