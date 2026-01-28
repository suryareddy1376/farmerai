import React, { useState } from 'react';
import { getCropRecommendations } from '../services/gemini';
import { CropRecommendation, LoadingState } from '../types';
import { Loader2, Droplets, Clock, TrendingUp, Sun, MapPin, Ruler } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const CropAdvisor: React.FC = () => {
  const [loading, setLoading] = useState(LoadingState.IDLE);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  
  const [formData, setFormData] = useState({
    soilType: 'Loamy',
    climate: 'Tropical',
    season: 'Monsoon',
    location: '',
    landSize: '1 acre'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(LoadingState.LOADING);
    try {
      const results = await getCropRecommendations(
        formData.soilType,
        formData.climate,
        formData.season,
        formData.location,
        formData.landSize
      );
      setRecommendations(results);
      setLoading(LoadingState.SUCCESS);
    } catch (error) {
      setLoading(LoadingState.ERROR);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const chartData = recommendations.map(rec => ({
    name: rec.cropName,
    confidence: rec.confidence,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold text-gray-900">Smart Crop Advisor</h2>
        <p className="text-gray-600 mt-2">Get personalized crop recommendations based on your land's specific conditions.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Input Form */}
        <div className="md:col-span-5 lg:col-span-4">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 sticky top-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
              <select name="soilType" value={formData.soilType} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all">
                <option>Loamy</option>
                <option>Clay</option>
                <option>Sandy</option>
                <option>Silt</option>
                <option>Peat</option>
                <option>Chalky</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Climate</label>
              <select name="climate" value={formData.climate} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all">
                <option>Tropical</option>
                <option>Dry</option>
                <option>Temperate</option>
                <option>Continental</option>
                <option>Polar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
              <select name="season" value={formData.season} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all">
                <option>Spring</option>
                <option>Summer</option>
                <option>Autumn</option>
                <option>Winter</option>
                <option>Monsoon</option>
                <option>Dry Season</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location/Region</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  name="location" 
                  placeholder="e.g. California Central Valley" 
                  value={formData.location} 
                  onChange={handleChange}
                  className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Land Size</label>
               <div className="relative">
                <Ruler className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  name="landSize" 
                  placeholder="e.g. 5 acres" 
                  value={formData.landSize} 
                  onChange={handleChange}
                  className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading === LoadingState.LOADING}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
            >
              {loading === LoadingState.LOADING ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sun className="w-5 h-5" />
                  Analyze Land
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Display */}
        <div className="md:col-span-7 lg:col-span-8 space-y-6">
          {loading === LoadingState.IDLE && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl p-12">
              <SproutIconPlaceholder />
              <p className="mt-4 font-medium">Fill out the form to get started</p>
            </div>
          )}

          {loading === LoadingState.ERROR && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
              Failed to analyze. Please check your connection and try again.
            </div>
          )}

          {loading === LoadingState.SUCCESS && recommendations.length > 0 && (
            <>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Suitability Analysis</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis dataKey="name" type="category" width={100} tick={{fill: '#4b5563', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{fill: 'transparent'}}
                      />
                      <Bar dataKey="confidence" radius={[0, 4, 4, 0]} barSize={20}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#16a34a' : '#86efac'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid gap-6">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-green-50 p-4 border-b border-green-100 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-green-800">{rec.cropName}</h3>
                      <span className="bg-white text-green-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                        {rec.confidence}% Match
                      </span>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 mb-6 leading-relaxed">{rec.reasoning}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <Droplets className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Water</p>
                            <p className="text-sm font-medium text-blue-900">{rec.waterRequirement}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                          <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider">Duration</p>
                            <p className="text-sm font-medium text-amber-900">{rec.growthDuration}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                            <TrendingUp className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Est. Yield</p>
                            <p className="text-sm font-medium text-emerald-900">{rec.estimatedYield}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple SVG placeholder component
const SproutIconPlaceholder = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-200">
    <path d="M7 20h10" />
    <path d="M10 20c5.5-3.5 2.5-8 5-13-.5-1-1-2-2-2s-2 1-2 2c2.5 5-2.5 9.5 3 13" />
    <path d="M9 20c-5.5-3.5-2.5-8-5-13 .5-1 1-2 2-2s2 1 2 2c-2.5 5 2.5 9.5-3 13" />
  </svg>
);
