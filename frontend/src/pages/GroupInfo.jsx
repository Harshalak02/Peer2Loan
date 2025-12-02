import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Users, Calendar, IndianRupee, Mail, UserCheck, Clock, AlertCircle } from 'lucide-react'
import { joinRequestService } from '../services/api.js'

const GroupInfo = () => {
  const { accessCode } = useParams()
  const navigate = useNavigate()
  const [requestMessage, setRequestMessage] = useState('')

  const { data: groupInfo, isLoading, error } = useQuery({
    queryKey: ['groupInfo', accessCode],
    queryFn: () => joinRequestService.getGroupInfo(accessCode),
    enabled: !!accessCode
  })

  const requestJoinMutation = useMutation({
    mutationFn: () => joinRequestService.requestJoin({
      accessCode,
      requestMessage
    }),
    onSuccess: () => {
      toast.success('Join request submitted! Waiting for organizer approval.')
      navigate('/groups')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit request')
    }
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-red-500 mb-4">
            <Mail className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Invalid Access Code</h1>
          <p className="text-gray-600 mb-6">
            {error.response?.data?.message || 'The access code is invalid or has expired.'}
          </p>
          <button
            onClick={() => navigate('/join-group')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Another Code
          </button>
        </div>
      </div>
    )
  }

  const group = groupInfo?.data?.group
  const organizer = groupInfo?.data?.organizer
  const memberCount = groupInfo?.data?.memberCount
  const slotsRemaining = groupInfo?.data?.slotsRemaining

  if (!group) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Group Not Found</h1>
          <p className="text-gray-600 mb-6">The group information could not be loaded.</p>
          <button
            onClick={() => navigate('/join-group')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Join Group
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Join Group</h1>
          <p className="text-gray-600 mt-1">Review group information before requesting to join</p>
        </div>

        <div className="p-6">
          {/* Group Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{group.name}</h2>
            {group.description && (
              <p className="text-gray-600 mb-6">{group.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <IndianRupee className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Monthly Contribution</p>
                  <p className="text-lg font-semibold text-gray-800">₹{group.monthlyContribution}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-600">Members</p>
                  <p className="text-lg font-semibold text-gray-800">{memberCount}/{group.groupSize}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600">Duration</p>
                  <p className="text-lg font-semibold text-gray-800">{group.duration} months</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg">
                <Clock className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-600">Slots Left</p>
                  <p className="text-lg font-semibold text-gray-800">{slotsRemaining}</p>
                </div>
              </div>
            </div>

            {/* Turn Order Policy */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Turn Order Policy</h3>
              <p className="text-gray-600 capitalize">
                {group.turnOrderPolicy?.replace('-', ' ') || 'fixed order'}
              </p>
            </div>

            {/* Organizer Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Organizer Information</h3>
              <div className="flex items-center space-x-3">
                <UserCheck className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-gray-800">{organizer?.name || 'Organizer'}</p>
                  <p className="text-sm text-gray-600">{organizer?.email || 'No email provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Join Request Form */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Request to Join</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              requestJoinMutation.mutate()
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message to Organizer (Optional)
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Tell the organizer why you want to join this group..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="3"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/join-group')}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestJoinMutation.isLoading || slotsRemaining === 0}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {requestJoinMutation.isLoading ? 'Submitting...' : 'Request to Join'}
                </button>
              </div>

              {slotsRemaining === 0 && (
                <p className="text-red-500 text-sm text-center">
                  This group is currently full. No more slots available.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GroupInfo