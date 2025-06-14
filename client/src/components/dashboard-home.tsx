import { useState, useEffect } from 'react';
import { mockData, bookingsApi } from "@/lib/supabase";

interface Booking {
  id: string;
  date: string | null;
  bookingNumber: string | null;
  name: string | null;
  address: string | null;
  mobile: string | null;
  servicedescription: string | null;
  serviceDescription: string | null;
  total: string | null;
  advance: string | null;
  status: string | null;
  updated_at: Date | null;
}

interface DashboardHomeProps {
  onOpenBookingModal: () => void;
  onNavigateToClients: () => void;
  onNavigateToDue: () => void;
}

export default function DashboardHome({ 
  onOpenBookingModal, 
  onNavigateToClients, 
  onNavigateToDue 
}: DashboardHomeProps) {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeBookings: 0,
    dueAmount: '₹0',
    monthlyRevenue: '₹0'
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookings = await bookingsApi.getAll();
        
        // Calculate statistics
        const totalDue = bookings.reduce((sum: number, booking: Booking) => {
          const total = parseFloat(booking.total || '0');
          const advance = parseFloat(booking.advance || '0');
          return sum + (total - advance);
        }, 0);

        const monthlyRevenue = bookings.reduce((sum: number, booking: Booking) => {
          const advance = parseFloat(booking.advance || '0');
          return sum + advance;
        }, 0);

        const activeBookings = bookings.filter((b: Booking) => b.status === 'active').length;

        setStats({
          totalClients: bookings.length,
          activeBookings,
          dueAmount: `₹${totalDue.toLocaleString('en-IN')}`,
          monthlyRevenue: `₹${monthlyRevenue.toLocaleString('en-IN')}`
        });

        // Get recent bookings
        const recent = bookings
          .sort((a: Booking, b: Booking) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
          .slice(0, 5)
          .map((booking: Booking) => ({
            id: booking.id,
            service: booking.serviceDescription || 'No description',
            client: booking.name || 'Unknown',
            amount: `₹${parseFloat(booking.total || '0').toLocaleString('en-IN')}`,
            date: booking.date || 'No date',
            icon: 'fa-camera',
            bgColor: 'bg-blue-500'
          }));

        setRecentBookings(recent);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mock clients data (since we don't have a clients table yet)
  const clients = [
    {
      id: 1,
      name: 'Rahul Patel',
      mobile: '+91 98765 43210',
      address: 'Mumbai, Maharashtra',
      status: 'Active',
      bookingCount: 3,
      initials: 'RP',
      bgColor: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      name: 'Maya Sharma', 
      mobile: '+91 87654 32109',
      address: 'Delhi, India',
      status: 'Active',
      bookingCount: 1,
      initials: 'MS',
      bgColor: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Clients</p>
              <p className="text-3xl font-bold text-slate-800">{stats.totalClients}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-users text-white"></i>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">
              <i className="fas fa-arrow-up"></i> +12% from last month
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Active Bookings</p>
              <p className="text-3xl font-bold text-slate-800">{stats.activeBookings}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-calendar-check text-white"></i>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">
              <i className="fas fa-arrow-up"></i> +3 this week
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Due Payments</p>
              <p className="text-3xl font-bold text-orange-600">{stats.dueAmount}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-white"></i>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-orange-600 text-sm font-medium">
              <i className="fas fa-clock"></i> 5 overdue
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Monthly Revenue</p>
              <p className="text-3xl font-bold text-slate-800">{stats.monthlyRevenue}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-chart-line text-white"></i>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">
              <i className="fas fa-arrow-up"></i> +8% from last month
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Recent Bookings</h3>
              <button 
                onClick={onNavigateToClients}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${booking.bgColor} rounded-full flex items-center justify-center`}>
                      <i className={`${booking.icon} text-white text-sm`}></i>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{booking.service}</p>
                      <p className="text-sm text-slate-600">{booking.client}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-800">{booking.amount}</p>
                    <p className="text-xs text-slate-600">{booking.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions - hidden/disabled */}
        {false && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-xl transition-all duration-300 group"
                  onClick={onOpenBookingModal}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <i className="fas fa-calendar-plus text-white text-xl"></i>
                    </div>
                    <p className="font-medium text-slate-800">New Booking</p>
                  </div>
                </button>

                <button 
                  className="p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 rounded-xl transition-all duration-300 group"
                  onClick={onNavigateToClients}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <i className="fas fa-user-plus text-white text-xl"></i>
                    </div>
                    <p className="font-medium text-slate-800">Add Client</p>
                  </div>
                </button>

                <button 
                  className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 rounded-xl transition-all duration-300 group"
                  onClick={onNavigateToClients}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <i className="fas fa-file-invoice-dollar text-white text-xl"></i>
                    </div>
                    <p className="font-medium text-slate-800">Generate Invoice</p>
                  </div>
                </button>

                <button 
                  className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border border-orange-200 rounded-xl transition-all duration-300 group"
                  onClick={onNavigateToDue}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <i className="fas fa-chart-line text-white text-xl"></i>
                    </div>
                    <p className="font-medium text-slate-800">View Reports</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}