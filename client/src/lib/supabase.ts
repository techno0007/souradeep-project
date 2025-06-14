import { createClient } from '@supabase/supabase-js';
import type { Booking, InsertBooking } from '@/../../shared/schema';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false
      }
    })
  : null;

// Database operations for bookings
export const bookingsApi = {
  async getAll(): Promise<Booking[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
      throw new Error(`Failed to fetch bookings: ${error.message}`);
    }

    return data || [];
  },

  async update(id: string, booking: Partial<Booking>): Promise<Booking> {
    if (!supabase) throw new Error('Supabase client not initialized');

    console.log('Update input:', booking);

    // Remove computed fields that don't exist in the database
    const { dueAmount, ...updateData } = booking;

    const { data, error } = await supabase
      .from('bookings')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      throw new Error(`Failed to update booking: ${error.message}`);
    }

    console.log('Update result:', data);
    return data;
  },

  async create(booking: InsertBooking): Promise<Booking> {
    if (!supabase) {
      const error = new Error('Supabase not configured - missing environment variables');
      console.error(error);
      throw error;
    }

    console.log('Creating booking with data:', booking);

    // Test connection first
    try {
      const { data: testData, error: testError } = await supabase
        .from('bookings')
        .select('count')
        .limit(1);

      if (testError) {
        console.error('Connection test failed:', testError);
        console.error('Error details:', {
          message: testError.message,
          details: testError.details,
          hint: testError.hint,
          code: testError.code
        });
        throw new Error(`Database connection failed: ${testError.message}`);
      }

      console.log('Connection test successful');
    } catch (connError) {
      console.error('Connection error:', connError);
      throw connError;
    }

    const bookingData = {
      id: crypto.randomUUID(),
      bookingNumber: `BK-${Date.now()}`,
      name: booking.name,
      address: booking.address,
      mobile: booking.mobile,
      serviceDescription: booking.serviceDescription,
      date: booking.date,
      total: parseFloat(booking.total || '0'),
      advance: parseFloat(booking.advance || '0'),
      notes: booking.notes,
      status: booking.status || 'confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Inserting booking data:', bookingData);

    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      throw new Error(`Failed to create booking: ${error.message}`);
    }

    console.log('Booking created successfully:', data);
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Logo functions for Supabase storage
export const logoApi = {
  async getLogoUrl(): Promise<string> {
    if (!supabase) return '/default-logo.png';

    try {
      const { data } = await supabase
        .from('logos')
        .select('url')
        .eq('isActive', true)
        .single();

      return data?.url || '/default-logo.png';
    } catch {
      return '/default-logo.png';
    }
  },

  async uploadLogo(file: File): Promise<string> {
    if (!supabase) throw new Error('Supabase not configured');

    const fileName = `logo-${Date.now()}.${file.name.split('.').pop()}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName);

    // Save to database
    const { error: dbError } = await supabase
      .from('logos')
      .insert({ name: fileName, url: publicUrl, isActive: true });

    if (dbError) throw dbError;

    return publicUrl;
  }
};

// Connection test function
export const testSupabaseConnection = async () => {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }

    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};

// Mock data functions - replace with actual Supabase queries
export const mockData = {
  stats: {
    totalClients: 24,
    activeBookings: 8,
    dueAmount: '₹45,000',
    monthlyRevenue: '₹1,20,000'
  },

  recentBookings: [
    {
      id: 1,
      service: 'Wedding Photography',
      client: 'Rahul & Priya',
      amount: '₹50,000',
      date: 'Dec 15, 2024',
      icon: 'fas fa-camera',
      bgColor: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      service: 'Logo Design',
      client: 'TechCorp Ltd',
      amount: '₹15,000',
      date: 'Dec 12, 2024',
      icon: 'fas fa-palette',
      bgColor: 'from-green-500 to-green-600'
    },
    {
      id: 3,
      service: 'Portrait Session',
      client: 'Maya Sharma',
      amount: '₹8,000',
      date: 'Dec 10, 2024',
      icon: 'fas fa-camera',
      bgColor: 'from-purple-500 to-purple-600'
    }
  ],

  clients: [
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
    },
    {
      id: 3,
      name: 'TechCorp Ltd',
      mobile: '+91 98876 54321',
      address: 'Bangalore, Karnataka',
      status: 'Active',
      bookingCount: 2,
      initials: 'TC',
      bgColor: 'from-teal-500 to-teal-600'
    }
  ],

  duePayments: [
    {
      id: 1,
      client: {
        name: 'Rahul Patel',
        mobile: '+91 98765 43210',
        initials: 'RP',
        bgColor: 'from-red-500 to-red-600'
      },
      service: 'Wedding Photography',
      bookingNumber: 'WD-001',
      amount: '₹25,000',
      dueDate: 'Dec 15, 2024',
      status: 'Overdue',
      statusColor: 'bg-red-100 text-red-800',
      daysOverdue: 3
    },
    {
      id: 2,
      client: {
        name: 'Maya Sharma',
        mobile: '+91 87654 32109',
        initials: 'MS',
        bgColor: 'from-purple-500 to-purple-600'
      },
      service: 'Portrait Session',
      bookingNumber: 'PT-002',
      amount: '₹4,000',
      dueDate: 'Dec 18, 2024',
      status: 'Due Today',
      statusColor: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 3,
      client: {
        name: 'TechCorp Ltd',
        mobile: '+91 98876 54321',
        initials: 'TC',
        bgColor: 'from-teal-500 to-teal-600'
      },
      service: 'Logo Design',
      bookingNumber: 'LD-003',
      amount: '₹7,500',
      dueDate: 'Dec 20, 2024',
      status: 'Upcoming',
      statusColor: 'bg-blue-100 text-blue-800'
    }
  ],

  notifications: [
    {
      id: 1,
      title: 'New Booking Confirmed',
      message: 'Wedding photography booking from Rahul Patel has been confirmed for December 15, 2024.',
      time: '2 hours ago',
      icon: 'fas fa-calendar-check',
      bgColor: 'from-blue-500 to-blue-600',
      isRead: false
    },
    {
      id: 2,
      title: 'Payment Overdue',
      message: '₹25,000 payment from Rahul Patel is now 3 days overdue.',
      time: '5 hours ago',
      icon: 'fas fa-exclamation-triangle',
      bgColor: 'from-orange-500 to-red-500',
      isRead: false
    },
    {
      id: 3,
      title: 'Payment Received',
      message: '₹15,000 payment received from TechCorp Ltd for logo design project.',
      time: '1 day ago',
      icon: 'fas fa-check-circle',
      bgColor: 'from-green-500 to-green-600',
      isRead: true
    }
  ],

  profile: {
    name: 'Souradeep Dey',
    email: 'souradeep@example.com',
    phone: '+91 98765 43210',
    address: 'Kolkata, West Bengal, India',
    bio: 'Professional photographer and designer with over 5 years of experience in wedding photography, portrait sessions, and creative design solutions.',
    initials: 'SD'
  }
};

export const notificationApi = {
  async createNotification(title: string, message: string, type: 'system' | 'update' | 'alert' | 'booking' | 'payment') {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([
          {
            title,
            message,
            type,
            is_read: false
          }
        ])
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Create notification for new booking
  async notifyNewBooking(bookingName: string, date: string) {
    return this.createNotification(
      'New Booking Created',
      `Booking for ${bookingName} has been scheduled for ${new Date(date).toLocaleDateString()}`,
      'booking'
    );
  },

  // Create notification for payment
  async notifyPayment(amount: number, bookingName: string) {
    return this.createNotification(
      'Payment Received',
      `Payment of ₹${amount} received for booking: ${bookingName}`,
      'payment'
    );
  },

  // Create notification for due payment
  async notifyDuePayment(amount: number, bookingName: string, daysOverdue: number) {
    return this.createNotification(
      'Payment Overdue',
      `Payment of ₹${amount} for ${bookingName} is ${daysOverdue} days overdue`,
      'alert'
    );
  },

  // Create system notification
  async notifySystem(message: string) {
    return this.createNotification(
      'System Update',
      message,
      'system'
    );
  },

  async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  async markAllAsRead() {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
};