import React, { useState, useRef } from 'react';
import { analyzePlantDisease } from '../services/gemini';
import { DiseaseAnalysis, LoadingState } from '../types';
import { Upload, X, AlertTriangle, CheckCircle, Search, Shield, Activity } from 'lucide-react';

export const DiseaseDetector: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(LoadingState.IDLE);
  const [analysis, setAnalysis] = useState<DiseaseAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Gemini expects just the base64 data, remove the data URL prefix
        const base64Data = base64String.split(',')[1];
        setImage(base64Data);
        // Keep the full string for display
        (e.target as any).preview = base64String;
        setAnalysis(null);
        setLoading(LoadingState.IDLE);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(LoadingState.LOADING);
    try {
      const result = await analyzePlantDisease(image);
      setAnalysis(result);
      setLoading(LoadingState.SUCCESS);
    } catch (error) {
      setLoading(LoadingState.ERROR);
    }
  };

  const clearImage = () => {
    setImage(null);
    setAnalysis(null);
    setLoading(LoadingState.IDLE);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold text-gray-900">Plant Disease Doctor</h2>
        <p className="text-gray-600 mt-2">Upload a photo of your affected plant to identify diseases and get treatment plans.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-4">
          <div 
            className={`
              relative border-2 border-dashed rounded-2xl h-80 flex flex-col items-center justify-center transition-all overflow-hidden
              ${image ? 'border-green-500 bg-gray-50' : 'border-gray-300 hover:border-green-400 hover:bg-green-50/30'}
            `}
          >
            {image ? (
              <>
                <img 
                  src={`data:image/jpeg;base64,${image}`} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={clearImage}
                  className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-md hover:bg-white text-gray-600 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer text-center p-8 w-full h-full flex flex-col items-center justify-center"
              >
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  <Upload className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-medium text-gray-700">Click to upload photo</p>
                <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG (Max 5MB)</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!image || loading === LoadingState.LOADING}
            className={`
              w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
              ${!image 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : loading === LoadingState.LOADING
                  ? 'bg-green-700 text-white cursor-wait'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20'}
            `}
          >
            {loading === LoadingState.LOADING ? (
              <>
                <Activity className="w-5 h-5 animate-spin" />
                Diagnosing...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Analyze Plant
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {loading === LoadingState.IDLE && !analysis && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 border border-gray-100 rounded-2xl bg-white/50">
              <Activity className="w-16 h-16 text-gray-200 mb-4" />
              <p>Upload an image to see the diagnosis</p>
            </div>
          )}

          {loading === LoadingState.ERROR && (
             <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-4">
               <AlertTriangle className="w-8 h-8 flex-shrink-0" />
               <p>We encountered an error analyzing the image. Please try a clearer photo.</p>
             </div>
          )}

          {analysis && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
              <div className={`p-6 border-b ${analysis.diseaseName.toLowerCase().includes('healthy') ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <div className="flex items-center gap-3 mb-2">
                  {analysis.diseaseName.toLowerCase().includes('healthy') ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{analysis.diseaseName}</h3>
                    <p className={`text-sm font-medium ${analysis.diseaseName.toLowerCase().includes('healthy') ? 'text-green-700' : 'text-red-700'}`}>
                      Confidence: {(analysis.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                    <Search className="w-4 h-4" /> Symptoms
                  </h4>
                  <ul className="space-y-2">
                    {analysis.symptoms.map((symptom, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                   <div className="bg-blue-50 p-4 rounded-xl">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">
                      <Activity className="w-4 h-4" /> Treatment
                    </h4>
                    <ul className="space-y-2">
                      {analysis.treatment.map((item, i) => (
                        <li key={i} className="text-sm text-blue-900 flex items-start gap-2">
                          <span className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-xl">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-600 uppercase tracking-wider mb-3">
                      <Shield className="w-4 h-4" /> Prevention
                    </h4>
                    <ul className="space-y-2">
                      {analysis.prevention.map((item, i) => (
                        <li key={i} className="text-sm text-emerald-900 flex items-start gap-2">
                          <span className="w-1 h-1 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
