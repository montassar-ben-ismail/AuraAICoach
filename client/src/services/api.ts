/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import { User, AuthResponse, PhysicalMetrics, UserProfile, WorkoutPlan, DailyStat, ParsedMeal, MealLog } from '@/types';

// Détecte si on est en production (build) ou développement
const isProduction:boolean = import.meta.env.PROD;

// En prod, utilise l'IP du serveur. En dev, localhost
const BASE_URL:string = isProduction
  ? `http://${window.location.hostname}:3001`  // IP automatique !
  : (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001');



const headers = () => {
  const token = localStorage.getItem('aura_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || 'Server Error');
    (error as any).status = res.status;
    (error as any).data = data;
    throw error;
  }
  return data;
};

export const api = {
  auth: {
    signup: async (data: any): Promise<AuthResponse> => {
      const res = await fetch(`${BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    login: async (data: any): Promise<AuthResponse> => {
      const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    googleLogin: async (credential: string): Promise<AuthResponse> => {
      const res = await fetch(`${BASE_URL}/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });
      return handleResponse(res);
    }
  },
  user: {
    saveMetrics: async (metrics: PhysicalMetrics): Promise<{ status: string; message: string }> => {
      const res = await fetch(`${BASE_URL}/setMetriquePhysique`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(metrics)
      });
      return handleResponse(res);
    },
    updateMetrics: async (data: Partial<PhysicalMetrics>): Promise<{ status: string; message: string }> => {
      const res = await fetch(`${BASE_URL}/setMetriquePhysique`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    getProfile: async (): Promise<UserProfile> => {
      const res = await fetch(`${BASE_URL}/getMetriquePhysique`, {
        headers: headers()
      });
      return handleResponse(res);
    },
    getStats: async (): Promise<{ status: string; message: DailyStat[] }> => {
      const res = await fetch(`${BASE_URL}/getStats`, {
        headers: headers()
      });
      return handleResponse(res);
    }
  },
  nutrition: {
    parse: async (description: string): Promise<any> => {
      const res = await fetch(`${BASE_URL}/getMacro`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ text: description })
      });
      return handleResponse(res);
    },
    log: async (meal: MealLog): Promise<void> => {
      console.warn("Nutrition logging not implemented in backend");
    },
    getHistory: async (): Promise<{ status: string; message: any[] }> => {
      const res = await fetch(`${BASE_URL}/historique`, {
        headers: headers()
      });
      return handleResponse(res);
    },
    search: async (text: string): Promise<MealLog | null> => {
      const res = await fetch(`${BASE_URL}/searchMeal`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ searchText: text })
      });
      const data = await handleResponse(res);
      return data.status === 'ok' ? data.message : null;
    }
  },
  workouts: {
    getPlan: async (): Promise<WorkoutPlan> => {
      const res = await fetch(`${BASE_URL}/getTrainningPlan`, {
        headers: headers()
      });
      return handleResponse(res);
    },
    setPlan: async (nbJourDispo: number): Promise<{ status: string; msg: string }> => {
      const res = await fetch(`${BASE_URL}/setTrainningPlan`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ nbJourDispo })
      });
      return handleResponse(res);
    },
    regeneratePlan: async (nbJourDispo: number): Promise<WorkoutPlan> => {
      await api.workouts.setPlan(nbJourDispo);
      return api.workouts.getPlan();
    },
    addExercise: async (exercise: { muscle: string; angle?: string; nomExercice: string }): Promise<any> => {
      const res = await fetch(`${BASE_URL}/addEx`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(exercise)
      });
      return handleResponse(res);
    }
  },
  payments: {
    createIntent: async (amount: number, planId: string): Promise<{ status: string; clientSecret?: string; error?: string }> => {
      const res = await fetch(`${BASE_URL}/create-payment-intent`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ amount, planId })
      });
      return handleResponse(res);
    },
    confirmPayment: async (paymentIntentId: string): Promise<{ status: string; message: string }> => {
      const res = await fetch(`${BASE_URL}/confirm-payment`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ paymentIntentId })
      });
      return handleResponse(res);
    },
    getPack: async (): Promise<{ status: string; message: any }> => {
      const res = await fetch(`${BASE_URL}/get-pack`, {
        headers: headers()
      });
      return handleResponse(res);
    }
  },
  admin: {
    getAllUsers: async (): Promise<{ status: string; approver: User[]; attente: User[] }> => {
      const res = await fetch(`${BASE_URL}/getAllUsers`, {
        headers: headers()
      });
      return handleResponse(res);
    },
    createUser: async (data: any): Promise<{ status: string; message: string }> => {
      const res = await fetch(`${BASE_URL}/admin/create-user`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    approveUser: async (email: string): Promise<{ status: string; message: string }> => {
      const res = await fetch(`${BASE_URL}/approveUser`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email })
      });
      return handleResponse(res);
    },
    ignoreUser: async (email: string): Promise<{ status: string; message: string }> => {
      const res = await fetch(`${BASE_URL}/ignoreUser`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email })
      });
      return handleResponse(res);
    }
  },
  security: {
    updatePassword: async (data: any): Promise<{ status: string; message: string }> => {
      const res = await fetch(`${BASE_URL}/updatePassWord`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    }
  }
};
