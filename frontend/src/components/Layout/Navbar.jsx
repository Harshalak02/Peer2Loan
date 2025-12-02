import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { Users, LogOut, User, Plus, Home, UserPlus, AlertCircle } from 'lucide-react'
import NotificationBell from '../Notifications/NotificationBell'
import { invitationService } from '../../services/api.js'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Fetch pending invitations for the current user
  const { data: invitationsData } = useQuery(
    ['userInvitations', user?._id],
    () => invitationService.getUserInvitations(user?._id),
    { enabled: !!user?._id }
  )

  const pendingInvitations = invitationsData?.data?.filter(inv => inv.status === 'pending') || []

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <Users className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-bold text-xl text-gray-800 group-hover:text-blue-600 transition-colors duration-300">Peer2Loan</span>
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-all duration-300 p-2 rounded-lg hover:bg-blue-50 hover:scale-105 transform"
              >
                <Home className="h-5 w-5 transition-transform duration-300" />
              </Link>

              <Link
                to="/create-group"
                className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg transform"
              >
                <Plus className="h-4 w-4 transition-transform duration-300" />
                <span>Create Group</span>
              </Link>

              {/* <Link
                to="/groups"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                My Groups
              </Link> */}

              <Link
                to="/profile"
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-all duration-300 p-2 rounded-lg hover:bg-blue-50 hover:scale-105 transform"
              >
                <User className="h-4 w-4 transition-transform duration-300" />
                <span>Profile</span>
              </Link>

              {/* Join Group with Pending Invitation Badge */}
              <Link
                to="/join-group"
                className="relative flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-100 transition-all duration-300 hover:scale-105 hover:shadow-md transform"
              >
                <UserPlus className="h-4 w-4 transition-transform duration-300" />
                <span>Join Group</span>

                {pendingInvitations.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {pendingInvitations.length}
                  </span>
                )}
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-all duration-300 p-2 rounded-lg hover:bg-red-50 hover:scale-105 transform"
              >
                <LogOut className="h-4 w-4 transition-transform duration-300" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-blue-600 transition-colors">
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
              <Link
                to="/join-group"
                className="relative flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span>Join Group</span>

                {pendingInvitations.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {pendingInvitations.length}
                  </span>
                )}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
