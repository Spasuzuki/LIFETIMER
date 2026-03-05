import { LifeExpectancyData } from './types';

export const LIFE_EXPECTANCY: LifeExpectancyData = {
  "Japan": { male: 81.7, female: 87.2, average: 84.5 },
  "Singapore": { male: 81.6, female: 86.3, average: 83.9 },
  "South Korea": { male: 80.8, female: 86.7, average: 83.8 },
  "Switzerland": { male: 81.4, female: 85.3, average: 83.4 },
  "Australia": { male: 81.3, female: 85.1, average: 83.2 },
  "Spain": { male: 80.4, female: 85.9, average: 83.2 },
  "Norway": { male: 81.5, female: 84.5, average: 83.0 },
  "Iceland": { male: 81.4, female: 84.4, average: 82.9 },
  "Israel": { male: 82.4, female: 83.4, average: 82.9 },
  "Italy": { male: 80.7, female: 84.8, average: 82.8 },
  "Sweden": { male: 81.1, female: 84.3, average: 82.7 },
  "France": { male: 79.7, female: 85.6, average: 82.7 },
  "Canada": { male: 80.4, female: 84.6, average: 82.5 },
  "Luxembourg": { male: 80.2, female: 84.6, average: 82.4 },
  "Netherlands": { male: 80.4, female: 83.8, average: 82.1 },
  "New Zealand": { male: 80.5, female: 83.7, average: 82.1 },
  "Ireland": { male: 80.2, female: 83.8, average: 82.0 },
  "Austria": { male: 79.4, female: 84.3, average: 81.9 },
  "Finland": { male: 79.2, female: 84.6, average: 81.9 },
  "Germany": { male: 79.3, female: 84.1, average: 81.7 },
  "Belgium": { male: 79.4, female: 84.0, average: 81.7 },
  "UK": { male: 79.5, female: 83.2, average: 81.4 },
  "Greece": { male: 78.8, female: 83.8, average: 81.3 },
  "Portugal": { male: 78.2, female: 84.2, average: 81.3 },
  "Slovenia": { male: 78.4, female: 84.1, average: 81.3 },
  "Denmark": { male: 79.4, female: 83.0, average: 81.2 },
  "Cyprus": { male: 79.1, female: 83.1, average: 81.1 },
  "USA": { male: 74.5, female: 80.2, average: 77.3 },
  "China": { male: 74.7, female: 80.5, average: 77.4 },
  "Brazil": { male: 72.4, female: 79.4, average: 75.9 },
  "Russia": { male: 66.0, female: 76.4, average: 71.3 },
  "India": { male: 69.5, female: 72.2, average: 70.8 }
};

export const COUNTRIES = Object.keys(LIFE_EXPECTANCY).sort();
