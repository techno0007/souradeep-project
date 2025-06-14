export interface DashboardStats {
  totalClients: number;
  activeBookings: number;
  dueAmount: string;
  monthlyRevenue: string;
}

export interface RecentBooking {
  id: number;
  service: string;
  client: string;
  amount: string;
  date: string;
  icon: string;
  bgColor: string;
}

export interface ClientWithBookings {
  id: number;
  name: string;
  mobile: string;
  address: string;
  status: string;
  bookingCount: number;
  initials: string;
  bgColor: string;
}

export interface DuePayment {
  id: number;
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

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
  icon: string;
  bgColor: string;
  isRead: boolean;
}

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  initials: string;
}
