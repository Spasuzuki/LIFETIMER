import { GoogleGenAI } from "@google/genai";
import { BucketListItem } from "../types";

export class AIService {
  private static aiInstance: GoogleGenAI | null = null;

  private static get ai() {
    if (!this.aiInstance) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set. Please check your environment variables.");
      }
      this.aiInstance = new GoogleGenAI({ apiKey });
    }
    return this.aiInstance;
  }

  static async generateEveningAdvice(items: BucketListItem[], language: string): Promise<string> {
    try {
      const activeItems = items.filter(i => !i.completed);
      const completedItems = items.filter(i => i.completed);

      const prompt = `
        You are a wise and encouraging life coach for a "Bucket List" app.
        The user is about to go to sleep. Please analyze their bucket list and provide a short, inspiring piece of advice or a reflection for tomorrow.
        
        Active Goals: ${activeItems.map(i => i.text).join(', ')}
        Recently Completed Goals: ${completedItems.slice(0, 3).map(i => i.text).join(', ')}
        
        Requirements:
        1. Keep it under 150 characters.
        2. Be encouraging but realistic (Memento Mori style - life is short, make it count).
        3. Focus on one specific active goal if possible, or give a general inspiring message.
        4. Respond ONLY in the following language: ${language}.
        5. Do not use any markdown formatting, just plain text.
      `;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      return response.text || "Rest well and dream of your next adventure.";
    } catch (error) {
      console.error("Failed to generate AI advice:", error);
      if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
        return "AI advice is currently unavailable (API Key missing).";
      }
      return "Rest well. Tomorrow is a new day to pursue your dreams.";
    }
  }
}
