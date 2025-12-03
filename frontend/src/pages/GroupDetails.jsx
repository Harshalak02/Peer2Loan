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
import { Users, Calendar, IndianRupee, AlertCircle, FileText, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { groupService, cycleService, paymentService, phonepeService } from '../services/api.js'
import InviteMembers from '../components/Groups/InviteMembers.jsx'
import PendingRequests from '../components/Groups/PendingRequests.jsx'

const GroupDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [proofFile, setProofFile] = useState(null)
  const [selectedCycleId, setSelectedCycleId] = useState(null)
  const [copied, setCopied] = useState(false)
  const [collapsedCycles, setCollapsedCycles] = useState({})
  const [cycleViewMode, setCycleViewMode] = useState('current') // 'current', 'all'
  const [expandedCycles, setExpandedCycles] = useState({})
  const [showAllMembers, setShowAllMembers] = useState(false)
  const [paymentVerificationExpanded, setPaymentVerificationExpanded] = useState({})

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

  // Toggle collapse state for cycles
  const toggleCycleCollapse = (cycleId) => {
    setCollapsedCycles(prev => ({
      ...prev,
      [cycleId]: !prev[cycleId]
    }))
  }

  // Toggle individual cycle expansion
  const toggleCycleExpansion = (cycleId) => {
    setExpandedCycles(prev => ({
      ...prev,
      [cycleId]: !prev[cycleId]
    }))
  }

  // Get filtered cycles based on view mode
  const getFilteredCycles = () => {
    if (!cycles || cycles.length === 0) return []
    
    if (cycleViewMode === 'current') {
      const activeCycle = cycles.find(cycle => cycle.status === 'active')
      return activeCycle ? [activeCycle] : cycles.slice(0, 1) // fallback to first cycle
    }
    
    return cycles // 'all' mode shows all cycles
  }

  // Copy to clipboard function
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(group.accessCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = group.accessCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Access code section (for organizer)
  const AccessCodeSection = () => {
    if (!isOrganizer || !group.accessCode) return null
    return (
      <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800">Group Access Code</h3>
        <div className="flex items-center space-x-3 mt-2">
          <p className="text-3xl font-mono font-bold text-blue-700">{group.accessCode}</p>
          <button
            onClick={handleCopyCode}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
              copied 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
            }`}
            title={copied ? 'Copied!' : 'Copy to clipboard'}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="text-sm font-medium">Copy</span>
              </>
            )}
          </button>
        </div>
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

      {/* Members Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Members</h2>
            <button
              onClick={() => setShowAllMembers(prev => !prev)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span className="text-sm font-medium">
                {showAllMembers ? 'Hide Members' : `Show Members (${members.length})`}
              </span>
              {showAllMembers ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        {showAllMembers && (
          <div className="p-6">
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 font-semibold text-sm">
                        {member.user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.user?.name}</p>
                      <p className="text-sm text-gray-500">{member.user?.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      member.role === 'organizer' 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {member.role}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      Turn: {member.turnOrder ?? '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      

      {/* Cycles Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <h2 className="text-xl font-semibold text-gray-800">Payment Cycles</h2>
            
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCycleViewMode('current')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  cycleViewMode === 'current'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Current Active
              </button>
              <button
                onClick={() => setCycleViewMode('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  cycleViewMode === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                View All Cycles
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!cycles || cycles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No payment cycles found yet.</p>
          ) : (
            <div className="space-y-6">
              {getFilteredCycles().map((cycle) => {
                const { base, lateFee, total } = getLateFeeInfo(cycle)
                const currentUserTurnOrder = currentUser?.membership?.turnOrder
                const isUserTurn = currentUserTurnOrder && currentUserTurnOrder === cycle.cycleNumber
                const recipientMember = members.find(m => m.turnOrder === cycle.cycleNumber)
                const isCollapsed = collapsedCycles[cycle._id]
                const isExpanded = cycleViewMode === 'current' ? true : expandedCycles[cycle._id]

                return (
                  <div key={cycle._id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Cycle Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold text-gray-900">Cycle {cycle.cycleNumber}</h3>
                                {cycleViewMode === 'all' && (
                                  <button
                                    onClick={() => toggleCycleExpansion(cycle._id)}
                                    className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                                  >
                                    {isExpanded ? 
                                      <ChevronUp className="h-4 w-4 text-gray-600" /> : 
                                      <ChevronDown className="h-4 w-4 text-gray-600" />
                                    }
                                  </button>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {recipientMember && (
                            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              Recipient: {recipientMember.user?.name}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            cycle.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : cycle.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {cycle.status.toUpperCase()}
                          </span>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Amount</p>
                            <p className="text-lg font-semibold text-gray-900">₹{group.monthlyContribution}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Late fee info for unpaid users */}
                      {isExpanded && (() => {
                        const paymentForUser = getUserPaymentForCycle(cycle)
                        if (paymentForUser || isUserTurn) return null

                        return (
                          <div className="mt-3 bg-white rounded-lg p-3 border border-blue-200">
                            <div className="flex justify-between items-center text-sm">
                              <span>Base Amount: ₹{base}</span>
                              {lateFee > 0 && <span className="text-red-600 font-semibold">Late Fee: +₹{lateFee}</span>}
                              <span className="font-semibold text-blue-700">Total Payable: ₹{total}</span>
                            </div>
                          </div>
                        )
                      })()}
                    </div>

                    {/* Cycle Details - Only show when expanded */}
                    {isExpanded && (
                      <>
                        {/* Organizer: Collapsible Member Payment Table */}
                        {isOrganizer && (
                      <div className="bg-white">
                        <button
                          onClick={() => setPaymentVerificationExpanded(prev => ({
                            ...prev,
                            [cycle._id]: !prev[cycle._id]
                          }))}
                          className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition-colors border-t border-gray-100"
                        >
                          <span className="text-sm font-medium text-gray-700">Payment Verification Status</span>
                          {paymentVerificationExpanded[cycle._id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        
                        {paymentVerificationExpanded[cycle._id] && (
                          <div className="px-4 pb-4">
                            <div className="bg-gray-50 rounded-lg overflow-hidden">
                              <div className="grid grid-cols-4 gap-4 p-3 bg-gray-100 text-sm font-medium text-gray-700">
                                <div>Member</div>
                                <div>Status</div>
                                <div>Proof</div>
                                <div>Action</div>
                              </div>
                              {members.filter(member => member.turnOrder !== cycle.cycleNumber).map((member) => {
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
                                  <div key={member._id} className="grid grid-cols-4 gap-4 p-3 border-b border-gray-200 last:border-b-0 items-center hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                                        <span className="text-blue-700 font-semibold text-sm">
                                          {member.user?.name?.charAt(0) || 'U'}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">{member.user?.name}</p>
                                        {member.turnOrder && (
                                          <p className="text-xs text-gray-500">Turn: {member.turnOrder}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      {payment ? (
                                        payment.verified ? (
                                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
                                            ✓ Verified
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 font-medium">
                                            ⏳ Pending
                                          </span>
                                        )
                                      ) : (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-red-100 text-red-800 font-medium">
                                          ❌ Unpaid
                                        </span>
                                      )}
                                    </div>
                                    <div>
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
                                          className="text-blue-600 hover:text-blue-800 text-sm underline font-medium"
                                        >
                                          View Proof
                                        </a>
                                      ) : (
                                        <span className="text-gray-400 text-sm">No proof</span>
                                      )}
                                    </div>
                                    <div>
                                      {payment ? (
                                        payment.verified ? (
                                          <span className="text-green-600 text-sm font-medium">✓ Verified</span>
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
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm disabled:opacity-50 transition-all duration-200 font-medium"
                                          >
                                            {verifyingPaymentId === payment._id ? 'Verifying...' : 'Verify Payment'}
                                          </button>
                                        )
                                      ) : (
                                        <span className="text-gray-400 text-sm">-</span>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Payment Action Section */}
                    <div className="bg-white border-t border-gray-200 p-4">
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

                        return (
                          <>
                            {isUserTurn ? (
                              /* Recipient View - Show collection summary and member status */
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-lg font-semibold text-blue-800 flex items-center">
                                    🎯 Your Turn - You're the Recipient
                                  </h4>
                                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    Cycle {cycle.cycleNumber}
                                  </span>
                                </div>
                                
                                {/* Collection Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                                    <p className="text-sm text-blue-700 font-medium">Total Expected</p>
                                    <p className="text-2xl font-bold text-blue-900">
                                      ₹{(group?.amount || group?.monthlyContribution || 0) * (members.length - 1)}
                                    </p>
                                  </div>
                                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                                    <p className="text-sm text-green-700 font-medium">Collected</p>
                                    <p className="text-2xl font-bold text-green-900">
                                      ₹{Array.isArray(cycle.payments) 
                                        ? cycle.payments
                                            .filter(p => {
                                              const isVerified = p.verified;
                                              const recipientMember = members.find(m => m.turnOrder === cycle.cycleNumber);
                                              const isNotRecipientPayment = recipientMember ? 
                                                String(p.member) !== String(recipientMember._id) : true;
                                              return isVerified && isNotRecipientPayment;
                                            })
                                            .reduce((sum, p) => sum + (p.amount || group?.monthlyContribution || 0), 0)
                                        : 0}
                                    </p>
                                  </div>
                                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                                    <p className="text-sm text-orange-700 font-medium">Remaining</p>
                                    <p className="text-2xl font-bold text-orange-900">
                                      ₹{((group?.amount || group?.monthlyContribution || 0) * (members.length - 1)) - 
                                        (Array.isArray(cycle.payments) 
                                          ? cycle.payments
                                              .filter(p => {
                                                const isVerified = p.verified;
                                                const recipientMember = members.find(m => m.turnOrder === cycle.cycleNumber);
                                                const isNotRecipientPayment = recipientMember ? 
                                                  String(p.member) !== String(recipientMember._id) : true;
                                                return isVerified && isNotRecipientPayment;
                                              })
                                              .reduce((sum, p) => sum + (p.amount || group?.monthlyContribution || 0), 0)
                                          : 0)}
                                    </p>
                                  </div>
                                </div>

                                {/* Collapsible Payment Status List */}
                                <div className="bg-gray-50 rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => toggleCycleCollapse(`${cycle._id}-status`)}
                                    className="w-full flex justify-between items-center p-3 text-left hover:bg-gray-100 transition-colors"
                                  >
                                    <span className="font-medium text-gray-700">Member Payment Status</span>
                                    {collapsedCycles[`${cycle._id}-status`] ? 
                                      <ChevronDown className="h-4 w-4" /> : 
                                      <ChevronUp className="h-4 w-4" />
                                    }
                                  </button>
                                  
                                  {!collapsedCycles[`${cycle._id}-status`] && (
                                    <div className="border-t border-gray-200">
                                      {members.filter(member => member.turnOrder !== cycle.cycleNumber).map(member => {
                                        const memberPayment = Array.isArray(cycle.payments) 
                                          ? cycle.payments.find(p => 
                                              String(p.member?._id || p.member) === String(member._id) ||
                                              String(p.user?._id || p.user) === String(member.user?._id)
                                            )
                                          : null;
                                        const memberPaid = !!memberPayment;
                                        const memberVerified = memberPayment?.verified;
                                        
                                        return (
                                          <div key={member._id} className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0 bg-white">
                                            <div className="flex items-center space-x-3">
                                              <div className={`w-3 h-3 rounded-full ${
                                                memberVerified ? 'bg-green-500' : memberPaid ? 'bg-yellow-500' : 'bg-gray-300'
                                              }`}></div>
                                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold text-sm">
                                                  {member.user?.name?.charAt(0) || 'U'}
                                                </span>
                                              </div>
                                              <div>
                                                <p className="font-medium text-gray-900">{member.user?.name}</p>
                                                <p className="text-xs text-gray-500">Turn: {member.turnOrder}</p>
                                              </div>
                                            </div>
                                            <div className="text-right">
                                              {memberVerified ? (
                                                <span className="text-green-600 font-semibold text-sm">✓ Paid</span>
                                              ) : memberPaid ? (
                                                <span className="text-yellow-600 font-semibold text-sm">⏳ Pending Verification</span>
                                              ) : (
                                                <span className="text-gray-500 text-sm">Not Paid</span>
                                              )}
                                              {memberPayment?.amount && (
                                                <p className="text-xs text-gray-600">₹{memberPayment.amount}</p>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              /* Non-recipient View - Show payment options */
                              <div className="space-y-3">
                                {hasPaid && isVerified ? (
                                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                          <span className="text-white text-sm">✓</span>
                                        </div>
                                        <span className="text-green-800 font-semibold">Payment Verified</span>
                                      </div>
                                      {proofUrl && (
                                        <a
                                          href={proofUrl.startsWith('/uploads') ? `http://localhost:5000${proofUrl}` : proofUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-green-700 underline text-sm hover:text-green-800"
                                        >
                                          View Proof
                                        </a>
                                      )}
                                    </div>
                                    {payment?.transactionId && (
                                      <p className="text-xs text-green-600 mt-1">
                                        Transaction ID: {payment.transactionId}
                                      </p>
                                    )}
                                  </div>
                                ) : selectedCycleId === cycle._id ? (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h5 className="font-medium text-blue-800 mb-3">Upload Payment Proof</h5>
                                    <div className="space-y-3">
                                      <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={handleProofUpload}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                      />
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => handleSubmitProof(cycle._id)}
                                          disabled={markAsPaidMutation.isLoading || !proofFile}
                                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                          {markAsPaidMutation.isLoading ? 'Uploading...' : 'Submit Proof'}
                                        </button>
                                        <button
                                          onClick={() => {
                                            setSelectedCycleId(null)
                                            setProofFile(null)
                                          }}
                                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-medium text-gray-900">Payment Required</p>
                                        <p className="text-sm text-gray-600">Amount to pay: ₹{total}</p>
                                      </div>
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => handlePhonePay(cycle._id)}
                                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                          Pay Now
                                        </button>
                                        <button
                                          onClick={() => handleMarkAsPaid(cycle._id)}
                                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                          Upload Proof
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {isOrganizer && <PendingRequests groupId={id} isOrganizer={isOrganizer} />}

      {/* Invite Members (only organizer) */}
      {isOrganizer && <InviteMembers groupId={id} groupName={group.name} />}
    </div>
  )
}

export default GroupDetails
