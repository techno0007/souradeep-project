import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { logoApi } from '@/lib/supabase';
import logoPath from "@assets/invoice_1749883088901.png";
import defaultLogo from "../assets/default-logo.png";

interface InvoiceData {
  bookingNumber: string;
  clientName: string;
  clientAddress: string;
  clientMobile: string;
  serviceDescription: string;
  bookingDate: string;
  total: string;
  advance: string;
  dueAmount: string;
  notes?: string;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: InvoiceData;
}

export default function InvoiceModal({ isOpen, onClose, invoiceData }: InvoiceModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>(logoPath);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

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
    
    fetchLogo();
  }, []);

  const downloadPDF = async () => {
    if (!invoiceRef.current || !pdfRef.current) return;

    setIsDownloading(true);
    try {
      // Temporarily show the PDF version
      pdfRef.current.style.display = 'block';
      invoiceRef.current.style.display = 'none';

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowWidth: 794, // A4 width in pixels at 96 DPI
        windowHeight: 1123, // A4 height in pixels at 96 DPI
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // A4 dimensions in mm
      const a4Width = 210;
      const a4Height = 297;
      
      // Calculate scaling to fit the content on one page
      const imgWidth = a4Width;
      const imgHeight = (canvas.height * a4Width) / canvas.width;
      
      // Add the image to the PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      pdf.save(`Invoice-${invoiceData.bookingNumber}.pdf`);

      // Restore the preview version
      pdfRef.current.style.display = 'none';
      invoiceRef.current.style.display = 'block';
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Invoice Preview
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-end space-x-2">
            <Button
              onClick={downloadPDF}
              disabled={isDownloading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {isDownloading ? (
                <div className="flex items-center space-x-2">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Generating PDF...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <i className="fas fa-download"></i>
                  <span>Download PDF</span>
                </div>
              )}
            </Button>
          </div>

          {/* Mobile Responsive Preview */}
          <Card ref={invoiceRef} className="p-4 sm:p-8 bg-white">
            {/* Watermark Logo */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 sm:w-96 h-64 sm:h-96 opacity-5 pointer-events-none">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Souradeep Dey Designs"
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Header with Company Info */}
            <div className="border-b-4 border-gradient-to-r from-blue-500 to-purple-500 pb-4 sm:pb-6 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-white shadow-lg flex items-center justify-center border-2 border-slate-100">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Souradeep Dey Designs"
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<span class="text-red-600 font-bold text-2xl sm:text-3xl">SD</span>';
                        }}
                      />
                    ) : (
                      <span className="text-red-600 font-bold text-2xl sm:text-3xl">SD</span>
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Souradeep Dey Designs</h1>
                    <p className="text-slate-600">Photographer and Designer</p>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-2 text-sm text-slate-500">
                      <span><i className="fas fa-phone mr-1"></i>+91 98765 43210</span>
                      <span><i className="fas fa-envelope mr-1"></i>info@souradeepdey.com</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      <i className="fas fa-map-marker-alt mr-1"></i>
                      Kolkata, West Bengal, India
                    </p>
                  </div>
                </div>
                <div className="text-right w-full sm:w-auto">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 sm:p-4 rounded-xl border border-blue-200">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">INVOICE</h2>
                    <p className="text-base sm:text-lg font-semibold text-blue-600 mt-1">#{invoiceData.bookingNumber}</p>
                    <p className="text-sm text-slate-600 mt-2">Date: {currentDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bill To Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 border-b-2 border-blue-200 pb-1">
                  <i className="fas fa-user mr-2 text-blue-500"></i>Bill To
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                  <p className="font-semibold text-slate-800 text-base sm:text-lg">{invoiceData.clientName}</p>
                  <p className="text-slate-600 mt-2">{invoiceData.clientAddress}</p>
                  <p className="text-slate-600 mt-1">
                    <i className="fas fa-phone mr-2 text-blue-500"></i>{invoiceData.clientMobile}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 border-b-2 border-purple-200 pb-1">
                  <i className="fas fa-calendar mr-2 text-purple-500"></i>Service Details
                </h3>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-4 rounded-lg border border-purple-100">
                  <p className="text-sm text-slate-600">Booking Date</p>
                  <p className="font-semibold text-slate-800">
                    {new Date(invoiceData.bookingDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">Service Type</p>
                  <p className="font-semibold text-slate-800">{invoiceData.serviceDescription}</p>
                </div>
              </div>
            </div>

            {/* Services Table */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 border-b-2 border-green-200 pb-1">
                <i className="fas fa-list mr-2 text-green-500"></i>Service Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[300px]">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                    <tr>
                      <th className="text-left py-3 sm:py-4 px-4 sm:px-6 font-semibold text-slate-800">Description</th>
                      <th className="text-right py-3 sm:py-4 px-4 sm:px-6 font-semibold text-slate-800">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="py-3 sm:py-4 px-4 sm:px-6 text-slate-700">{invoiceData.serviceDescription}</td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6 text-right font-semibold text-slate-800">
                        ₹{parseFloat(invoiceData.total).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="flex justify-end mb-6 sm:mb-8">
              <div className="w-full sm:w-96">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 sm:p-6 rounded-lg border border-slate-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="font-semibold text-slate-800">
                        ₹{parseFloat(invoiceData.total).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-3">
                      <span className="text-green-600 font-medium">
                        <i className="fas fa-check-circle mr-1"></i>Advance Paid:
                      </span>
                      <span className="font-semibold text-green-600">
                        ₹{parseFloat(invoiceData.advance).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t-2 border-slate-300 pt-3">
                      <span className="text-base sm:text-lg font-bold text-slate-800">Amount Due:</span>
                      <span className="text-xl sm:text-2xl font-bold text-red-600">
                        ₹{parseFloat(invoiceData.dueAmount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {invoiceData.notes && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 border-b-2 border-yellow-200 pb-1">
                  <i className="fas fa-sticky-note mr-2 text-yellow-500"></i>Notes
                </h3>
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-3 sm:p-4 rounded-lg border border-yellow-200">
                  <p className="text-slate-700">{invoiceData.notes}</p>
                </div>
              </div>
            )}

            {/* Payment Terms */}
            <div className="border-t-2 border-slate-200 pt-4 sm:pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">
                    <i className="fas fa-credit-card mr-2 text-blue-500"></i>Payment Methods
                  </h4>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>• Bank Transfer: HDFC Bank</p>
                    <p>• UPI: photostudio@paytm</p>
                    <p>• Cash Payment Accepted</p>
                    <p>• Card Payment Available</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">
                    <i className="fas fa-info-circle mr-2 text-green-500"></i>Terms & Conditions
                  </h4>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>• Payment due within 30 days</p>
                    <p>• Late payment charges may apply</p>
                    <p>• Images delivered post full payment</p>
                    <p>• Cancellation policy applies</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Thank you for choosing Souradeep Dey Designs! For any queries, contact us at +91 98765 43210
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-6 mt-3 text-slate-400">
                <span><i className="fab fa-instagram"></i> @souradeepdey</span>
                <span><i className="fab fa-facebook"></i> Souradeep Dey Designs</span>
                <span><i className="fas fa-globe"></i> www.souradeepdey.com</span>
              </div>
            </div>
          </Card>

          {/* Desktop PDF Version (Hidden by default) */}
          <div ref={pdfRef} className="hidden">
            <Card className="p-6 bg-white" style={{ width: '794px', minHeight: '1123px' }}>
              {/* Watermark Logo */}
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-5 pointer-events-none">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Souradeep Dey Designs"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Header with Company Info */}
              <div className="border-b-2 border-gradient-to-r from-blue-500 to-purple-500 pb-4 mb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-white shadow-lg flex items-center justify-center border-2 border-slate-100">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt="Souradeep Dey Designs"
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<span class="text-red-600 font-bold text-2xl">SD</span>';
                          }}
                        />
                      ) : (
                        <span className="text-red-600 font-bold text-2xl">SD</span>
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-blue-600">Souradeep Dey Designs</h1>
                      <p className="text-slate-600 text-sm">Photographer and Designer</p>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                        <span><i className="fas fa-phone mr-1"></i>+91 98765 43210</span>
                        <span><i className="fas fa-envelope mr-1"></i>info@souradeepdey.com</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        Kolkata, West Bengal, India
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-xl border border-blue-200">
                      <h2 className="text-xl font-bold text-slate-800">INVOICE</h2>
                      <p className="text-base font-semibold text-blue-600 mt-1">#{invoiceData.bookingNumber}</p>
                      <p className="text-xs text-slate-600 mt-1">Date: {currentDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bill To Section */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-800 mb-2 border-b border-blue-200 pb-1">
                    <i className="fas fa-user mr-2 text-blue-500"></i>Bill To
                  </h3>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                    <p className="font-semibold text-slate-800 text-base">{invoiceData.clientName}</p>
                    <p className="text-slate-600 text-sm mt-1">{invoiceData.clientAddress}</p>
                    <p className="text-slate-600 text-sm mt-1">
                      <i className="fas fa-phone mr-2 text-blue-500"></i>{invoiceData.clientMobile}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800 mb-2 border-b border-purple-200 pb-1">
                    <i className="fas fa-calendar mr-2 text-purple-500"></i>Service Details
                  </h3>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-100">
                    <p className="text-xs text-slate-600">Booking Date</p>
                    <p className="font-semibold text-slate-800 text-sm">
                      {new Date(invoiceData.bookingDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">Service Type</p>
                    <p className="font-semibold text-slate-800 text-sm">{invoiceData.serviceDescription}</p>
                  </div>
                </div>
              </div>

              {/* Services Table */}
              <div className="mb-4">
                <h3 className="text-base font-semibold text-slate-800 mb-2 border-b border-green-200 pb-1">
                  <i className="fas fa-list mr-2 text-green-500"></i>Service Breakdown
                </h3>
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <tr>
                        <th className="text-left py-2 px-4 font-semibold text-slate-800 text-sm">Description</th>
                        <th className="text-right py-2 px-4 font-semibold text-slate-800 text-sm">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="py-2 px-4 text-slate-700 text-sm">{invoiceData.serviceDescription}</td>
                        <td className="py-2 px-4 text-right font-semibold text-slate-800 text-sm">
                          ₹{parseFloat(invoiceData.total).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="flex justify-end mb-4">
                <div className="w-72">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-3 rounded-lg border border-slate-200">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 text-sm">Subtotal:</span>
                        <span className="font-semibold text-slate-800 text-sm">
                          ₹{parseFloat(invoiceData.total).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="text-green-600 font-medium text-sm">
                          <i className="fas fa-check-circle mr-1"></i>Advance Paid:
                        </span>
                        <span className="font-semibold text-green-600 text-sm">
                          ₹{parseFloat(invoiceData.advance).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t-2 border-slate-300 pt-2">
                        <span className="text-base font-bold text-slate-800">Amount Due:</span>
                        <span className="text-lg font-bold text-red-600">
                          ₹{parseFloat(invoiceData.dueAmount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {invoiceData.notes && (
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-slate-800 mb-2 border-b border-yellow-200 pb-1">
                    <i className="fas fa-sticky-note mr-2 text-yellow-500"></i>Notes
                  </h3>
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-slate-700 text-sm">{invoiceData.notes}</p>
                  </div>
                </div>
              )}

              {/* Payment Terms */}
              <div className="border-t border-slate-200 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1 text-sm">
                      <i className="fas fa-credit-card mr-2 text-blue-500"></i>Payment Methods
                    </h4>
                    <div className="text-xs text-slate-600 space-y-0.5">
                      <p>• Bank Transfer: HDFC Bank</p>
                      <p>• UPI: photostudio@paytm</p>
                      <p>• Cash Payment Accepted</p>
                      <p>• Card Payment Available</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1 text-sm">
                      <i className="fas fa-info-circle mr-2 text-green-500"></i>Terms & Conditions
                    </h4>
                    <div className="text-xs text-slate-600 space-y-0.5">
                      <p>• Payment due within 30 days</p>
                      <p>• Late payment charges may apply</p>
                      <p>• Images delivered post full payment</p>
                      <p>• Cancellation policy applies</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  Thank you for choosing Souradeep Dey Designs! For any queries, contact us at +91 98765 43210
                </p>
                <div className="flex justify-center space-x-4 mt-2 text-slate-400 text-xs">
                  <span><i className="fab fa-instagram"></i> @souradeepdey</span>
                  <span><i className="fab fa-facebook"></i> Souradeep Dey Designs</span>
                  <span><i className="fas fa-globe"></i> www.souradeepdey.com</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
