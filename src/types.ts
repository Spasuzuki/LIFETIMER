export interface BucketListItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: number;
  category?: 'annual' | 'life';
  memo?: string;
}

export type Language = 'ja' | 'en' | 'zh' | 'es' | 'fr';

export type QuoteCategory = 'mementoMori' | 'stoicism' | 'zen' | 'entrepreneur';

export interface NotificationSettings {
  enabled: boolean;
  dailyTime: string; // HH:mm
  dailyQuote: boolean;
  quoteCategory: QuoteCategory;
  weeklyLife: boolean;
  monthlyUpdate: boolean;
  birthdayMessage: boolean;
}

export interface UserData {
  birthDate: string;
  gender: 'male' | 'female';
  country: string;
  language: Language;
  lifeExpectancyOverride?: number;
  bucketList?: BucketListItem[];
  notifications?: NotificationSettings;
  isPremium?: boolean;
}

export interface LifeExpectancyData {
  [country: string]: {
    male: number;
    female: number;
    average: number;
  };
}
