import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bookingsApi } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    mobile: "",
    serviceDescription: "",
    date: "",
    total: "",
    advance: "",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await bookingsApi.create({
        name: formData.name,
        address: formData.address,
        mobile: formData.mobile,
        serviceDescription: formData.serviceDescription,
        date: formData.date,
        total: formData.total,
        advance: formData.advance,
        notes: formData.notes,
        status: 'confirmed'
      });
      
      toast({
        title: "Booking Created",
        description: "New booking has been successfully created.",
      });
      
      onClose();
      setFormData({
        name: "",
        address: "",
        mobile: "",
        serviceDescription: "",
        date: "",
        total: "",
        advance: "",
        notes: "",
      });
    } catch (error) {
      console.error('Booking creation error:', error);
      toast({
        title: "Error",
        description: `Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-800">New Booking</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">Client Name</Label>
            <Input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter client name"
            />
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">Client Address</Label>
            <Input
              type="text"
              required
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter client address"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">Mobile Number</Label>
            <Input
              type="tel"
              required
              value={formData.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter mobile number"
            />
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">Service Description</Label>
            <Input
              type="text"
              required
              value={formData.serviceDescription}
              onChange={(e) => handleChange("serviceDescription", e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter service description"
            />
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">Date</Label>
            <Input
              type="date"
              required
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
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
              value={formData.total}
              onChange={(e) => handleChange("total", e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="0"
            />
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">Advance Paid (₹)</Label>
            <Input
              type="number"
              min="0"
              step="100"
              value={formData.advance}
              onChange={(e) => handleChange("advance", e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="0"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
