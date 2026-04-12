import { GoogleGenAI } from "@google/genai";
import { BucketListItem } from "../types";

export class AIService {
  private static ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  static async generateEveningAdvice(items: BucketListItem[], language: string): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      return "Gemini API Key is not set.";
    }

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

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      return response.text || "Rest well and dream of your next adventure.";
    } catch (error) {
      console.error("Failed to generate AI advice:", error);
      return "Rest well. Tomorrow is a new day to pursue your dreams.";
    }
  }

  static async generateGoalAdvice(goal: string, remainingYears: number, isBonusTime: boolean, language: string): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      return "Gemini API Key is not set.";
    }

    const context = isBonusTime 
      ? `The user has exceeded their life expectancy and is in "Bonus Time" (gifted time).`
      : `The user has approximately ${remainingYears.toFixed(1)} years of life remaining.`;

    const prompt = `
      You are a wise life coach helping a user plan a bucket list goal.
      Goal: "${goal}"
      Context: ${context}
      
      Requirements:
      1. Provide specific, actionable advice on "when" and "how" to achieve this goal given the remaining time.
      2. Be encouraging but realistic. If it's bonus time, emphasize the preciousness of every moment and the wisdom of experience.
      3. Keep the advice concise (under 300 characters).
      4. Respond ONLY in the following language: ${language}.
      5. Do not use any markdown formatting, just plain text.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      return response.text || "Every moment is a gift. Start planning your goal today.";
    } catch (error) {
      console.error("Failed to generate goal advice:", error);
      return "Focus on what matters most. Your time is precious.";
    }
  }
}
