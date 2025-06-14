import { useState, useEffect } from "react";
import Navigation from "../components/navigation";
import DashboardHome from "../components/dashboard-home";
import ClientsView from "@/components/clients-view";
import DuePaymentsView from "@/components/due-payments-view";
import NotificationsView from "@/components/notifications-view";
import ProfileView from "@/components/profile-view";
import BookingModal from "@/components/booking-modal";
import { logoApi, testSupabaseConnection } from "@/lib/supabase";
import logoPath from "@assets/invoice_1749883088901.png";
import { useLocation } from 'wouter';

export default function Dashboard() {
  const [activeView, setActiveView] = useState<string>("home");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>(logoPath);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const url = await logoApi.getLogoUrl();
        if (url !== '/default-logo.png') {
          setLogoUrl(url);
        }
      } catch (error) {
        console.log('Using default logo');
      }
    };
    
    const testConnection = async () => {
      console.log('Testing Supabase connection...');
      const isConnected = await testSupabaseConnection();
      console.log('Supabase connection status:', isConnected ? 'Connected' : 'Failed');
    };
    
    fetchLogo();
    testConnection();
  }, []);

  const handleOpenBookingModal = () => {
    setIsBookingModalOpen(true);
  };

  const handleNavigateToClients = () => {
    setActiveView("clients");
  };

  const handleNavigateToDue = () => {
    setActiveView("due");
  };

  const renderView = () => {
    switch (activeView) {
      case "home":
        return <DashboardHome 
          onOpenBookingModal={handleOpenBookingModal}
          onNavigateToClients={handleNavigateToClients}
          onNavigateToDue={handleNavigateToDue}
        />;
      case "clients":
        return <ClientsView />;
      case "due":
        return <DuePaymentsView />;
      case "notifications":
        return <NotificationsView />;
      case "profile":
        return <ProfileView />;
      default:
        return <DashboardHome 
          onOpenBookingModal={handleOpenBookingModal}
          onNavigateToClients={handleNavigateToClients}
          onNavigateToDue={handleNavigateToDue}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 font-inter">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-white shadow-lg flex items-center justify-center border-2 border-slate-100">
                <img 
                  src={logoUrl} 
                  alt="Souradeep Dey Designs Logo" 
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<span class="text-red-600 font-bold text-lg sm:text-xl">SD</span>';
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Souradeep Dey Designs</h1>
                <p className="text-slate-600 text-xs sm:text-sm">Photographer and Designer</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-slate-600">Welcome back,</p>
                <p className="font-semibold text-slate-800">Souradeep</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <i className="fas fa-user text-white text-sm"></i>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fadeIn">
          {renderView()}
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50">
        <button 
          className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 animate-float flex items-center justify-center group relative overflow-hidden"
          onClick={() => setIsBookingModalOpen(true)}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <i className="fas fa-plus text-lg sm:text-xl relative z-10 transform group-hover:rotate-90 transition-transform duration-300"></i>
        </button>
      </div>

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      />
    </div>
  );
}
