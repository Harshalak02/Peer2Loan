import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function PhonePay() {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const navigate = useNavigate()

  const handlePay = async () => {
    try {
      const resp = await axios.post('/api/phonepe/create-payment', {
        name,
        amount
      })
      if (resp.data?.success && resp.data.redirectUrl) {
        // redirect to PhonePe checkout (sandbox)
        window.location.href = resp.data.redirectUrl
      } else {
        alert('Failed to create payment')
      }
    } catch (err) {
      console.error('Payment error', err?.response?.data || err.message)
      alert('Payment initiation failed')
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">PhonePe Test Payment</h2>
      <div className="mb-2">
        <input
          className="border rounded px-2 py-1 w-full"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <input
          className="border rounded px-2 py-1 w-full"
          placeholder="Amount (INR)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handlePay}>
          Pay
        </button>
        <button className="px-4 py-2 border rounded" onClick={() => navigate('/groups')}>
          Back
        </button>
      </div>
    </div>
  )
}
