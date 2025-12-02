// import React from 'react'
// import { Link } from 'react-router-dom'
// import { useQuery } from '@tanstack/react-query'
// import { Users, Calendar, IndianRupee, Plus, AlertCircle } from 'lucide-react'
// import { groupService } from '../services/api.js'

// const Groups = () => {
//   const { data: groupsData, isLoading, error } = useQuery({
//     queryKey: ['userGroups'],
//     queryFn: () => groupService.getUserGroups()
//   })

//   // Detailed debugging
//   console.log('=== GROUPS DEBUG INFO ===')
//   console.log('Full groupsData:', groupsData)
//   console.log('groupsData.data:', groupsData?.data)
//   console.log('Type of groupsData.data:', typeof groupsData?.data)
//   console.log('Is array?', Array.isArray(groupsData?.data))
//   console.log('Data keys:', groupsData?.data ? Object.keys(groupsData.data) : 'No data')
//   console.log('======================')

//   // Safe data extraction - handle different response structures
//   let groupsArray = []
  
//   if (groupsData?.data) {
//     if (Array.isArray(groupsData.data)) {
//       groupsArray = groupsData.data
//     } else if (groupsData.data.data && Array.isArray(groupsData.data.data)) {
//       // Handle nested data structure
//       groupsArray = groupsData.data.data
//     } else if (groupsData.data.success && Array.isArray(groupsData.data.data)) {
//       // Handle success/data structure
//       groupsArray = groupsData.data.data
//     }
//   }

//   console.log('Final groupsArray:', groupsArray)
//   console.log('Array length:', groupsArray.length)

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="loading-spinner"></div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="text-center py-12">
//         <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Groups</h2>
//         <p className="text-gray-600">{error.response?.data?.message || 'Failed to load groups'}</p>
//         <Link
//           to="/create-group"
//           className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           Create Your First Group
//         </Link>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold text-gray-800">My Groups</h1>
//         <Link
//           to="/create-group"
//           className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           <Plus className="h-4 w-4" />
//           <span>Create New Group</span>
//         </Link>
//       </div>

//       {groupsArray.length === 0 ? (
//         <div className="text-center py-12">
//           <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">No Groups Yet</h2>
//           <p className="text-gray-600 mb-6">
//             {groupsData?.data ? 'You are not a member of any groups yet.' : 'Start by creating your first peer-to-peer lending group'}
//           </p>
//           <Link
//             to="/create-group"
//             className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Create Your First Group
//           </Link>
//         </div>
//       ) : (
//         <div className="grid gap-6">
//           {groupsArray.map((member, index) => (
//             <div
//               key={member._id || `group-${index}`}
//               className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex-1">
//                   <div className="flex items-center space-x-3 mb-2">
//                     <h3 className="text-xl font-semibold text-gray-800">
//                       {member.group?.name || member.name || 'Unnamed Group'}
//                     </h3>
//                     <span className={`px-2 py-1 text-xs rounded-full ${
//                       (member.group?.status || member.status) === 'active' 
//                         ? 'bg-green-100 text-green-800'
//                         : (member.group?.status || member.status) === 'setup'
//                         ? 'bg-yellow-100 text-yellow-800'
//                         : 'bg-gray-100 text-gray-800'
//                     }`}>
//                       {(member.group?.status || member.status || 'unknown').toUpperCase()}
//                     </span>
//                   </div>
                  
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
//                     <div className="flex items-center space-x-1">
//                       <IndianRupee className="h-4 w-4" />
//                       <span>₹{member.group?.monthlyContribution || member.monthlyContribution || 0}/month</span>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       <Users className="h-4 w-4" />
//                       <span>{member.group?.groupSize || member.groupSize || 0} members</span>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       <Calendar className="h-4 w-4" />
//                       <span>{member.group?.duration || member.duration || 0} months</span>
//                     </div>
//                     <div>
//                       <span className="capitalize">{member.role || 'member'}</span>
//                     </div>
//                   </div>

//                   <div className="mt-4 flex items-center justify-between">
//                     <div>
//                       <span className="text-sm text-gray-500">
//                         Current Cycle: {member.group?.currentCycle || member.currentCycle || 0}/{member.group?.duration || member.duration || 0}
//                       </span>
//                     </div>
//                     {member.group?._id || member._id ? (
//                       <Link
//                         to={`/groups/${member.group?._id || member._id}`}
//                         className="text-blue-600 hover:text-blue-700 font-medium"
//                       >
//                         View Details →
//                       </Link>
//                     ) : (
//                       <span className="text-gray-400">No Details Available</span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// export default Groups




import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Users, Calendar, DollarSign, Plus, AlertCircle, ChevronRight, Building2, Shield } from 'lucide-react'
import { groupService } from '../services/api.js'

const Groups = () => {
  const { data: groupsData, isLoading, error } = useQuery({
    queryKey: ['userGroups'],
    queryFn: () => groupService.getUserGroups()
  })

  // Safe data extraction - handle different response structures
  let groupsArray = []
  
  if (groupsData?.data) {
    if (Array.isArray(groupsData.data)) {
      groupsArray = groupsData.data
    } else if (groupsData.data.data && Array.isArray(groupsData.data.data)) {
      groupsArray = groupsData.data.data
    } else if (groupsData.data.success && Array.isArray(groupsData.data.data)) {
      groupsArray = groupsData.data.data
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your groups...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Groups</h2>
          <p className="text-gray-600 mb-6">{error.response?.data?.message || 'Failed to load groups'}</p>
          <Link
            to="/create-group"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
          >
            <Plus className="h-4 w-4" />
            Create Your First Group
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">My Groups</h1>
              </div>
              <p className="text-gray-600">Manage your lending circles and communities</p>
            </div>
            
            <Link
              to="/create-group"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <Plus className="h-5 w-5" />
              Create New Group
            </Link>
          </div>
        </div>

        {/* Trust badge */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-gray-600">All groups are secure and verified</span>
          </div>
        </div>

        {groupsArray.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">No Groups Yet</h2>
              <p className="text-gray-600 mb-6">
                {groupsData?.data ? 'You are not a member of any groups yet.' : 'Start by creating your first peer-to-peer lending group'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/create-group"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
                >
                  Create Your First Group
                </Link>
                <Link
                  to="/groups/explore"
                  className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:border-blue-300 hover:bg-gray-50 transition-colors font-medium"
                >
                  Explore Groups
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {groupsArray.map((member, index) => (
              <div
                key={member._id || `group-${index}`}
                className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {member.group?.name || member.name || 'Unnamed Group'}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          (member.group?.status || member.status) === 'active' 
                            ? 'bg-emerald-100 text-emerald-700'
                            : (member.group?.status || member.status) === 'setup'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {(member.group?.status || member.status || 'unknown').toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          member.role === 'organizer'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {member.role || 'member'}
                        </span>
                      </div>
                    </div>
                    
                    {member.group?._id || member._id ? (
                      <Link
                        to={`/groups/${member.group?._id || member._id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    ) : null}
                  </div>

                  {/* Group Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Contribution</span>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        ₹{member.group?.monthlyContribution || member.monthlyContribution || 0}/month
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Members</span>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {member.group?.groupSize || member.groupSize || 0}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Duration</span>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {member.group?.duration || member.duration || 0} months
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-400">#</span>
                        </div>
                        <span className="text-sm text-gray-500">Current Cycle</span>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {member.group?.currentCycle || member.currentCycle || 0}/{member.group?.duration || member.duration || 0}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Created: {member.group?.createdAt || member.createdAt 
                          ? new Date(member.group?.createdAt || member.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              year: 'numeric' 
                            })
                          : 'N/A'
                        }
                      </span>
                      
                      {member.group?._id || member._id ? (
                        <Link
                          to={`/groups/${member.group?._id || member._id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                        >
                          View Details
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {groupsArray.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 border border-gray-200 rounded-xl">
                <div className="text-3xl font-bold text-gray-900 mb-2">{groupsArray.length}</div>
                <p className="text-gray-600">Total Groups</p>
                <p className="text-sm text-gray-500 mt-2">You are a member of</p>
              </div>
              
              <div className="text-center p-6 border border-gray-200 rounded-xl">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {groupsArray.filter(g => g.role === 'organizer').length}
                </div>
                <p className="text-gray-600">Organizer Roles</p>
                <p className="text-sm text-gray-500 mt-2">Groups you manage</p>
              </div>
              
              <div className="text-center p-6 border border-gray-200 rounded-xl">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ₹{groupsArray.reduce((sum, g) => sum + (g.group?.monthlyContribution || g.monthlyContribution || 0), 0)}
                </div>
                <p className="text-gray-600">Monthly Contribution</p>
                <p className="text-sm text-gray-500 mt-2">Across all groups</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Groups