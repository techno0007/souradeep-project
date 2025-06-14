import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function Navigation({ activeView, onViewChange }: NavigationProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!supabase) {
        console.error('Supabase client is not available');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('id')
          .eq('is_read', false);

        if (error) throw error;
        setUnreadCount(data?.length || 0);
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    fetchUnreadCount();

    // Subscribe to changes in notifications
    if (supabase) {
      const channel = supabase
        .channel('notifications_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications'
          },
          () => {
            fetchUnreadCount();
          }
        )
        .subscribe();

      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, []);

  const navItems = [
    { id: "home", label: "Home", icon: "fas fa-home", className: "home" },
    { id: "clients", label: "My Clients", icon: "fas fa-users", className: "clients" },
    { id: "due", label: "Due Payments", icon: "fas fa-exclamation-triangle", className: "due" },
    { id: "notifications", label: "Notifications", icon: "fas fa-bell", className: "notifications" },
    { id: "profile", label: "My Profile", icon: "fas fa-user-circle", className: "profile" },
  ];

  return (
    <nav className="bg-gradient-to-r from-slate-50 to-white shadow-lg border-b border-slate-200 sticky top-0 z-40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={cn(
                "nav-btn",
                item.className,
                activeView === item.id && "active"
              )}
              onClick={() => onViewChange(item.id)}
            >
              <div className="relative">
                <i className={item.icon}></i>
                {item.id === "notifications" && unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
