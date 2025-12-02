// // src/pages/GroupDetails.jsx
// import React, { useState } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { useQuery, useMutation } from '@tanstack/react-query'
// import { Users, Calendar, IndianRupee, AlertCircle, FileText } from 'lucide-react'
// import { groupService, cycleService, paymentService } from '../services/api.js'
// import InviteMembers from '../components/Groups/InviteMembers.jsx'
// import PendingRequests from '../components/Groups/PendingRequests.jsx'

// const GroupDetails = () => {
//   const { id } = useParams()
//   const navigate = useNavigate()
//   const [proofFile, setProofFile] = useState(null)
//   const [selectedCycleId, setSelectedCycleId] = useState(null)

//   // Validate ID
//   if (!id || id === 'undefined') {
//     return (
//       <div className="text-center py-12">
//         <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Group</h2>
//         <p className="text-gray-600">The group ID is missing or invalid.</p>
//       </div>
//     )
//   }

//   // Fetch group data
//   const { data: groupData, isLoading, error } = useQuery({
//     queryKey: ['group', id],
//     queryFn: () => groupService.getGroup(id),
//     enabled: !!id
//   })

//   // Fetch cycles data
//   const { data: cyclesData, isLoading: cyclesLoading, error: cyclesError } = useQuery({
//     queryKey: ['cycles', id],
//     queryFn: () => cycleService.getGroupCycles(id),
//     enabled: !!id
//   })

//   // Mutation to mark payment as paid
//   const markAsPaidMutation = useMutation({
//     mutationFn: ({ cycleId, proof }) => {
//       const formData = new FormData()
//       formData.append('cycleId', cycleId)
//       if (proof) formData.append('proof', proof)
//       return paymentService.recordPayment(formData)
//     },
//     onSuccess: () => {
//       window.location.reload() // Refresh to show updated status
//     }
//   })

//   // Track which payment is being verified for loading state
//   const [verifyingPaymentId, setVerifyingPaymentId] = useState(null)
//   // Mutation for organizer to verify payment
//   const verifyPaymentMutation = useMutation({
//     mutationFn: ({ cycleId, paymentId }) => {
//       setVerifyingPaymentId(paymentId)
//       return paymentService.verifyPayment({ cycleId, paymentId })
//     },
//     onSuccess: () => {
//       // Refetch only cycles data for a smoother UX
//       setVerifyingPaymentId(null)
//       // Use react-query's refetch for cycles
//       if (typeof window !== 'undefined' && window.location) {
//         window.location.reload()
//       }
//     },
//     onSettled: () => {
//       setVerifyingPaymentId(null)
//     }
//   })

//   const handleMarkAsPaid = (cycleId) => {
//     setSelectedCycleId(cycleId)
//   }

//   const handleProofUpload = (e) => {
//     setProofFile(e.target.files[0])
//   }

//   const handleSubmitProof = (cycleId) => {
//     markAsPaidMutation.mutate({ cycleId, proof: proofFile })
//     setProofFile(null)
//     setSelectedCycleId(null)
//   }

//   const handleVerifyPayment = (cycleId, paymentId) => {
//     verifyPaymentMutation.mutate({ cycleId, paymentId })
//   }

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
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Group</h2>
//         <p className="text-gray-600">{error.response?.data?.message || 'Failed to load group details'}</p>
//       </div>
//     )
//   }

//   const group = groupData?.data?.group
//   const members = groupData?.data?.members || []
//   // Prefer cycles from cyclesData, fallback to groupData if needed
//   let cycles = []
//   if (cyclesData?.data) {
//     if (Array.isArray(cyclesData.data)) {
//       cycles = cyclesData.data
//     } else if (cyclesData.data.data && Array.isArray(cyclesData.data.data)) {
//       cycles = cyclesData.data.data
//     }
//   } else if (groupData?.data?.cycles && Array.isArray(groupData.data.cycles)) {
//     cycles = groupData.data.cycles
//   }
//   const currentUser = groupData?.data?.currentUser

//   // Debug output for cycles and payments
//   if (typeof window !== 'undefined') {
//     console.log('DEBUG: cycles', cycles)
//     if (cycles.length > 0) {
//       cycles.forEach((cycle, idx) => {
//         console.log(`Cycle ${idx + 1}:`, cycle)
//         if (cycle.payments) {
//           console.log('Payments:', cycle.payments)
//         }
//       })
//     }
//     console.log('Current user:', currentUser)
//   }

//   if (!group) {
//     return (
//       <div className="text-center py-12">
//         <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">Group Not Found</h2>
//         <p className="text-gray-600">The group you're looking for doesn't exist or you don't have access to it.</p>
//       </div>
//     )
//   }

//   const isOrganizer = currentUser?.isOrganizer

//   // Access code section (for organizer)
//   const AccessCodeSection = () => {
//     if (!isOrganizer || !group.accessCode) return null
//     return (
//       <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
//         <h3 className="text-lg font-semibold text-blue-800">Group Access Code</h3>
//         <p className="text-3xl font-mono font-bold text-blue-700 mt-2">{group.accessCode}</p>
//         <p className="text-sm text-blue-600 mt-2">Share this code with members to join the group</p>
//       </div>
//     )
//   }

//   // Show loading if cycles are still loading
//   if (cyclesLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="loading-spinner"></div>
//       </div>
//     )
//   }
//   if (cyclesError) {
//     return (
//       <div className="text-center py-12">
//         <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Cycles</h2>
//         <p className="text-gray-600">{cyclesError.response?.data?.message || 'Failed to load payment cycles'}</p>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-8">
//       {/* Group Header */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//         <div className="flex justify-between items-start">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800">{group.name}</h1>
//             <p className="text-gray-600 mt-2">{group.description}</p>
//             <AccessCodeSection />
            
//             <div className="flex items-center space-x-4 mt-4">
//               <div className="flex items-center space-x-1">
//                 <IndianRupee className="h-5 w-5 text-gray-500" />
//                 <span className="text-lg font-semibold">₹{group.monthlyContribution}</span>
//                 <span className="text-gray-500">/month</span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <Users className="h-5 w-5 text-gray-500" />
//                 <span className="text-lg font-semibold">{group.groupSize}</span>
//                 <span className="text-gray-500">members</span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <Calendar className="h-5 w-5 text-gray-500" />
//                 <span className="text-lg font-semibold">{group.currentCycle}</span>
//                 <span className="text-gray-500">/ {group.duration} cycles</span>
//               </div>
//             </div>
//           </div>
          
//           <div className="flex items-center justify-end space-x-3">
//             <div className={`px-3 py-1 rounded-full text-sm font-medium ${
//               group.status === 'active' 
//                 ? 'bg-green-100 text-green-800'
//                 : group.status === 'setup'
//                 ? 'bg-yellow-100 text-yellow-800'
//                 : 'bg-gray-100 text-gray-800'
//             }`}>
//               {group.status.toUpperCase()}
//             </div>
//             <button
//               onClick={() => navigate(`/groups/${id}/report`)}
//               className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               <FileText className="h-4 w-4" />
//               <span>View Report</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Members Section */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//         <div className="p-6 border-b border-gray-200">
//           <h2 className="text-xl font-semibold text-gray-800">Members</h2>
//         </div>
//         <div className="p-6">
//           <div className="space-y-4">
//             {members.map((member) => (
//               <div key={member._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//                     <span className="text-blue-600 font-semibold text-sm">
//                       {member.user?.name?.charAt(0) || 'U'}
//                     </span>
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-800">{member.user?.name}</p>
//                     <p className="text-sm text-gray-500">{member.user?.email}</p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <span className={`px-2 py-1 text-xs rounded-full ${
//                     member.role === 'organizer' 
//                       ? 'bg-purple-100 text-purple-800'
//                       : 'bg-gray-100 text-gray-800'
//                   }`}>
//                     {member.role}
//                   </span>
//                   {member.turnOrder && (
//                     <p className="text-sm text-gray-500 mt-1">Turn: {member.turnOrder}</p>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Cycles Section */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//         <div className="p-6 border-b border-gray-200">
//           <h2 className="text-xl font-semibold text-gray-800">Payment Cycles</h2>
//         </div>

//       <div className="p-6">
//         {(!cycles || cycles.length === 0) ? (
//           <p className="text-gray-500 text-center">No payment cycles found yet.</p>
//         ) : (
//           <div className="space-y-3">
//             {cycles.map((cycle) => (
//               <div key={cycle._id} className="p-3 border border-gray-200 rounded-lg">
//                 <div className="flex flex-col md:flex-row justify-between items-center">
//                   <div>
//                     <p className="font-medium text-gray-800">Cycle {cycle.cycleNumber}</p>
//                     <p className="text-sm text-gray-500">
//                       {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <span className={`px-2 py-1 text-xs rounded-full ${
//                       cycle.status === 'active' 
//                         ? 'bg-green-100 text-green-800'
//                         : cycle.status === 'completed'
//                         ? 'bg-blue-100 text-blue-800'
//                         : 'bg-gray-100 text-gray-800'
//                     }`}>
//                       {cycle.status}
//                     </span>
//                     <p className="text-sm font-semibold text-gray-800 mt-1">₹{cycle.potAmount}</p>
//                   </div>
//                 </div>
//                 {/* Organizer: show all members' payments */}
//                 {isOrganizer ? (
//                   <div className="mt-4">
//                     <table className="min-w-full text-sm border">
//                       <thead>
//                         <tr className="bg-gray-100">
//                           <th className="px-2 py-1 border">Member</th>
//                           <th className="px-2 py-1 border">Status</th>
//                           <th className="px-2 py-1 border">Proof</th>
//                           <th className="px-2 py-1 border">Verification</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {members.map((member) => {
//                           // Robust payment lookup: match by member._id and user._id
//                           const payment = Array.isArray(cycle.payments)
//                             ? cycle.payments.find((p) => {
//                                 // Try to match by member._id if present, else fallback to user._id
//                                 const payMemberId = p.member?._id || p.member;
//                                 const payUserId = p.user?._id || p.user || p.member?.user?._id;
//                                 return (
//                                   (payMemberId && String(payMemberId) === String(member._id)) ||
//                                   (payUserId && String(payUserId) === String(member.user?._id))
//                                 );
//                               })
//                             : undefined;
//                           return (
//                             <tr key={member._id}>
//                               <td className="px-2 py-1 border">{member.user?.name}</td>
//                               <td className="px-2 py-1 border">
//                                 {payment ? (
//                                   payment.verified ? (
//                                     <span className="text-green-700 font-bold">Verified</span>
//                                   ) : (
//                                     <span className="text-yellow-600 font-bold">Request sent to organizer</span>
//                                   )
//                                 ) : (
//                                   <span className="text-red-600">Unpaid</span>
//                                 )}
//                               </td>
//                               <td className="px-2 py-1 border">
//                                 {payment?.proof || payment?.proofUrl ? (
//                                   <a
//                                     href={payment.proof?.startsWith('/uploads') || payment.proofUrl?.startsWith('/uploads')
//                                       ? `http://localhost:5000${payment.proof || payment.proofUrl}`
//                                       : payment.proof || payment.proofUrl}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="text-blue-600 underline"
//                                   >View</a>
//                                 ) : (
//                                   <span className="text-gray-400">-</span>
//                                 )}
//                               </td>
//                               <td className="px-2 py-1 border">
//                                 {payment ? (
//                                   payment.verified ? (
//                                     <span className="text-green-700 font-bold">Verified</span>
//                                   ) : (
//                                     <button
//                                       onClick={() => {
//                                         if (!payment._id) {
//                                           alert('Payment ID missing! Cannot verify.');
//                                           return;
//                                         }
//                                         verifyPaymentMutation.mutate({ cycleId: cycle._id, paymentId: payment._id })
//                                       }}
//                                       disabled={verifyingPaymentId === payment._id}
//                                       className="bg-green-600 text-white px-2 py-1 rounded disabled:opacity-50"
//                                     >
//                                       {verifyingPaymentId === payment._id ? 'Verifying...' : 'Verify'}
//                                     </button>
//                                   )
//                                 ) : (
//                                   <span className="text-gray-400">-</span>
//                                 )}
//                               </td>
//                             </tr>
//                           );
//                         })}
//                       </tbody>
//                     </table>
//                   </div>
//                 ) : (
//                   // Non-organizer: show only own payment actions
//                   (() => {
//                     // Robust payment lookup for current user
//                     const curId = currentUser?._id || currentUser?.membership?.user?._id;
//                     const curMemberId = currentUser?.membership?._id;
//                     const payment = Array.isArray(cycle.payments)
//                       ? cycle.payments.find((p) => {
//                           const payMemberId = p.member?._id || p.member;
//                           const payUserId = p.user?._id || p.user || p.member?.user?._id;
//                           return (
//                             (payMemberId && curMemberId && String(payMemberId) === String(curMemberId)) ||
//                             (payUserId && curId && String(payUserId) === String(curId))
//                           );
//                         })
//                       : undefined;
//                     const hasPaid = !!payment;
//                     const isVerified = payment?.verified;
//                     const proofUrl = payment?.proof || payment?.proofUrl;
//                     return (
//                       <div className="mt-4 text-right">
//                         {hasPaid ? (
//                           <div>
//                             {isVerified ? (
//                               <span className="text-green-700 font-bold ml-2">Verified</span>
//                             ) : (
//                               <span className="text-yellow-600 font-bold ml-2">Request sent to organizer</span>
//                             )}
//                             {proofUrl && (
//                               <a
//                                 href={proofUrl.startsWith('/uploads') ? `http://localhost:5000${proofUrl}` : proofUrl}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="ml-2 text-blue-600 underline"
//                               >View Proof</a>
//                             )}
//                           </div>
//                         ) : (
//                           selectedCycleId === cycle._id ? (
//                             <div className="flex flex-col items-end">
//                               <input type="file" accept="image/*,application/pdf" onChange={handleProofUpload} className="mb-2" />
//                               <button
//                                 onClick={() => handleSubmitProof(cycle._id)}
//                                 disabled={markAsPaidMutation.isLoading || !proofFile}
//                                 className="bg-blue-600 text-white px-2 py-1 rounded disabled:opacity-50"
//                               >
//                                 {markAsPaidMutation.isLoading ? 'Uploading...' : 'Submit Proof'}
//                               </button>
//                               <button
//                                 onClick={() => { setSelectedCycleId(null); setProofFile(null); }}
//                                 className="mt-1 text-sm text-gray-500 underline"
//                               >Cancel</button>
//                             </div>
//                           ) : (
//                             <button
//                               onClick={() => handleMarkAsPaid(cycle._id)}
//                               className="ml-2 bg-blue-600 text-white px-2 py-1 rounded"
//                             >
//                               Mark as Paid
//                             </button>
//                           )
//                         )}
//                       </div>
//                     );
//                   })()
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       </div>
//         {isOrganizer && <PendingRequests groupId={id} isOrganizer={isOrganizer} />}
//       {/* Invite Members (only organizer) */}
//       {isOrganizer && <InviteMembers groupId={id} groupName={group.name} />}
//     </div>
//   )
// }

// export default GroupDetails

// src/pages/GroupDetails.jsx
// import React, { useState } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { useQuery, useMutation } from '@tanstack/react-query'
// import { Users, Calendar, IndianRupee, AlertCircle, FileText } from 'lucide-react'
// import { groupService, cycleService, paymentService, phonepeService } from '../services/api.js'
// import InviteMembers from '../components/Groups/InviteMembers.jsx'
// import PendingRequests from '../components/Groups/PendingRequests.jsx'

// const GroupDetails = () => {
//   const { id } = useParams()
//   const navigate = useNavigate()
//   const [proofFile, setProofFile] = useState(null)
//   const [selectedCycleId, setSelectedCycleId] = useState(null)

//   // Validate ID
//   if (!id || id === 'undefined') {
//     return (
//       <div className="text-center py-12">
//         <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Group</h2>
//         <p className="text-gray-600">The group ID is missing or invalid.</p>
//       </div>
//     )
//   }

//   // Fetch group data
//   const { data: groupData, isLoading, error } = useQuery({
//     queryKey: ['group', id],
//     queryFn: () => groupService.getGroup(id),
//     enabled: !!id
//   })

//   // Fetch cycles data
//   const { data: cyclesData, isLoading: cyclesLoading, error: cyclesError } = useQuery({
//     queryKey: ['cycles', id],
//     queryFn: () => cycleService.getGroupCycles(id),
//     enabled: !!id
//   })

//   // Mutation to mark payment as paid
// const markAsPaidMutation = useMutation({
//   mutationFn: ({ cycleId, proof }) => {
//     const formData = new FormData()
//     formData.append('cycleId', cycleId)
//     if (proof) formData.append('proof', proof)
//     console.log('🧾 FormData contents before upload:', {
//       cycleId,
//       proofName: proof?.name,
//       proofType: proof?.type,
//     })
//     return paymentService.recordPayment(formData)
//   },
//   onSuccess: (res) => {
//     console.log('✅ Payment proof uploaded successfully:', res)
//     window.location.reload()
//   },
//   onError: (err) => {
//     console.error('❌ Payment upload failed:', err?.response?.data || err.message)
//   }
// })


//   // Track which payment is being verified for loading state
//   const [verifyingPaymentId, setVerifyingPaymentId] = useState(null)
//   // Mutation for organizer to verify payment
//   const verifyPaymentMutation = useMutation({
//   mutationFn: ({ cycleId, paymentId }) => {
//     console.log('🕵️‍♂️ Organizer verifying payment:', { cycleId, paymentId })
//     setVerifyingPaymentId(paymentId)
//     return paymentService.verifyPayment({ cycleId, paymentId })
//   },
//   onSuccess: (res) => {
//     console.log('✅ Payment verification success:', res)
//     setVerifyingPaymentId(null)
//     window.location.reload()
//   },
//   onError: (err) => {
//     console.error('❌ Payment verification failed:', err?.response?.data || err.message)
//     setVerifyingPaymentId(null)
//   },
//   onSettled: () => {
//     setVerifyingPaymentId(null)
//   }
// })


//   const handleMarkAsPaid = (cycleId) => {
//     setSelectedCycleId(cycleId)
//   }

//   const handleProofUpload = (e) => {
//     setProofFile(e.target.files[0])
//   }

//  const handleSubmitProof = (cycleId) => {
//   console.log('📤 Submitting payment proof for:', { cycleId, proofFile })

//   markAsPaidMutation.mutate({ cycleId, proof: proofFile })
//   setProofFile(null)
//   setSelectedCycleId(null)
// }


//   const handleVerifyPayment = (cycleId, paymentId) => {
//     verifyPaymentMutation.mutate({ cycleId, paymentId })
//   }









//   // Start PhonePe payment flow for this cycle (frontend triggers backend create-payment)
// const handlePhonePay = async (cycleId) => {
//   try {
//     const amount = group.monthlyContribution || 0
//     const name = currentUser?.name || currentUser?.membership?.user?.name || ''
//     console.log('📤 Initiating PhonePe payment with:', { name, amount, cycleId, groupId: id })

//     const resp = await phonepeService.createPayment({ name, amount, cycleId, groupId: id })
// console.log('✅ Full PhonePe API Response:', resp.data);
// alert(`Redirect URL received: ${resp.data.redirectUrl}`);
//     if (resp.data?.success && resp.data.redirectUrl) {
//       console.log('➡️ Redirecting to PhonePe URL:', resp.data.redirectUrl)
//       window.location.href = resp.data.redirectUrl
//     } else {
//       console.warn('⚠️ Payment initiation failed. Response:', resp.data)
//       alert('Failed to initiate payment')
//     }
//   } catch (err) {
//     console.error('❌ PhonePe create payment error', err?.response?.data || err.message)
//     alert('Error initiating payment')
//   }
// }


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
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Group</h2>
//         <p className="text-gray-600">{error.response?.data?.message || 'Failed to load group details'}</p>
//       </div>
//     )
//   }

//   const group = groupData?.data?.group
//   const members = groupData?.data?.members || []
//   // Prefer cycles from cyclesData, fallback to groupData if needed
//   let cycles = []
//   if (cyclesData?.data) {
//     if (Array.isArray(cyclesData.data)) {
//       cycles = cyclesData.data
//     } else if (cyclesData.data.data && Array.isArray(cyclesData.data.data)) {
//       cycles = cyclesData.data.data
//     }
//   } else if (groupData?.data?.cycles && Array.isArray(groupData.data.cycles)) {
//     cycles = groupData.data.cycles
//   }
//   const currentUser = groupData?.data?.currentUser

//   // Debug output for cycles and payments
//  if (typeof window !== 'undefined') {
//   console.log('DEBUG: Current Group →', group)
//   console.log('DEBUG: Current User →', currentUser)
//   console.log('DEBUG: Cycles Data →', cycles)
//   if (cycles?.length > 0) {
//     cycles.forEach((cycle) => {
//       console.log(`Cycle ${cycle.cycleNumber} (${cycle._id}) payments →`, cycle.payments)
//     })
//   }
// }


//   if (!group) {
//     return (
//       <div className="text-center py-12">
//         <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">Group Not Found</h2>
//         <p className="text-gray-600">The group you're looking for doesn't exist or you don't have access to it.</p>
//       </div>
//     )
//   }

//   const isOrganizer = currentUser?.isOrganizer

//   // Access code section (for organizer)
//   const AccessCodeSection = () => {
//     if (!isOrganizer || !group.accessCode) return null
//     return (
//       <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
//         <h3 className="text-lg font-semibold text-blue-800">Group Access Code</h3>
//         <p className="text-3xl font-mono font-bold text-blue-700 mt-2">{group.accessCode}</p>
//         <p className="text-sm text-blue-600 mt-2">Share this code with members to join the group</p>
//       </div>
//     )
//   }

//   // Show loading if cycles are still loading
//   if (cyclesLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="loading-spinner"></div>
//       </div>
//     )
//   }
//   if (cyclesError) {
//     return (
//       <div className="text-center py-12">
//         <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Cycles</h2>
//         <p className="text-gray-600">{cyclesError.response?.data?.message || 'Failed to load payment cycles'}</p>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-8">
//       {/* Group Header */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//         <div className="flex justify-between items-start">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800">{group.name}</h1>
//             <p className="text-gray-600 mt-2">{group.description}</p>
//             <AccessCodeSection />
            
//             <div className="flex items-center space-x-4 mt-4">
//               <div className="flex items-center space-x-1">
//                 <IndianRupee className="h-5 w-5 text-gray-500" />
//                 <span className="text-lg font-semibold">₹{group.monthlyContribution}</span>
//                 <span className="text-gray-500">/month</span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <Users className="h-5 w-5 text-gray-500" />
//                 <span className="text-lg font-semibold">{group.groupSize}</span>
//                 <span className="text-gray-500">members</span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <Calendar className="h-5 w-5 text-gray-500" />
//                 <span className="text-lg font-semibold">{group.currentCycle}</span>
//                 <span className="text-gray-500">/ {group.duration} cycles</span>
//               </div>
//             </div>
//           </div>
          
//           <div className="flex items-center justify-end space-x-3">
//             <div className={`px-3 py-1 rounded-full text-sm font-medium ${
//               group.status === 'active' 
//                 ? 'bg-green-100 text-green-800'
//                 : group.status === 'setup'
//                 ? 'bg-yellow-100 text-yellow-800'
//                 : 'bg-gray-100 text-gray-800'
//             }`}>
//               {group.status.toUpperCase()}
//             </div>
//             <button
//               onClick={() => navigate(`/groups/${id}/report`)}
//               className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               <FileText className="h-4 w-4" />
//               <span>View Report</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Members Section */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//         <div className="p-6 border-b border-gray-200">
//           <h2 className="text-xl font-semibold text-gray-800">Members</h2>
//         </div>
//         <div className="p-6">
//           <div className="space-y-4">
//             {members.map((member) => (
//               <div key={member._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//                     <span className="text-blue-600 font-semibold text-sm">
//                       {member.user?.name?.charAt(0) || 'U'}
//                     </span>
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-800">{member.user?.name}</p>
//                     <p className="text-sm text-gray-500">{member.user?.email}</p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <span className={`px-2 py-1 text-xs rounded-full ${
//                     member.role === 'organizer' 
//                       ? 'bg-purple-100 text-purple-800'
//                       : 'bg-gray-100 text-gray-800'
//                   }`}>
//                     {member.role}
//                   </span>
//                   {member.turnOrder && (
//                     <p className="text-sm text-gray-500 mt-1">Turn: {member.turnOrder}</p>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Cycles Section */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//         <div className="p-6 border-b border-gray-200">
//           <h2 className="text-xl font-semibold text-gray-800">Payment Cycles</h2>
//         </div>

//         <div className="p-6">
//           {(!cycles || cycles.length === 0) ? (
//             <p className="text-gray-500 text-center">No payment cycles found yet.</p>
//           ) : (
//             <div className="space-y-3">
//               {cycles.map((cycle) => (
//                 <div key={cycle._id} className="p-3 border border-gray-200 rounded-lg">
//                   <div className="flex flex-col md:flex-row justify-between items-center">
//                     <div>
//                       <p className="font-medium text-gray-800">Cycle {cycle.cycleNumber}</p>
//                       <p className="text-sm text-gray-500">
//                         {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <span className={`px-2 py-1 text-xs rounded-full ${
//                         cycle.status === 'active' 
//                           ? 'bg-green-100 text-green-800'
//                           : cycle.status === 'completed'
//                           ? 'bg-blue-100 text-blue-800'
//                           : 'bg-gray-100 text-gray-800'
//                       }`}>
//                         {cycle.status}
//                       </span>
//                       <p className="text-sm font-semibold text-gray-800 mt-1">₹{group.monthlyContribution}</p>
//                     </div>
//                   </div>

//                   {/* Organizer: show all members' payments */}
//                   {isOrganizer && (
//                     <div className="mt-4">
//                       <table className="min-w-full text-sm border">
//                         <thead>
//                           <tr className="bg-gray-100">
//                             <th className="px-2 py-1 border">Member</th>
//                             <th className="px-2 py-1 border">Status</th>
//                             <th className="px-2 py-1 border">Proof</th>
//                             <th className="px-2 py-1 border">Verification</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {members.map((member) => {
//                             // Robust payment lookup: match by member._id and user._id
//                             const payment = Array.isArray(cycle.payments)
//                               ? cycle.payments.find((p) => {
//                                   // Try to match by member._id if present, else fallback to user._id
//                                   const payMemberId = p.member?._id || p.member;
//                                   const payUserId = p.user?._id || p.user || p.member?.user?._id;
//                                   return (
//                                     (payMemberId && String(payMemberId) === String(member._id)) ||
//                                     (payUserId && String(payUserId) === String(member.user?._id))
//                                   );
//                                 })
//                               : undefined;
//                             return (
//                               <tr key={member._id}>
//                                 <td className="px-2 py-1 border">{member.user?.name}</td>
//                                 <td className="px-2 py-1 border">
//                                   {payment ? (
//                                     payment.verified ? (
//                                       <span className="text-green-700 font-bold">Verified</span>
//                                     ) : (
//                                       <span className="text-yellow-600 font-bold">Request sent to organizer</span>
//                                     )
//                                   ) : (
//                                     <span className="text-red-600">Unpaid</span>
//                                   )}
//                                 </td>
//                                 <td className="px-2 py-1 border">
//                                   {payment?.proof || payment?.proofUrl ? (
//                                     <a
//                                       href={payment.proof?.startsWith('/uploads') || payment.proofUrl?.startsWith('/uploads')
//                                         ? `http://localhost:5000${payment.proof || payment.proofUrl}`
//                                         : payment.proof || payment.proofUrl}
//                                       target="_blank"
//                                       rel="noopener noreferrer"
//                                       className="text-blue-600 underline"
//                                     >View</a>
//                                   ) : (
//                                     <span className="text-gray-400">-</span>
//                                   )}
//                                 </td>
//                                 <td className="px-2 py-1 border">
//                                   {payment ? (
//                                     payment.verified ? (
//                                       <span className="text-green-700 font-bold">Verified</span>
//                                     ) : (
//                                       <button
//                                         onClick={() => {
//                                           if (!payment._id) {
//                                             alert('Payment ID missing! Cannot verify.');
//                                             return;
//                                           }
//                                           verifyPaymentMutation.mutate({ cycleId: cycle._id, paymentId: payment._id })
//                                         }}
//                                         disabled={verifyingPaymentId === payment._id}
//                                         className="bg-green-600 text-white px-2 py-1 rounded disabled:opacity-50"
//                                       >
//                                         {verifyingPaymentId === payment._id ? 'Verifying...' : 'Verify'}
//                                       </button>
//                                     )
//                                   ) : (
//                                     <span className="text-gray-400">-</span>
//                                   )}
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}

//                   {/* 🆕 EVERYONE (including organizer) sees their own payment actions */}
//                   <div className="mt-4 text-right">
//                     {/* Robust payment lookup for current user */}
//                     {(() => {
//                       const curId = currentUser?._id || currentUser?.membership?.user?._id;
//                       const curMemberId = currentUser?.membership?._id;
//                       const payment = Array.isArray(cycle.payments)
//                         ? cycle.payments.find((p) => {
//                             const payMemberId = p.member?._id || p.member;
//                             const payUserId = p.user?._id || p.user || p.member?.user?._id;
//                             return (
//                               (payMemberId && curMemberId && String(payMemberId) === String(curMemberId)) ||
//                               (payUserId && curId && String(payUserId) === String(curId))
//                             );
//                           })
//                         : undefined;
//                       const hasPaid = !!payment;
//                       const isVerified = payment?.verified;
//                       const proofUrl = payment?.proof || payment?.proofUrl;
                      
//                       return (
//                         <>
//                           {hasPaid ? (
//                             <div>
//                               {isVerified ? (
//                                 <div>
//                                   <span className="text-green-700 font-bold ml-2">✅ Verified & Paid</span>
//                                   {proofUrl && proofUrl.startsWith('phonepe:') && (
//                                     <div className="text-xs text-gray-600 mt-1">
//                                       Transaction: {proofUrl.replace('phonepe:', '')}
//                                     </div>
//                                   )}
//                                 </div>
//                               ) : (
//                                 <span className="text-yellow-600 font-bold ml-2">
//                                   {isOrganizer ? 'Waiting for admin verification' : 'Request sent to organizer'}
//                                 </span>
//                               )}
//                               {proofUrl && !proofUrl.startsWith('phonepe:') && (
//                                 <a
//                                   href={proofUrl.startsWith('/uploads') ? `http://localhost:5000${proofUrl}` : proofUrl}
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                   className="ml-2 text-blue-600 underline"
//                                 >View Proof</a>
//                               )}
//                             </div>
//                           ) : (
//                             selectedCycleId === cycle._id ? (
//                               <div className="flex flex-col items-end">
//                                 <input type="file" accept="image/*,application/pdf" onChange={handleProofUpload} className="mb-2" />
//                                 <button
//                                   onClick={() => handleSubmitProof(cycle._id)}
//                                   disabled={markAsPaidMutation.isLoading || !proofFile}
//                                   className="bg-blue-600 text-white px-2 py-1 rounded disabled:opacity-50"
//                                 >
//                                   {markAsPaidMutation.isLoading ? 'Uploading...' : 'Submit Proof'}
//                                 </button>
//                                 <button
//                                   onClick={() => { setSelectedCycleId(null); setProofFile(null); }}
//                                   className="mt-1 text-sm text-gray-500 underline"
//                                 >Cancel</button>
//                               </div>
//                             ) : (
//                               <div className="flex items-center gap-2">
//                                 <button
//                                   onClick={() => handlePhonePay(cycle._id)}
//                                   className="ml-2 bg-green-600 text-white px-2 py-1 rounded"
//                                 >
//                                   Pay
//                                 </button>
//                                 <button
//                                   onClick={() => handleMarkAsPaid(cycle._id)}
//                                   className="ml-2 bg-blue-600 text-white px-2 py-1 rounded"
//                                 >
//                                   {isOrganizer ? 'Mark as Paid' : 'Mark as Paid'}
//                                 </button>
//                               </div>
//                             )
//                           )}
//                         </>
//                       );
//                     })()}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {isOrganizer && <PendingRequests groupId={id} isOrganizer={isOrganizer} />}
      
//       {/* Invite Members (only organizer) */}
//       {isOrganizer && <InviteMembers groupId={id} groupName={group.name} />}
//     </div>
//   )
// }

// export default GroupDetails


// import React, { useState } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { useQuery, useMutation } from '@tanstack/react-query'
// import { Users, Calendar, IndianRupee, AlertCircle, FileText } from 'lucide-react'
// import { groupService, cycleService, paymentService, phonepeService } from '../services/api.js'
// import InviteMembers from '../components/Groups/InviteMembers.jsx'
// import PendingRequests from '../components/Groups/PendingRequests.jsx'

// const GroupDetails = () => {
//   const { id } = useParams()
//   const navigate = useNavigate()
//   const [proofFile, setProofFile] = useState(null)
//   const [selectedCycleId, setSelectedCycleId] = useState(null)

//   // Validate ID
//   if (!id || id === 'undefined') {
//     return (
//       <div className="text-center py-12">
//         <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Group</h2>
//         <p className="text-gray-600">The group ID is missing or invalid.</p>
//       </div>
//     )
//   }

//   // Fetch group data
//   const { data: groupData, isLoading, error } = useQuery({
//     queryKey: ['group', id],
//     queryFn: () => groupService.getGroup(id),
//     enabled: !!id
//   })

//   // Fetch cycles data
//   const { data: cyclesData, isLoading: cyclesLoading, error: cyclesError } = useQuery({
//     queryKey: ['cycles', id],
//     queryFn: () => cycleService.getGroupCycles(id),
//     enabled: !!id
//   })

//   // Mutation to mark payment as paid
//   const markAsPaidMutation = useMutation({
//     mutationFn: ({ cycleId, proof }) => {
//       const formData = new FormData()
//       formData.append('cycleId', cycleId)
//       if (proof) formData.append('proof', proof)
//       console.log('🧾 FormData contents before upload:', {
//         cycleId,
//         proofName: proof?.name,
//         proofType: proof?.type,
//       })
//       return paymentService.recordPayment(formData)
//     },
//     onSuccess: (res) => {
//       console.log('✅ Payment proof uploaded successfully:', res)
//       window.location.reload()
//     },
//     onError: (err) => {
//       console.error('❌ Payment upload failed:', err?.response?.data || err.message)
//     }
//   })

//   // Track which payment is being verified for loading state
//   const [verifyingPaymentId, setVerifyingPaymentId] = useState(null)

//   // Mutation for organizer to verify payment
//   const verifyPaymentMutation = useMutation({
//     mutationFn: ({ cycleId, paymentId }) => {
//       console.log('🕵️‍♂️ Organizer verifying payment:', { cycleId, paymentId })
//       setVerifyingPaymentId(paymentId)
//       return paymentService.verifyPayment({ cycleId, paymentId })
//     },
//     onSuccess: (res) => {
//       console.log('✅ Payment verification success:', res)
//       setVerifyingPaymentId(null)
//       window.location.reload()
//     },
//     onError: (err) => {
//       console.error('❌ Payment verification failed:', err?.response?.data || err.message)
//       setVerifyingPaymentId(null)
//     },
//     onSettled: () => {
//       setVerifyingPaymentId(null)
//     }
//   })

//   const handleMarkAsPaid = (cycleId) => {
//     setSelectedCycleId(cycleId)
//   }

//   const handleProofUpload = (e) => {
//     setProofFile(e.target.files[0])
//   }

//   const handleSubmitProof = (cycleId) => {
//     console.log('📤 Submitting payment proof for:', { cycleId, proofFile })

//     markAsPaidMutation.mutate({ cycleId, proof: proofFile })
//     setProofFile(null)
//     setSelectedCycleId(null)
//   }

//   const handleVerifyPayment = (cycleId, paymentId) => {
//     verifyPaymentMutation.mutate({ cycleId, paymentId })
//   }

//   // Start PhonePe payment flow for this cycle (frontend triggers backend create-payment)
//   const handlePhonePay = async (cycleId) => {
//     try {
//       const amount = group.monthlyContribution || 0
//       const name = currentUser?.name || currentUser?.membership?.user?.name || ''
//       console.log('📤 Initiating PhonePe payment with:', { name, amount, cycleId, groupId: id })

//       const resp = await phonepeService.createPayment({ name, amount, cycleId, groupId: id })
//       console.log('✅ Full PhonePe API Response:', resp.data)
//       alert(`Redirect URL received: ${resp.data.redirectUrl}`)
//       if (resp.data?.success && resp.data.redirectUrl) {
//         console.log('➡️ Redirecting to PhonePe URL:', resp.data.redirectUrl)
//         window.location.href = resp.data.redirectUrl
//       } else {
//         console.warn('⚠️ Payment initiation failed. Response:', resp.data)
//         alert('Failed to initiate payment')
//       }
//     } catch (err) {
//       console.error('❌ PhonePe create payment error', err?.response?.data || err.message)
//       alert('Error initiating payment')
//     }
//   }

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
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Group</h2>
//         <p className="text-gray-600">{error.response?.data?.message || 'Failed to load group details'}</p>
//       </div>
//     )
//   }

//   const group = groupData?.data?.group
//   const members = groupData?.data?.members || []
//   // Prefer cycles from cyclesData, fallback to groupData if needed
//   let cycles = []
//   if (cyclesData?.data) {
//     if (Array.isArray(cyclesData.data)) {
//       cycles = cyclesData.data
//     } else if (cyclesData.data.data && Array.isArray(cyclesData.data.data)) {
//       cycles = cyclesData.data.data
//     }
//   } else if (groupData?.data?.cycles && Array.isArray(groupData.data.cycles)) {
//     cycles = groupData.data.cycles
//   }
//   const currentUser = groupData?.data?.currentUser

//   // Debug output for cycles and payments
//   if (typeof window !== 'undefined') {
//     console.log('DEBUG: Current Group →', group)
//     console.log('DEBUG: Current User →', currentUser)
//     console.log('DEBUG: Cycles Data →', cycles)
//     if (cycles?.length > 0) {
//       cycles.forEach((cycle) => {
//         console.log(`Cycle ${cycle.cycleNumber} (${cycle._id}) payments →`, cycle.payments)
//       })
//     }
//   }

//   if (!group) {
//     return (
//       <div className="text-center py-12">
//         <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">Group Not Found</h2>
//         <p className="text-gray-600">The group you're looking for doesn't exist or you don't have access to it.</p>
//       </div>
//     )
//   }

//   const isOrganizer = currentUser?.isOrganizer

//   // Access code section (for organizer)
//   const AccessCodeSection = () => {
//     if (!isOrganizer || !group.accessCode) return null
//     return (
//       <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
//         <h3 className="text-lg font-semibold text-blue-800">Group Access Code</h3>
//         <p className="text-3xl font-mono font-bold text-blue-700 mt-2">{group.accessCode}</p>
//         <p className="text-sm text-blue-600 mt-2">Share this code with members to join the group</p>
//       </div>
//     )
//   }

//   // Show loading if cycles are still loading
//   if (cyclesLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="loading-spinner"></div>
//       </div>
//     )
//   }
//   if (cyclesError) {
//     return (
//       <div className="text-center py-12">
//         <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Cycles</h2>
//         <p className="text-gray-600">{cyclesError.response?.data?.message || 'Failed to load payment cycles'}</p>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-8">
//       {/* Group Header */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//         <div className="flex justify-between items-start">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800">{group.name}</h1>
//             <p className="text-gray-600 mt-2">{group.description}</p>
//             <AccessCodeSection />

//             <div className="flex items-center space-x-4 mt-4">
//               <div className="flex items-center space-x-1">
//                 <IndianRupee className="h-5 w-5 text-gray-500" />
//                 <span className="text-lg font-semibold">₹{group.monthlyContribution}</span>
//                 <span className="text-gray-500">/month</span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <Users className="h-5 w-5 text-gray-500" />
//                 <span className="text-lg font-semibold">{group.groupSize}</span>
//                 <span className="text-gray-500">members</span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <Calendar className="h-5 w-5 text-gray-500" />
//                 <span className="text-lg font-semibold">{group.currentCycle}</span>
//                 <span className="text-gray-500">/ {group.duration} cycles</span>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center justify-end space-x-3">
//             <div
//               className={`px-3 py-1 rounded-full text-sm font-medium ${
//                 group.status === 'active'
//                   ? 'bg-green-100 text-green-800'
//                   : group.status === 'setup'
//                   ? 'bg-yellow-100 text-yellow-800'
//                   : 'bg-gray-100 text-gray-800'
//               }`}
//             >
//               {group.status.toUpperCase()}
//             </div>
//             <button
//               onClick={() => navigate(`/groups/${id}/report`)}
//               className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               <FileText className="h-4 w-4" />
//               <span>View Report</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Members Section */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//         <div className="p-6 border-b border-gray-200">
//           <h2 className="text-xl font-semibold text-gray-800">Members</h2>
//         </div>
//         <div className="p-6">
//           <div className="space-y-4">
//             {members.map((member) => (
//               <div
//                 key={member._id}
//                 className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
//               >
//                 <div className="flex items-center space-x-3">
//                   <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//                     <span className="text-blue-600 font-semibold text-sm">
//                       {member.user?.name?.charAt(0) || 'U'}
//                     </span>
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-800">{member.user?.name}</p>
//                     <p className="text-sm text-gray-500">{member.user?.email}</p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <span
//                     className={`px-2 py-1 text-xs rounded-full ${
//                       member.role === 'organizer'
//                         ? 'bg-purple-100 text-purple-800'
//                         : 'bg-gray-100 text-gray-800'
//                     }`}
//                   >
//                     {member.role}
//                   </span>
//                   {member.turnOrder && (
//                     <p className="text-sm text-gray-500 mt-1">Turn: {member.turnOrder}</p>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Cycles Section */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//         <div className="p-6 border-b border-gray-200">
//           <h2 className="text-xl font-semibold text-gray-800">Payment Cycles</h2>
//         </div>

//         <div className="p-6">
//           {!cycles || cycles.length === 0 ? (
//             <p className="text-gray-500 text-center">No payment cycles found yet.</p>
//           ) : (
//             <div className="space-y-3">
//               {cycles.map((cycle) => (
//                 <div key={cycle._id} className="p-3 border border-gray-200 rounded-lg">
//                   <div className="flex flex-col md:flex-row justify-between items-center">
//                     <div>
//                       <p className="font-medium text-gray-800">Cycle {cycle.cycleNumber}</p>
//                       <p className="text-sm text-gray-500">
//                         {new Date(cycle.startDate).toLocaleDateString()} -{' '}
//                         {new Date(cycle.endDate).toLocaleDateString()}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <span
//                         className={`px-2 py-1 text-xs rounded-full ${
//                           cycle.status === 'active'
//                             ? 'bg-green-100 text-green-800'
//                             : cycle.status === 'completed'
//                             ? 'bg-blue-100 text-blue-800'
//                             : 'bg-gray-100 text-gray-800'
//                         }`}
//                       >
//                         {cycle.status}
//                       </span>
//                       <p className="text-sm font-semibold text-gray-800 mt-1">
//                         ₹{group.monthlyContribution}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Organizer: show all members' payments */}
//                   {isOrganizer && (
//                     <div className="mt-4">
//                       <table className="min-w-full text-sm border">
//                         <thead>
//                           <tr className="bg-gray-100">
//                             <th className="px-2 py-1 border">Member</th>
//                             <th className="px-2 py-1 border">Status</th>
//                             <th className="px-2 py-1 border">Proof</th>
//                             <th className="px-2 py-1 border">Verification</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {members.map((member) => {
//                             // Robust payment lookup: match by member._id and user._id
//                             const payment = Array.isArray(cycle.payments)
//                               ? cycle.payments.find((p) => {
//                                   const payMemberId = p.member?._id || p.member
//                                   const payUserId =
//                                     p.user?._id || p.user || p.member?.user?._id
//                                   return (
//                                     (payMemberId &&
//                                       String(payMemberId) === String(member._id)) ||
//                                     (payUserId &&
//                                       String(payUserId) ===
//                                         String(member.user?._id))
//                                   )
//                                 })
//                               : undefined

//                             const rawProof = payment?.proof || payment?.proofUrl
//                             const isPhonePeProof = rawProof?.startsWith('phonepe:')

//                             return (
//                               <tr key={member._id}>
//                                 <td className="px-2 py-1 border">
//                                   {member.user?.name}
//                                 </td>
//                                 <td className="px-2 py-1 border">
//                                   {payment ? (
//                                     payment.verified ? (
//                                       <span className="text-green-700 font-bold">
//                                         Verified
//                                       </span>
//                                     ) : (
//                                       <span className="text-yellow-600 font-bold">
//                                         Request sent to organizer
//                                       </span>
//                                     )
//                                   ) : (
//                                     <span className="text-red-600">Unpaid</span>
//                                   )}
//                                 </td>
//                                 <td className="px-2 py-1 border">
//                                   {rawProof ? (
//                                     isPhonePeProof ? (
//                                       // 🔥 No "View" link for PhonePe proofs
//                                       <span className="text-gray-500 text-xs">
//                                         PhonePe payment
//                                       </span>
//                                     ) : (
//                                       <a
//                                         href={
//                                           rawProof.startsWith('/uploads')
//                                             ? `http://localhost:5000${rawProof}`
//                                             : rawProof
//                                         }
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className="text-blue-600 underline"
//                                       >
//                                         View
//                                       </a>
//                                     )
//                                   ) : (
//                                     <span className="text-gray-400">-</span>
//                                   )}
//                                 </td>
//                                 <td className="px-2 py-1 border">
//                                   {payment ? (
//                                     payment.verified ? (
//                                       <span className="text-green-700 font-bold">
//                                         Verified
//                                       </span>
//                                     ) : (
//                                       <button
//                                         onClick={() => {
//                                           if (!payment._id) {
//                                             alert(
//                                               'Payment ID missing! Cannot verify.'
//                                             )
//                                             return
//                                           }
//                                           verifyPaymentMutation.mutate({
//                                             cycleId: cycle._id,
//                                             paymentId: payment._id,
//                                           })
//                                         }}
//                                         disabled={
//                                           verifyingPaymentId === payment._id
//                                         }
//                                         className="bg-green-600 text-white px-2 py-1 rounded disabled:opacity-50"
//                                       >
//                                         {verifyingPaymentId === payment._id
//                                           ? 'Verifying...'
//                                           : 'Verify'}
//                                       </button>
//                                     )
//                                   ) : (
//                                     <span className="text-gray-400">-</span>
//                                   )}
//                                 </td>
//                               </tr>
//                             )
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}

//                   {/* 🆕 EVERYONE (including organizer) sees their own payment actions */}
//                   <div className="mt-4 text-right">
//                     {(() => {
//                       const curId =
//                         currentUser?._id || currentUser?.membership?.user?._id
//                       const curMemberId = currentUser?.membership?._id

//                       const payment = Array.isArray(cycle.payments)
//                         ? cycle.payments.find((p) => {
//                             const payMemberId = p.member?._id || p.member
//                             const payUserId =
//                               p.user?._id ||
//                               p.user ||
//                               p.member?.user?._id
//                             return (
//                               (payMemberId &&
//                                 curMemberId &&
//                                 String(payMemberId) ===
//                                   String(curMemberId)) ||
//                               (payUserId &&
//                                 curId &&
//                                 String(payUserId) === String(curId))
//                             )
//                           })
//                         : undefined

//                       const hasPaid = !!payment
//                       const isVerified = payment?.verified
//                       const proofUrl = payment?.proof || payment?.proofUrl

//                       return (
//                         <>
//                           {hasPaid ? (
//                             <div>
//                               {isVerified ? (
//                                 <div>
//                                   <span className="text-green-700 font-bold ml-2">
//                                     ✅ Verified & Paid
//                                   </span>
//                                   {proofUrl &&
//                                     proofUrl.startsWith('phonepe:') && (
//                                       <div className="text-xs text-gray-600 mt-1">
//                                         Transaction:{' '}
//                                         {proofUrl.replace('phonepe:', '')}
//                                       </div>
//                                     )}
//                                 </div>
//                               ) : (
//                                 <span className="text-yellow-600 font-bold ml-2">
//                                   {isOrganizer
//                                     ? 'Waiting for admin verification'
//                                     : 'Request sent to organizer'}
//                                 </span>
//                               )}
//                               {proofUrl &&
//                                 !proofUrl.startsWith('phonepe:') && (
//                                   <a
//                                     href={
//                                       proofUrl.startsWith('/uploads')
//                                         ? `http://localhost:5000${proofUrl}`
//                                         : proofUrl
//                                     }
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="ml-2 text-blue-600 underline"
//                                   >
//                                     View Proof
//                                   </a>
//                                 )}
//                             </div>
//                           ) : selectedCycleId === cycle._id ? (
//                             <div className="flex flex-col items-end">
//                               <input
//                                 type="file"
//                                 accept="image/*,application/pdf"
//                                 onChange={handleProofUpload}
//                                 className="mb-2"
//                               />
//                               <button
//                                 onClick={() =>
//                                   handleSubmitProof(cycle._id)
//                                 }
//                                 disabled={
//                                   markAsPaidMutation.isLoading || !proofFile
//                                 }
//                                 className="bg-blue-600 text-white px-2 py-1 rounded disabled:opacity-50"
//                               >
//                                 {markAsPaidMutation.isLoading
//                                   ? 'Uploading...'
//                                   : 'Submit Proof'}
//                               </button>
//                               <button
//                                 onClick={() => {
//                                   setSelectedCycleId(null)
//                                   setProofFile(null)
//                                 }}
//                                 className="mt-1 text-sm text-gray-500 underline"
//                               >
//                                 Cancel
//                               </button>
//                             </div>
//                           ) : (
//                             <div className="flex items-center gap-2">
//                               <button
//                                 onClick={() => handlePhonePay(cycle._id)}
//                                 className="ml-2 bg-green-600 text-white px-2 py-1 rounded"
//                               >
//                                 Pay
//                               </button>
//                               <button
//                                 onClick={() => handleMarkAsPaid(cycle._id)}
//                                 className="ml-2 bg-blue-600 text-white px-2 py-1 rounded"
//                               >
//                                 {isOrganizer ? 'Mark as Paid' : 'Mark as Paid'}
//                               </button>
//                             </div>
//                           )}
//                         </>
//                       )
//                     })()}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {isOrganizer && <PendingRequests groupId={id} isOrganizer={isOrganizer} />}

//       {/* Invite Members (only organizer) */}
//       {isOrganizer && <InviteMembers groupId={id} groupName={group.name} />}
//     </div>
//   )
// }

// export default GroupDetails

import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Users, Calendar, IndianRupee, AlertCircle, FileText } from 'lucide-react'
import { groupService, cycleService, paymentService, phonepeService } from '../services/api.js'
import InviteMembers from '../components/Groups/InviteMembers.jsx'
import PendingRequests from '../components/Groups/PendingRequests.jsx'

const GroupDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [proofFile, setProofFile] = useState(null)
  const [selectedCycleId, setSelectedCycleId] = useState(null)

  // Validate ID
  if (!id || id === 'undefined') {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Group</h2>
        <p className="text-gray-600">The group ID is missing or invalid.</p>
      </div>
    )
  }

  // Fetch group data
  const { data: groupData, isLoading, error } = useQuery({
    queryKey: ['group', id],
    queryFn: () => groupService.getGroup(id),
    enabled: !!id
  })

  // Fetch cycles data
  const { data: cyclesData, isLoading: cyclesLoading, error: cyclesError } = useQuery({
    queryKey: ['cycles', id],
    queryFn: () => cycleService.getGroupCycles(id),
    enabled: !!id
  })

  // Mutation to mark payment as paid
  const markAsPaidMutation = useMutation({
    mutationFn: ({ cycleId, proof }) => {
      const formData = new FormData()
      formData.append('cycleId', cycleId)
      if (proof) formData.append('proof', proof)
      console.log('🧾 FormData contents before upload:', {
        cycleId,
        proofName: proof?.name,
        proofType: proof?.type,
      })
      return paymentService.recordPayment(formData)
    },
    onSuccess: (res) => {
      console.log('✅ Payment proof uploaded successfully:', res)
      window.location.reload()
    },
    onError: (err) => {
      console.error('❌ Payment upload failed:', err?.response?.data || err.message)
    }
  })

  // Track which payment is being verified for loading state
  const [verifyingPaymentId, setVerifyingPaymentId] = useState(null)

  // Mutation for organizer to verify payment
  const verifyPaymentMutation = useMutation({
    mutationFn: ({ cycleId, paymentId }) => {
      console.log('🕵️‍♂️ Organizer verifying payment:', { cycleId, paymentId })
      setVerifyingPaymentId(paymentId)
      return paymentService.verifyPayment({ cycleId, paymentId })
    },
    onSuccess: (res) => {
      console.log('✅ Payment verification success:', res)
      setVerifyingPaymentId(null)
      window.location.reload()
    },
    onError: (err) => {
      console.error('❌ Payment verification failed:', err?.response?.data || err.message)
      setVerifyingPaymentId(null)
    },
    onSettled: () => {
      setVerifyingPaymentId(null)
    }
  })

  const handleMarkAsPaid = (cycleId) => {
    setSelectedCycleId(cycleId)
  }

  const handleProofUpload = (e) => {
    setProofFile(e.target.files[0])
  }

  const handleSubmitProof = (cycleId) => {
    console.log('📤 Submitting payment proof for:', { cycleId, proofFile })

    markAsPaidMutation.mutate({ cycleId, proof: proofFile })
    setProofFile(null)
    setSelectedCycleId(null)
  }

  const handleVerifyPayment = (cycleId, paymentId) => {
    verifyPaymentMutation.mutate({ cycleId, paymentId })
  }

  // ---------------- LATE FEE HELPERS (no hooks) ----------------

  // We will fill these AFTER we know group/currentUser/cycles
  // but define them here as placeholders to avoid hoisting issues.
  let getUserPaymentForCycle = () => null
  let getLateFeeInfo = () => ({ base: 0, lateFee: 0, total: 0 })

  // Start PhonePe payment flow for this cycle (frontend triggers backend create-payment)
  const handlePhonePay = async (cycleId) => {
    try {
      // We will compute the correct late-fee-adjusted amount below
      // after we know group + cycles + currentUser
      const cycle = cycles.find((c) => c._id === cycleId)
      const { total } = getLateFeeInfo(cycle) // includes late fee if applicable

      const amount = total || group.monthlyContribution || 0
      const name = currentUser?.name || currentUser?.membership?.user?.name || ''
      console.log('📤 Initiating PhonePe payment with:', { name, amount, cycleId, groupId: id })

      const resp = await phonepeService.createPayment({ name, amount, cycleId, groupId: id })
      console.log('✅ Full PhonePe API Response:', resp.data)
      alert(`Redirect URL received: ${resp.data.redirectUrl}`)
      if (resp.data?.success && resp.data.redirectUrl) {
        console.log('➡️ Redirecting to PhonePe URL:', resp.data.redirectUrl)
        window.location.href = resp.data.redirectUrl
      } else {
        console.warn('⚠️ Payment initiation failed. Response:', resp.data)
        alert('Failed to initiate payment')
      }
    } catch (err) {
      console.error('❌ PhonePe create payment error', err?.response?.data || err.message)
      alert('Error initiating payment')
    }
  }

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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Group</h2>
        <p className="text-gray-600">{error.response?.data?.message || 'Failed to load group details'}</p>
      </div>
    )
  }

  const group = groupData?.data?.group
  const members = groupData?.data?.members || []
  // Prefer cycles from cyclesData, fallback to groupData if needed
  let cycles = []
  if (cyclesData?.data) {
    if (Array.isArray(cyclesData.data)) {
      cycles = cyclesData.data
    } else if (cyclesData.data.data && Array.isArray(cyclesData.data.data)) {
      cycles = cyclesData.data.data
    }
  } else if (groupData?.data?.cycles && Array.isArray(groupData.data.cycles)) {
    cycles = groupData.data.cycles
  }
  const currentUser = groupData?.data?.currentUser

  // Now we can define helpers properly because group/currentUser/cycles exist
  getUserPaymentForCycle = (cycle) => {
    if (!cycle || !Array.isArray(cycle.payments)) return null
    const curId = currentUser?._id || currentUser?.membership?.user?._id
    const curMemberId = currentUser?.membership?._id

    return cycle.payments.find((p) => {
      const payMemberId = p.member?._id || p.member
      const payUserId = p.user?._id || p.user || p.member?.user?._id
      return (
        (payMemberId && curMemberId && String(payMemberId) === String(curMemberId)) ||
        (payUserId && curId && String(payUserId) === String(curId))
      )
    }) || null
  }

  getLateFeeInfo = (cycle) => {
    const base = group?.monthlyContribution || 0
    let lateFee = 0

    if (!cycle || !group) return { base, lateFee, total: base }

    // If user already paid in this cycle → no late fee
    const payment = getUserPaymentForCycle(cycle)
    if (payment) {
      return { base, lateFee: 0, total: base }
    }

    const grace = group.penaltyRules?.gracePeriod || 0
    const flatLateFee = group.penaltyRules?.lateFee || 0 // TYPE 1: fixed late fee

    const endDateWithGrace = new Date(cycle.endDate)
    endDateWithGrace.setDate(endDateWithGrace.getDate() + grace)

    if (flatLateFee > 0 && new Date() > endDateWithGrace) {
      lateFee = flatLateFee
    }

    return { base, lateFee, total: base + lateFee }
  }

  // Debug output for cycles and payments
  if (typeof window !== 'undefined') {
    console.log('DEBUG: Current Group →', group)
    console.log('DEBUG: Current User →', currentUser)
    console.log('DEBUG: Cycles Data →', cycles)
    if (cycles?.length > 0) {
      cycles.forEach((cycle) => {
        console.log(`Cycle ${cycle.cycleNumber} (${cycle._id}) payments →`, cycle.payments)
      })
    }
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Group Not Found</h2>
        <p className="text-gray-600">The group you're looking for doesn't exist or you don't have access to it.</p>
      </div>
    )
  }

  const isOrganizer = currentUser?.isOrganizer

  // Access code section (for organizer)
  const AccessCodeSection = () => {
    if (!isOrganizer || !group.accessCode) return null
    return (
      <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800">Group Access Code</h3>
        <p className="text-3xl font-mono font-bold text-blue-700 mt-2">{group.accessCode}</p>
        <p className="text-sm text-blue-600 mt-2">Share this code with members to join the group</p>
      </div>
    )
  }

  // Show loading if cycles are still loading
  if (cyclesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }
  if (cyclesError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Cycles</h2>
        <p className="text-gray-600">{cyclesError.response?.data?.message || 'Failed to load payment cycles'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Group Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{group.name}</h1>
            <p className="text-gray-600 mt-2">{group.description}</p>
            <AccessCodeSection />

            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-1">
                <IndianRupee className="h-5 w-5 text-gray-500" />
                <span className="text-lg font-semibold">₹{group.monthlyContribution}</span>
                <span className="text-gray-500">/month</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-5 w-5 text-gray-500" />
                <span className="text-lg font-semibold">{group.groupSize}</span>
                <span className="text-gray-500">members</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="text-lg font-semibold">{group.currentCycle}</span>
                <span className="text-gray-500">/ {group.duration} cycles</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                group.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : group.status === 'setup'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {group.status.toUpperCase()}
            </div>
            <button
              onClick={() => navigate(`/groups/${id}/report`)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>View Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Members Section
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Members</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {member.user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{member.user?.name}</p>
                    <p className="text-sm text-gray-500">{member.user?.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      member.role === 'organizer' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {member.role}
                  </span>
                  {member.turnOrder && <p className="text-sm text-gray-500 mt-1">Turn: {member.turnOrder}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* Members Section */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200">
  <div className="p-6 border-b border-gray-200">
    <h2 className="text-xl font-semibold text-gray-800">Members</h2>
  </div>

  <div className="p-6">
    <div className="space-y-4">

      {members.map((member) => (
        <div
          key={member._id}
          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {member.user?.name?.charAt(0) || 'U'}
              </span>
            </div>

            <div>
              <p className="font-medium text-gray-800">{member.user?.name}</p>
              <p className="text-sm text-gray-500">{member.user?.email}</p>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                member.role === 'organizer'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {member.role}
            </span>

            {/* ALWAYS SHOW TURN ORDER */}
            <p className="text-sm text-gray-500 mt-1">
              Turn: {member.turnOrder ?? '—'}
            </p>
          </div>
        </div>
      ))}

    </div>
  </div>
</div>
      

      {/* Cycles Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Payment Cycles</h2>
        </div>

        <div className="p-6">
          {!cycles || cycles.length === 0 ? (
            <p className="text-gray-500 text-center">No payment cycles found yet.</p>
          ) : (
            <div className="space-y-3">
              {cycles.map((cycle) => {
                const { base, lateFee, total } = getLateFeeInfo(cycle)

                return (
                  <div key={cycle._id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">Cycle {cycle.cycleNumber}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(cycle.startDate).toLocaleDateString()} -{' '}
                          {new Date(cycle.endDate).toLocaleDateString()}
                        </p>
                        {/* Show late-fee info for current user only if unpaid */}
                        {(() => {
                          const paymentForUser = getUserPaymentForCycle(cycle)
                          if (paymentForUser) return null

                          return (
                            <div className="mt-1 text-xs text-right md:text-left">
                              <p>Base Amount: ₹{base}</p>
                              {lateFee > 0 && (
                                <p className="text-red-600 font-semibold">Late Fee: +₹{lateFee}</p>
                              )}
                              <p className="font-semibold text-blue-700">Total Payable: ₹{total}</p>
                            </div>
                          )
                        })()}
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            cycle.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : cycle.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {cycle.status}
                        </span>
                        <p className="text-sm font-semibold text-gray-800 mt-1">₹{group.monthlyContribution}</p>
                      </div>
                    </div>

                    {/* Organizer: show all members' payments */}
                    {isOrganizer && (
                      <div className="mt-4">
                        <table className="min-w-full text-sm border">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-2 py-1 border">Member</th>
                              <th className="px-2 py-1 border">Status</th>
                              <th className="px-2 py-1 border">Proof</th>
                              <th className="px-2 py-1 border">Verification</th>
                            </tr>
                          </thead>
                          <tbody>
                            {members.map((member) => {
                              const payment = Array.isArray(cycle.payments)
                                ? cycle.payments.find((p) => {
                                    const payMemberId = p.member?._id || p.member
                                    const payUserId = p.user?._id || p.user || p.member?.user?._id
                                    return (
                                      (payMemberId && String(payMemberId) === String(member._id)) ||
                                      (payUserId && String(payUserId) === String(member.user?._id))
                                    )
                                  })
                                : undefined
                              return (
                                <tr key={member._id}>
                                  <td className="px-2 py-1 border">{member.user?.name}</td>
                                  <td className="px-2 py-1 border">
                                    {payment ? (
                                      payment.verified ? (
                                        <span className="text-green-700 font-bold">Verified</span>
                                      ) : (
                                        <span className="text-yellow-600 font-bold">Request sent to organizer</span>
                                      )
                                    ) : (
                                      <span className="text-red-600">Unpaid</span>
                                    )}
                                  </td>
                                  <td className="px-2 py-1 border">
                                    {payment?.proof || payment?.proofUrl ? (
                                      <a
                                        href={
                                          payment.proof?.startsWith('/uploads') ||
                                          payment.proofUrl?.startsWith('/uploads')
                                            ? `http://localhost:5000${payment.proof || payment.proofUrl}`
                                            : payment.proof || payment.proofUrl
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline"
                                      >
                                        View
                                      </a>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                  <td className="px-2 py-1 border">
                                    {payment ? (
                                      payment.verified ? (
                                        <span className="text-green-700 font-bold">Verified</span>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            if (!payment._id) {
                                              alert('Payment ID missing! Cannot verify.')
                                              return
                                            }
                                            verifyPaymentMutation.mutate({ cycleId: cycle._id, paymentId: payment._id })
                                          }}
                                          disabled={verifyingPaymentId === payment._id}
                                          className="bg-green-600 text-white px-2 py-1 rounded disabled:opacity-50"
                                        >
                                          {verifyingPaymentId === payment._id ? 'Verifying...' : 'Verify'}
                                        </button>
                                      )
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* EVERYONE (including organizer) sees their own payment actions */}
                    <div className="mt-4 text-right">
                      {(() => {
                        const curId = currentUser?._id || currentUser?.membership?.user?._id
                        const curMemberId = currentUser?.membership?._id
                        const payment = Array.isArray(cycle.payments)
                          ? cycle.payments.find((p) => {
                              const payMemberId = p.member?._id || p.member
                              const payUserId = p.user?._id || p.user || p.member?.user?._id
                              return (
                                (payMemberId && curMemberId && String(payMemberId) === String(curMemberId)) ||
                                (payUserId && curId && String(payUserId) === String(curId))
                              )
                            })
                          : undefined
                        const hasPaid = !!payment
                        const isVerified = payment?.verified
                        const proofUrl = payment?.proof || payment?.proofUrl
                        const { total } = getLateFeeInfo(cycle)

                        return (
                          <>
                            {hasPaid ? (
                              <div>
                                {isVerified ? (
                                  <div>
                                    <span className="text-green-700 font-bold ml-2">✅ Verified & Paid</span>
                                    {proofUrl && proofUrl.startsWith('phonepe:') && (
                                      <div className="text-xs text-gray-600 mt-1">
                                        Transaction: {proofUrl.replace('phonepe:', '')}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-yellow-600 font-bold ml-2">
                                    {isOrganizer ? 'Waiting for admin verification' : 'Request sent to organizer'}
                                  </span>
                                )}
                                {proofUrl && !proofUrl.startsWith('phonepe:') && (
                                  <a
                                    href={proofUrl.startsWith('/uploads') ? `http://localhost:5000${proofUrl}` : proofUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-blue-600 underline"
                                  >
                                    View Proof
                                  </a>
                                )}
                              </div>
                            ) : selectedCycleId === cycle._id ? (
                              <div className="flex flex-col items-end">
                                <input
                                  type="file"
                                  accept="image/*,application/pdf"
                                  onChange={handleProofUpload}
                                  className="mb-2"
                                />
                                <button
                                  onClick={() => handleSubmitProof(cycle._id)}
                                  disabled={markAsPaidMutation.isLoading || !proofFile}
                                  className="bg-blue-600 text-white px-2 py-1 rounded disabled:opacity-50"
                                >
                                  {markAsPaidMutation.isLoading ? 'Uploading...' : 'Submit Proof'}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedCycleId(null)
                                    setProofFile(null)
                                  }}
                                  className="mt-1 text-sm text-gray-500 underline"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-4 justify-end">
                                <div className="text-right text-xs">
                                  <p className="font-semibold">You will pay: ₹{total}</p>
                                </div>
                                <button
                                  onClick={() => handlePhonePay(cycle._id)}
                                  className="ml-2 bg-green-600 text-white px-2 py-1 rounded"
                                >
                                  Pay
                                </button>
                                <button
                                  onClick={() => handleMarkAsPaid(cycle._id)}
                                  className="ml-2 bg-blue-600 text-white px-2 py-1 rounded"
                                >
                                  {isOrganizer ? 'Mark as Paid' : 'Mark as Paid'}
                                </button>
                              </div>
                            )}
                          </>


export default GroupDetails
