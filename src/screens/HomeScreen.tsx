import { useState } from 'react';
import { Search, ScanLine, Copy, Plus } from 'lucide-react';
import { db } from '../db';
import toast from 'react-hot-toast';
import ScannerModal from '../components/ScannerModal';
import type { Device } from '../db';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [foundDevice, setFoundDevice] = useState<Device | null>(null);
  const [notFoundQuery, setNotFoundQuery] = useState('');

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      const device = await db.devices.where('serial_number').equals(query.trim()).first();
      if (device) {
        setFoundDevice(device);
        setNotFoundQuery('');
      } else {
        setFoundDevice(null);
        setNotFoundQuery(query.trim());
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء البحث');
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    setIsScanning(false);
    setSearchQuery(decodedText);
    handleSearch(decodedText);
  };

  const copyCode = async () => {
    if (foundDevice?.generated_code) {
      try {
        await navigator.clipboard.writeText(foundDevice.generated_code);
        toast.success('تم نسخ الكود بنجاح!');
      } catch (err) {
        toast.error('فشل في نسخ الكود');
      }
    }
  };

  const handleQuickAdd = async () => {
    try {
      const newDevice = {
        device_name: 'جهاز جديد',
        serial_number: notFoundQuery,
        generated_code: 'CODE_' + Math.floor(Math.random() * 1000000), // Placeholder logic
        created_date: new Date().toISOString(),
      };
      await db.devices.add(newDevice);
      toast.success('تم إضافة الجهاز بنجاح!');
      handleSearch(notFoundQuery);
    } catch (error) {
      toast.error('هذا السيريال مسجل مسبقاً أو حدث خطأ');
    }
  };

  return (
    <div className="flex flex-col h-full px-4 pt-12 pb-6 max-w-md mx-auto">
      <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <h1 className="text-3xl font-bold text-center text-brand-purple mb-8">
          تطبيق عادل
        </h1>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-4 relative z-10 w-full">
          
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              placeholder="أدخل السيريال نمبر (IMEI)"
              className="w-full h-14 pl-12 pr-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent text-lg text-brand-purple font-mono"
            />
            <button
              onClick={() => setIsScanning(true)}
              className="absolute left-2 top-2 bottom-2 text-brand-purple opacity-40 hover:opacity-100 transition-opacity p-2"
              aria-label="مسح الباركود"
            >
              <ScanLine className="w-6 h-6" />
            </button>
          </div>

          <button
            onClick={() => handleSearch(searchQuery)}
            className="w-full h-14 bg-brand-orange text-white rounded-xl font-bold text-xl flex items-center justify-center space-x-2 space-x-reverse active:scale-95 transition-transform"
          >
            <Search className="w-6 h-6" />
            <span>بحث</span>
          </button>
        </div>

        {/* Results Area */}
        <div className="mt-8">
          {foundDevice && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-in zoom-in-95 duration-300">
              <h3 className="text-sm font-medium text-gray-400 mb-1">تفاصيل الجهاز</h3>
              <p className="text-lg font-bold text-brand-purple mb-4">{foundDevice.device_name || 'غير محدد'}</p>
              
              <div className="space-y-3 mb-6">
                <div>
                  <span className="text-xs text-brand-purple opacity-60">السيريال نمبر</span>
                  <p className="font-mono font-medium text-gray-800">{foundDevice.serial_number}</p>
                </div>
                <div>
                  <span className="text-xs text-brand-purple opacity-60">تاريخ الإضافة</span>
                  <p className="text-sm text-gray-600">
                    {new Date(foundDevice.created_date).toLocaleString('ar-EG')}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-brand-purple opacity-60">الكود المستخرج</span>
                  <p className="font-mono text-2xl font-bold text-brand-purple">{foundDevice.generated_code}</p>
                </div>
              </div>

              <button
                onClick={copyCode}
                className="w-full h-12 bg-brand-orange text-white rounded-xl font-bold flex items-center justify-center space-x-2 space-x-reverse active:bg-orange-600 transition-colors"
              >
                <Copy className="w-5 h-5" />
                <span>نسخ الكود</span>
              </button>
            </div>
          )}

          {notFoundQuery && !foundDevice && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center animate-in fade-in duration-300">
              <p className="text-brand-purple font-medium mb-4">
                هذا السيريال غير موجود، هل تريد إضافته مؤقتاً؟
              </p>
              <button
                onClick={handleQuickAdd}
                className="w-full h-12 flex items-center justify-center space-x-2 space-x-reverse border-2 border-brand-orange text-brand-orange rounded-xl font-bold hover:bg-orange-50 active:bg-orange-100 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>إضافة سريعة</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {isScanning && (
        <ScannerModal 
          onClose={() => setIsScanning(false)} 
          onScan={handleScanSuccess} 
        />
      )}
    </div>
  );
}
