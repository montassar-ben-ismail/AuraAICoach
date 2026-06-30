import React, { useEffect, useState } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Activity, Flame, Utensils, Zap, Send, TrendingUp, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { UserProfile, WorkoutPlan, DailyStat } from '../types';
import { navigate } from '../utils/navigation';
import { Lock, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Toast, ToastType } from '../components/ui/Toast';

const DashboardPage = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [stats, setStats] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Log State
  const [mealInput, setMealInput] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [lastLogged, setLastLogged] = useState<any>(null);

  const [todayConsumed, setTodayConsumed] = useState(0);
  const [todayProtein, setTodayProtein] = useState(0);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Checklist Persistence
  const [checkedExercises, setCheckedExercises] = useState<Record<string, boolean>>({});

  const refreshAnalytics = async () => {
    try {
      const [statsData, histRes] = await Promise.all([
        api.user.getStats(),
        api.nutrition.getHistory()
      ]);

      if (statsData && statsData.status === 'ok') {
        setStats(statsData.message);
      }

      if (histRes && histRes.status === 'ok' && Array.isArray(histRes.message)) {
        const totalCal = histRes.message.reduce((acc: number, curr: any) => acc + (Number(curr.calories) || 0), 0);
        const totalProt = histRes.message.reduce((acc: number, curr: any) => acc + (Number(curr.protein) || 0), 0);
        setTodayConsumed(totalCal);
        setTodayProtein(totalProt);
      }
    } catch (e) {
      console.error("Refresh failed", e);
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        // Fetch profile and plan individually to handle failures separately
        let profileData;
        try {
          profileData = await api.user.getProfile();
        } catch (e: any) {
          console.warn("Profile fetch failed, might be missing metrics", e);
          // If profile fetch fails (e.g. 400), it means metrics are missing
          navigate('/onboarding');
          return;
        }

        if (profileData && profileData.status === 'ok') {
          setProfile(profileData);
        } else {
          console.warn("Profile metrics not found via status, redirecting to onboarding");
          navigate('/onboarding');
          return;
        }

        // Fetch plan - non-critical for redirection
        try {
          const workoutData = await api.workouts.getPlan();
          if (workoutData && workoutData.status === 'ok') {
            setWorkout(workoutData);
          }
        } catch (e) {
          console.log("No workout plan found yet, this is normal for new users.");
        }

        await refreshAnalytics();

        // Load checklist from localStorage
        const saved = localStorage.getItem('aura-coach-checklist');
        if (saved) {
          setCheckedExercises(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Dashboard unexpected init error", e);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [navigate]);

  const toggleExercise = (name: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const key = `${todayStr}-${name}`;
    const newState = { ...checkedExercises, [key]: !checkedExercises[key] };
    setCheckedExercises(newState);
    localStorage.setItem('aura-coach-checklist', JSON.stringify(newState));
  };

  const handleMealLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealInput.trim()) return;

    // Security check: Block non-pro users before API call
    if (!authUser?.isPro && authUser?.role !== 'admin') {
      setToast({
        message: 'ACCESS DENIED: Subscription Protocol Required. Please authenticate as a Pro member.',
        type: 'error'
      });
      return;
    }

    setIsLogging(true);
    try {
      const res = await api.nutrition.parse(mealInput);
      if (res.status === 'ok') {
        if (res.message.message) {
          // It's a rejection message from AI
          setToast({ message: res.message.message, type: 'warning' });
        } else {
          setLastLogged({
            foodItems: [mealInput],
            totalCalories: res.message.calories,
            macros: {
              protein: res.message.protein,
              carbs: res.message.carbs,
              fats: res.message.fat
            }
          });
          setToast({ message: 'Nutrition protocol updated successfully.', type: 'success' });
          await refreshAnalytics();
        }
      }
      setMealInput('');
    } catch (e: any) {
      console.error(e);
      setToast({
        message: e.status === 403 ? 'ACCESS DENIED: Subscription required.' : 'AI SERVER_ERROR: Protocol failed.',
        type: 'error'
      });
    } finally {
      setIsLogging(false);
    }
  };

  if (loading || !profile) return <div className="flex-grow flex items-center justify-center text-neon animate-pulse">SYNCING DATA...</div>;

  const today = new Date().getDay();
  const dayKey = `day${today === 0 ? 7 : today}`;
  const todaysExercises = workout?.planWeek[dayKey];
  const isRest = typeof todaysExercises === 'string' && todaysExercises.toLowerCase().includes('repos');
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-4xl font-heading font-bold text-white uppercase tracking-tighter">
              Welcome, {authUser?.name || 'Recruit'}
            </h1>
            {authUser?.isPro && (
              <span className="bg-neon text-black text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest">
                PRO ACTIVE
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm max-w-md uppercase tracking-widest">
            {authUser?.role === 'admin' ? 'System Administrator Access' : 'Biometric Terminal Synchronized'}
          </p>
        </div>

        {!authUser?.isApproved && (
          <div className="bg-amber-500/10 border border-amber-500/50 p-3 flex items-center space-x-3 animate-pulse">
            <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
            <span className="text-amber-500 text-[10px] font-bold uppercase tracking-widest">
              Security Clearance Pending: Awaiting Admin Approval
            </span>
          </div>
        )}
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Consumed Today</div>
          <div className="text-4xl font-heading font-bold text-neon">{todayConsumed} <span className="text-sm text-slate-500 font-sans">/ {profile.dailyCalorie}</span></div>
          <div className="mt-2 h-1 bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-neon transition-all duration-1000"
              style={{ width: `${Math.min(100, (todayConsumed / profile.dailyCalorie) * 100)}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Protein Intake</div>
          <div className="text-4xl font-heading font-bold text-white">{todayProtein}g <span className="text-sm text-slate-500 font-sans">/ {profile.proteineCible}g</span></div>
          <div className="mt-2 h-1 bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-1000"
              style={{ width: `${Math.min(100, (todayProtein / profile.proteineCible) * 100)}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">BMR Status</div>
          <div className="text-4xl font-heading font-bold text-white">{profile.BMR} <span className="text-sm text-slate-500 font-sans">kcal</span></div>
        </div>
        <div className="bg-neon p-6 flex flex-col justify-between relative overflow-hidden">
          <Zap className="absolute -right-4 -bottom-4 text-black/10 w-32 h-32" />
          <div className="text-black/60 text-xs font-bold uppercase tracking-wider mb-2">Macro Ceiling (C/F)</div>
          <div className="text-2xl font-heading font-bold text-black relative z-10">{profile.carbohydrateCible}g / {profile.fatCible}g</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">

          {/* Charts */}
          <div className="bg-slate-900 border border-slate-800 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h3 className="text-xl font-heading font-bold uppercase flex items-center">
                <TrendingUp className="text-neon mr-2" size={20} />
                Progress Analytics
              </h3>
            </div>
            <div className="h-64 sm:h-72 lg:h-80 w-full min-h-[250px] relative">
              {stats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ADFF2F" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ADFF2F" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#475569"
                      fontSize={10}
                      tickFormatter={(val) => val.split('-').slice(1).join('/')}
                    />
                    <YAxis
                      stroke="#475569"
                      fontSize={10}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                      itemStyle={{ color: '#ADFF2F' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="calories"
                      stroke="#ADFF2F"
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center border border-dashed border-slate-800 text-slate-600 text-sm">
                  Historical tracking will populate as you log more data.
                </div>
              )}
            </div>
          </div>

          {/* Quick Log AI */}
          <div className="bg-slate-900 border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-heading font-bold uppercase flex items-center">
                <Utensils className="text-neon mr-2" size={20} /> AI Nutrition Log
              </h3>
              <button
                onClick={() => navigate('/history')}
                className="text-xs font-bold text-slate-500 hover:text-neon uppercase tracking-widest transition-colors"
              >
                View Full History
              </button>
            </div>
            <div className="relative group">
              <form onSubmit={handleMealLog} className="relative">
                <textarea
                  className="w-full bg-slate-950 border border-slate-700 text-white p-4 pr-12 rounded-none focus:border-neon focus:ring-1 focus:ring-neon focus:outline-none transition-colors h-24 resize-none"
                  placeholder="Ex: 3 eggs, 2 slices of toast, and a black coffee..."
                  value={mealInput}
                  onChange={(e) => setMealInput(e.target.value)}
                ></textarea>
                <button
                  type="submit"
                  disabled={isLogging || !mealInput}
                  className="absolute bottom-4 right-4 text-neon hover:text-white disabled:opacity-50 transition-colors"
                >
                  {isLogging ? <Activity className="animate-spin" /> : <Send />}
                </button>
              </form>

              {lastLogged && (
                <div className="mt-4 p-4 bg-slate-950 border border-slate-800 flex items-center justify-between animate-fade-in">
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Detected</div>
                    <div className="text-white text-sm">{lastLogged.foodItems.join(', ')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-neon">{lastLogged.totalCalories} kcal</div>
                    <div className="text-xs text-slate-500">
                      P: {lastLogged.macros.protein}g • C: {lastLogged.macros.carbs}g • F: {lastLogged.macros.fats}g
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Workout Card */}
          <div className="bg-slate-900 border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-heading font-bold uppercase flex items-center">
                <Flame className="text-neon mr-2" size={20} /> Today's Protocol
              </h3>
              <span className="text-xs bg-slate-800 text-white px-2 py-1 rounded-sm uppercase tracking-tighter">
                {workout?.typeSplit}
              </span>
            </div>

            <div className="space-y-4">
              {!workout ? (
                <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 space-y-4">
                  <p className="text-xs uppercase tracking-widest">Protocol Offline</p>
                  <button
                    onClick={() => navigate('/plan')}
                    className="text-neon text-xs font-bold hover:underline"
                  >
                    INITIALIZE PROTOCOL
                  </button>
                </div>
              ) : isRest ? (
                <div className="text-center py-12 text-slate-500 italic border border-dashed border-slate-800">
                  Recovery Session Active
                </div>
              ) : (
                Array.isArray(todaysExercises) && todaysExercises.map((ex, idx) => {
                  const name = typeof ex === 'string' ? ex : ex.name;
                  const muscle = typeof ex === 'object' ? ex.muscle : '';
                  const angle = typeof ex === 'object' ? ex.angle : '';
                  const sets = typeof ex === 'object' ? ex.sets : '';
                  const reps = typeof ex === 'object' ? ex.reps : '';
                  const rest = typeof ex === 'object' ? ex.rest : '';
                  const isChecked = checkedExercises[`${todayStr}-${name}`];

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleExercise(name)}
                      className={`flex items-center justify-between p-3 border transition-colors group cursor-pointer ${isChecked ? 'bg-neon/5 border-neon/30' : 'bg-slate-950 border-slate-800 hover:border-neon/30'}`}
                    >
                      <div className="flex-grow">
                        <div className={`font-bold text-sm transition-colors ${isChecked ? 'text-neon line-through opacity-50' : 'text-slate-200 group-hover:text-white'}`}>{name}</div>
                        <div className="flex items-center space-x-2">
                          {muscle && (
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                              {muscle} {angle && <span>• {angle}</span>}
                            </span>
                          )}
                          {rest && (
                            <span className="text-[10px] text-slate-600 font-mono">
                              REST: {rest}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right mr-4 shrink-0">
                        {sets && (
                          <div className={`text-[10px] font-bold uppercase tracking-tighter ${isChecked ? 'text-slate-600' : 'text-neon'}`}>
                            {sets} x {reps}
                          </div>
                        )}
                      </div>
                      <div className={`h-6 w-6 rounded-sm border flex items-center justify-center transition-all ${isChecked ? 'bg-neon border-neon' : 'border-slate-700 group-hover:border-neon'}`}>
                        {isChecked && <CheckCircle2 size={14} className="text-black" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => navigate('/plan')}
              className="mt-6 w-full py-3 border border-slate-800 text-xs font-bold uppercase tracking-widest hover:border-neon hover:text-neon transition-all"
            >
              View Full Architecture
            </button>
          </div>
        </div>

      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div >
  );
};

export default DashboardPage;
