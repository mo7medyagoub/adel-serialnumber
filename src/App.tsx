import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Home as HomeIcon, List, BarChart2, Settings } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { cn } from './lib/utils';
import HomeScreen from './screens/HomeScreen';
import SavedDevicesScreen from './screens/SavedDevicesScreen';
import StatsScreen from './screens/StatsScreen';
import SettingsScreen from './screens/SettingsScreen';

function BottomTabItem({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center w-full h-full space-y-1",
          isActive ? "text-brand-orange" : "text-brand-purple opacity-60"
        )
      }
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs font-medium">{label}</span>
    </NavLink>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Background Gradient */}
      <div className="flex flex-col h-full h-[100dvh] bg-gradient-to-b from-brand-bg-purple/40 to-brand-bg-orange/20">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-16 relative">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/saved" element={<SavedDevicesScreen />} />
            <Route path="/stats" element={<StatsScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
          </Routes>
        </main>

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
          <div className="flex justify-around items-center h-full max-w-md mx-auto">
            <BottomTabItem to="/" icon={HomeIcon} label="الرئيسية" />
            <BottomTabItem to="/saved" icon={List} label="الأجهزة المحفوظة" />
            <BottomTabItem to="/stats" icon={BarChart2} label="الإحصائيات" />
            <BottomTabItem to="/settings" icon={Settings} label="الإعدادات" />
          </div>
        </nav>
        
        <Toaster position="top-center" />
      </div>
    </BrowserRouter>
  );
}
