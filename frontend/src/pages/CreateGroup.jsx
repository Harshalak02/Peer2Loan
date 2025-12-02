// import React from 'react'
// import { useForm } from 'react-hook-form'
// import { useNavigate } from 'react-router-dom'
// import { useMutation } from '@tanstack/react-query'
// import { toast } from 'react-toastify'
// import { groupService } from '../services/api'

// const CreateGroup = () => {
//   const navigate = useNavigate()
//   const { register, handleSubmit, formState: { errors }, watch } = useForm()

//   // In your CreateGroup.jsx, update the mutation to log the response
// const createGroupMutation = useMutation({
//   mutationFn: (groupData) => groupService.createGroup(groupData),
//   onSuccess: (data) => {
//     console.log('Group creation response:', data)
//     console.log('Group ID:', data.data._id) // Check if we're getting the ID
//     toast.success('Group created successfully!')
//     navigate(`/groups/${data.data._id}`)
//   },
//   onError: (error) => {
//     console.error('Group creation error:', error)
//     console.error('Error response:', error.response)
//     toast.error(error.response?.data?.message || 'Failed to create group')
//   }
// })
//   const onSubmit = (data) => {
//     const groupData = {
//       ...data,
//       monthlyContribution: Number(data.monthlyContribution),
//       groupSize: Number(data.groupSize),
//       duration: Number(data.duration),
//       paymentWindow: {
//         startDay: Number(data.paymentWindowStart),
//         endDay: Number(data.paymentWindowEnd)
//       },
//       penaltyRules: {
//         lateFee: Number(data.lateFee) || 0,
//         gracePeriod: Number(data.gracePeriod) || 0,
//         autoApply: data.autoApplyPenalty || false
//       },
//       rules: {
//         allowTurnReassignment: data.allowTurnReassignment || false,
//         autoReminders: data.autoReminders !== false,
//         requirePaymentProof: data.requirePaymentProof !== false
//       }
//     }

//     createGroupMutation.mutate(groupData)
//   }

//   return (
//     <div className="max-w-2xl mx-auto">
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//         <div className="p-6 border-b border-gray-200">
//           <h1 className="text-2xl font-bold text-gray-800">Create New Group</h1>
//           <p className="text-gray-600 mt-1">
//             Set up a new peer-to-peer lending group with custom rules
//           </p>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
//           {/* Basic Information */}
//           <div>
//             <h2 className="text-lg font-semibold text-gray-800 mb-4">
//               Basic Information
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Group Name *
//                 </label>
//                 <input
//                   type="text"
//                   {...register('name', { required: 'Group name is required' })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter group name"
//                 />
//                 {errors.name && (
//                   <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Currency
//                 </label>
//                 <select
//                   {...register('currency')}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="INR">Indian Rupee (₹)</option>
//                   <option value="USD">US Dollar ($)</option>
//                   <option value="EUR">Euro (€)</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Monthly Contribution *
//                 </label>
//                 <input
//                   type="number"
//                   {...register('monthlyContribution', {
//                     required: 'Monthly contribution is required',
//                     min: { value: 1, message: 'Must be at least 1' }
//                   })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="5000"
//                 />
//                 {errors.monthlyContribution && (
//                   <p className="text-red-500 text-sm mt-1">
//                     {errors.monthlyContribution.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Group Size *
//                 </label>
//                 <input
//                   type="number"
//                   {...register('groupSize', {
//                     required: 'Group size is required',
//                     min: { value: 2, message: 'Minimum 2 members required' }
//                   })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="12"
//                 />
//                 {errors.groupSize && (
//                   <p className="text-red-500 text-sm mt-1">
//                     {errors.groupSize.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Duration (months) *
//                 </label>
//                 <input
//                   type="number"
//                   {...register('duration', {
//                     required: 'Duration is required',
//                     min: { value: 1, message: 'Minimum 1 month' }
//                   })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="12"
//                 />
//                 {errors.duration && (
//                   <p className="text-red-500 text-sm mt-1">
//                     {errors.duration.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Start Date *
//                 </label>
//                 <input
//                   type="date"
//                   {...register('startDate', { required: 'Start date is required' })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 {errors.startDate && (
//                   <p className="text-red-500 text-sm mt-1">
//                     {errors.startDate.message}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Payment Window */}
//           <div>
//             <h2 className="text-lg font-semibold text-gray-800 mb-4">
//               Payment Window
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Payment Window Start Day *
//                 </label>
//                 <input
//                   type="number"
//                   {...register('paymentWindowStart', {
//                     required: 'Start day is required',
//                     min: { value: 1, message: 'Must be between 1-31' },
//                     max: { value: 31, message: 'Must be between 1-31' }
//                   })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="1"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Payment Window End Day *
//                 </label>
//                 <input
//                   type="number"
//                   {...register('paymentWindowEnd', {
//                     required: 'End day is required',
//                     min: { value: 1, message: 'Must be between 1-31' },
//                     max: { value: 31, message: 'Must be between 1-31' }
//                   })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="7"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Turn Order Policy */}
//           <div>
//             <h2 className="text-lg font-semibold text-gray-800 mb-4">
//               Turn Order Policy
//             </h2>
//             <select
//               {...register('turnOrderPolicy')}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="fixed">Fixed Order</option>
//               <option value="random">Random</option>
//               <option value="need-based">Need-based (Admin decides)</option>
//               <option value="seniority">Seniority-based</option>
//             </select>
//           </div>

//           {/* Penalty Rules */}
//           <div>
//             <h2 className="text-lg font-semibold text-gray-800 mb-4">
//               Penalty Rules
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Late Fee Amount
//                 </label>
//                 <input
//                   type="number"
//                   {...register('lateFee')}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="0"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Grace Period (days)
//                 </label>
//                 <input
//                   type="number"
//                   {...register('gracePeriod')}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="0"
//                 />
//               </div>
//             </div>

//             <div className="mt-4 space-y-2">
//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   {...register('autoApplyPenalty')}
//                   className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                 />
//                 <span className="ml-2 text-sm text-gray-700">
//                   Automatically apply penalty after grace period
//                 </span>
//               </label>

//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   {...register('autoReminders')}
//                   defaultChecked
//                   className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                 />
//                 <span className="ml-2 text-sm text-gray-700">
//                   Send automatic payment reminders
//                 </span>
//               </label>

//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   {...register('requirePaymentProof')}
//                   defaultChecked
//                   className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                 />
//                 <span className="ml-2 text-sm text-gray-700">
//                   Require payment proof
//                 </span>
//               </label>

//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   {...register('allowTurnReassignment')}
//                   className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                 />
//                 <span className="ml-2 text-sm text-gray-700">
//                   Allow turn reassignment in case of defaults
//                 </span>
//               </label>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <div className="flex justify-end pt-6">
//             <button
//               type="submit"
//               disabled={createGroupMutation.isLoading}
//               className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               {createGroupMutation.isLoading ? 'Creating...' : 'Create Group'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

// export default CreateGroup


// --------------- new ui 

import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { groupService } from '../services/api'
import { 
  Building2, 
  Users, 
  Calendar, 
  DollarSign, 
  Shield, 
  Clock, 
  Settings,
  AlertCircle,
  ArrowRight
} from 'lucide-react'

const CreateGroup = () => {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors }, watch } = useForm()

  const createGroupMutation = useMutation({
  mutationFn: (groupData) => groupService.createGroup(groupData),
  onSuccess: (data) => {
    console.log('Group creation response:', data)
    console.log('Group ID:', data.data._id)
    toast.success('Group created successfully!')
    navigate('/')
  },
  onError: (error) => {
    console.error('Group creation error:', error)
    console.error('Error response:', error.response)
    toast.error(error.response?.data?.message || 'Failed to create group')
  }
})
  const onSubmit = (data) => {
    const groupData = {
      ...data,
      monthlyContribution: Number(data.monthlyContribution),
      groupSize: Number(data.groupSize),
      duration: Number(data.duration),
      paymentWindow: {
        startDay: Number(data.paymentWindowStart),
        endDay: Number(data.paymentWindowEnd)
      },
      penaltyRules: {
        lateFee: Number(data.lateFee) || 0,
        gracePeriod: Number(data.gracePeriod) || 0,
        autoApply: data.autoApplyPenalty || false
      },
      rules: {
        allowTurnReassignment: data.allowTurnReassignment || false,
        autoReminders: data.autoReminders !== false,
        requirePaymentProof: data.requirePaymentProof !== false
      }
    }

    createGroupMutation.mutate(groupData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Group</h1>
          </div>
          <p className="text-gray-600">
            Set up a trusted peer-to-peer lending circle with custom rules
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar - Guide */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Setup Guide</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Basic Info</p>
                    <p className="text-xs text-gray-500">Name, currency, contribution</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment Settings</p>
                    <p className="text-xs text-gray-500">Windows, penalties, rules</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Review & Create</p>
                    <p className="text-xs text-gray-500">Finalize your group setup</p>
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Secure Setup</p>
                    <p className="text-xs text-gray-500">All data is encrypted</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                {/* Basic Information */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-blue-50 rounded-lg">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        Group Name *
                      </label>
                      <input
                        type="text"
                        {...register('name', { required: 'Group name is required' })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter group name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        Currency
                      </label>
                      <select
                        {...register('currency')}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="INR">Indian Rupee (₹)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                        Monthly Contribution *
                      </label>
                      <input
                        type="number"
                        {...register('monthlyContribution', {
                          required: 'Monthly contribution is required',
                          min: { value: 1, message: 'Must be at least 1' }
                        })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="5000"
                      />
                      {errors.monthlyContribution && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.monthlyContribution.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        Group Size *
                      </label>
                      <input
                        type="number"
                        {...register('groupSize', {
                          required: 'Group size is required',
                          min: { value: 2, message: 'Minimum 2 members required' }
                        })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="12"
                      />
                      {errors.groupSize && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.groupSize.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        Duration (months) *
                      </label>
                      <input
                        type="number"
                        {...register('duration', {
                          required: 'Duration is required',
                          min: { value: 1, message: 'Minimum 1 month' }
                        })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="12"
                      />
                      {errors.duration && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.duration.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        {...register('startDate', { required: 'Start date is required' })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                      {errors.startDate && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.startDate.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Window */}
                <div className="mb-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-purple-50 rounded-lg">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Payment Window</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Payment Window Start Day *
                      </label>
                      <input
                        type="number"
                        {...register('paymentWindowStart', {
                          required: 'Start day is required',
                          min: { value: 1, message: 'Must be between 1-31' },
                          max: { value: 31, message: 'Must be between 1-31' }
                        })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Payment Window End Day *
                      </label>
                      <input
                        type="number"
                        {...register('paymentWindowEnd', {
                          required: 'End day is required',
                          min: { value: 1, message: 'Must be between 1-31' },
                          max: { value: 31, message: 'Must be between 1-31' }
                        })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="7"
                      />
                    </div>
                  </div>
                </div>

                {/* Turn Order Policy */}
                <div className="mb-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-emerald-50 rounded-lg">
                      <Settings className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Turn Order Policy</h2>
                  </div>
                  
                  <select
                    {...register('turnOrderPolicy')}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="fixed">Fixed Order</option>
                    <option value="random">Random</option>
                    <option value="need-based">Need-based (Admin decides)</option>
                    <option value="seniority">Seniority-based</option>
                  </select>
                </div>

                {/* Penalty Rules */}
                <div className="pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-orange-50 rounded-lg">
                      <Shield className="h-5 w-5 text-orange-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Rules & Penalties</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Late Fee Amount
                      </label>
                      <input
                        type="number"
                        {...register('lateFee')}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Grace Period (days)
                      </label>
                      <input
                        type="number"
                        {...register('gracePeriod')}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('autoApplyPenalty')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        Automatically apply penalty after grace period
                      </span>
                    </label>

                    <label className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('autoReminders')}
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        Send automatic payment reminders
                      </span>
                    </label>

                    <label className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('requirePaymentProof')}
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        Require payment proof
                      </span>
                    </label>

                    <label className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('allowTurnReassignment')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        Allow turn reassignment in case of defaults
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={createGroupMutation.isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  <div className="flex items-center justify-center">
                    {createGroupMutation.isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Creating Group...
                      </>
                    ) : (
                      <>
                        Create Group
                        <ArrowRight className="ml-3 h-5 w-5" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateGroup