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

      const languageMap: Record<string, string> = {
        ja: 'Japanese',
        en: 'English',
        zh: 'Chinese',
        es: 'Spanish',
        fr: 'French'
      };
      const targetLanguage = languageMap[language] || language;

      const prompt = `
        You are a wise and encouraging life coach for a "Bucket List" app.
        The user is about to go to sleep. Please analyze their bucket list and provide a short, inspiring piece of advice or a reflection for tomorrow.
        
        Active Goals: ${activeItems.map(i => i.text).join(', ')}
        Recently Completed Goals: ${completedItems.slice(0, 3).map(i => i.text).join(', ')}
        
        Requirements:
        1. Keep it under 150 characters.
        2. Be encouraging but realistic (Memento Mori style - life is short, make it count).
        3. Focus on one specific active goal if possible, or give a general inspiring message.
        4. Respond ONLY in the following language: ${targetLanguage}.
        5. Do not use any markdown formatting, just plain text.
      `;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      return response.text || "Rest well and dream of your next adventure.";
    } catch (error) {
      console.error("Failed to generate AI advice:", error);
      const errorMessages: Record<string, string> = {
        ja: "ゆっくり休んでください。明日は夢を追いかける新しい一日です。",
        en: "Rest well. Tomorrow is a new day to pursue your dreams.",
        zh: "好好休息。明天是追求梦想的新一天。",
        es: "Descansa bien. Mañana es un nuevo día para perseguir tus sueños.",
        fr: "Reposez-vous bien. Demain est un nouveau jour pour poursuivre vos rêves."
      };
      return errorMessages[language] || errorMessages['en'];
    }
  }
}
