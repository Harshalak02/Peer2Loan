import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Users, Calendar, IndianRupee, Plus, AlertCircle } from 'lucide-react'
import { groupService } from '../services/api.js'

const Groups = () => {
  const { data: groupsData, isLoading, error } = useQuery({
    queryKey: ['userGroups'],
    queryFn: () => groupService.getUserGroups()
  })

  // Detailed debugging
  console.log('=== GROUPS DEBUG INFO ===')
  console.log('Full groupsData:', groupsData)
  console.log('groupsData.data:', groupsData?.data)
  console.log('Type of groupsData.data:', typeof groupsData?.data)
  console.log('Is array?', Array.isArray(groupsData?.data))
  console.log('Data keys:', groupsData?.data ? Object.keys(groupsData.data) : 'No data')
  console.log('======================')

  // Safe data extraction - handle different response structures
  let groupsArray = []
  
  if (groupsData?.data) {
    if (Array.isArray(groupsData.data)) {
      groupsArray = groupsData.data
    } else if (groupsData.data.data && Array.isArray(groupsData.data.data)) {
      // Handle nested data structure
      groupsArray = groupsData.data.data
    } else if (groupsData.data.success && Array.isArray(groupsData.data.data)) {
      // Handle success/data structure
      groupsArray = groupsData.data.data
    }
  }

  console.log('Final groupsArray:', groupsArray)
  console.log('Array length:', groupsArray.length)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Groups</h2>
        <p className="text-gray-600">{error.response?.data?.message || 'Failed to load groups'}</p>
        <Link
          to="/create-group"
          className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Your First Group
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">My Groups</h1>
        <Link
          to="/create-group"
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Group</span>
        </Link>
      </div>

      {groupsArray.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Groups Yet</h2>
          <p className="text-gray-600 mb-6">
            {groupsData?.data ? 'You are not a member of any groups yet.' : 'Start by creating your first peer-to-peer lending group'}
          </p>
          <Link
            to="/create-group"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Group
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {groupsArray.map((member, index) => (
            <div
              key={member._id || `group-${index}`}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {member.group?.name || member.name || 'Unnamed Group'}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      (member.group?.status || member.status) === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : (member.group?.status || member.status) === 'setup'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {(member.group?.status || member.status || 'unknown').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <IndianRupee className="h-4 w-4" />
                      <span>₹{member.group?.monthlyContribution || member.monthlyContribution || 0}/month</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{member.group?.groupSize || member.groupSize || 0} members</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{member.group?.duration || member.duration || 0} months</span>
                    </div>
                    <div>
                      <span className="capitalize">{member.role || 'member'}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500">
                        Current Cycle: {member.group?.currentCycle || member.currentCycle || 0}/{member.group?.duration || member.duration || 0}
                      </span>
                    </div>
                    {member.group?._id || member._id ? (
                      <Link
                        to={`/groups/${member.group?._id || member._id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Details →
                      </Link>
                    ) : (
                      <span className="text-gray-400">No Details Available</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Groups