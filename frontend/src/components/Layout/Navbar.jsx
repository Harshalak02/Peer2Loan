import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { Users, LogOut, User, Plus, Home, UserPlus, AlertCircle } from 'lucide-react'
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
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Users className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-xl text-gray-800">Peer2Loan</span>
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/create-group"
                className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
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
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>

              {/* Join Group with Pending Invitation Badge */}
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

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
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
