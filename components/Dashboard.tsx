import React, { useState } from 'react';
import { AppView, Task } from '../types';
import { Sprout, Activity, MessageSquare, ArrowRight, CloudSun, Droplets, Wind, Mic } from 'lucide-react';
import { TaskManager } from './TaskManager';
import { LiveVoiceAssistant } from './LiveVoiceAssistant';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, tasks, setTasks }) => {
  const [isLiveOpen, setIsLiveOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Voice Assistant Modal */}
      <LiveVoiceAssistant isOpen={isLiveOpen} onClose={() => setIsLiveOpen(false)} />

      {/* Header / Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-800 to-green-600 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome back, Farmer!</h1>
          <p className="text-green-100 text-lg mb-8 leading-relaxed">
            Your fields are looking good today. Use the AI tools below to optimize your yield or check for plant health issues.
          </p>
          <div className="flex gap-3">
            <button 
              onClick={() => onNavigate(AppView.CHAT)}
              className="bg-white text-green-800 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors inline-flex items-center gap-2"
            >
              Ask Assistant <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsLiveOpen(true)}
              className="bg-green-700 text-white border border-green-500 px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors inline-flex items-center gap-2 shadow-lg shadow-green-900/20"
            >
              <Mic className="w-4 h-4" /> Live Voice Mode
            </button>
          </div>
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 bg-green-400/20 rounded-full blur-2xl"></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Features */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                <CloudSun className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Weather</p>
                <p className="text-lg font-bold text-gray-800">Sunny, 24°C</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Humidity</p>
                <p className="text-lg font-bold text-gray-800">45%</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                <Wind className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Wind Speed</p>
                <p className="text-lg font-bold text-gray-800">12 km/h</p>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              onClick={() => onNavigate(AppView.CROP_ADVISOR)}
              className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all cursor-pointer"
            >
              <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center text-green-600 mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Crop Advisor</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Get intelligent recommendations for what to plant based on soil, season, and location.
              </p>
            </div>

            <div 
              onClick={() => onNavigate(AppView.DISEASE_DETECTOR)}
              className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-red-200 transition-all cursor-pointer"
            >
              <div className="bg-red-50 w-12 h-12 rounded-xl flex items-center justify-center text-red-600 mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Disease Doctor</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Upload photos of sick plants to identify diseases and get instant treatment plans.
              </p>
            </div>

            <div 
              onClick={() => setIsLiveOpen(true)}
              className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all cursor-pointer relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-3">
                <span className="bg-purple-100 text-purple-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">New</span>
              </div>
              <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Live Assistant</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Hands-free voice conversation with your farming expert. Perfect for when you're in the field.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Task Manager */}
        <div className="lg:col-span-1">
          <TaskManager tasks={tasks} setTasks={setTasks} />
        </div>
      </div>
    </div>
  );
};
