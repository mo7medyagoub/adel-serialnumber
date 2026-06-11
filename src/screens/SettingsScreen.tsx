import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { db, type Device } from '../db';
import { User, UploadCloud, Database, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsScreen() {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setProgress(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as any[];
          
          if (rows.length === 0) {
            toast.error("الملف فارغ أو صيغته غير صحيحة");
            setIsImporting(false);
            return;
          }

          // Map CSV rows to our Device structure
          // We assume CSV might have columns dynamically named, taking common names
          const devicesToImport: Device[] = rows.map((row) => ({
            device_name: row.device_name || row['اسم الجهاز'] || row.Name || 'جديد (مستورد)',
            serial_number: row.serial_number || row['السيريال'] || row.IMEI || row.Serial || null,
            generated_code: row.generated_code || row['الكود'] || row.Code || 'UNKNOWN',
            created_date: row.created_date || row['التاريخ'] || row.Date || new Date().toISOString(),
          })).filter(d => d.serial_number); // Filter out rows without serial numbers

          if (devicesToImport.length === 0) {
            toast.error("لم يتم العثور على أرقام سيريال صحيحة في الملف");
            setIsImporting(false);
            return;
          }

          // Perform batch insert in chunks to avoid blocking main thread completely on massive files
          // Dexie bulkAdd handles thousands easily, but batching is cleaner for UI updates
          const chunkSize = 5000;
          let insertedCount = 0;

          await db.transaction('rw', db.devices, async () => {
            for (let i = 0; i < devicesToImport.length; i += chunkSize) {
              const chunk = devicesToImport.slice(i, i + chunkSize);
              // Use put instead of add to gracefully overwrite existing identical serial numbers
              await db.devices.bulkPut(chunk);
              insertedCount += chunk.length;
              
              // Artificial delay UI update (In browser transaction this is tricky since it's atomic,
              // but we estimate progress conceptually, actual transaction commit happens at the end)
              setProgress(Math.round((insertedCount / devicesToImport.length) * 100));
            }
          });

          toast.success(`تم استيراد ${insertedCount} جهاز بنجاح!`);
        } catch (error) {
          console.error(error);
          toast.error("حدث خطأ أثناء رفع قاعدة البيانات");
        } finally {
          setIsImporting(false);
          setProgress(0);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        console.error(error);
        toast.error("خطأ في قراءة ملف CSV");
        setIsImporting(false);
      }
    });
  };

  const clearDatabase = async () => {
    if (window.confirm('هل أنت متأكد من حذف جميع بيانات الأجهزة؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        await db.devices.clear();
        toast.success("تم مسح قاعدة البيانات بنجاح");
      } catch (error) {
        toast.error("حدث خطأ أثناء مسح قاعدة البيانات");
      }
    }
  };

  return (
    <div className="flex flex-col h-full px-4 pt-8 max-w-md mx-auto animate-in fade-in">
      <h2 className="text-2xl font-bold text-center text-brand-purple mb-8">
        الإعدادات
      </h2>

      {/* User Profile Placeholder */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-brand-bg-orange flex items-center justify-center text-brand-orange">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-brand-purple">عادل</h3>
          <p className="text-sm text-gray-500">مدير النظام</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Import Database */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-brand-purple mb-1">استيراد قاعدة البيانات</h3>
              <p className="text-xs text-gray-500">قم برفع ملف CSV يحتوي على الأجهزة والسيريالات</p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
          </div>
          
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          
          <button
            onClick={triggerFileInput}
            disabled={isImporting}
            className="w-full h-12 bg-white border-2 border-brand-orange text-brand-orange font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isImporting ? (
              <span className="animate-pulse">جاري الاستيراد {progress}%...</span>
            ) : (
              <>
                <UploadCloud className="w-5 h-5" />
                <span>استيراد ملف (CSV)</span>
              </>
            )}
          </button>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg flex gap-2 text-xs text-gray-600">
            <AlertCircle className="w-4 h-4 text-gray-400 shrink-0" />
            <p>يجب أن يحتوي الملف على أعمدة باسم (serial_number) أو (IMEI)</p>
          </div>
        </div>

        {/* Clear Database */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100">
          <h3 className="font-bold text-rose-600 mb-1">منطقة الخطر</h3>
          <p className="text-xs text-gray-500 mb-4">احذر، هذا الإجراء سيحذف جميع بياناتك المحفوظة</p>
          
          <button
            onClick={clearDatabase}
            className="w-full h-12 bg-rose-50 text-rose-600 font-bold rounded-xl flex items-center justify-center hover:bg-rose-100 transition-colors"
          >
            مسح جميع البيانات
          </button>
        </div>
      </div>
    </div>
  );
}
