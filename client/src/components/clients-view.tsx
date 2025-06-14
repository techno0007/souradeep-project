import { useState, useEffect } from "react";
import { bookingsApi } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import InvoiceModal from './invoice-modal';
import type { Booking } from "@/../../shared/schema";
import { notificationApi } from "@/lib/supabase";

interface BookingWithClient extends Booking {
  dueAmount: number;
}

export default function ClientsView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All Clients");
  const [bookings, setBookings] = useState<BookingWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingWithClient | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState<any>(null);
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithClient | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    date: "",
    total: "",
    advance: "",
    serviceDescription: "",
    notes: ""
  });
  

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await bookingsApi.getAll();
        const bookingsWithDue = data.map(booking => ({
          ...booking,
          dueAmount: (parseFloat(booking.total || '0') - parseFloat(booking.advance || '0'))
        }));
        setBookings(bookingsWithDue);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.mobile?.includes(searchTerm) ||
                         booking.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (filter === "Paid") {
      matchesFilter = booking.dueAmount <= 0;
    } else if (filter === "Pending") {
      matchesFilter = booking.dueAmount > 0;
    } else if (filter === "Confirmed") {
      matchesFilter = booking.status === "confirmed";
    }

    return matchesSearch && matchesFilter;
  });

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'NA';
  };

  const getBgColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-teal-500 to-teal-600',
      'from-green-500 to-green-600',
      'from-orange-500 to-orange-600',
      'from-red-500 to-red-600'
    ];
    return colors[index % colors.length];
  };

  const formatDate = (dateString: string | null | Date) => {
    if (!dateString) return 'N/A';
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number | string | null) => {
    if (amount === null) return '₹0';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(num) ? '₹0' : `₹${num.toLocaleString('en-IN')}`;
  };

  const handleEditBooking = (booking: BookingWithClient) => {
    setEditingBooking(booking);
    setEditFormData({
      name: booking.name || "",
      mobile: booking.mobile || "",
      address: booking.address || "",
      date: booking.date || "",
      total: booking.total?.toString() || "",
      advance: booking.advance?.toString() || "",
      serviceDescription: booking.serviceDescription || "",
      notes: booking.notes || ""
    });
    setEditModalOpen(true);
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    setIsUpdating(true);
    try {
      const updatePayload = {
        name: editFormData.name,
        mobile: editFormData.mobile,
        address: editFormData.address,
        date: editFormData.date,
        total: editFormData.total.toString(),
        advance: editFormData.advance.toString(),
        serviceDescription: editFormData.serviceDescription,
        notes: editFormData.notes
      };

      const updatedBooking = await bookingsApi.update(editingBooking.id, updatePayload);

      // Update local state with calculated dueAmount
      const bookingWithDue = {
        ...updatedBooking,
        dueAmount: (parseFloat(updatedBooking.total || '0') - parseFloat(updatedBooking.advance || '0'))
      };

      setBookings(prev => prev.map(booking => 
        booking.id === editingBooking.id ? bookingWithDue : booking
      ));

      setEditModalOpen(false);
      setEditingBooking(null);
    } catch (error) {
      console.error('Failed to update booking:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGenerateInvoice = (booking: BookingWithClient) => {
    const invoiceData = {
      bookingNumber: booking.bookingNumber || 'N/A',
      clientName: booking.name || 'Unknown',
      clientAddress: booking.address || 'No address provided',
      clientMobile: booking.mobile || 'No mobile provided',
      serviceDescription: booking.serviceDescription || 'Service',
      bookingDate: booking.date || new Date().toISOString().split('T')[0],
      total: booking.total?.toString() || '0',
      advance: booking.advance?.toString() || '0',
      dueAmount: booking.dueAmount?.toString() || '0',
      notes: booking.notes || ''
    };

    setSelectedInvoiceData(invoiceData);
    setInvoiceModalOpen(true);
  };

  const handleViewDetails = (booking: BookingWithClient) => {
    setSelectedBooking(booking);
    setViewDetailsModalOpen(true);
  };

  const handleCancelBooking = async (booking: BookingWithClient) => {
    try {
      const updatedBooking = await bookingsApi.update(booking.id, {
        ...booking,
        status: 'cancelled'
      });

      // Update local state
      const bookingWithDue = {
        ...updatedBooking,
        dueAmount: (parseFloat(updatedBooking.total || '0') - parseFloat(updatedBooking.advance || '0'))
      };

      setBookings(prev => prev.map(b => 
        b.id === booking.id ? bookingWithDue : b
      ));

      // Create notification for cancelled booking
      await notificationApi.createNotification(
        'Booking Cancelled',
        `Booking #${booking.bookingNumber} for ${booking.name} has been cancelled`,
        'alert'
      );
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  const handleCompleteWork = async (booking: BookingWithClient) => {
    try {
      const updatedBooking = await bookingsApi.update(booking.id, {
        ...booking,
        status: 'completed'
      });

      // Update local state
      const bookingWithDue = {
        ...updatedBooking,
        dueAmount: (parseFloat(updatedBooking.total || '0') - parseFloat(updatedBooking.advance || '0'))
      };

      setBookings(prev => prev.map(b => 
        b.id === booking.id ? bookingWithDue : b
      ));

      // Create notification for completed work
      await notificationApi.createNotification(
        'Work Completed',
        `Work for booking #${booking.bookingNumber} (${booking.name}) has been completed`,
        'update'
      );
    } catch (error) {
      console.error('Failed to complete work:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">My Clients</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-600">Loading bookings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">My Clients & Bookings</h2>
        <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl">
          <i className="fas fa-calendar-plus"></i>
          <span>Add New Booking</span>
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by name, mobile, address, or booking number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
          >
            <option>All Clients</option>
            <option>Confirmed</option>
            <option>Paid</option>
            <option>Pending</option>
          </select>
        </div>
      </Card>

      {/* Bookings Grid */}
      {filteredBookings.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-slate-500">
            <i className="fas fa-calendar-times text-4xl mb-4"></i>
            <p className="text-lg font-medium">No bookings found</p>
            <p className="text-sm">Try adjusting your search or filter criteria</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBookings.map((booking, index) => (
            <Card key={booking.id} className="p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <i className="fas fa-calendar text-blue-600"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">#{booking.bookingNumber}</h3>
                    <p className="text-sm text-slate-500">{booking.name}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                    {booking.date}
                  </span>
                  <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                    ₹{booking.total}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="text-slate-500">
                    <i className="fas fa-map-marker-alt mr-1"></i>
                    {booking.address}
                  </span>
                  <span className="text-slate-500">
                    <i className="fas fa-phone mr-1"></i>
                    {booking.mobile}
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">
                  {booking.servicedescription}
                </p>
              </div>

              {/* Status and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : booking.status === 'confirmed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status || 'pending'}
                  </span>
                  {booking.dueAmount > 0 && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      Payment Due
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleViewDetails(booking)}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                  >
                    View Details
                  </button>
                  {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                    <>
                      <button 
                        onClick={() => handleCancelBooking(booking)}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                      >
                        Cancel Booking
                      </button>
                      <button 
                        onClick={() => handleCompleteWork(booking)}
                        className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                      >
                        Complete Work
                      </button>
                    </>
                  )}
                  {booking.dueAmount > 0 && (
                    <button className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors">
                      Record Payment
                    </button>
                  )}
                  <button 
                    onClick={() => handleGenerateInvoice(booking)}
                    className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors"
                  >
                    Generate Invoice
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Booking Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md w-full max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-800">
              Edit Booking - {editingBooking?.bookingNumber}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdateBooking} className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Client Name</Label>
              <Input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Mobile Number</Label>
              <Input
                type="tel"
                required
                value={editFormData.mobile}
                onChange={(e) => setEditFormData(prev => ({ ...prev, mobile: e.target.value }))}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Address</Label>
              <Input
                type="text"
                required
                value={editFormData.address}
                onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Booking Date</Label>
              <Input
                type="date"
                required
                value={editFormData.date}
                onChange={(e) => setEditFormData(prev => ({ ...prev, date: e.target.value }))}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Service Description</Label>
              <Input
                type="text"
                required
                value={editFormData.serviceDescription}
                onChange={(e) => setEditFormData(prev => ({ ...prev, serviceDescription: e.target.value }))}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Total Amount (₹)</Label>
              <Input
                type="number"
                required
                min="0"
                step="100"
                value={editFormData.total}
                onChange={(e) => setEditFormData(prev => ({ ...prev, total: e.target.value }))}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Advance Paid (₹)</Label>
              <Input
                type="number"
                min="0"
                step="100"
                value={editFormData.advance}
                onChange={(e) => setEditFormData(prev => ({ ...prev, advance: e.target.value }))}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Notes</Label>
              <Textarea
                value={editFormData.notes}
                onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                rows={3}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Update Booking"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invoice Modal */}
      {selectedInvoiceData && (
        <InvoiceModal
          isOpen={invoiceModalOpen}
          onClose={() => {
            setInvoiceModalOpen(false);
            setSelectedInvoiceData(null);
          }}
          invoiceData={selectedInvoiceData}
        />
      )}

      {/* View Details Modal */}
      <Dialog open={viewDetailsModalOpen} onOpenChange={setViewDetailsModalOpen}>
        <DialogContent className="max-w-2xl w-full max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-800">
              Booking Details - {selectedBooking?.bookingNumber}
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Client Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Client Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Name</p>
                    <p className="font-medium text-slate-800">{selectedBooking.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Mobile</p>
                    <p className="font-medium text-slate-800">{selectedBooking.mobile}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-slate-600">Address</p>
                    <p className="font-medium text-slate-800">{selectedBooking.address}</p>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Booking Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Booking Number</p>
                    <p className="font-medium text-slate-800">{selectedBooking.bookingNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Booking Date</p>
                    <p className="font-medium text-slate-800">{formatDate(selectedBooking.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Service</p>
                    <p className="font-medium text-slate-800">{selectedBooking.serviceDescription}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    <p className="font-medium text-slate-800">{selectedBooking.status || 'pending'}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl border border-green-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Payment Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Total Amount</p>
                    <p className="font-medium text-slate-800">{formatAmount(selectedBooking.total)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Advance Paid</p>
                    <p className="font-medium text-green-600">{formatAmount(selectedBooking.advance)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Amount Due</p>
                    <p className={`font-medium ${selectedBooking.dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatAmount(selectedBooking.dueAmount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Notes</h3>
                  <p className="text-slate-700">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setViewDetailsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() => handleEditBooking(selectedBooking)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl transition-all duration-300"
                >
                  Edit Booking
                </Button>
                <Button
                  type="button"
                  onClick={() => handleGenerateInvoice(selectedBooking)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-xl transition-all duration-300"
                >
                  Generate Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}