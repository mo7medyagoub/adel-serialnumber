import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Activity, Database, Smartphone, Clock } from 'lucide-react';

export default function StatsScreen() {
  const totalDevices = useLiveQuery(() => db.devices.count());
  
  // Get today's count
  const todayCount = useLiveQuery(async () => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return await db.devices
      .where('created_date')
      .aboveOrEqual(startOfToday.toISOString())
      .count();
  });

  return (
    <div className="flex flex-col h-full px-4 pt-8 max-w-md mx-auto animate-in fade-in">
      <h2 className="text-2xl font-bold text-center text-brand-purple mb-8">
        الإحصائيات
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <Database className="w-8 h-8 text-brand-orange mb-3" />
          <p className="text-2xl font-bold text-brand-purple">{totalDevices ?? '...'}</p>
          <span className="text-xs text-gray-500 mt-1">إجمالي الأجهزة</span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <Activity className="w-8 h-8 text-brand-purple opacity-80 mb-3" />
          <p className="text-2xl font-bold text-brand-purple">{todayCount ?? '...'}</p>
          <span className="text-xs text-gray-500 mt-1">تم إضافتها اليوم</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-brand-purple mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          معلومات إضافية
        </h3>
        
        <ul className="space-y-4">
          <li className="flex items-center justify-between text-sm">
            <span className="text-gray-500">حالة قاعدة البيانات</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md font-medium text-xs">متصلة (محلية)</span>
          </li>
          <li className="flex items-center justify-between text-sm border-t border-gray-50 pt-4">
            <span className="text-gray-500">إصدار التطبيق</span>
            <span className="font-mono text-gray-700">1.0.0</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
