import React, { useState } from 'react';
import { Task, LoadingState } from '../types';
import { generateFarmingTasks } from '../services/gemini';
import { CheckSquare, Plus, Trash2, Calendar, Sparkles, Loader2, X } from 'lucide-react';

interface TaskManagerProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ tasks, setTasks }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAiForm, setShowAiForm] = useState(false);
  const [loading, setLoading] = useState(LoadingState.IDLE);
  
  // Manual Add State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  // AI Gen State
  const [aiCrop, setAiCrop] = useState('');
  const [aiStage, setAiStage] = useState('');

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'Medium',
      completed: false
    };
    
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setShowAddForm(false);
  };

  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiCrop || !aiStage) return;
    
    setLoading(LoadingState.LOADING);
    try {
      const generated = await generateFarmingTasks(aiCrop, aiStage);
      
      const newTasks: Task[] = generated.map((t, idx) => {
        const date = new Date();
        date.setDate(date.getDate() + t.daysFromNow);
        return {
          id: Date.now().toString() + idx,
          title: t.title,
          priority: t.priority,
          dueDate: date.toISOString().split('T')[0],
          completed: false
        };
      });

      setTasks(prev => [...prev, ...newTasks]);
      setLoading(LoadingState.SUCCESS);
      setShowAiForm(false);
      setAiCrop('');
      setAiStage('');
    } catch (error) {
      setLoading(LoadingState.ERROR);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-amber-100 text-amber-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-green-50/30">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-green-600" />
          Task Manager
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => { setShowAiForm(!showAiForm); setShowAddForm(false); }}
            className="text-xs flex items-center gap-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Suggest
          </button>
          <button 
            onClick={() => { setShowAddForm(!showAddForm); setShowAiForm(false); }}
            className="text-xs flex items-center gap-1 bg-gray-900 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>

      {/* Forms Area */}
      {(showAddForm || showAiForm) && (
        <div className="p-4 bg-gray-50 border-b border-gray-100 animate-fade-in">
          {showAddForm && (
            <form onSubmit={handleManualAdd} className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                autoFocus
              />
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Save</button>
            </form>
          )}

          {showAiForm && (
            <form onSubmit={handleAiGenerate} className="space-y-3">
              <div className="flex gap-3">
                 <input
                  type="text"
                  value={aiCrop}
                  onChange={(e) => setAiCrop(e.target.value)}
                  placeholder="Crop (e.g., Tomato)"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  autoFocus
                />
                <select 
                  value={aiStage}
                  onChange={(e) => setAiStage(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
                >
                  <option value="" disabled>Select Stage</option>
                  <option value="Sowing">Sowing</option>
                  <option value="Vegetative">Vegetative</option>
                  <option value="Flowering">Flowering</option>
                  <option value="Harvest">Harvest</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={loading === LoadingState.LOADING || !aiCrop || !aiStage}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-purple-700 disabled:opacity-50"
              >
                {loading === LoadingState.LOADING ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                  </>
                ) : (
                  'Generate Schedule'
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[400px]">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No tasks yet.</p>
            <p className="text-xs mt-1">Add one or ask AI!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id}
              className={`group flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-gray-50 border border-transparent hover:border-gray-100 ${task.completed ? 'opacity-60 bg-gray-50' : 'bg-white'}`}
            >
              <button 
                onClick={() => handleToggleTask(task.id)}
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-500 text-transparent'}`}
              >
                <CheckSquare className="w-3.5 h-3.5 fill-current" />
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {task.dueDate}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleDeleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
