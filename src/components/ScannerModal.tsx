import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

interface ScannerModalProps {
  onClose: () => void;
  onScan: (decodedText: string) => void;
}

export default function ScannerModal({ onClose, onScan }: ScannerModalProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent scrolling behind modal
    document.body.style.overflow = 'hidden';
    
    let html5QrcodeScanner: Html5QrcodeScanner | null = null;
    
    try {
      html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: {width: 250, height: 250},
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true
        },
        false
      );

      const onScanSuccess = (decodedText: string, decodedResult: any) => {
        // Stop scanning after success
        html5QrcodeScanner?.clear().catch(console.error);
        onScan(decodedText);
      };

      html5QrcodeScanner.render(onScanSuccess, (err) => {
        // suppress frequent scan errors unless critical
      });
    } catch (e: any) {
      console.error(e);
      setError("تعذر الوصول إلى الكاميرا. يرجى التأكد من منح الصلاحيات اللازمة.");
    }

    return () => {
      document.body.style.overflow = 'auto';
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex flex-col justify-center items-center px-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <h3 className="font-bold text-brand-purple">مسح الباركود</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 bg-black/5 min-h-[300px] flex items-center justify-center relative">
          {error ? (
             <div className="text-center text-red-500 font-medium p-4">
                {error}
             </div>
          ) : (
            <div id="reader" className="w-full scanner-container"></div>
          )}
        </div>
        <div className="p-4 border-t border-gray-100 text-center text-sm text-gray-500">
          قم بتوجيه الكاميرا نحو الباركود أو السيريال نمبر
        </div>
      </div>
      
      {/* Scope css specifically for Html5QrcodeScanner elements overrides */}
      <style>{`
        .scanner-container video {
          border-radius: 0.5rem;
          object-fit: cover;
        }
        #reader__dashboard_section_csr span {
          display: none !important;
        }
        #reader__dashboard_section_swaplink {
          text-decoration: none;
          color: #FF6D00;
          font-weight: bold;
          margin-top: 10px;
          display: inline-block;
        }
        #reader__camera_permission_button, #reader button {
          background-color: #FF6D00 !important;
          color: white !important;
          border: none !important;
          padding: 8px 16px !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
        }
      `}</style>
    </div>
  );
}
