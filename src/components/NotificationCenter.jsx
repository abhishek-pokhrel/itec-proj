import React, { useState, useEffect } from 'react';
import { Bell, Trash2, CheckCircle } from 'lucide-react';
import NotificationService from '../lib/notificationService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await NotificationService.getAll();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(
        notifications.map((n) =>
          n._id === id ? { ...n, read: true } : n
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await NotificationService.delete(id);
      const notification = notifications.find((n) => n._id === id);
      setNotifications(notifications.filter((n) => n._id !== id));
      if (!notification.read) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Clear all notifications?')) {
      try {
        await NotificationService.clearAll();
        setNotifications([]);
        setUnreadCount(0);
      } catch (error) {
        console.error('Error clearing notifications:', error);
      }
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMinutes = Math.floor((now - notifDate) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return notifDate.toLocaleDateString();
  };

  const getNotificationColor = (type) => {
    const colors = {
      'task-assigned': 'bg-blue-50 border-blue-200',
      'task-completed': 'bg-green-50 border-green-200',
      'task-overdue': 'bg-red-50 border-red-200',
      'comment-mentioned': 'bg-purple-50 border-purple-200',
      'task-updated': 'bg-slate-50 border-slate-200',
    };
    return colors[type] || 'bg-slate-50 border-slate-200';
  };

  return (
    <>
      {/* Bell Icon Button */}
      <div className="relative">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="relative p-2 text-slate-600 hover:text-slate-900 transition"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Panel */}
        {showPanel && (
          <div className="absolute right-0 mt-2 w-80 max-h-96 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs hover:bg-white/20 px-2 py-1 rounded transition"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-80">
              {loading ? (
                <div className="p-4 text-center text-slate-500">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-slate-500">No notifications</div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-3 border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {notification.taskId?.title || 'Task notification'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Mark as read"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-slate-200 p-2">
                <button
                  onClick={handleClearAll}
                  className="w-full text-xs text-slate-600 hover:text-slate-900 py-2 rounded hover:bg-slate-50 transition"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Close panel when clicking outside */}
      {showPanel && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPanel(false)}
        />
      )}
    </>
  );
};

export default NotificationCenter;
