// import React from 'react'
// import { useAuth } from '../hooks/useAuth'

// const Profile = () => {
//   const { user } = useAuth()

//   return (
//     <div className="max-w-2xl mx-auto">
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//         <div className="p-6 border-b border-gray-200">
//           <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
//           <p className="text-gray-600 mt-1">Manage your account information</p>
//         </div>

//         <div className="p-6 space-y-6">
//           <div className="flex items-center space-x-4">
//             <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
//               <span className="text-blue-600 font-semibold text-xl">
//                 {user?.name?.charAt(0) || 'U'}
//               </span>
//             </div>
//             <div>
//               <h2 className="text-xl font-semibold text-gray-800">{user?.name}</h2>
//               <p className="text-gray-600">{user?.email}</p>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Full Name
//               </label>
//               <input
//                 type="text"
//                 value={user?.name || ''}
//                 readOnly
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 value={user?.email || ''}
//                 readOnly
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Phone
//               </label>
//               <input
//                 type="tel"
//                 value={user?.phone || 'Not provided'}
//                 readOnly
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Member Since
//               </label>
//               <input
//                 type="text"
//                 value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
//                 readOnly
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
//               />
//             </div>
//           </div>

//           <div className="pt-6 border-t border-gray-200">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Statistics</h3>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <div className="text-center p-4 bg-gray-50 rounded-lg">
//                 <div className="text-2xl font-bold text-gray-800">0</div>
//                 <div className="text-sm text-gray-600">Groups</div>
//               </div>
//               <div className="text-center p-4 bg-gray-50 rounded-lg">
//                 <div className="text-2xl font-bold text-gray-800">0</div>
//                 <div className="text-sm text-gray-600">Active</div>
//               </div>
//               <div className="text-center p-4 bg-gray-50 rounded-lg">
//                 <div className="text-2xl font-bold text-gray-800">₹0</div>
//                 <div className="text-sm text-gray-600">Contributed</div>
//               </div>
//               <div className="text-center p-4 bg-gray-50 rounded-lg">
//                 <div className="text-2xl font-bold text-gray-800">₹0</div>
//                 <div className="text-sm text-gray-600">Received</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Profile

import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { User, Mail, Phone, Calendar, Shield, Users, DollarSign, TrendingUp } from 'lucide-react'

const Profile = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Your account information</p>

  )
}

export default Profile