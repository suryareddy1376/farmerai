export enum AppView {
  HOME = 'HOME',
  CROP_ADVISOR = 'CROP_ADVISOR',
  DISEASE_DETECTOR = 'DISEASE_DETECTOR',
  CHAT = 'CHAT'
}

export interface CropRecommendation {
  cropName: string;
  confidence: number;
  reasoning: string;
  waterRequirement: string;
  growthDuration: string;
  estimatedYield: string;
}

export interface DiseaseAnalysis {
  diseaseName: string;
  confidence: number;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
