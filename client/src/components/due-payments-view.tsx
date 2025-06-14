import { useState, useEffect } from "react";
import { bookingsApi } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import type { Booking } from "@/../../shared/schema";

interface DuePayment {
  id: string;
  client: {
    name: string;
    mobile: string;
    initials: string;
    bgColor: string;
  };
  service: string;
  bookingNumber: string;
  amount: string;
  dueDate: string;
  status: string;
  statusColor: string;
  daysOverdue?: number;
}

export default function DuePaymentsView() {
  const [filter, setFilter] = useState("All Payments");
  const [duePayments, setDuePayments] = useState<DuePayment[]>([]);
  const [loading, setLoading] = useState(true);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRandomColor = () => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-teal-500 to-teal-600',
      'from-green-500 to-green-600',
      'from-red-500 to-red-600',
      'from-orange-500 to-orange-600'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getDueStatus = (dueAmount: number, bookingDate: string) => {
    if (dueAmount <= 0) return null; // No due amount
    
    const today = new Date();
    const booking = new Date(bookingDate);
    const diffTime = today.getTime() - booking.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      return {
        status: 'Overdue',
        statusColor: 'bg-red-100 text-red-800',
        daysOverdue: diffDays - 30
      };
    } else if (diffDays > 25) {
      return {
        status: 'Due Today',
        statusColor: 'bg-yellow-100 text-yellow-800'
      };
    } else {
      return {
        status: 'Upcoming',
        statusColor: 'bg-blue-100 text-blue-800'
      };
    }
  };

  useEffect(() => {
    const fetchDuePayments = async () => {
      try {
        setLoading(true);
        const bookings = await bookingsApi.getAll();
        
        const paymentsWithDue = bookings
          .map((booking: Booking) => {
            const total = parseFloat(booking.total?.toString() || '0');
            const advance = parseFloat(booking.advance?.toString() || '0');
            const dueAmount = total - advance;
            
            if (dueAmount <= 0) return null; // Skip if no due amount
            
            const dueStatus = getDueStatus(dueAmount, booking.date || '');
            if (!dueStatus) return null;
            
            return {
              id: booking.id,
              client: {
                name: booking.name || 'Unknown',
                mobile: booking.mobile || '',
                initials: getInitials(booking.name || 'Unknown'),
                bgColor: getRandomColor()
              },
              service: booking.serviceDescription || 'Service',
              bookingNumber: booking.bookingNumber || 'N/A',
              amount: `₹${dueAmount.toLocaleString()}`,
              dueDate: new Date(booking.date || '').toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }),
              status: dueStatus.status,
              statusColor: dueStatus.statusColor,
              daysOverdue: dueStatus.daysOverdue
            };
          })
          .filter(Boolean) as DuePayment[];
        
        setDuePayments(paymentsWithDue);
      } catch (error) {
        console.error('Failed to fetch due payments:', error);
        setDuePayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDuePayments();
  }, []);

  const filteredPayments = duePayments.filter(payment => {
    if (filter === "All Payments") return true;
    return payment.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Due Payments</h2>
        <div className="flex space-x-3">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          >
            <option>All Payments</option>
            <option>Overdue</option>
            <option>Due Today</option>
            <option>Upcoming</option>
          </select>
        </div>
      </div>

      {/* Due Payments Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-slate-600">Loading due payments...</div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-slate-600">No due payments found</div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Client</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Service</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Amount Due</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Booking Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50 transition-colors duration-200">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 bg-gradient-to-br ${payment.client.bgColor} rounded-full flex items-center justify-center`}>
                        <span className="text-white text-sm font-bold">{payment.client.initials}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{payment.client.name}</p>
                        <p className="text-sm text-slate-600">{payment.client.mobile}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-slate-800">{payment.service}</p>
                    <p className="text-sm text-slate-600">Booking #{payment.bookingNumber}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-lg font-bold text-orange-600">{payment.amount}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-slate-800">{payment.dueDate}</p>
                    {payment.daysOverdue && (
                      <p className="text-sm text-red-600">{payment.daysOverdue} days overdue</p>
                    )}
                    {payment.status === "Due Today" && (
                      <p className="text-sm text-orange-600">Due today</p>
                    )}
                    {payment.status === "Upcoming" && (
                      <p className="text-sm text-slate-600">Upcoming</p>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${payment.statusColor}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300">
                        <i className="fas fa-bell"></i>
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300">
                        <i className="fas fa-check"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
