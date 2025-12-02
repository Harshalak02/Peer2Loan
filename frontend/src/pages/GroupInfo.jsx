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

 
}

export default GroupInfo