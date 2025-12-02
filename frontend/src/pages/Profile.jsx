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
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          {/* Profile Header */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-2xl flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-2xl">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-gray-600 mt-1">{user?.email}</p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  <span>Verified Member</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 text-gray-400" />
                  Full Name
                </label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-gray-900">{user?.name || 'Not provided'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400" />
                  Email Address
                </label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-gray-900">{user?.email || 'Not provided'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" />
                  Phone Number
                </label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-gray-900">{user?.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Member Since
                </label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Statistics - Using existing mock data */}
          {/* <div className="p-8 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Statistics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-5 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-blue-50 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600 mt-1">Groups</div>
              </div>

              <div className="p-5 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-emerald-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600 mt-1">Active</div>
              </div>

              <div className="p-5 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-purple-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">₹0</div>
                <div className="text-sm text-gray-600 mt-1">Contributed</div>
              </div>

              <div className="p-5 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-orange-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">₹0</div>
                <div className="text-sm text-gray-600 mt-1">Received</div>
              </div>
            </div>
          </div> */}

          {/* Security Note */}
          <div className="p-8 border-t border-gray-100 bg-gradient-to-r from-blue-50/50 to-emerald-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Your information is secure</p>
                <p className="text-xs text-gray-500 mt-1">
                  
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile