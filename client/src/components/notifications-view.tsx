import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Bell, RefreshCw, AlertTriangle, Calendar, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationApi } from "@/lib/supabase";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'update' | 'alert' | 'booking' | 'payment';
  is_read: boolean;
  created_at: string;
}

interface Booking {
  id: string;
  name: string | null;
  serviceDescription: string | null;
  date: string | null;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'system':
      return <Bell className="h-5 w-5 text-blue-500" />;
    case 'update':
      return <RefreshCw className="h-5 w-5 text-green-500" />;
    case 'alert':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'booking':
      return <Calendar className="h-5 w-5 text-purple-500" />;
    case 'payment':
      return <IndianRupee className="h-5 w-5 text-yellow-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'system':
      return 'bg-blue-50 border-blue-200';
    case 'update':
      return 'bg-green-50 border-green-200';
    case 'alert':
      return 'bg-red-50 border-red-200';
    case 'booking':
      return 'bg-purple-50 border-purple-200';
    case 'payment':
      return 'bg-yellow-50 border-yellow-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchData = async () => {
    if (!supabase) {
      setError('Supabase client is not available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (notificationsError) throw notificationsError;

      // Calculate unread count
      const unread = notificationsData?.filter(n => !n.is_read).length || 0;
      setUnreadCount(unread);

      setNotifications(
        notificationsData?.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          is_read: n.is_read,
          created_at: n.created_at,
        })) || []
      );

      // Fetch upcoming bookings (next 15 days)
      console.log('Fetching upcoming bookings...');
      const today = new Date();
      const fifteenDaysLater = new Date(today);
      fifteenDaysLater.setDate(today.getDate() + 15);
      
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("id, name, servicedescription, date")
        .gte("date", today.toISOString().split("T")[0])
        .lte("date", fifteenDaysLater.toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        setError('Failed to fetch upcoming bookings');
        return;
      }

      console.log('Bookings data:', bookingsData);
      
      if (bookingsData) {
        setUpcomingBookings(
          bookingsData.map((b) => ({
            id: b.id,
            name: b.name,
            serviceDescription: b.servicedescription,
            date: b.date,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await notificationApi.markAllAsRead();
                  setUnreadCount(0);
                  setNotifications(notifications.map(n => ({ ...n, is_read: true })));
                } catch (error) {
                  console.error('Error marking all as read:', error);
                }
              }}
            >
              Mark all as read
            </Button>
          )}
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading && <div className="text-slate-600">Loading notifications...</div>}
        {!isLoading && notifications.length === 0 && (
          <div className="text-slate-600">No notifications found.</div>
        )}
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 border rounded-lg mb-3 ${getNotificationColor(notification.type)} ${
              !notification.is_read ? 'border-l-4' : ''
            }`}
            onClick={async () => {
              if (!notification.is_read) {
                try {
                  await notificationApi.markAsRead(notification.id);
                  setNotifications(notifications.map(n => 
                    n.id === notification.id ? { ...n, is_read: true } : n
                  ));
                  setUnreadCount(prev => Math.max(0, prev - 1));
                } catch (error) {
                  console.error('Error marking notification as read:', error);
                }
              }
            }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{notification.title}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Bookings */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Upcoming Bookings (Next 15 Days)</h3>
        {isLoading && <div className="text-slate-600">Loading bookings...</div>}
        {!isLoading && upcomingBookings.length === 0 && (
          <div className="text-slate-600">No upcoming bookings found.</div>
        )}
        <div className="space-y-4">
          {upcomingBookings.map((booking) => (
            <Card key={booking.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold text-slate-800">{booking.name}</div>
                <div className="text-slate-600 text-sm">{booking.serviceDescription}</div>
              </div>
              <div className="text-slate-500 text-xs mt-2 sm:mt-0">
                {booking.date ? new Date(booking.date).toLocaleDateString() : "No date"}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
