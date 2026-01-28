import { GoogleGenAI, Type } from "@google/genai";
import { CropRecommendation, DiseaseAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Constants for models
const MODEL_TEXT = 'gemini-3-flash-preview'; 
const MODEL_VISION = 'gemini-3-flash-preview'; // Multimodal capable

export const getCropRecommendations = async (
  soilType: string,
  climate: string,
  season: string,
  location: string,
  landSize: string
): Promise<CropRecommendation[]> => {
  const prompt = `
    Act as an expert agronomist. Based on the following conditions, recommend 3 specific crops that would maximize yield and sustainability.
    
    Conditions:
    - Soil Type: ${soilType}
    - Climate: ${climate}
    - Season: ${season}
    - Location Context: ${location}
    - Land Size: ${landSize}

    Return the response as a JSON array of objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              cropName: { type: Type.STRING },
              confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 100" },
              reasoning: { type: Type.STRING },
              waterRequirement: { type: Type.STRING, description: "e.g., High, Moderate, Low" },
              growthDuration: { type: Type.STRING, description: "e.g., 90-120 days" },
              estimatedYield: { type: Type.STRING, description: "e.g., 2-3 tons/acre" }
            },
            required: ["cropName", "confidence", "reasoning", "waterRequirement", "growthDuration", "estimatedYield"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as CropRecommendation[];
  } catch (error) {
    console.error("Gemini Advisor Error:", error);
    throw error;
  }
};

export const analyzePlantDisease = async (base64Image: string): Promise<DiseaseAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_VISION,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: "Analyze this image of a plant. Identify if there is any disease, pest damage, or nutrient deficiency. If healthy, state that. Provide a detailed analysis in JSON format."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diseaseName: { type: Type.STRING, description: "Name of the disease or 'Healthy'" },
            confidence: { type: Type.NUMBER },
            symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
            treatment: { type: Type.ARRAY, items: { type: Type.STRING } },
            prevention: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["diseaseName", "confidence", "symptoms", "treatment", "prevention"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as DiseaseAnalysis;
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw error;
  }
};

export const chatWithAgronomist = async (message: string, history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
  try {
    // Note: In a real app, we would persist the Chat object. 
    // Here we are doing a stateless one-off for simplicity or reconstructing context if needed.
    // However, the cleanest way for this specific request is using the chat interface.
    
    // Transform simple history to API format
    const chat = ai.chats.create({
      model: MODEL_TEXT,
      history: history,
      config: {
        systemInstruction: "You are AgriSmart, a helpful and knowledgeable agricultural assistant. Keep answers concise, practical, and encouraging for farmers."
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sorry, I'm having trouble connecting to the farming database right now.";
  }
};

export const generateFarmingTasks = async (crop: string, stage: string): Promise<Array<{title: string, priority: 'High'|'Medium'|'Low', daysFromNow: number}>> => {
  const prompt = `
    Act as a farm manager. Generate a checklist of 3-5 critical farming tasks for growing ${crop} during the ${stage} stage.
    For each task, provide a priority (High, Medium, Low) and a suggested due date offset (days from today, e.g., 0 for today, 2 for in 2 days).
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Actionable task title" },
              priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
              daysFromNow: { type: Type.INTEGER, description: "Suggested days from now to complete task" }
            },
            required: ["title", "priority", "daysFromNow"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Task Gen Error:", error);
    throw error;
  }
};
