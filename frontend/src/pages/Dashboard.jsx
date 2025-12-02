import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth.jsx'
import { Users, Calendar, TrendingUp, AlertCircle, Plus, Clock, CheckCircle, DollarSign } from 'lucide-react'
import { groupService, cycleService } from '../services/api.js'
import api from '../services/api.js'
import Navbar from '../components/Layout/Navbar.jsx'

const Dashboard = () => {
  const { user } = useAuth()
  const [showPendingActions, setShowPendingActions] = useState(false)

  const { data: groupsData, isLoading: groupsLoading, error: groupsError } = useQuery({
    queryKey: ['userGroups'],
    queryFn: () => groupService.getUserGroups()
  })

  // Fetch all cycles data
  const { data: cyclesData } = useQuery({
    queryKey: ['allCycles'],
    queryFn: async () => {
      const groupsArray = groupsData?.data || []
      if (!Array.isArray(groupsArray) || groupsArray.length === 0) return []
      
      try {
        const cyclesPromises = groupsArray.map(member =>
          cycleService.getGroupCycles(member.group?._id).catch(() => ({ data: [] }))
        );
        const results = await Promise.all(cyclesPromises);
        return results.flatMap((result, idx) => {
          const cycles = Array.isArray(result.data) ? result.data : (result.data?.data ? result.data.data : []);
          return cycles.map(cycle => ({
            ...cycle,
            groupId: groupsArray[idx].group?._id,
            groupName: groupsArray[idx].group?.name
          }));
        });
      } catch (error) {
        return [];
      }
    },
    enabled: !!groupsData?.data && Array.isArray(groupsData.data) && groupsData.data.length > 0
  })

  // Fetch pending join requests for all organizer groups
  // const safeGroupsArray = Array.isArray(groupsData?.data) ? groupsData.data : [];
  // const { data: joinRequestsData } = useQuery({
  //   queryKey: ['pendingJoinRequests', safeGroupsArray.map(m => m.group?._id).join(',')],
  //   queryFn: async () => {
  //     const organizerGroups = safeGroupsArray.filter(m => m.role === 'organizer')
  //     const requestsPromises = organizerGroups.map(m =>
  //       api.get(`/join-requests/group/${m.group?._id}/pending`).then(res => {
  //         console.log('DEBUG: Pending join requests for group', m.group?._id, res.data)
  //         return { group: m.group, requests: res.data?.data || [] }
  //       }).catch((err) => {
  //         console.error('ERROR: Fetching join requests for group', m.group?._id, err)
  //         return { group: m.group, requests: [] }
  //       })
  //     )
  //     const results = await Promise.all(requestsPromises)
  //     console.log('DEBUG: All pending join requests results', results)
  //     return results
  //   },
  //   enabled: safeGroupsArray.length > 0
  // })

// Fetch pending join requests for all organizer groups
const { data: joinRequestsData } = useQuery({
  queryKey: ['pendingJoinRequests', safeGroupsArray.map(m => m.group?._id).join(',')],
  queryFn: async () => {
    const organizerGroups = safeGroupsArray.filter(m => m.role === 'organizer')
    const requestsPromises = organizerGroups.map(m =>
      api.get(`/join-requests/group/${m.group?._id}/pending`).then(res => {  // ✅ CORRECT ENDPOINT
        console.log('DEBUG: Pending join requests for group', m.group?._id, res.data)
        return { group: m.group, requests: res.data?.data || [] }
      }).catch((err) => {
        console.error('ERROR: Fetching join requests for group', m.group?._id, err)
        return { group: m.group, requests: [] }
      })
    )
    const results = await Promise.all(requestsPromises)
    console.log('DEBUG: All pending join requests results', results)
    return results
  },
  enabled: safeGroupsArray.length > 0
})


  // Calculate pending actions
  const pendingActions = useMemo(() => {
    const actions = []
    const groupsArray = Array.isArray(groupsData?.data) ? groupsData.data : []
    const cyclesArray = Array.isArray(cyclesData) ? cyclesData : []

    // For members: unpaid cycles
    groupsArray.forEach(member => {
      const groupCycles = cyclesArray.filter(c => c.groupId === member.group?._id && c.status === 'active')
      groupCycles.forEach(cycle => {
        const memberPayment = Array.isArray(cycle.payments)
          ? cycle.payments.find(p => {
              const payMemberId = p.member?._id || p.member
              return payMemberId && String(payMemberId) === String(member._id)
            })
          : null

        if (!memberPayment && member.joinedAt && cycle.status === 'active') {
          actions.push({
            id: `payment-${cycle._id}-${member._id}`,
            type: 'payment',
            groupId: member.group?._id,
            groupName: member.group?.name,
            title: `Pay for Cycle ${cycle.cycleNumber}`,
            description: `₹${member.group?.monthlyContribution} payment due`,
            amount: member.group?.monthlyContribution,
            status: 'pending',
            dueDate: cycle.endDate,
            role: 'member'
          })
        } else if (!memberPayment) {
          actions.push({
            id: `payment-${cycle._id}-${member._id}`,
            type: 'payment',
            groupId: member.group?._id,
            groupName: member.group?.name,
            title: `Pay for Cycle ${cycle.cycleNumber}`,
            description: `₹${member.group?.monthlyContribution} payment due`,
            amount: member.group?.monthlyContribution,
            status: 'pending',
            dueDate: cycle.endDate,
            role: 'member'
          })
        } else if (memberPayment.proof && !memberPayment.verified) {
          actions.push({
            id: `verify-${cycle._id}-${member._id}`,
            type: 'payment_pending',
            groupId: member.group?._id,
            groupName: member.group?.name,
            title: `Payment Verification Pending - Cycle ${cycle.cycleNumber}`,
            description: 'Awaiting organizer approval',
            amount: member.group?.monthlyContribution,
            status: 'awaiting_approval',
            role: 'member'
          })
        }
      })
    })

    // For organizers: always show pending join requests, even if cycles/contributions are empty
    // For organizers: always show pending join requests, even if cycles/contributions are empty
if (Array.isArray(joinRequestsData)) {
  joinRequestsData.forEach(({ group, requests }) => {
    const safeRequests = Array.isArray(requests) ? requests : [];
    safeRequests.forEach(request => {
      if (request.status === 'pending') {
        actions.push({
          id: `join-request-${request._id}`,
          type: 'join_request',
          groupId: group._id,
          groupName: group.name,
          title: `Pending Join Request - ${request.user?.name || 'Unknown'}`,
          description: `${request.user?.email} wants to join`,
          status: 'pending',
          requestId: request._id,
          userId: request.user?._id,
          // invitedBy removed since it's not available in the new endpoint
          requestedAt: request.createdAt,
          role: 'organizer'
        });
      }
    });
        // If no requests, but user is organizer, show a message (optional)
        if (safeRequests.length === 0) {
          // Optionally, add a placeholder action for organizers with no requests
          // actions.push({
          //   id: `no-join-requests-${group._id}`,
          //   type: 'info',
          //   groupId: group._id,
          //   groupName: group.name,
          //   title: `No pending join requests`,
          //   description: `No users have requested to join this group yet.`,
          //   status: 'info',
          //   role: 'organizer'
          // });
        }
      });
    }

    // Organizer: show pending actions even if contributions array is empty
    groupsArray.forEach(member => {
      if (member.role === 'organizer') {
        const groupCycles = cyclesArray.filter(c => c.groupId === member.group?._id)
        groupCycles.forEach(cycle => {
          if (Array.isArray(cycle.payments)) {
            cycle.payments.forEach(payment => {
              if (payment.proof && !payment.verified) {
                const memberName = payment.user?.name || payment.member?.user?.name || 'Unknown'
                actions.push({
                  id: `verify-payment-${cycle._id}-${payment._id}`,
                  type: 'verify_payment',
                  groupId: member.group?._id,
                  groupName: member.group?.name,
                  title: `Verify Payment - ${memberName}`,
                  description: `Cycle ${cycle.cycleNumber} - ₹${member.group?.monthlyContribution}`,
                  amount: member.group?.monthlyContribution,
                  status: 'awaiting_approval',
                  cycleId: cycle._id,
                  paymentId: payment._id,
                  role: 'organizer'
                })
              }
            })
          }
        })
      }
    })

    return actions.filter((action, idx, self) => self.findIndex(a => a.id === action.id) === idx)
  }, [groupsData, cyclesData, joinRequestsData])

  // Safe data extraction and fallback for missing fields
  const groupsArray = Array.isArray(groupsData?.data) ? groupsData.data : [];
  const totalGroups = groupsArray.length;

  // Use fallback for group size and contribution
  const activeCycles = useMemo(() => {
    const cyclesArray = Array.isArray(cyclesData) ? cyclesData : [];
    return cyclesArray.filter(c => c.status === 'active').length;
  }, [cyclesData]);

  const totalContributions = useMemo(() => {
    const cyclesArray = Array.isArray(cyclesData) ? cyclesData : [];
    let total = 0;
    cyclesArray.forEach(cycle => {
      if (Array.isArray(cycle.payments)) {
        cycle.payments.forEach(payment => {
          if (payment.verified) {
            // Find the group for this cycle
            const groupData = groupsArray.find(m => m.group?._id === cycle.groupId);
            // Use monthlyContribution, fallback to 0
            total += groupData?.group?.monthlyContribution || cycle.potAmount || 0;
          }
        });
      }
    });
    return total;
  }, [cyclesData, groupsArray]);

  const stats = [
    {
      title: 'Total Groups',
      value: totalGroups,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Cycles',
      value: activeCycles,
      icon: Calendar,
      color: 'green'
    },
    {
      title: 'Total Contributions',
      value: `₹${totalContributions}`,
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'Pending Actions',
      value: pendingActions.length,
      icon: AlertCircle,
      color: 'red',
      clickable: true,
      onClick: () => setShowPendingActions(!showPendingActions)
    }
  ]

  if (groupsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (groupsError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Error loading groups</h3>
          <p className="text-gray-600">Failed to load your groups. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-slate-600">Here's your lending circle overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-sm p-6 border-l-4 border-${stat.color}-500 hover:shadow-md transition-shadow ${stat.clickable ? 'cursor-pointer' : ''}`}
                onClick={stat.onClick}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                    <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pending Actions Modal */}
        {showPendingActions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Pending Actions</h2>
                <button
                  onClick={() => setShowPendingActions(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {pendingActions.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {pendingActions.map((action) => (
                    <div key={action.id} className="p-6 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => {
                      if (action.type === 'join_request') {
                        // Future: open join request detail modal or page
                        alert(`Join Request from ${action.title}\nEmail: ${action.description}\nInvited by: ${action.invitedBy}\nRequested: ${action.requestedAt ? new Date(action.requestedAt).toLocaleDateString() : ''}`)
                      }
                    }}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{action.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">{action.description}</p>
                          <p className="text-xs text-slate-500 mt-2">Group: {action.groupName}</p>
                          {action.type === 'join_request' && (
                            <>
                              <p className="text-xs text-slate-500 mt-1">Invited by: {action.invitedBy}</p>
                              <p className="text-xs text-slate-500 mt-1">Requested: {action.requestedAt ? new Date(action.requestedAt).toLocaleDateString() : ''}</p>
                            </>
                          )}
                        </div>
                        <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          action.status === 'pending' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {action.status === 'pending' ? 'Pending' : 'Awaiting Approval'}
                        </span>
                      </div>
                      {action.amount && (
                        <p className="text-sm font-medium text-slate-900 mt-2">Amount: ₹{action.amount}</p>
                      )}
                      <div className="mt-4 flex gap-2">
                        {action.type === 'payment' && (
                          <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                            Pay Now
                          </button>
                        )}
                        {action.type === 'join_request' && (
                          <>
                            <button className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                              Approve
                            </button>
                            <button className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
                              Reject
                            </button>
                          </>
                        )}
                        {action.type === 'verify_payment' && (
                          <button className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                            Verify Payment
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-6">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-slate-600">No pending actions</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Groups Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Your Groups</h2>
          {groupsArray.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groupsArray.map((member) => (
                <Link
                  key={member._id}
                  to={`/groups/${member.group?._id}`}
                  className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{member.group?.name}</h3>
                      <p className="text-sm text-slate-500">Role: {member.role}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      member.group?.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {member.group?.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>👥 {member.group?.totalMembers} members</p>
                    <p>💰 ₹{member.group?.monthlyContribution} per cycle</p>
                    <p>📅 Cycle Length: {member.group?.cycleLength} months</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">You haven't joined any lending circles yet</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Dashboard


