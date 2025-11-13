import React, { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Download, Printer, TrendingUp, Users, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react'
import { groupService, cycleService } from '../services/api.js'
import html2pdf from 'html2pdf.js'

const GroupReport = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const reportRef = useRef()
  const [selectedCycle, setSelectedCycle] = useState(null)

  // Fetch group data
  const { data: groupData, isLoading: groupLoading, error: groupError } = useQuery({
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

  if (groupLoading || cyclesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    )
  }

  if (groupError || cyclesError) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <AlertCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-red-800">Error Loading Report</h2>
              <p className="text-red-700 mt-1">Failed to load group or cycle data</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const group = groupData?.data?.group
  const members = groupData?.data?.members || []
  let cycles = []
  if (cyclesData?.data) {
    if (Array.isArray(cyclesData.data)) {
      cycles = cyclesData.data
    } else if (cyclesData.data.data && Array.isArray(cyclesData.data.data)) {
      cycles = cyclesData.data.data
    }
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Group Not Found</h2>
      </div>
    )
  }

  // Calculate statistics
  const calculateStats = () => {
    const stats = {
      totalMembers: members.length,
      totalCycles: cycles.length,
      totalContributions: 0,
      totalCollected: 0,
      onTimePayments: 0,
      latePayments: 0,
      pendingPayments: 0,
      penaltyApplied: 0,
      pendingAmount: 0,
      collectiveAmount: 0,
    }

    cycles.forEach(cycle => {
      stats.collectiveAmount += cycle.potAmount || 0
      if (Array.isArray(cycle.payments)) {
        cycle.payments.forEach(payment => {
          if (payment.verified) {
            stats.totalCollected += group.monthlyContribution
            stats.onTimePayments += 1
          } else if (payment.proof) {
            stats.latePayments += 1
          }
        })
      }
    })

    stats.totalContributions = group.monthlyContribution * members.length * cycles.length
    stats.pendingAmount = stats.totalContributions - stats.totalCollected
    stats.pendingPayments = (members.length * cycles.length) - stats.onTimePayments - stats.latePayments

    return stats
  }

  const stats = calculateStats()

  // Get payment details for a member in a cycle
  const getPaymentStatus = (cycle, member) => {
    if (!Array.isArray(cycle.payments)) return { status: 'unpaid', verified: false }
    
    const payment = cycle.payments.find(p => {
      const payMemberId = p.member?._id || p.member
      return payMemberId && String(payMemberId) === String(member._id)
    })
    
    if (!payment) return { status: 'unpaid', verified: false }
    if (payment.verified) return { status: 'verified', verified: true }
    if (payment.proof) return { status: 'pending', verified: false }
    return { status: 'submitted', verified: false }
  }

  // Generate PDF
  const generatePDF = () => {
    const element = reportRef.current
    const opt = {
      margin: 10,
      filename: `Group_Report_${group.name}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    }
    html2pdf().set(opt).from(element).save()
  }

  // Print report
  const printReport = () => {
    const element = reportRef.current
    const printWindow = window.open('', '_blank')
    printWindow.document.write(element.innerHTML)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 250)
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Group
        </button>
        <div className="flex space-x-2">
          <button
            onClick={generatePDF}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={printReport}
            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="text-center mb-8 pb-8 border-b-2 border-gray-200">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{group.name}</h1>
          <p className="text-gray-600 mb-4">{group.description}</p>
          <p className="text-sm text-gray-500">
            Report Generated: {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Group Overview Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <span>Group Overview</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Group Size */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Group Size</p>
                  <p className="text-3xl font-bold text-blue-600">{group.groupSize}</p>
                </div>
                <Users className="h-8 w-8 text-blue-300" />
              </div>
              <p className="text-xs text-gray-600 mt-2">Current Members: {members.length}</p>
            </div>

            {/* Monthly Contribution */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Monthly Contribution</p>
                  <p className="text-3xl font-bold text-green-600">₹{group.monthlyContribution}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-300" />
              </div>
            </div>

            {/* Duration */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Duration</p>
                  <p className="text-3xl font-bold text-purple-600">{group.duration}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-300" />
              </div>
              <p className="text-xs text-gray-600 mt-2">months</p>
            </div>

            {/* Total Collective */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Collective</p>
                  <p className="text-3xl font-bold text-orange-600">₹{stats.collectiveAmount}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-300" />
              </div>
            </div>
          </div>

          {/* Organizer Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Organizer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-800">{group.organizer?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-800">{group.organizer?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-gray-800 capitalize">{group.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Cycle</p>
                <p className="font-semibold text-gray-800">{group.currentCycle}/{group.duration}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <span>Payment Statistics</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* On-Time Payments */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold text-gray-800">On-Time Payments</h3>
              </div>
              <p className="text-3xl font-bold text-green-600 mb-1">{stats.onTimePayments}</p>
              <p className="text-sm text-gray-600">₹{stats.onTimePayments * group.monthlyContribution} collected</p>
            </div>

            {/* Late Payments */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center space-x-3 mb-3">
                <Clock className="h-6 w-6 text-yellow-600" />
                <h3 className="font-semibold text-gray-800">Pending Verification</h3>
              </div>
              <p className="text-3xl font-bold text-yellow-600 mb-1">{stats.latePayments}</p>
              <p className="text-sm text-gray-600">Awaiting organizer verification</p>
            </div>

            {/* Unpaid */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center space-x-3 mb-3">
                <XCircle className="h-6 w-6 text-red-600" />
                <h3 className="font-semibold text-gray-800">Pending Payments</h3>
              </div>
              <p className="text-3xl font-bold text-red-600 mb-1">{stats.pendingPayments}</p>
              <p className="text-sm text-gray-600">₹{stats.pendingAmount} outstanding</p>
            </div>
          </div>

          {/* Collection Summary */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Collection Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-700">Total Expected Contributions</span>
                <span className="font-bold">₹{stats.totalContributions}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-700">Total Collected (Verified)</span>
                <span className="font-bold text-green-600">₹{stats.totalCollected}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Outstanding Amount</span>
                <span className="font-bold text-red-600">₹{stats.pendingAmount}</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(stats.totalCollected / stats.totalContributions) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Collection Rate: {((stats.totalCollected / stats.totalContributions) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <Users className="h-6 w-6 text-purple-600" />
            <span>Members ({members.length})</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">Member Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">Email</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-800">Turn Order</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-800">Role</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-800">Status</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member, idx) => (
                  <tr key={member._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">{member.user?.name}</td>
                    <td className="px-4 py-3 text-gray-600">{member.user?.email}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {member.turnOrder || idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        member.role === 'organizer' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.role === 'organizer' ? '👤 Organizer' : '👥 Member'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cycles & Payments Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <DollarSign className="h-6 w-6 text-orange-600" />
            <span>Payment Cycles ({cycles.length})</span>
          </h2>

          {cycles.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No payment cycles found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cycles.map((cycle) => (
                <div key={cycle._id} className="border-2 border-gray-300 rounded-lg p-6">
                  {/* Cycle Header */}
                  <div className="flex justify-between items-start mb-4 pb-4 border-b-2 border-gray-200">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Cycle {cycle.cycleNumber}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {new Date(cycle.startDate).toLocaleDateString('en-IN')} - {new Date(cycle.endDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-800">₹{cycle.potAmount}</p>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                        cycle.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : cycle.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {cycle.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Cycle Payments Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-2 text-left font-semibold text-gray-800">Member</th>
                          <th className="px-4 py-2 text-center font-semibold text-gray-800">Amount</th>
                          <th className="px-4 py-2 text-center font-semibold text-gray-800">Status</th>
                          <th className="px-4 py-2 text-center font-semibold text-gray-800">Verification</th>
                          <th className="px-4 py-2 text-center font-semibold text-gray-800">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member) => {
                          const paymentStatus = getPaymentStatus(cycle, member)
                          const payment = Array.isArray(cycle.payments) 
                            ? cycle.payments.find(p => {
                                const payMemberId = p.member?._id || p.member
                                return payMemberId && String(payMemberId) === String(member._id)
                              })
                            : null

                          return (
                            <tr key={`${cycle._id}-${member._id}`} className="border-b border-gray-200">
                              <td className="px-4 py-2 text-gray-800 font-medium">{member.user?.name}</td>
                              <td className="px-4 py-2 text-center text-gray-700">₹{group.monthlyContribution}</td>
                              <td className="px-4 py-2 text-center">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                  paymentStatus.status === 'verified' 
                                    ? 'bg-green-100 text-green-800'
                                    : paymentStatus.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : paymentStatus.status === 'submitted'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {paymentStatus.status === 'verified' ? '✓ Verified' : 
                                   paymentStatus.status === 'pending' ? '⏳ Pending' :
                                   paymentStatus.status === 'submitted' ? '📋 Submitted' : '✗ Unpaid'}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-center">
                                {payment?.verified ? (
                                  <span className="text-green-600 font-bold">Approved</span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-center text-gray-600 text-xs">
                                {payment?.notes || '-'}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Cycle Summary */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Verified Payments</p>
                        <p className="text-lg font-bold text-green-600">
                          {Array.isArray(cycle.payments) ? cycle.payments.filter(p => p.verified).length : 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Pending Verification</p>
                        <p className="text-lg font-bold text-yellow-600">
                          {Array.isArray(cycle.payments) ? cycle.payments.filter(p => p.proof && !p.verified).length : 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Outstanding</p>
                        <p className="text-lg font-bold text-red-600">
                          {members.length - (Array.isArray(cycle.payments) ? cycle.payments.length : 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-6 text-center text-gray-600 text-sm">
          <p>This is an official report of the group "{group.name}"</p>
          <p className="mt-2">Generated on {new Date().toLocaleDateString('en-IN')} at {new Date().toLocaleTimeString('en-IN')}</p>
          <p className="mt-4 text-xs text-gray-500">For internal use only. Please maintain confidentiality.</p>
        </div>
      </div>
    </div>
  )
}

export default GroupReport
