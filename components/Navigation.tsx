import React from 'react';
import { AppView } from '../types';
import { Sprout, Activity, MessageSquare, Home, Leaf } from 'lucide-react';

interface NavigationProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navItems = [
    { view: AppView.HOME, label: 'Dashboard', icon: Home },
    { view: AppView.CROP_ADVISOR, label: 'Crop Advisor', icon: Sprout },
    { view: AppView.DISEASE_DETECTOR, label: 'Disease Doctor', icon: Activity },
    { view: AppView.CHAT, label: 'Farm Chat', icon: MessageSquare },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-30 h-screen w-64 bg-green-900 text-white transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center gap-3 p-6 border-b border-green-800">
          <div className="bg-green-500 p-2 rounded-lg">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">AgriSmart</h1>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => {
                  onNavigate(item.view);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-900/20 font-medium' 
                    : 'text-green-200 hover:bg-green-800 hover:text-white'}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-6">
          <div className="bg-green-800 rounded-xl p-4 text-sm text-green-200">
            <p className="font-semibold text-white mb-1">Pro Tip</p>
            <p>Rotate crops annually to maintain soil health and reduce pests.</p>
          </div>
        </div>
      </aside>
    </>
  );
};
