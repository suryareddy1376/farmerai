import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { CropAdvisor } from './components/CropAdvisor';
import { DiseaseDetector } from './components/DiseaseDetector';
import { ChatAssistant } from './components/ChatAssistant';
import { AppView, Task } from './types';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lifted state for tasks
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Check soil moisture', priority: 'High', dueDate: new Date().toISOString().split('T')[0], completed: false },
    { id: '2', title: 'Order new seeds', priority: 'Medium', dueDate: new Date().toISOString().split('T')[0], completed: true }
  ]);

  const renderContent = () => {
    switch (currentView) {
      case AppView.HOME:
        return <Dashboard onNavigate={setCurrentView} tasks={tasks} setTasks={setTasks} />;
      case AppView.CROP_ADVISOR:
        return <CropAdvisor />;
      case AppView.DISEASE_DETECTOR:
        return <DiseaseDetector />;
      case AppView.CHAT:
        return <ChatAssistant />;
      default:
        return <Dashboard onNavigate={setCurrentView} tasks={tasks} setTasks={setTasks} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navigation 
        currentView={currentView} 
        onNavigate={setCurrentView}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <main className="lg:ml-64 min-h-screen flex flex-col transition-all duration-300">
        
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm">
          <h1 className="font-bold text-lg text-green-900">AgriSmart</h1>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* View Container */}
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
