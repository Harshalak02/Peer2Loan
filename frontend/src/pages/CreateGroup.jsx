import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { groupService } from '../services/api'

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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Create New Group</h1>
          <p className="text-gray-600 mt-1">
            Set up a new peer-to-peer lending group with custom rules
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Group name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter group name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  {...register('currency')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Contribution *
                </label>
                <input
                  type="number"
                  {...register('monthlyContribution', {
                    required: 'Monthly contribution is required',
                    min: { value: 1, message: 'Must be at least 1' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5000"
                />
                {errors.monthlyContribution && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.monthlyContribution.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Size *
                </label>
                <input
                  type="number"
                  {...register('groupSize', {
                    required: 'Group size is required',
                    min: { value: 2, message: 'Minimum 2 members required' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12"
                />
                {errors.groupSize && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.groupSize.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (months) *
                </label>
                <input
                  type="number"
                  {...register('duration', {
                    required: 'Duration is required',
                    min: { value: 1, message: 'Minimum 1 month' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12"
                />
                {errors.duration && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.duration.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  {...register('startDate', { required: 'Start date is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Window */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Payment Window
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Window Start Day *
                </label>
                <input
                  type="number"
                  {...register('paymentWindowStart', {
                    required: 'Start day is required',
                    min: { value: 1, message: 'Must be between 1-31' },
                    max: { value: 31, message: 'Must be between 1-31' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Window End Day *
                </label>
                <input
                  type="number"
                  {...register('paymentWindowEnd', {
                    required: 'End day is required',
                    min: { value: 1, message: 'Must be between 1-31' },
                    max: { value: 31, message: 'Must be between 1-31' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="7"
                />
              </div>
            </div>
          </div>

          {/* Turn Order Policy */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Turn Order Policy
            </h2>
            <select
              {...register('turnOrderPolicy')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fixed">Fixed Order</option>
              <option value="random">Random</option>
              <option value="need-based">Need-based (Admin decides)</option>
              <option value="seniority">Seniority-based</option>
            </select>
          </div>

          {/* Penalty Rules */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Penalty Rules
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Late Fee Amount
                </label>
                <input
                  type="number"
                  {...register('lateFee')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grace Period (days)
                </label>
                <input
                  type="number"
                  {...register('gracePeriod')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('autoApplyPenalty')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Automatically apply penalty after grace period
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('autoReminders')}
                  defaultChecked
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Send automatic payment reminders
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('requirePaymentProof')}
                  defaultChecked
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Require payment proof
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('allowTurnReassignment')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Allow turn reassignment in case of defaults
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={createGroupMutation.isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createGroupMutation.isLoading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateGroup