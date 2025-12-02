import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useAuth } from '../hooks/useAuth'
import { Shield, Users, ArrowRight, Eye, EyeOff, Building2 } from 'lucide-react'
import { useState } from 'react'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [showPassword, setShowPassword] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const loginMutation = useMutation({
    mutationFn: (credentials) => login(credentials.email, credentials.password),
    onSuccess: () => {
      toast.success('Welcome back to Peer2Loan!')
      navigate('/')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.')
    }
  })

  const onSubmit = (data) => {
    loginMutation.mutate(data)
  }

 
}

export default Login