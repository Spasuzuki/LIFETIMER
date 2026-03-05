export interface BucketListItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: number;
  category?: 'annual' | 'life';
}

export type Language = 'ja' | 'en' | 'zh' | 'es' | 'fr';

export interface NotificationSettings {
  enabled: boolean;
  dailyTime: string; // HH:mm
  includeLifeRemaining: boolean;
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
}

export interface LifeExpectancyData {
  [country: string]: {
    male: number;
    female: number;
    average: number;
  };
}
