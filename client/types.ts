export interface User {
  id: string;
  name: string;
  email: string;
  isPro: boolean;
  avatar?: string;
  role: 'user' | 'admin';
  isApproved: boolean;
}

export interface AuthResponse {
  status?: string;
  msg?: string;
  message?: string;
  token: string;
  user?: User;
  isNewUser?: boolean;
}

export interface PhysicalMetrics {
  age: number;
  dob?: string;
  height: number; // cm
  weight: number; // kg
  gender: 'male' | 'female';
  AF: number; // Activity Factor: 1.3, 1.375, 1.45, 1.55
  target: 'lose weight' | 'lose fat' | 'stay healthy' | 'gain muscle' | 'gain weight';
}

export interface UserProfile {
  status: string;
  target: string;
  BMR: number;
  dailyCalorie: number;
  proteineCible: number;
  fatCible: number;
  carbohydrateCible: number;
  [key: string]: any;
}

export interface MealLog {
  id: string;
  mealName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  timestamp: string;
}

export interface ParsedMeal {
  parsed: {
    foodItems: string[];
    totalCalories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
    confidenceScore: number;
  };
}

export interface WorkoutExercise {
  name: string;
  muscle: string;
  angle: string;
  type: string;
  category: string;
  sets: string;
  reps: string;
  rest: string;
}

export interface WorkoutPlan {
  status: string;
  typeSplit: string;
  planWeek: {
    [key: string]: WorkoutExercise[] | string; // "day1": [{...}] or "day1": "repos"
  };
}

export interface DailyStat {
  date: string;
  weight: number;
  calories: number;
}
