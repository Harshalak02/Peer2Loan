import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Pages
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Groups from './pages/Groups.jsx'
import GroupDetails from './pages/GroupDetails.jsx'
import GroupReport from './pages/GroupReport.jsx'
import CreateGroup from './pages/CreateGroup.jsx'
import Profile from './pages/Profile.jsx'
import JoinGroup from './pages/JoinGroup.jsx'
import JoinGroupPreview from './pages/JoinGroupPreview.jsx'
import GroupInfo from './pages/GroupInfo.jsx'

// Components
import Navbar from './components/Layout/Navbar.jsx'
import ProtectedRoute from './components/Auth/ProtectedRoute.jsx'

// Hooks
import { AuthProvider } from './hooks/useAuth.jsx'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/groups"
                  element={
                    <ProtectedRoute>
                      <Groups />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/groups/:id"
                  element={
                    <ProtectedRoute>
                      <GroupDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/groups/:id/report"
                  element={
                    <ProtectedRoute>
                      <GroupReport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-group"
                  element={
                    <ProtectedRoute>
                      <CreateGroup />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/join-group"
                  element={
                    <ProtectedRoute>
                      <JoinGroup />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/join-group/:accessCode" 
                  element={
                    <ProtectedRoute>
                      <JoinGroupPreview />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <ToastContainer position="bottom-right" />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App