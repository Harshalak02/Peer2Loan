import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get('token');
      
      if (token) {
        // 1. Store token
        localStorage.setItem('token', token);
        
        try {
          // 2. Verify user and check for missing details (like Phone)
          const response = await api.get('/auth/verify');
          const user = response.data.user;

          toast.success('Logged in successfully!');

          // 3. Conditional Redirect
          if (!user.phone) {
            toast.info('Please update your phone number to continue.');
            // Force a reload to ensure Navbar/AuthProvider picks up the new user state
            window.location.href = '/profile'; 
          } else {
             // Force a reload to ensure Navbar/AuthProvider picks up the new user state
            window.location.href = '/';
          }
        } catch (error) {
          toast.error('Authentication failed');
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    handleAuth();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Completing secure login...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;