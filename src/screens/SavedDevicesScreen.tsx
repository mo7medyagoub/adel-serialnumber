import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Search, Hash, Calendar, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SavedDevicesScreen() {
  const [filterQuery, setFilterQuery] = useState('');

  // Use Dexie live query. If query is empty, show latest 100 to avoid massive DOM
  // If user searched, filter by serial_number starting with query (or contains).
  const devices = useLiveQuery(async () => {
    if (filterQuery.trim()) {
      return await db.devices
        .where('serial_number')
        .startsWithIgnoreCase(filterQuery.trim())
        .limit(100)
        .toArray();
    } else {
      return await db.devices
        .orderBy('id')
        .reverse()
        .limit(100)
        .toArray();
    }
  }, [filterQuery]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('تم النسخ');
    } catch {
      toast.error('فشل النسخ');
    }
  };

  return (
    <div className="flex flex-col h-full px-4 pt-8 max-w-md mx-auto animate-in fade-in">
      <h2 className="text-2xl font-bold text-center text-brand-purple mb-6">
        الأجهزة المحفوظة
      </h2>

      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center mb-6 sticky top-4 z-10">
        <Search className="w-5 h-5 text-gray-400 mx-2" />
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="ابحث بالسيريال نمبر..."
          className="flex-1 h-10 bg-transparent border-none focus:outline-none text-brand-purple"
        />
      </div>

      <div className="flex-1 space-y-4 pb-4">
        {!devices && <div className="text-center text-gray-400 py-10">جاري التحميل...</div>}
        
        {devices?.length === 0 && (
          <div className="text-center text-gray-400 py-10">
            لا توجد أجهزة مطابقة للبحث
          </div>
        )}

        {devices?.map((device) => (
          <div 
            key={device.id} 
            className="bg-white p-4 rounded-2xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-50 flex flex-col gap-3 transition-transform hover:scale-[1.01]"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                   <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-brand-purple">{device.device_name || 'جهاز غير معروف'}</h3>
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded w-fit flex items-center gap-1">
                 <Calendar className="w-3 h-3" />
                 {new Date(device.created_date).toLocaleDateString('ar-EG')}
              </span>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
               <div className="flex justify-between items-center group cursor-pointer" onClick={() => copyToClipboard(device.serial_number)}>
                 <span className="text-xs text-gray-400">السيريال</span>
                 <span className="font-mono text-sm text-gray-700">{device.serial_number}</span>
               </div>
               <div className="h-px bg-gray-200/50 w-full"></div>
               <div className="flex justify-between items-center group cursor-pointer" onClick={() => copyToClipboard(device.generated_code)}>
                 <span className="text-xs text-gray-400">الكود</span>
                 <span className="font-mono text-lg font-bold text-brand-orange flex items-center gap-1">
                    <Hash className="w-4 h-4" />
                    {device.generated_code}
                 </span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
