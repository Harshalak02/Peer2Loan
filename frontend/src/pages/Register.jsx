// import React from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useForm } from 'react-hook-form'
// import { useMutation } from '@tanstack/react-query'
// import { toast } from 'react-toastify'
// import { useAuth } from '../hooks/useAuth'

// const Register = () => {
//   const { register: registerUser } = useAuth()
//   const navigate = useNavigate()
//   const { register, handleSubmit, formState: { errors } } = useForm()

//   const registerMutation = useMutation({
//     mutationFn: (userData) => registerUser(userData),
//     onSuccess: () => {
//       toast.success('Account created successfully!')
//       navigate('/')
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || 'Registration failed')
//     }
//   })

//   const onSubmit = (data) => {
//     registerMutation.mutate(data)
//   }

//   return (
//     <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
//       <h1 className="text-2xl font-bold text-gray-800 mb-6">Join Peer2Loan</h1>
      
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Full Name
//           </label>
//           <input
//             type="text"
//             {...register('name', { required: 'Full name is required' })}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Enter your full name"
//           />
//           {errors.name && (
//             <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
//           )}
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Email
//           </label>
//           <input
//             type="email"
//             {...register('email', { 
//               required: 'Email is required',
//               pattern: {
//                 value: /^\S+@\S+$/i,
//                 message: 'Invalid email address'
//               }
//             })}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Enter your email"
//           />
//           {errors.email && (
//             <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
//           )}
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Phone
//           </label>
//           <input
//             type="tel"
//             {...register('phone')}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Enter your phone number"
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Password
//           </label>
//           <input
//             type="password"
//             {...register('password', { 
//               required: 'Password is required',
//               minLength: {
//                 value: 6,
//                 message: 'Password must be at least 6 characters'
//               }
//             })}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Create a password"
//           />
//           {errors.password && (
//             <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
//           )}
//         </div>
        
//         <button
//           type="submit"
//           disabled={registerMutation.isLoading}
//           className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//         >
//           {registerMutation.isLoading ? 'Creating Account...' : 'Create Account'}
//         </button>
//       </form>
      
//       <p className="mt-6 text-center text-gray-600">
//         Already have an account?{' '}
//         <Link to="/login" className="text-blue-600 hover:underline">
//           Login here
//         </Link>
//       </p>
//     </div>
//   )
// }

// export default Register

// import React from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useForm } from 'react-hook-form'
// import { useMutation } from '@tanstack/react-query'
// import { toast } from 'react-toastify'
// import { useAuth } from '../hooks/useAuth'

// const Register = () => {
//   const { register: registerUser } = useAuth()
//   const navigate = useNavigate()
//   const { register, handleSubmit, formState: { errors } } = useForm()

//   const registerMutation = useMutation({
//     mutationFn: (userData) => registerUser(userData),
//     onSuccess: () => {
//       toast.success('Account created successfully!')
//       navigate('/')
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || 'Registration failed')
//     }
//   })

//   const onSubmit = (data) => {
//     registerMutation.mutate(data)
//   }

//   return (
//     <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
//       <h1 className="text-2xl font-bold text-gray-800 mb-6">Join Peer2Loan</h1>
      
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Full Name
//           </label>
//           <input
//             type="text"
//             {...register('name', { required: 'Full name is required' })}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Enter your full name"
//           />
//           {errors.name && (
//             <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
//           )}
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Email
//           </label>
//           <input
//             type="email"
//             {...register('email', { 
//               required: 'Email is required',
//               pattern: {
//                 value: /^\S+@\S+$/i,
//                 message: 'Invalid email address'
//               }
//             })}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Enter your email"
//           />
//           {errors.email && (
//             <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
//           )}
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Phone
//           </label>
//           <input
//             type="tel"
//             {...register('phone')}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Enter your phone number"
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Password
//           </label>
//           <input
//             type="password"
//             {...register('password', { 
//               required: 'Password is required',
//               minLength: {
//                 value: 6,
//                 message: 'Password must be at least 6 characters'
//               }
//             })}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Create a password"
//           />
//           {errors.password && (
//             <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
//           )}
//         </div>
        
//         <button
//           type="submit"
//           disabled={registerMutation.isLoading}
//           className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//         >
//           {registerMutation.isLoading ? 'Creating Account...' : 'Create Account'}
//         </button>
//       </form>
      
//       <p className="mt-6 text-center text-gray-600">
//         Already have an account?{' '}
//         <Link to="/login" className="text-blue-600 hover:underline">
//           Login here
//         </Link>
//       </p>
//     </div>
//   )
// }

// export default Register


import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useAuth } from '../hooks/useAuth'

const Register = () => {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const registerMutation = useMutation({
    mutationFn: (userData) => registerUser(userData),
    onSuccess: () => {
      toast.success('Account created successfully!')
      navigate('/')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Registration failed')
    }
  })

  const onSubmit = (data) => {
    registerMutation.mutate(data)
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Join Peer2Loan</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            {...register('name', { required: 'Full name is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your full name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Invalid email address'
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            {...register('phone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your phone number"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Create a password"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={registerMutation.isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {registerMutation.isLoading ? 'Creating Account...' : 'Create Account'}
        </button>

        {/* --- GOOGLE BUTTON SECTION START --- */}
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign up with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}
            className="mt-4 w-full flex items-center justify-center gap-2 border border-gray-300 bg-white py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              className="w-5 h-5" 
            />
            <span className="text-gray-700 font-medium">Sign up with Google</span>
          </button>
        </div>
        {/* --- GOOGLE BUTTON SECTION END --- */}

      </form>
      
      <p className="mt-6 text-center text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  )
}

export default Register