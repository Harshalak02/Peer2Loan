// import React, { useState, useMemo } from 'react'
// import { Link } from 'react-router-dom'
// import { useQuery } from '@tanstack/react-query'
// import { useAuth } from '../hooks/useAuth.jsx'
// import { Users, Calendar, TrendingUp, AlertCircle, Plus, Clock, CheckCircle, DollarSign } from 'lucide-react'
// import { groupService, cycleService } from '../services/api.js'
// import api from '../services/api.js'
// import Navbar from '../components/Layout/Navbar.jsx'

// const Dashboard = () => {
//   const { user } = useAuth()
//   const [showPendingActions, setShowPendingActions] = useState(false)

//   const { data: groupsData, isLoading: groupsLoading, error: groupsError } = useQuery({
//     queryKey: ['userGroups'],
//     queryFn: () => groupService.getUserGroups()
//   })

//   // Fetch all cycles data
//   const { data: cyclesData } = useQuery({
//     queryKey: ['allCycles'],
//     queryFn: async () => {
//       const groupsArray = groupsData?.data || []
//       if (!Array.isArray(groupsArray) || groupsArray.length === 0) return []
      
//       try {
//         const cyclesPromises = groupsArray.map(member =>
//           cycleService.getGroupCycles(member.group?._id).catch(() => ({ data: [] }))
//         );
//         const results = await Promise.all(cyclesPromises);
//         return results.flatMap((result, idx) => {
//           const cycles = Array.isArray(result.data) ? result.data : (result.data?.data ? result.data.data : []);
//           return cycles.map(cycle => ({
//             ...cycle,
//             groupId: groupsArray[idx].group?._id,
//             groupName: groupsArray[idx].group?.name
//           }));
//         });
//       } catch (error) {
//         return [];
//       }
//     },
//     enabled: !!groupsData?.data && Array.isArray(groupsData.data) && groupsData.data.length > 0
//   })

//   // Fetch pending join requests for all organizer groups
//   // const safeGroupsArray = Array.isArray(groupsData?.data) ? groupsData.data : [];
//   // const { data: joinRequestsData } = useQuery({
//   //   queryKey: ['pendingJoinRequests', safeGroupsArray.map(m => m.group?._id).join(',')],
//   //   queryFn: async () => {
//   //     const organizerGroups = safeGroupsArray.filter(m => m.role === 'organizer')
//   //     const requestsPromises = organizerGroups.map(m =>
//   //       api.get(`/join-requests/group/${m.group?._id}/pending`).then(res => {
//   //         console.log('DEBUG: Pending join requests for group', m.group?._id, res.data)
//   //         return { group: m.group, requests: res.data?.data || [] }
//   //       }).catch((err) => {
//   //         console.error('ERROR: Fetching join requests for group', m.group?._id, err)
//   //         return { group: m.group, requests: [] }
//   //       })
//   //     )
//   //     const results = await Promise.all(requestsPromises)
//   //     console.log('DEBUG: All pending join requests results', results)
//   //     return results
//   //   },
//   //   enabled: safeGroupsArray.length > 0
//   // })

// // Fetch pending join requests for all organizer groups
// const { data: joinRequestsData } = useQuery({
//   queryKey: ['pendingJoinRequests', safeGroupsArray.map(m => m.group?._id).join(',')],
//   queryFn: async () => {
//     const organizerGroups = safeGroupsArray.filter(m => m.role === 'organizer')
//     const requestsPromises = organizerGroups.map(m =>
//       api.get(`/join-requests/group/${m.group?._id}/pending`).then(res => {  // ✅ CORRECT ENDPOINT
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


//   // Calculate pending actions
//   const pendingActions = useMemo(() => {
//     const actions = []
//     const groupsArray = Array.isArray(groupsData?.data) ? groupsData.data : []
//     const cyclesArray = Array.isArray(cyclesData) ? cyclesData : []

//     // For members: unpaid cycles
//     groupsArray.forEach(member => {
//       const groupCycles = cyclesArray.filter(c => c.groupId === member.group?._id && c.status === 'active')
//       groupCycles.forEach(cycle => {
//         const memberPayment = Array.isArray(cycle.payments)
//           ? cycle.payments.find(p => {
//               const payMemberId = p.member?._id || p.member
//               return payMemberId && String(payMemberId) === String(member._id)
//             })
//           : null

//         if (!memberPayment && member.joinedAt && cycle.status === 'active') {
//           actions.push({
//             id: `payment-${cycle._id}-${member._id}`,
//             type: 'payment',
//             groupId: member.group?._id,
//             groupName: member.group?.name,
//             title: `Pay for Cycle ${cycle.cycleNumber}`,
//             description: `₹${member.group?.monthlyContribution} payment due`,
//             amount: member.group?.monthlyContribution,
//             status: 'pending',
//             dueDate: cycle.endDate,
//             role: 'member'
//           })
//         } else if (!memberPayment) {
//           actions.push({
//             id: `payment-${cycle._id}-${member._id}`,
//             type: 'payment',
//             groupId: member.group?._id,
//             groupName: member.group?.name,
//             title: `Pay for Cycle ${cycle.cycleNumber}`,
//             description: `₹${member.group?.monthlyContribution} payment due`,
//             amount: member.group?.monthlyContribution,
//             status: 'pending',
//             dueDate: cycle.endDate,
//             role: 'member'
//           })
//         } else if (memberPayment.proof && !memberPayment.verified) {
//           actions.push({
//             id: `verify-${cycle._id}-${member._id}`,
//             type: 'payment_pending',
//             groupId: member.group?._id,
//             groupName: member.group?.name,
//             title: `Payment Verification Pending - Cycle ${cycle.cycleNumber}`,
//             description: 'Awaiting organizer approval',
//             amount: member.group?.monthlyContribution,
//             status: 'awaiting_approval',
//             role: 'member'
//           })
//         }
//       })
//     })

//     // For organizers: always show pending join requests, even if cycles/contributions are empty
//     // For organizers: always show pending join requests, even if cycles/contributions are empty
// if (Array.isArray(joinRequestsData)) {
//   joinRequestsData.forEach(({ group, requests }) => {
//     const safeRequests = Array.isArray(requests) ? requests : [];
//     safeRequests.forEach(request => {
//       if (request.status === 'pending') {
//         actions.push({
//           id: `join-request-${request._id}`,
//           type: 'join_request',
//           groupId: group._id,
//           groupName: group.name,
//           title: `Pending Join Request - ${request.user?.name || 'Unknown'}`,
//           description: `${request.user?.email} wants to join`,
//           status: 'pending',
//           requestId: request._id,
//           userId: request.user?._id,
//           // invitedBy removed since it's not available in the new endpoint
//           requestedAt: request.createdAt,
//           role: 'organizer'
//         });
//       }
//     });
//         // If no requests, but user is organizer, show a message (optional)
//         if (safeRequests.length === 0) {
//           // Optionally, add a placeholder action for organizers with no requests
//           // actions.push({
//           //   id: `no-join-requests-${group._id}`,
//           //   type: 'info',
//           //   groupId: group._id,
//           //   groupName: group.name,
//           //   title: `No pending join requests`,
//           //   description: `No users have requested to join this group yet.`,
//           //   status: 'info',
//           //   role: 'organizer'
//           // });
//         }
//       });
//     }

//     // Organizer: show pending actions even if contributions array is empty
//     groupsArray.forEach(member => {
//       if (member.role === 'organizer') {
//         const groupCycles = cyclesArray.filter(c => c.groupId === member.group?._id)
//         groupCycles.forEach(cycle => {
//           if (Array.isArray(cycle.payments)) {
//             cycle.payments.forEach(payment => {
//               if (payment.proof && !payment.verified) {
//                 const memberName = payment.user?.name || payment.member?.user?.name || 'Unknown'
//                 actions.push({
//                   id: `verify-payment-${cycle._id}-${payment._id}`,
//                   type: 'verify_payment',
//                   groupId: member.group?._id,
//                   groupName: member.group?.name,
//                   title: `Verify Payment - ${memberName}`,
//                   description: `Cycle ${cycle.cycleNumber} - ₹${member.group?.monthlyContribution}`,
//                   amount: member.group?.monthlyContribution,
//                   status: 'awaiting_approval',
//                   cycleId: cycle._id,
//                   paymentId: payment._id,
//                   role: 'organizer'
//                 })
//               }
//             })
//           }
//         })
//       }
//     })

//     return actions.filter((action, idx, self) => self.findIndex(a => a.id === action.id) === idx)
//   }, [groupsData, cyclesData, joinRequestsData])

//   // Safe data extraction and fallback for missing fields
//   const groupsArray = Array.isArray(groupsData?.data) ? groupsData.data : [];
//   const totalGroups = groupsArray.length;

//   // Use fallback for group size and contribution
//   const activeCycles = useMemo(() => {
//     const cyclesArray = Array.isArray(cyclesData) ? cyclesData : [];
//     return cyclesArray.filter(c => c.status === 'active').length;
//   }, [cyclesData]);

//   const totalContributions = useMemo(() => {
//     const cyclesArray = Array.isArray(cyclesData) ? cyclesData : [];
//     let total = 0;
//     cyclesArray.forEach(cycle => {
//       if (Array.isArray(cycle.payments)) {
//         cycle.payments.forEach(payment => {
//           if (payment.verified) {
//             // Find the group for this cycle
//             const groupData = groupsArray.find(m => m.group?._id === cycle.groupId);
//             // Use monthlyContribution, fallback to 0
//             total += groupData?.group?.monthlyContribution || cycle.potAmount || 0;
//           }
//         });
//       }
//     });
//     return total;
//   }, [cyclesData, groupsArray]);

//   const stats = [
//     {
//       title: 'Total Groups',
//       value: totalGroups,
//       icon: Users,
//       color: 'blue'
//     },
//     {
//       title: 'Active Cycles',
//       value: activeCycles,
//       icon: Calendar,
//       color: 'green'
//     },
//     {
//       title: 'Total Contributions',
//       value: `₹${totalContributions}`,
//       icon: TrendingUp,
//       color: 'purple'
//     },
//     {
//       title: 'Pending Actions',
//       value: pendingActions.length,
//       icon: AlertCircle,
//       color: 'red',
//       clickable: true,
//       onClick: () => setShowPendingActions(!showPendingActions)
//     }
//   ]

//   if (groupsLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="loading-spinner"></div>
//       </div>
//     )
//   }

//   if (groupsError) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="text-center">
//           <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-gray-800 mb-2">Error loading groups</h3>
//           <p className="text-gray-600">Failed to load your groups. Please try again.</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <>
//       <Navbar />
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 max-w-7xl mx-auto px-4 py-8">
//         {/* Welcome Section */}
//         <div className="mb-12">
//           <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {user?.name}!</h1>
//           <p className="text-slate-600">Here's your lending circle overview</p>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
//           {stats.map((stat, index) => {
//             const Icon = stat.icon
//             return (
//               <div
//                 key={index}
//                 className={`bg-white rounded-lg shadow-sm p-6 border-l-4 border-${stat.color}-500 hover:shadow-md transition-shadow ${stat.clickable ? 'cursor-pointer' : ''}`}
//                 onClick={stat.onClick}
//               >
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
//                     <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
//                   </div>
//                   <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
//                     <Icon className={`h-6 w-6 text-${stat.color}-600`} />
//                   </div>
//                 </div>
//               </div>
//             )
//           })}
//         </div>

//         {/* Pending Actions Modal */}
//         {showPendingActions && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//             <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-auto">
//               <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
//                 <h2 className="text-xl font-bold text-slate-900">Pending Actions</h2>
//                 <button
//                   onClick={() => setShowPendingActions(false)}
//                   className="text-slate-400 hover:text-slate-600"
//                 >
//                   ✕
//                 </button>
//               </div>

//               {pendingActions.length > 0 ? (
//                 <div className="divide-y divide-slate-200">
//                   {pendingActions.map((action) => (
//                     <div key={action.id} className="p-6 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => {
//                       if (action.type === 'join_request') {
//                         // Future: open join request detail modal or page
//                         alert(`Join Request from ${action.title}\nEmail: ${action.description}\nInvited by: ${action.invitedBy}\nRequested: ${action.requestedAt ? new Date(action.requestedAt).toLocaleDateString() : ''}`)
//                       }
//                     }}>
//                       <div className="flex items-start justify-between mb-2">
//                         <div className="flex-1">
//                           <h3 className="font-semibold text-slate-900">{action.title}</h3>
//                           <p className="text-sm text-slate-600 mt-1">{action.description}</p>
//                           <p className="text-xs text-slate-500 mt-2">Group: {action.groupName}</p>
//                           {action.type === 'join_request' && (
//                             <>
//                               <p className="text-xs text-slate-500 mt-1">Invited by: {action.invitedBy}</p>
//                               <p className="text-xs text-slate-500 mt-1">Requested: {action.requestedAt ? new Date(action.requestedAt).toLocaleDateString() : ''}</p>
//                             </>
//                           )}
//                         </div>
//                         <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
//                           action.status === 'pending' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
//                         }`}>
//                           {action.status === 'pending' ? 'Pending' : 'Awaiting Approval'}
//                         </span>
//                       </div>
//                       {action.amount && (
//                         <p className="text-sm font-medium text-slate-900 mt-2">Amount: ₹{action.amount}</p>
//                       )}
//                       <div className="mt-4 flex gap-2">
//                         {action.type === 'payment' && (
//                           <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
//                             Pay Now
//                           </button>
//                         )}
//                         {action.type === 'join_request' && (
//                           <>
//                             <button className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
//                               Approve
//                             </button>
//                             <button className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
//                               Reject
//                             </button>
//                           </>
//                         )}
//                         {action.type === 'verify_payment' && (
//                           <button className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
//                             Verify Payment
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-12 px-6">
//                   <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
//                   <p className="text-slate-600">No pending actions</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Groups Section */}
//         <div className="bg-white rounded-lg shadow-sm p-8">
//           <h2 className="text-xl font-bold text-slate-900 mb-6">Your Groups</h2>
//           {groupsArray.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {groupsArray.map((member) => (
//                 <Link
//                   key={member._id}
//                   to={`/groups/${member.group?._id}`}
//                   className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
//                 >
//                   <div className="flex justify-between items-start mb-4">
//                     <div>
//                       <h3 className="text-lg font-semibold text-slate-900">{member.group?.name}</h3>
//                       <p className="text-sm text-slate-500">Role: {member.role}</p>
//                     </div>
//                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                       member.group?.status === 'active'
//                         ? 'bg-green-100 text-green-700'
//                         : 'bg-gray-100 text-gray-700'
//                     }`}>
//                       {member.group?.status}
//                     </span>
//                   </div>
//                   <div className="space-y-2 text-sm text-slate-600">
//                     <p>👥 {member.group?.totalMembers} members</p>
//                     <p>💰 ₹{member.group?.monthlyContribution} per cycle</p>
//                     <p>📅 Cycle Length: {member.group?.cycleLength} months</p>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12">
//               <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
//               <p className="text-slate-600">You haven't joined any lending circles yet</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   )
// }

// export default Dashboard



// import React, { useState, useMemo, useEffect } from 'react'
// import { Link } from 'react-router-dom'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { useAuth } from '../hooks/useAuth.jsx'
// import { Users, Calendar, TrendingUp, AlertCircle, Plus, Clock, CheckCircle, DollarSign } from 'lucide-react'
// import { groupService, cycleService } from '../services/api.js'
// import api from '../services/api.js'
// import Navbar from '../components/Layout/Navbar.jsx'
// import { useNavigate } from 'react-router-dom';

// const Dashboard = () => {
//   const { user } = useAuth()
//   const [showPendingActions, setShowPendingActions] = useState(false)
//   const queryClient = useQueryClient()

//   console.log('🚀 DEBUG: Dashboard component rendering');

//   const { data: groupsData, isLoading: groupsLoading, error: groupsError } = useQuery({
//     queryKey: ['userGroups'],
//     queryFn: async () => {
//       console.log('🔄 DEBUG: Starting groups fetch...');
//       try {
//         const response = await groupService.getUserGroups();
//         console.log('✅ DEBUG: Groups API full response:', response);
//         console.log('🔍 DEBUG: Groups response.data:', response.data);
//         console.log('🔍 DEBUG: Groups response.data.data:', response.data?.data);
//         console.log('🔍 DEBUG: Is groups data array?', Array.isArray(response.data?.data));
//         console.log('🔍 DEBUG: Groups data length:', response.data?.data?.length);
//         return response;
//       } catch (error) {
//         console.error('❌ DEBUG: Groups API error:', error);
//         throw error;
//       }
//     }
//   });
//   const navigate = useNavigate();

//   // More flexible safeGroupsArray definition
//   let safeGroupsArray = [];
//   console.log('🔍 DEBUG: Raw groupsData:', groupsData);

//   if (groupsData?.data?.data && Array.isArray(groupsData.data.data)) {
//     safeGroupsArray = groupsData.data.data;
//     console.log('✅ DEBUG: Using nested groupsData.data.data array');
//   } else if (groupsData?.data && Array.isArray(groupsData.data)) {
//     safeGroupsArray = groupsData.data;
//     console.log('✅ DEBUG: Using groupsData.data array');
//   } else if (groupsData && Array.isArray(groupsData)) {
//     safeGroupsArray = groupsData;
//     console.log('✅ DEBUG: Using groupsData array directly');
//   } else {
//     console.log('❌ DEBUG: No groups array found in groupsData:', groupsData);
//   }

//   console.log('🔍 DEBUG: Final safeGroupsArray:', safeGroupsArray);
//   console.log('🔍 DEBUG: Final safeGroupsArray length:', safeGroupsArray.length);
//   console.log('🔍 DEBUG: safeGroupsArray contents:', safeGroupsArray.map(g => ({
//     groupId: g.group?._id,
//     groupName: g.group?.name,
//     role: g.role,
//     isOrganizer: g.role === 'organizer'
//   })));

//   // Temporary debug - check the actual API response
//   useEffect(() => {
//     console.log('🔍 DEBUG: groupsData full object:', groupsData);
//     console.log('🔍 DEBUG: groupsData?.data:', groupsData?.data);
//     console.log('🔍 DEBUG: groupsData?.data type:', typeof groupsData?.data);
//     console.log('🔍 DEBUG: Is groupsData?.data array?', Array.isArray(groupsData?.data));
//   }, [groupsData]);

//   // Fetch all cycles data
//   const { data: cyclesData, isLoading: cyclesLoading, error: cyclesError } = useQuery({
//     queryKey: ['allCycles', safeGroupsArray.map(m => m.group?._id).join('-')],
//     queryFn: async () => {
//       console.log('🔄 DEBUG: Starting cycles fetch');
//       console.log('🔍 DEBUG: safeGroupsArray for cycles:', safeGroupsArray);
      
//       if (!Array.isArray(safeGroupsArray) || safeGroupsArray.length === 0) {
//         console.log('🔄 DEBUG: No groups, returning empty cycles');
//         return []
//       }
      
//       try {
//         console.log('🔍 DEBUG: Fetching cycles for groups:', safeGroupsArray.map(g => g.group?._id));
        
//         const cyclesPromises = safeGroupsArray.map(member => {
//           console.log(`🔍 DEBUG: Fetching cycles for group: ${member.group?.name} (${member.group?._id})`);
//           return cycleService.getGroupCycles(member.group?._id)
//             .then(result => {
//               console.log(`✅ DEBUG: Cycles API success for ${member.group?.name}:`, result);
//               return result;
//             })
//             .catch((error) => {
//               console.error(`❌ DEBUG: Error fetching cycles for group ${member.group?._id}:`, error);
//               return { data: [] }
//             });
//         });
        
//         const results = await Promise.all(cyclesPromises);
//         console.log('🔍 DEBUG: Raw cycles results from API:', results);
        
//         const flattened = results.flatMap((result, idx) => {
//           console.log(`🔍 DEBUG: Processing result ${idx} for group ${safeGroupsArray[idx]?.group?.name}:`, result);
          
//           let cycles = [];
//           if (Array.isArray(result?.data)) {
//             cycles = result.data;
//             console.log(`✅ DEBUG: Using result.data array with ${cycles.length} cycles`);
//           } else if (result?.data?.data && Array.isArray(result.data.data)) {
//             cycles = result.data.data;
//             console.log(`✅ DEBUG: Using result.data.data array with ${cycles.length} cycles`);
//           } else if (Array.isArray(result)) {
//             cycles = result;
//             console.log(`✅ DEBUG: Using result array directly with ${cycles.length} cycles`);
//           } else {
//             console.log(`❌ DEBUG: No cycles array found in result:`, result);
//           }
          
//           console.log(`🔍 DEBUG: Extracted ${cycles.length} cycles for group ${safeGroupsArray[idx]?.group?.name}`);
          
//           // Debug each cycle's payments
//           cycles.forEach((cycle, cycleIdx) => {
//             console.log(`   Cycle ${cycleIdx + 1}:`, {
//               cycleId: cycle._id,
//               cycleNumber: cycle.cycleNumber,
//               status: cycle.status,
//               paymentsCount: Array.isArray(cycle.payments) ? cycle.payments.length : 0,
//               payments: Array.isArray(cycle.payments) ? cycle.payments.map(p => ({
//                 paymentId: p._id,
//                 memberId: p.member?._id || p.member,
//                 userId: p.user?._id || p.user,
//                 proof: p.proof,
//                 verified: p.verified,
//                 hasProofNeedsVerification: p.proof && !p.verified
//               })) : 'No payments array'
//             });
//           });
          
//           return cycles.map(cycle => ({
//             ...cycle,
//             groupId: safeGroupsArray[idx].group?._id,
//             groupName: safeGroupsArray[idx].group?.name
//           }));
//         });
        
//         console.log('✅ DEBUG: Final flattened cycles data:', flattened);
//         return flattened;
//       } catch (error) {
//         console.error('❌ DEBUG: Error in cycles fetch function:', error);
//         return [];
//       }
//     },
//     enabled: safeGroupsArray.length > 0
//   })

//   console.log('🔍 DEBUG: cyclesData:', cyclesData);
//   console.log('🔍 DEBUG: cyclesLoading:', cyclesLoading);
//   console.log('🔍 DEBUG: cyclesError:', cyclesError);

//   // Debug payment data in cycles
//   useEffect(() => {
//     if (cyclesData && Array.isArray(cyclesData)) {
//       console.log('💰 DEBUG: Analyzing cycles with payments data:');
//       let totalPaymentsNeedingVerification = 0;
      
//       cyclesData.forEach((cycle, index) => {
//         console.log(`Cycle ${index + 1} (${cycle.groupName}):`, {
//           cycleId: cycle._id,
//           cycleNumber: cycle.cycleNumber,
//           status: cycle.status,
//           paymentsCount: Array.isArray(cycle.payments) ? cycle.payments.length : 0,
//         });
        
//         // Log individual payments that need verification
//         if (Array.isArray(cycle.payments)) {
//           cycle.payments.forEach((payment, pIndex) => {
//             if (payment.proof && !payment.verified) {
//               totalPaymentsNeedingVerification++;
//               console.log(`   🔔 Payment needs verification:`, {
//                 paymentId: payment._id,
//                 member: payment.user?.name || payment.member?.user?.name || 'Unknown',
//                 proof: payment.proof,
//                 verified: payment.verified,
//                 cycle: cycle.cycleNumber,
//                 group: cycle.groupName
//               });
//             }
//           });
//         }
//       });
      
//       console.log(`💰 DEBUG: Total payments needing verification: ${totalPaymentsNeedingVerification}`);
//     } else if (cyclesLoading) {
//       console.log('🔄 DEBUG: Cycles data is still loading...');
//     } else {
//       console.log('❌ DEBUG: No cycles data available or not an array');
//     }
//   }, [cyclesData, cyclesLoading]);

//   // Fetch pending join requests for all organizer groups
//   const { data: joinRequestsData, isLoading: joinRequestsLoading } = useQuery({
//     queryKey: ['pendingJoinRequests', safeGroupsArray.map(m => m.group?._id).join(',')],
//     queryFn: async () => {
//       console.log('🔄 DEBUG: Starting join requests fetch');
      
//       const organizerGroups = safeGroupsArray.filter(m => m.role === 'organizer')
//       console.log('🔍 DEBUG: Organizer groups found:', organizerGroups.length);
//       console.log('🔍 DEBUG: Organizer groups details:', organizerGroups.map(og => ({
//         groupId: og.group?._id,
//         groupName: og.group?.name,
//         role: og.role
//       })));

//       if (organizerGroups.length === 0) {
//         console.log('🔍 DEBUG: No organizer groups found');
//         return [];
//       }

//       const requestsPromises = organizerGroups.map(m => {
//         console.log(`🔍 DEBUG: Making API call for group ${m.group?.name} (${m.group?._id})`);
//         return api.get(`/join-requests/group/${m.group?._id}/pending`).then(res => {
//           console.log(`✅ DEBUG: Success for group ${m.group?.name}`, res.data);
//           console.log(`✅ DEBUG: Requests count for ${m.group?.name}:`, res.data?.data?.length || 0);
//           return { group: m.group, requests: res.data?.data || [] }
//         }).catch((err) => {
//           console.error(`❌ DEBUG: Error for group ${m.group?.name}`, err.response?.data || err.message);
//           return { group: m.group, requests: [] }
//         })
//       });
      
//       const results = await Promise.all(requestsPromises);
//       console.log('✅ DEBUG: All join requests results', results);
      
//       const totalRequests = results.reduce((sum, result) => sum + result.requests.length, 0);
//       console.log('🔢 DEBUG: Total pending join requests across all groups', totalRequests);
      
//       return results;
//     },
//     enabled: safeGroupsArray.length > 0
//   })

//   console.log('🔍 DEBUG: joinRequestsData', joinRequestsData);
//   console.log('🔍 DEBUG: joinRequestsLoading', joinRequestsLoading);

//   // Approve join request mutation
//   const approveMutation = useMutation({
//     mutationFn: (requestId) => api.post(`/join-requests/${requestId}/approve`),
//     onSuccess: () => {
//       alert('Request approved! User has been added to the group.');
//       // Refetch the join requests to update the list
//       queryClient.invalidateQueries(['pendingJoinRequests']);
//     },
//     onError: (error) => {
//       alert(error.response?.data?.message || 'Failed to approve request');
//     }
//   })

//   // Reject join request mutation
//   const rejectMutation = useMutation({
//     mutationFn: (requestId) => api.post(`/join-requests/${requestId}/reject`, { reason: 'Request rejected by organizer' }),
//     onSuccess: () => {
//       alert('Request rejected.');
//       // Refetch the join requests to update the list
//       queryClient.invalidateQueries(['pendingJoinRequests']);
//     },
//     onError: (error) => {
//       alert(error.response?.data?.message || 'Failed to reject request');
//     }
//   })

//   // Verify payment mutation
//   const verifyPaymentMutation = useMutation({
//     mutationFn: ({ cycleId, paymentId }) => 
//       api.post(`/payments/verify`, { cycleId, paymentId }),
//     onSuccess: () => {
//       alert('Payment verified successfully!');
//       // Refetch cycles data to update the list
//       queryClient.invalidateQueries(['allCycles']);
//       queryClient.invalidateQueries(['pendingJoinRequests']);
//     },
//     onError: (error) => {
//       alert(error.response?.data?.message || 'Failed to verify payment');
//     }
//   })

//   // Calculate pending actions
//   const pendingActions = useMemo(() => {
//     console.log('🔄 DEBUG: Calculating pending actions...');
//     console.log('🔍 DEBUG: Inputs - cyclesData:', cyclesData, 'joinRequestsData:', joinRequestsData);
    
//     const actions = []
//     const cyclesArray = Array.isArray(cyclesData) ? cyclesData : [];
    
//     console.log('🔍 DEBUG: cyclesArray for pending actions', cyclesArray);
//     console.log('🔍 DEBUG: safeGroupsArray for pending actions', safeGroupsArray);

//     // For members: unpaid cycles and payment verifications pending
//     safeGroupsArray.forEach(member => {
//       console.log(`🔍 DEBUG: Processing member ${member._id} in group ${member.group?.name}, role: ${member.role}`);
//       const groupCycles = cyclesArray.filter(c => c.groupId === member.group?._id && c.status === 'active')
//       console.log(`🔍 DEBUG: Active cycles for member ${member._id}:`, groupCycles.length);
      
//       groupCycles.forEach(cycle => {
//         const memberPayment = Array.isArray(cycle.payments)
//           ? cycle.payments.find(p => {
//               const payMemberId = p.member?._id || p.member
//               const match = payMemberId && String(payMemberId) === String(member._id)
//               if (match) {
//                 console.log(`🔍 DEBUG: Found payment for member ${member._id} in cycle ${cycle._id}:`, p);
//               }
//               return match
//             })
//           : null

//         console.log(`🔍 DEBUG: Member ${member._id} payment status for cycle ${cycle._id}:`, 
//           memberPayment ? (memberPayment.verified ? 'VERIFIED' : 'PAID BUT NOT VERIFIED') : 'UNPAID');

//         if (!memberPayment && member.joinedAt && cycle.status === 'active') {
//           console.log(`➕ DEBUG: Adding payment action for member ${member._id}`);
//           actions.push({
//             id: `payment-${cycle._id}-${member._id}`,
//             type: 'payment',
//             groupId: member.group?._id,
//             groupName: member.group?.name,
//             title: `Pay for Cycle ${cycle.cycleNumber}`,
//             description: `₹${member.group?.monthlyContribution} payment due`,
//             amount: member.group?.monthlyContribution,
//             status: 'pending',
//             dueDate: cycle.endDate,
//             role: 'member'
//           })
//         } else if (memberPayment?.proof && !memberPayment.verified) {
//           console.log(`➕ DEBUG: Adding verification pending action for member ${member._id}`);
//           actions.push({
//             id: `verify-${cycle._id}-${member._id}`,
//             type: 'payment_pending',
//             groupId: member.group?._id,
//             groupName: member.group?.name,
//             title: `Payment Verification Pending - Cycle ${cycle.cycleNumber}`,
//             description: 'Awaiting organizer approval',
//             amount: member.group?.monthlyContribution,
//             status: 'awaiting_approval',
//             role: 'member'
//           })
//         }
//       })
//     })

//     // For organizers: always show pending join requests
//     if (Array.isArray(joinRequestsData)) {
//       console.log('🔍 DEBUG: Processing joinRequestsData', joinRequestsData);
//       joinRequestsData.forEach(({ group, requests }) => {
//         const safeRequests = Array.isArray(requests) ? requests : [];
//         console.log(`🔍 DEBUG: Group ${group?.name} has ${safeRequests.length} pending join requests`);
        
//         safeRequests.forEach(request => {
//           if (request.status === 'pending') {
//             console.log(`➕ DEBUG: Adding join request action for ${request.user?.name}`);
//             actions.push({
//               id: `join-request-${request._id}`,
//               type: 'join_request',
//               groupId: group._id,
//               groupName: group.name,
//               title: `Pending Join Request - ${request.user?.name || 'Unknown'}`,
//               description: `${request.user?.email} wants to join`,
//               status: 'pending',
//               requestId: request._id,
//               userId: request.user?._id,
//               requestedAt: request.createdAt,
//               role: 'organizer'
//             });
//           }
//         });
//       });
//     } else {
//       console.log('🔍 DEBUG: joinRequestsData is not an array or is undefined');
//     }

//     // Organizer: show pending payment verifications
//     safeGroupsArray.forEach(member => {
//       if (member.role === 'organizer') {
//         console.log(`🔍 DEBUG: Processing organizer ${member._id} for payment verifications in group ${member.group?.name}`);
//         const groupCycles = cyclesArray.filter(c => c.groupId === member.group?._id && c.status === 'active')
//         console.log(`🔍 DEBUG: Found ${groupCycles.length} active cycles for organizer verification`);
        
//         groupCycles.forEach(cycle => {
//           console.log(`🔍 DEBUG: Checking cycle ${cycle.cycleNumber} for unverified payments`);
//           if (Array.isArray(cycle.payments)) {
//             cycle.payments.forEach(payment => {
//               // Check if payment has proof but is not verified
//               if (payment.proof && !payment.verified) {
//                 const memberName = payment.user?.name || payment.member?.user?.name || 'Unknown User'
//                 console.log(`➕ DEBUG: Adding verify payment action for ${memberName}`);
//                 actions.push({
//                   id: `verify-payment-${cycle._id}-${payment._id}`,
//                   type: 'verify_payment',
//                   groupId: member.group?._id,
//                   groupName: member.group?.name,
//                   title: `Verify Payment - ${memberName}`,
//                   description: `Cycle ${cycle.cycleNumber} - ₹${member.group?.monthlyContribution}`,
//                   amount: member.group?.monthlyContribution,
//                   status: 'awaiting_approval',
//                   cycleId: cycle._id,
//                   paymentId: payment._id,
//                   memberName: memberName,
//                   role: 'organizer'
//                 })
//               }
//             })
//           } else {
//             console.log(`🔍 DEBUG: Cycle ${cycle.cycleNumber} has no payments array or payments is not array`);
//           }
//         })
//       }
//     })

//     const uniqueActions = actions.filter((action, idx, self) => self.findIndex(a => a.id === action.id) === idx);
//     console.log('✅ DEBUG: Final pending actions count', uniqueActions.length);
//     console.log('✅ DEBUG: Final pending actions', uniqueActions);
    
//     return uniqueActions;
//   }, [safeGroupsArray, cyclesData, joinRequestsData])

//   console.log('🔍 DEBUG: pendingActions (outside useMemo)', pendingActions);
//   console.log('🔍 DEBUG: pendingActions length', pendingActions.length);

//   // Use fallback for group size and contribution
//   const totalGroups = safeGroupsArray.length;

//   const activeCycles = useMemo(() => {
//     const cyclesArray = Array.isArray(cyclesData) ? cyclesData : [];
//     const active = cyclesArray.filter(c => c.status === 'active').length;
//     console.log('🔍 DEBUG: activeCycles', active);
//     return active;
//   }, [cyclesData]);

//   const totalContributions = useMemo(() => {
//     const cyclesArray = Array.isArray(cyclesData) ? cyclesData : [];
//     let total = 0;
//     cyclesArray.forEach(cycle => {
//       if (Array.isArray(cycle.payments)) {
//         cycle.payments.forEach(payment => {
//           if (payment.verified) {
//             const groupData = safeGroupsArray.find(m => m.group?._id === cycle.groupId);
//             total += groupData?.group?.monthlyContribution || cycle.potAmount || 0;
//           }
//         });
//       }
//     });
//     console.log('🔍 DEBUG: totalContributions', total);
//     return total;
//   }, [cyclesData, safeGroupsArray]);

//   const stats = [
//     {
//       title: 'Total Groups',
//       value: totalGroups,
//       icon: Users,
//       color: 'blue'
//     },
//     {
//       title: 'Active Cycles',
//       value: activeCycles,
//       icon: Calendar,
//       color: 'green'
//     },
//     {
//       title: 'Total Contributions',
//       value: `₹${totalContributions}`,
//       icon: TrendingUp,
//       color: 'purple'
//     },
//     {
//       title: 'Pending Actions',
//       value: pendingActions.length,
//       icon: AlertCircle,
//       color: 'red',
//       clickable: true,
//       onClick: () => {
//         console.log('🔍 DEBUG: Pending actions clicked, count:', pendingActions.length);
//         console.log('🔍 DEBUG: Pending actions details:', pendingActions);
//         setShowPendingActions(!showPendingActions);
//       }
//     }
//   ]

//   console.log('🔍 DEBUG: Stats values', stats.map(stat => ({ title: stat.title, value: stat.value })));

//   if (groupsLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="loading-spinner"></div>
//       </div>
//     )
//   }

//   if (groupsError) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="text-center">
//           <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-gray-800 mb-2">Error loading groups</h3>
//           <p className="text-gray-600">Failed to load your groups. Please try again.</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <>
      
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 max-w-7xl mx-auto px-4 py-8">
//         {/* Welcome Section */}
//         <div className="mb-12">
//           <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {user?.name}!</h1>
//           <p className="text-slate-600">Here's your lending circle overview</p>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
//           {stats.map((stat, index) => {
//             const Icon = stat.icon
//             return (
//               <div
//                 key={index}
//                 className={`bg-white rounded-lg shadow-sm p-6 border-l-4 border-${stat.color}-500 hover:shadow-md transition-shadow ${stat.clickable ? 'cursor-pointer' : ''}`}
//                 onClick={stat.onClick}
//               >
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
//                     <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
//                   </div>
//                   <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
//                     <Icon className={`h-6 w-6 text-${stat.color}-600`} />
//                   </div>
//                 </div>
//               </div>
//             )
//           })}
//         </div>

//         {/* Pending Actions Modal */}
//         {showPendingActions && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//             <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-auto">
//               <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
//                 <h2 className="text-xl font-bold text-slate-900">Pending Actions</h2>
//                 <button
//                   onClick={() => setShowPendingActions(false)}
//                   className="text-slate-400 hover:text-slate-600"
//                 >
//                   ✕
//                 </button>
//               </div>

//               {pendingActions.length > 0 ? (
//                 <div className="divide-y divide-slate-200">
//                   {pendingActions.map((action) => (
//                     <div key={action.id} className="p-6 hover:bg-slate-50 transition-colors">
//                       <div className="flex items-start justify-between mb-2">
//                         <div className="flex-1">
//                           <h3 className="font-semibold text-slate-900">{action.title}</h3>
//                           <p className="text-sm text-slate-600 mt-1">{action.description}</p>
//                           <p className="text-xs text-slate-500 mt-2">Group: {action.groupName}</p>
//                           {action.type === 'join_request' && (
//                             <>
//                               <p className="text-xs text-slate-500 mt-1">Requested: {action.requestedAt ? new Date(action.requestedAt).toLocaleDateString() : ''}</p>
//                             </>
//                           )}
//                           {action.type === 'verify_payment' && (
//                             <>
//                               <p className="text-xs text-slate-500 mt-1">Member: {action.memberName}</p>
//                               <p className="text-xs text-slate-500 mt-1">Cycle: {action.description.split(' - ')[0]}</p>
//                             </>
//                           )}
//                         </div>
//                         <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
//                           action.status === 'pending' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
//                         }`}>
//                           {action.status === 'pending' ? 'Pending' : 'Awaiting Approval'}
//                         </span>
//                       </div>
//                       {action.amount && (
//                         <p className="text-sm font-medium text-slate-900 mt-2">Amount: ₹{action.amount}</p>
//                       )}
//                       <div className="mt-4 flex gap-2">
//                         {action.type === 'payment' && (
//                           <button 
//                             onClick={() => {
//                               navigate(`/groups/${action.groupId}`);
//                             }}
//                             className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
//                           >
//                             Proceed for Payment
//                           </button>
//                         )}
//                         {action.type === 'join_request' && (
//                           <>
//                             <button 
//                               onClick={() => approveMutation.mutate(action.requestId)}
//                               disabled={approveMutation.isLoading || rejectMutation.isLoading}
//                               className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
//                             >
//                               {approveMutation.isLoading ? 'Approving...' : 'Approve'}
//                             </button>
//                             <button 
//                               onClick={() => rejectMutation.mutate(action.requestId)}
//                               disabled={approveMutation.isLoading || rejectMutation.isLoading}
//                               className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
//                             >
//                               {rejectMutation.isLoading ? 'Rejecting...' : 'Reject'}
//                             </button>
//                           </>
//                         )}
//                         {action.type === 'verify_payment' && (
//                           <button 
//                             onClick={() => verifyPaymentMutation.mutate({
//                               cycleId: action.cycleId, 
//                               paymentId: action.paymentId
//                             })}
//                             disabled={verifyPaymentMutation.isLoading}
//                             className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
//                           >
//                             {verifyPaymentMutation.isLoading ? 'Verifying...' : 'Verify Payment'}
//                           </button>
//                         )}
//                         {action.type === 'payment_pending' && (
//                           <span className="text-sm text-yellow-600 font-medium">Waiting for organizer verification</span>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-12 px-6">
//                   <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
//                   <p className="text-slate-600">No pending actions</p>
//                   <p className="text-sm text-slate-500 mt-2">All caught up! 🎉</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Groups Section */}
//         <div className="bg-white rounded-lg shadow-sm p-8">
//           <h2 className="text-xl font-bold text-slate-900 mb-6">Your Groups</h2>
//           {safeGroupsArray.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {safeGroupsArray.map((member) => (
//                 <Link
//                   key={member._id}
//                   to={`/groups/${member.group?._id}`}
//                   className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
//                 >
//                   <div className="flex justify-between items-start mb-4">
//                     <div>
//                       <h3 className="text-lg font-semibold text-slate-900">{member.group?.name}</h3>
//                       <p className="text-sm text-slate-500">Role: {member.role}</p>
//                     </div>
//                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                       member.group?.status === 'active'
//                         ? 'bg-green-100 text-green-700'
//                         : 'bg-gray-100 text-gray-700'
//                     }`}>
//                       {member.group?.status}
//                     </span>
//                   </div>
//                   <div className="space-y-2 text-sm text-slate-600">
//                     <p>👥 {member.group?.totalMembers} members</p>
//                     <p>💰 ₹{member.group?.monthlyContribution} per cycle</p>
//                     <p>📅 Cycle Length: {member.group?.cycleLength} months</p>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12">
//               <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
//               <p className="text-slate-600">You haven't joined any lending circles yet</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   )
// }

// export default Dashboard
//////////////////////////////////////////////////////////////// harshal code below 

// import React, { useState, useMemo } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { useAuth } from '../hooks/useAuth.jsx'
// import { Users, Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
// import { groupService, cycleService } from '../services/api.js'
// import api from '../services/api.js'
// import Navbar from '../components/Layout/Navbar.jsx'

// const Dashboard = () => {
//   const { user } = useAuth()
//   const [showPendingActions, setShowPendingActions] = useState(false)
//   const [searchTerm, setSearchTerm] = useState('')
//   const queryClient = useQueryClient()
//   const navigate = useNavigate()

//   const { data: groupsData, isLoading: groupsLoading, error: groupsError } = useQuery({
//     queryKey: ['userGroups'],
//     queryFn: async () => {
//       const response = await groupService.getUserGroups()
//       return response
//     }
//   })

//   // Build safeGroupsArray from different possible API shapes
//   let safeGroupsArray = []
//   if (Array.isArray(groupsData?.data?.data)) {
//     safeGroupsArray = groupsData.data.data
//   } else if (Array.isArray(groupsData?.data)) {
//     safeGroupsArray = groupsData.data
//   } else if (Array.isArray(groupsData)) {
//     safeGroupsArray = groupsData
//   }

//   // === CYCLES QUERY ===
//   const { data: cyclesData } = useQuery({
//     queryKey: ['allCycles', safeGroupsArray.map(m => m.group?._id).join('-')],
//     queryFn: async () => {
//       if (!Array.isArray(safeGroupsArray) || safeGroupsArray.length === 0) return []
//       const cyclesPromises = safeGroupsArray.map(member =>
//         cycleService
//           .getGroupCycles(member.group?._id)
//           .catch(() => ({ data: [] }))
//       )
//       const results = await Promise.all(cyclesPromises)

//       return results.flatMap((result, idx) => {
//         let cycles = []
//         if (Array.isArray(result?.data)) {
//           cycles = result.data
//         } else if (result?.data?.data && Array.isArray(result.data.data)) {
//           cycles = result.data.data
//         } else if (Array.isArray(result)) {
//           cycles = result
//         }

//         return cycles.map(cycle => ({
//           ...cycle,
//           groupId: safeGroupsArray[idx].group?._id,
//           groupName: safeGroupsArray[idx].group?.name
//         }))
//       })
//     },
//     enabled: safeGroupsArray.length > 0
//   })

//   // === JOIN REQUESTS QUERY ===
//   const { data: joinRequestsData } = useQuery({
//     queryKey: ['pendingJoinRequests', safeGroupsArray.map(m => m.group?._id).join(',')],
//     queryFn: async () => {
//       const organizerGroups = safeGroupsArray.filter(m => m.role === 'organizer')
//       if (organizerGroups.length === 0) return []

//       const requestsPromises = organizerGroups.map(m =>
//         api
//           .get(`/join-requests/group/${m.group?._id}/pending`)
//           .then(res => ({
//             group: m.group,
//             requests: res.data?.data || []
//           }))
//           .catch(() => ({
//             group: m.group,
//             requests: []
//           }))
//       )

//       const results = await Promise.all(requestsPromises)
//       return results
//     },
//     enabled: safeGroupsArray.length > 0
//   })

//   // === MUTATIONS ===
//   const approveMutation = useMutation({
//     mutationFn: (requestId) => api.post(`/join-requests/${requestId}/approve`),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['pendingJoinRequests'])
//     }
//   })

//   const rejectMutation = useMutation({
//     mutationFn: (requestId) =>
//       api.post(`/join-requests/${requestId}/reject`, {
//         reason: 'Request rejected by organizer'
//       }),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['pendingJoinRequests'])
//     }
//   })

//   const verifyPaymentMutation = useMutation({
//     mutationFn: ({ cycleId, paymentId }) =>
//       api.post(`/payments/verify`, { cycleId, paymentId }),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['allCycles'])
//       queryClient.invalidateQueries(['pendingJoinRequests'])
//     }
//   })

//   // === PENDING ACTIONS ===
//   const pendingActions = useMemo(() => {
//     const actions = []
//     const cyclesArray = Array.isArray(cyclesData) ? cyclesData : []

//     // Member-based actions (payments / verification)
//     safeGroupsArray.forEach(member => {
//       const groupCycles = cyclesArray.filter(
//         c => c.groupId === member.group?._id && c.status === 'active'
//       )

//       groupCycles.forEach(cycle => {
//         const memberPayment = Array.isArray(cycle.payments)
//           ? cycle.payments.find(p => {
//               const payMemberId = p.member?._id || p.member
//               return payMemberId && String(payMemberId) === String(member._id)
//             })
//           : null

//         if (!memberPayment && member.joinedAt && cycle.status === 'active') {
//           actions.push({
//             id: `payment-${cycle._id}-${member._id}`,
//             type: 'payment',
//             groupId: member.group?._id,
//             groupName: member.group?.name,
//             title: `Pay for Cycle ${cycle.cycleNumber}`,
//             description: `₹${member.group?.monthlyContribution} payment due`,
//             amount: member.group?.monthlyContribution,
//             status: 'pending',
//             dueDate: cycle.endDate,
//             role: 'member'
//           })
//         } else if (memberPayment?.proof && !memberPayment.verified) {
//           actions.push({
//             id: `verify-${cycle._id}-${member._id}`,
//             type: 'payment_pending',
//             groupId: member.group?._id,
//             groupName: member.group?.name,
//             title: `Payment Verification Pending - Cycle ${cycle.cycleNumber}`,
//             description: 'Awaiting organizer approval',
//             amount: member.group?.monthlyContribution,
//             status: 'awaiting_approval',
//             role: 'member'
//           })
//         }
//       })
//     })

//     // Organizer: join requests
//     if (Array.isArray(joinRequestsData)) {
//       joinRequestsData.forEach(({ group, requests }) => {
//         const safeRequests = Array.isArray(requests) ? requests : []
//         safeRequests.forEach(request => {
//           if (request.status === 'pending') {
//             actions.push({
//               id: `join-request-${request._id}`,
//               type: 'join_request',
//               groupId: group._id,
//               groupName: group.name,
//               title: `Pending Join Request - ${request.user?.name || 'Unknown'}`,
//               description: `${request.user?.email} wants to join`,
//               status: 'pending',
//               requestId: request._id,
//               userId: request.user?._id,
//               requestedAt: request.createdAt,
//               role: 'organizer'
//             })
//           }
//         })
//       })
//     }

//     // Organizer: payment verifications
//     safeGroupsArray.forEach(member => {
//       if (member.role === 'organizer') {
//         const groupCycles = cyclesArray.filter(
//           c => c.groupId === member.group?._id && c.status === 'active'
//         )

//         groupCycles.forEach(cycle => {
//           if (Array.isArray(cycle.payments)) {
//             cycle.payments.forEach(payment => {
//               if (payment.proof && !payment.verified) {
//                 const memberName =
//                   payment.user?.name ||
//                   payment.member?.user?.name ||
//                   'Unknown User'
//                 actions.push({
//                   id: `verify-payment-${cycle._id}-${payment._id}`,
//                   type: 'verify_payment',
//                   groupId: member.group?._id,
//                   groupName: member.group?.name,
//                   title: `Verify Payment - ${memberName}`,
//                   description: `Cycle ${cycle.cycleNumber} - ₹${member.group?.monthlyContribution}`,
//                   amount: member.group?.monthlyContribution,
//                   status: 'awaiting_approval',
//                   cycleId: cycle._id,
//                   paymentId: payment._id,
//                   memberName,
//                   role: 'organizer'
//                 })
//               }
//             })
//           }
//         })
//       }
//     })

//     return actions.filter(
//       (action, idx, self) => self.findIndex(a => a.id === action.id) === idx
//     )
//   }, [safeGroupsArray, cyclesData, joinRequestsData])

//   // === STATS ===
//   const totalGroups = safeGroupsArray.length

//   const activeCycles = useMemo(() => {
//     const cyclesArray = Array.isArray(cyclesData) ? cyclesData : []
//     return cyclesArray.filter(c => c.status === 'active').length
//   }, [cyclesData])

//   const totalContributions = useMemo(() => {
//     const cyclesArray = Array.isArray(cyclesData) ? cyclesData : []
//     let total = 0
//     cyclesArray.forEach(cycle => {
//       if (Array.isArray(cycle.payments)) {
//         cycle.payments.forEach(payment => {
//           if (payment.verified) {
//             const groupData = safeGroupsArray.find(
//               m => m.group?._id === cycle.groupId
//             )
//             total +=
//               groupData?.group?.monthlyContribution || cycle.potAmount || 0
//           }
//         })
//       }
//     })
//     return total
//   }, [cyclesData, safeGroupsArray])

//   const stats = [
//     {
//       title: 'Total Groups',
//       value: totalGroups,
//       icon: Users,
//       color: 'blue'
//     },
//     {
//       title: 'Active Cycles',
//       value: activeCycles,
//       icon: Calendar,
//       color: 'green'
//     },
//     {
//       title: 'Total Contributions',
//       value: `₹${totalContributions}`,
//       icon: TrendingUp,
//       color: 'purple'
//     },
//     {
//       title: 'Pending Actions',
//       value: pendingActions.length,
//       icon: AlertCircle,
//       color: 'red',
//       clickable: true,
//       onClick: () => setShowPendingActions(true)
//     }
//   ]

//   // === SEARCH FILTER (ONLY FOR DISPLAYING GROUP CARDS) ===
//   const filteredGroups = useMemo(() => {
//     if (!searchTerm.trim()) return safeGroupsArray
//     const q = searchTerm.toLowerCase()
//     return safeGroupsArray.filter(m =>
//       m.group?.name?.toLowerCase().startsWith(q)
//     )
//   }, [safeGroupsArray, searchTerm])

//   if (groupsLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="loading-spinner" />
//       </div>
//     )
//   }

//   if (groupsError) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="text-center">
//           <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-gray-800 mb-2">
//             Error loading groups
//           </h3>
//           <p className="text-gray-600">
//             Failed to load your groups. Please try again.
//           </p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <>
     
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 max-w-7xl mx-auto px-4 py-8">
//         {/* Welcome */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-slate-900 mb-2">
//             Welcome back, {user?.name}!
//           </h1>
//           <p className="text-slate-600">Here's your lending circle overview</p>
//         </div>

//         {/* Search */}
//         <div className="mb-8">
//           <input
//             type="text"
//             placeholder="Search groups by name..."
//             value={searchTerm}
//             onChange={e => setSearchTerm(e.target.value)}
//             className="w-full max-w-lg px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           />
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
//           {stats.map((stat, index) => {
//             const Icon = stat.icon
//             return (
//               <div
//                 key={index}
//                 className={`bg-white rounded-lg shadow-sm p-6 border-l-4 border-${stat.color}-500 hover:shadow-md transition-shadow ${
//                   stat.clickable ? 'cursor-pointer' : ''
//                 }`}
//                 onClick={stat.onClick}
//               >
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
//                     <p className="text-3xl font-bold text-slate-900">
//                       {stat.value}
//                     </p>
//                   </div>
//                   <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
//                     <Icon className={`h-6 w-6 text-${stat.color}-600`} />
//                   </div>
//                 </div>
//               </div>
//             )
//           })}
//         </div>

//         {/* Pending Actions Modal */}
//         {showPendingActions && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//             <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-auto">
//               <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
//                 <h2 className="text-xl font-bold text-slate-900">
//                   Pending Actions
//                 </h2>
//                 <button
//                   onClick={() => setShowPendingActions(false)}
//                   className="text-slate-400 hover:text-slate-600"
//                 >
//                   ✕
//                 </button>
//               </div>

//               {pendingActions.length > 0 ? (
//                 <div className="divide-y divide-slate-200">
//                   {pendingActions.map(action => (
//                     <div
//                       key={action.id}
//                       className="p-6 hover:bg-slate-50 transition-colors"
//                     >
//                       <div className="flex items-start justify-between mb-2">
//                         <div className="flex-1">
//                           <h3 className="font-semibold text-slate-900">
//                             {action.title}
//                           </h3>
//                           <p className="text-sm text-slate-600 mt-1">
//                             {action.description}
//                           </p>
//                           <p className="text-xs text-slate-500 mt-2">
//                             Group: {action.groupName}
//                           </p>
//                           {action.type === 'join_request' && (
//                             <p className="text-xs text-slate-500 mt-1">
//                               Requested:{' '}
//                               {action.requestedAt
//                                 ? new Date(
//                                     action.requestedAt
//                                   ).toLocaleDateString()
//                                 : ''}
//                             </p>
//                           )}
//                           {action.type === 'verify_payment' && (
//                             <>
//                               <p className="text-xs text-slate-500 mt-1">
//                                 Member: {action.memberName}
//                               </p>
//                               <p className="text-xs text-slate-500 mt-1">
//                                 Cycle:{' '}
//                                 {action.description.split(' - ')[0] || ''}
//                               </p>
//                             </>
//                           )}
//                         </div>
//                         <span
//                           className={`ml-4 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
//                             action.status === 'pending'
//                               ? 'bg-red-100 text-red-700'
//                               : 'bg-yellow-100 text-yellow-700'
//                           }`}
//                         >
//                           {action.status === 'pending'
//                             ? 'Pending'
//                             : 'Awaiting Approval'}
//                         </span>
//                       </div>

//                       {action.amount && (
//                         <p className="text-sm font-medium text-slate-900 mt-2">
//                           Amount: ₹{action.amount}
//                         </p>
//                       )}

//                       <div className="mt-4 flex gap-2 flex-wrap">
//                         {action.type === 'payment' && (
//                           <button
//                             onClick={() => navigate(`/groups/${action.groupId}`)}
//                             className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
//                           >
//                             Proceed for Payment
//                           </button>
//                         )}

//                         {action.type === 'join_request' && (
//                           <>
//                             <button
//                               onClick={() =>
//                                 approveMutation.mutate(action.requestId)
//                               }
//                               disabled={
//                                 approveMutation.isLoading ||
//                                 rejectMutation.isLoading
//                               }
//                               className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
//                             >
//                               {approveMutation.isLoading
//                                 ? 'Approving...'
//                                 : 'Approve'}
//                             </button>
//                             <button
//                               onClick={() =>
//                                 rejectMutation.mutate(action.requestId)
//                               }
//                               disabled={
//                                 approveMutation.isLoading ||
//                                 rejectMutation.isLoading
//                               }
//                               className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
//                             >
//                               {rejectMutation.isLoading
//                                 ? 'Rejecting...'
//                                 : 'Reject'}
//                             </button>
//                           </>
//                         )}

//                         {action.type === 'verify_payment' && (
//                           <button
//                             onClick={() =>
//                               verifyPaymentMutation.mutate({
//                                 cycleId: action.cycleId,
//                                 paymentId: action.paymentId
//                               })
//                             }
//                             disabled={verifyPaymentMutation.isLoading}
//                             className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
//                           >
//                             {verifyPaymentMutation.isLoading
//                               ? 'Verifying...'
//                               : 'Verify Payment'}
//                           </button>
//                         )}

//                         {action.type === 'payment_pending' && (
//                           <span className="text-sm text-yellow-600 font-medium">
//                             Waiting for organizer verification
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-12 px-6">
//                   <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
//                   <p className="text-slate-600">No pending actions</p>
//                   <p className="text-sm text-slate-500 mt-2">
//                     All caught up! 🎉
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Groups Section */}
//         <div className="bg-white rounded-lg shadow-sm p-8">
//           <h2 className="text-xl font-bold text-slate-900 mb-6">Your Groups</h2>
//           {filteredGroups.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {filteredGroups.map(member => (
//                 <Link
//                   key={member._id}
//                   to={`/groups/${member.group?._id}`}
//                   className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
//                 >
//                   <div className="flex justify-between items-start mb-4">
//                     <div>
//                       <h3 className="text-lg font-semibold text-slate-900">
//                         {member.group?.name}
//                       </h3>
//                       <p className="text-sm text-slate-500">
//                         Role: {member.role}
//                       </p>
//                     </div>
//                     <span
//                       className={`px-3 py-1 rounded-full text-xs font-medium ${
//                         member.group?.status === 'active'
//                           ? 'bg-green-100 text-green-700'
//                           : 'bg-gray-100 text-gray-700'
//                       }`}
//                     >
//                       {member.group?.status}
//                     </span>
//                   </div>
//                   <div className="space-y-2 text-sm text-slate-600">
//                     <p>👥 {member.group?.totalMembers} members</p>
//                     <p>💰 ₹{member.group?.monthlyContribution} per cycle</p>
//                     <p>📅 Cycle Length: {member.group?.cycleLength} months</p>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12">
//               <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
//               <p className="text-slate-600">
//                 {searchTerm
//                   ? `No groups found matching "${searchTerm}"`
//                   : "You haven't joined any lending circles yet"}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   )
// }

// export default Dashboard


//////////////////// new ui 
import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth.jsx'
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Search,
  Building2,
  DollarSign,
  IndianRupee,
  ArrowRight,
  ChevronRight,
  UserCheck,
  FileCheck,
  Clock,
  Plus
} from 'lucide-react'
import { groupService, cycleService } from '../services/api.js'
import api from '../services/api.js'

const Dashboard = () => {
  const { user } = useAuth()
  const [showPendingActions, setShowPendingActions] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: groupsData, isLoading: groupsLoading, error: groupsError } = useQuery({
    queryKey: ['userGroups'],
    queryFn: async () => {
      const response = await groupService.getUserGroups()
      return response
    }
  })

  // Build safeGroupsArray from different possible API shapes
  let safeGroupsArray = []
  if (Array.isArray(groupsData?.data?.data)) {
    safeGroupsArray = groupsData.data.data
  } else if (Array.isArray(groupsData?.data)) {
    safeGroupsArray = groupsData.data
  } else if (Array.isArray(groupsData)) {
    safeGroupsArray = groupsData
  }

  // Filter groups based on search
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return safeGroupsArray
    const q = searchTerm.toLowerCase()
    return safeGroupsArray.filter(m =>
      m.group?.name?.toLowerCase().includes(q)
    )
  }, [safeGroupsArray, searchTerm])

  // Cycles query
  const { data: cyclesData } = useQuery({
    queryKey: ['allCycles', safeGroupsArray.map(m => m.group?._id).join('-')],
    queryFn: async () => {
      if (!Array.isArray(safeGroupsArray) || safeGroupsArray.length === 0) return []
      const cyclesPromises = safeGroupsArray.map(member =>
        cycleService
          .getGroupCycles(member.group?._id)
          .catch(() => ({ data: [] }))
      )
      const results = await Promise.all(cyclesPromises)

      return results.flatMap((result, idx) => {
        let cycles = []
        if (Array.isArray(result?.data)) {
          cycles = result.data
        } else if (result?.data?.data && Array.isArray(result.data.data)) {
          cycles = result.data.data
        } else if (Array.isArray(result)) {
          cycles = result
        }

        return cycles.map(cycle => ({
          ...cycle,
          groupId: safeGroupsArray[idx].group?._id,
          groupName: safeGroupsArray[idx].group?.name
        }))
      })
    },
    enabled: safeGroupsArray.length > 0
  })

  // Join requests query
  const { data: joinRequestsData } = useQuery({
    queryKey: ['pendingJoinRequests', safeGroupsArray.map(m => m.group?._id).join(',')],
    queryFn: async () => {
      const organizerGroups = safeGroupsArray.filter(m => m.role === 'organizer')
      if (organizerGroups.length === 0) return []

      const requestsPromises = organizerGroups.map(m =>
        api
          .get(`/join-requests/group/${m.group?._id}/pending`)
          .then(res => ({
            group: m.group,
            requests: res.data?.data || []
          }))
          .catch(() => ({
            group: m.group,
            requests: []
          }))
      )

      const results = await Promise.all(requestsPromises)
      return results
    },
    enabled: safeGroupsArray.length > 0
  })

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (requestId) => api.post(`/join-requests/${requestId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingJoinRequests'])
    }
  })

  const rejectMutation = useMutation({
    mutationFn: (requestId) =>
      api.post(`/join-requests/${requestId}/reject`, {
        reason: 'Request rejected by organizer'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingJoinRequests'])
    }
  })

  const verifyPaymentMutation = useMutation({
    mutationFn: ({ cycleId, paymentId }) =>
      api.post(`/payments/verify`, { cycleId, paymentId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['allCycles'])
      queryClient.invalidateQueries(['pendingJoinRequests'])
    }
  })

  // Pending actions calculation
  const pendingActions = useMemo(() => {
    const actions = []
    const cyclesArray = Array.isArray(cyclesData) ? cyclesData : []

    // Member-based actions
    safeGroupsArray.forEach(member => {
      const groupCycles = cyclesArray.filter(
        c => c.groupId === member.group?._id && c.status === 'active'
      )

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
            role: 'member'
          })
        } else if (memberPayment?.proof && !memberPayment.verified) {
          actions.push({
            id: `verify-${cycle._id}-${member._id}`,
            type: 'payment_pending',
            groupId: member.group?._id,
            groupName: member.group?.name,
            title: `Payment Verification Pending`,
            description: 'Awaiting organizer approval',
            amount: member.group?.monthlyContribution,
            status: 'awaiting_approval',
            role: 'member'
          })
        }
      })
    })

    // Organizer: join requests
    if (Array.isArray(joinRequestsData)) {
      joinRequestsData.forEach(({ group, requests }) => {
        const safeRequests = Array.isArray(requests) ? requests : []
        safeRequests.forEach(request => {
          if (request.status === 'pending') {
            actions.push({
              id: `join-request-${request._id}`,
              type: 'join_request',
              groupId: group._id,
              groupName: group.name,
              title: `Pending Join Request`,
              description: `${request.user?.name || 'User'} wants to join`,
              status: 'pending',
              requestId: request._id,
              userId: request.user?._id,
              requestedAt: request.createdAt,
              role: 'organizer'
            })
          }
        })
      })
    }

    // Organizer: payment verifications
    safeGroupsArray.forEach(member => {
      if (member.role === 'organizer') {
        const groupCycles = cyclesArray.filter(
          c => c.groupId === member.group?._id && c.status === 'active'
        )

        groupCycles.forEach(cycle => {
          if (Array.isArray(cycle.payments)) {
            cycle.payments.forEach(payment => {
              if (payment.proof && !payment.verified) {
                const memberName =
                  payment.user?.name ||
                  payment.member?.user?.name ||
                  'Member'
                actions.push({
                  id: `verify-payment-${cycle._id}-${payment._id}`,
                  type: 'verify_payment',
                  groupId: member.group?._id,
                  groupName: member.group?.name,
                  title: `Verify Payment`,
                  description: `${memberName} - Cycle ${cycle.cycleNumber}`,
                  amount: member.group?.monthlyContribution,
                  status: 'awaiting_approval',
                  cycleId: cycle._id,
                  paymentId: payment._id,
                  memberName,
                  role: 'organizer'
                })
              }
            })
          }
        })
      }
    })

    return actions.filter(
      (action, idx, self) => self.findIndex(a => a.id === action.id) === idx
    )
  }, [safeGroupsArray, cyclesData, joinRequestsData])

  // Stats calculation
  const totalGroups = safeGroupsArray.length

  const activeCycles = useMemo(() => {
    const cyclesArray = Array.isArray(cyclesData) ? cyclesData : []
    return cyclesArray.filter(c => c.status === 'active').length
  }, [cyclesData])

  const totalContributions = useMemo(() => {
    const cyclesArray = Array.isArray(cyclesData) ? cyclesData : []
    let total = 0
    cyclesArray.forEach(cycle => {
      if (Array.isArray(cycle.payments)) {
        cycle.payments.forEach(payment => {
          if (payment.verified) {
            const groupData = safeGroupsArray.find(
              m => m.group?._id === cycle.groupId
            )
            total += groupData?.group?.monthlyContribution || 0
          }
        })
      }
    })
    return total
  }, [cyclesData, safeGroupsArray])

  const stats = [
    {
      title: 'Total Groups',
      value: totalGroups,
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      description: 'Active memberships'
    },
    {
      title: 'Active Cycles',
      value: activeCycles,
      icon: Calendar,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      description: 'In progress'
    },
    {
      title: 'Total Contributions',
      value: `₹${totalContributions}`,
      icon: TrendingUp,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      description: 'Lifetime amount'
    },
    {
      title: 'Pending Actions',
      value: pendingActions.length,
      icon: pendingActions.length > 0 ? AlertCircle : CheckCircle,
      bgColor: pendingActions.length > 0 ? 'bg-orange-50' : 'bg-green-50',
      iconColor: pendingActions.length > 0 ? 'text-orange-600' : 'text-green-600',
      description: pendingActions.length > 0 ? 'Requires attention' : 'All clear',
      clickable: true,
      onClick: () => setShowPendingActions(true)
    }
  ]

  if (groupsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (groupsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-gray-900 mb-3">Error loading dashboard</h3>
          <p className="text-gray-600 mb-6">Failed to load your groups. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, <span className="text-blue-600">{user?.name}</span>
                  </h1>
                  <p className="text-gray-600 mt-1">Your financial community dashboard</p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                {/* <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  {totalGroups} Groups
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                  {activeCycles} Active Cycles
                </span> */}
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                  Verified Member
                </span>
              </div>
            </div>
            
            <Link
              to="/create-group"
              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create New Group
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your groups..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow ${stat.clickable ? 'cursor-pointer hover:border-blue-300' : ''}`}
                onClick={stat.onClick}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                    {index === 3 && pendingActions.length > 0 && (
                      <p className="text-xs text-orange-600 mt-2 font-medium">
                        {pendingActions.length} action{pendingActions.length !== 1 ? 's' : ''} pending
                      </p>
                    )}
                  </div>
                  <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pending Actions Notification */}
        {/* {pendingActions.length > 0 && (
          <div 
            onClick={() => setShowPendingActions(true)}
            className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">You have {pendingActions.length} pending action{pendingActions.length !== 1 ? 's' : ''}</h3>
                  <p className="text-sm text-gray-600">Click to review and take action</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-orange-500" />
            </div>
          </div>
        )} */}

        {/* Groups Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-8 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Your Groups</h2>
                <p className="text-gray-600 mt-1">Manage and track all your peer-to-peer groups</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <p className="text-sm text-gray-500">
                  Showing {filteredGroups.length} of {safeGroupsArray.length} groups
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {filteredGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((member) => (
                  <Link
                    key={member._id}
                    to={`/groups/${member.group?._id}`}
                    className="group border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                          {member.group?.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            member.role === 'organizer'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {member.role}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            member.group?.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {member.group?.status}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Group Size</span>
                        </div>
                        <span className="font-semibold text-gray-900">{member.group?.groupSize || 0}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          
<IndianRupee className="h-4 w-4 text-gray-400" />
            
}

export default Dashboard