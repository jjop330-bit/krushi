import React, { useState, useEffect } from 'react';
import { Bell, Check, X, ExternalLink } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface AppNotificationItem {
  id: string;
  user_id: string;
  role: string;
  category: string;
  title_en: string;
  title_or: string;
  message_en: string;
  message_or: string;
  link_tab?: string;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationBellProps {
  lang: 'or' | 'en';
  onNavigateTab: (tab: string) => void;
  userId?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  lang,
  onNavigateTab,
  userId = 'farmer-local'
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotificationItem[]>([]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const backendUrl = StorageService.getSettings().backendUrl;
      const res = await fetch(`${backendUrl}/notifications?limit=20`, {
        headers: { 'x-user-id': userId }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {
      // Non-blocking
    }
  };

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const backendUrl = StorageService.getSettings().backendUrl;
      await fetch(`${backendUrl}/notifications/${id}/read`, { method: 'POST' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {
      // Non-blocking
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const backendUrl = StorageService.getSettings().backendUrl;
      await fetch(`${backendUrl}/notifications/mark-all-read`, {
        method: 'POST',
        headers: { 'x-user-id': userId }
      });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch {
      // Non-blocking
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-agri-100 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
        title="Notifications / ସୂଚନା"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-lime-400 text-agri-950 font-black text-[9px] rounded-full flex items-center justify-center shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-xs animate-scaleUp">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900">
                {lang === 'or' ? 'ସୂଚନା କେନ୍ଦ୍ର' : 'Notification Center'}
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-lime-100 text-lime-900 font-extrabold text-[10px]">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-agri-800 hover:text-agri-950"
              >
                {lang === 'or' ? 'ସବୁ ପଢ଼ାଗଲା' : 'Mark all read'}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <p className="text-xs">{lang === 'or' ? 'କୌଣସି ନୂତନ ସୂଚନା ନାହିଁ' : 'No new notifications'}</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (n.link_tab) onNavigateTab(n.link_tab);
                    setIsOpen(false);
                  }}
                  className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start space-x-2.5 ${
                    !n.is_read ? 'bg-lime-50/50' : ''
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    !n.is_read ? 'bg-lime-500' : 'bg-transparent'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-900 text-xs">
                      {lang === 'or' ? n.title_or : n.title_en}
                    </h5>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                      {lang === 'or' ? n.message_or : n.message_en}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={(e) => handleMarkRead(n.id, e)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
