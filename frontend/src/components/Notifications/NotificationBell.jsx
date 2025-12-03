import React, { useState, useEffect } from 'react'
import { Bell, X, CheckCheck } from 'lucide-react'
import { notificationService } from '../../services/api'
import webSocketService from '../../services/websocket'

const NotificationBell = () => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const [notificationsRes, countRes] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount()
      ])
      
      setNotifications(notificationsRes.data.data || [])
      setUnreadCount(countRes.data.data.count || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    
    // Listen for real-time notifications
    webSocketService.onNewNotification((newNotification) => {
      console.log('📩 New notification received:', newNotification)
      
      // Add new notification to the list
      setNotifications(prev => [newNotification, ...prev])
      
      // Update unread count
      setUnreadCount(prev => prev + 1)
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        const notificationTitle = newNotification.type === 'pot_collected' 
          ? '🎉 Pot Collected Successfully!' 
          : 'New Payment Notification';
        
        new Notification(notificationTitle, {
          body: newNotification.message,
          icon: '/favicon.ico'
        })
      }
    })
    
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
    
    // Cleanup
    return () => {
      webSocketService.offNewNotification()
    }
  }, [])

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      // Optimistic update - mark as read immediately
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      await notificationService.markAsRead(notificationId)
    } catch (error) {
      console.error('Error marking notification as read:', error)
      // Revert optimistic update on error
      fetchNotifications()
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      // Optimistic update - mark all as read immediately
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      )
      setUnreadCount(0)
      
      await notificationService.markAllAsRead()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      // Revert optimistic update on error
      fetchNotifications()
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment_received':
        return '💰'
      case 'pot_collected':
        return '🎉'
      case 'payment_due':
        return '⏰'
      case 'cycle_started':
        return '🎯'
      case 'cycle_completed':
        return '✅'
      default:
        return '📢'
    }
  }

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-900">
              Notifications
            </h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setShowNotifications(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-slate-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm">Loading notifications...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-400' : ''
                    }`}
                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 text-lg">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            notification.type === 'payment_received' 
                              ? 'bg-green-100 text-green-800' 
                              : notification.type === 'payment_due'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.type.replace('_', ' ').toUpperCase()}
                          </span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        
                        <p className="text-sm text-slate-900 mt-2 font-medium">
                          {notification.message}
                        </p>
                        
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                          <span>{formatDate(notification.createdAt)}</span>
                          {notification.amount && (
                            <span className="font-medium text-green-600">
                              ₹{notification.amount}
                            </span>
                          )}
                        </div>
                        
                        {notification.groupId && (
                          <div className="mt-1">
                            <span className="text-xs text-slate-400">
                              Cycle {notification.cycleNumber} • {notification.groupId.name || 'Group'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs mt-1">You'll see payment updates here</p>
              </div>
            )}
          </div>
          
          {notifications.length > 5 && (
            <div className="bg-slate-50 px-4 py-2 text-center border-t border-slate-200">
              <button
                onClick={() => setShowNotifications(false)}
                className="text-xs text-slate-600 hover:text-slate-800"
              >
                Close notifications
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Background overlay for mobile */}
      {showNotifications && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 sm:hidden"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  )
}

export default NotificationBell
