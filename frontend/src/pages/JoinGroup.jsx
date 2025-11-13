// import React from 'react';
// import { useForm } from 'react-hook-form';
// import { useMutation, useQuery } from '@tanstack/react-query';
// import { toast } from 'react-toastify';
// import { Link, useNavigate } from 'react-router-dom';
// import { Users, Mail, Clock, UserCheck } from 'lucide-react'
// import { invitationService } from '../services/api.js'

// const JoinGroup = () => {
//   const navigate = useNavigate();
//   const { register, handleSubmit, formState: { errors }, reset } = useForm()

//   const { data: invitationsData, isLoading: isLoadingInvitations, error: invitationsError } = useQuery({
//     queryKey: ['myInvitations'],
//     queryFn: async () => {
//       const response = await invitationService.getMyInvitations();
//       return response.data;
//     }
//   })

//   const joinMutation = useMutation({
//     mutationFn: (accessCode) => invitationService.joinGroup(accessCode),
//     onSuccess: (data) => {
//       toast.success('Successfully joined the group!');
//       reset();
//       refetch(); // Refresh invitations list
//       // Navigate to the group details page after successful join
//       if (data?.data?.group?._id) {
//         navigate(`/groups/${data.data.group._id}`);
//       } else {
//         navigate('/groups');
//       }
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || 'Failed to join group');
//     }
//   })

//   const onSubmit = (data) => {
//     joinMutation.mutate(data.accessCode)
//   }

//   const invitations = Array.isArray(invitationsData) ? invitationsData : [];

//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//         <div className="p-6 border-b border-gray-200">
//           <h1 className="text-2xl font-bold text-gray-800">Join a Group</h1>
//           <p className="text-gray-600 mt-1">Use an access code to join an existing group</p>
//         </div>

//         <div className="p-6">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Join with Access Code */}
//             <div>
//               <h2 className="text-lg font-semibold text-gray-800 mb-4">Join with Access Code</h2>
//               // Replace the access code form with this:
// <form onSubmit={handleSubmit((data) => {
//   navigate(`/join-group/${data.accessCode}`)
// })} className="space-y-4">
//   <div>
//     <label className="block text-sm font-medium text-gray-700 mb-1">
//       Access Code
//     </label>
//     <input
//       type="text"
//       {...register('accessCode', {
//         required: 'Access code is required',
//         pattern: {
//           value: /^[A-Z0-9]{6,12}$/,
//           message: 'Invalid access code format'
//         }
//       })}
//       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
//       placeholder="Enter access code"
//     />
//     {errors.accessCode && (
//       <p className="text-red-500 text-sm mt-1">{errors.accessCode.message}</p>
//     )}
//   </div>

//   <button
//     type="submit"
//     className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//   >
//     View Group & Request to Join
//   </button>
// </form>
//             </div>

//             {/* Pending Invitations */}
//             <div>
//               <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Invitations</h2>
              
//               {isLoadingInvitations ? (
//                 <div className="text-center py-8">
//                   <div className="loading-spinner mx-auto"></div>
//                   <p className="text-gray-600 mt-2">Loading invitations...</p>
//                 </div>
//               ) : invitationsError ? (
//                 <div className="text-center py-8 text-red-600">
//                   <p>Failed to load invitations</p>
//                 </div>
//               ) : invitations.length === 0 ? (
//                 <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
//                   <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                   <p className="text-gray-600">No pending invitations</p>
//                   <p className="text-sm text-gray-500 mt-1">Ask a group organizer to send you an invitation</p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {invitations.map((invitation) => (
//                     <div key={invitation._id} className="border border-gray-200 rounded-lg p-4">
//                       <div className="flex items-center justify-between mb-2">
//                         <h3 className="font-semibold text-gray-800">{invitation.group.name}</h3>
//                         <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
//                           Pending
//                         </span>
//                       </div>
                      
//                       <div className="space-y-2 text-sm text-gray-600">
//                         <div className="flex items-center space-x-2">
//                           <UserCheck className="h-4 w-4" />
//                           <span>Invited by: {invitation.invitedBy.name}</span>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <Clock className="h-4 w-4" />
//                           <span>Expires: {new Date(invitation.expiresAt).toLocaleDateString()}</span>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <Users className="h-4 w-4" />
//                           <span>Role: {invitation.role}</span>
//                         </div>
//                       </div>

//                       <div className="mt-3 flex space-x-2">
//                         <button
//                           onClick={() => joinMutation.mutate(invitation.accessCode)}
//                           disabled={joinMutation.isLoading}
//                           className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
//                         >
//                           Accept
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default JoinGroup

import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Users, Mail } from 'lucide-react'

const JoinGroup = () => {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = (data) => {
    // Navigate to group info page with the access code
    navigate(`/join-group/${data.accessCode.toUpperCase()}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Join a Group</h1>
          <p className="text-gray-600 mt-1">Enter the access code provided by the group organizer</p>
        </div>

        <div className="p-6">
          <div className="text-center mb-8">
            <Users className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Join with Access Code</h2>
            <p className="text-gray-600">
              You'll be able to review the group information before requesting to join
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Code
              </label>
              <input
                type="text"
                {...register('accessCode', {
                  required: 'Access code is required',
                  pattern: {
                    value: /^[A-Z0-9]{4,12}$/,
                    message: 'Access code should be 4-12 characters (letters and numbers only)'
                  }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono uppercase tracking-wider"
                placeholder="ENTER ACCESS CODE"
                style={{ letterSpacing: '0.2em' }}
              />
              {errors.accessCode && (
                <p className="text-red-500 text-sm mt-2 text-center">{errors.accessCode.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-lg font-semibold"
            >
              View Group & Request to Join
            </button>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-800">How to get an access code?</h3>
                <p className="text-blue-700 text-sm mt-1">
                  Ask a group organizer to send you an invitation with the access code.
                  The code is usually 6-8 characters long and contains letters and numbers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JoinGroup