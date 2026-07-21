import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { UserProfile, PhysicalMetrics } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User as UserIcon, Settings, CreditCard, ChevronRight, Lock, Download, HelpCircle, AlertTriangle, Calendar } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { navigate } from '@/utils/navigation';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pack, setPack] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nbJourDispo, setNbJourDispo] = useState(3);
  const [originalSettings, setOriginalSettings] = useState({ target: '', days: 0 });

  // Edit State
  const [metrics, setMetrics] = useState<PhysicalMetrics>({
    age: 25,
    dob: '',
    height: 175,
    weight: 75,
    gender: 'male',
    AF: 1.375,
    target: 'stay healthy'
  });
  const [saving, setSaving] = useState(false);
  const [showOptimizePrompt, setShowOptimizePrompt] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; msg: string }>({
    isOpen: false,
    title: '',
    msg: ''
  });
  const [msg, setMsg] = useState('');

  // Modal States
  const [activeModal, setActiveModal] = useState<'password' | 'subscription' | 'support' | 'export' | null>(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassWord: '', newPassWord: '', confirmNewPassWord: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const calculateAge = (birthday: string) => {
    if (!birthday) return 25;
    const ageDifMs = Date.now() - new Date(birthday).getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const fetchData = async () => {
    try {
      // Individual fetches to prevent one failure from blocking others
      let profileData = null;
      try {
        profileData = await api.user.getProfile();
      } catch (e) {
        console.warn("Could not fetch profile metrics", e);
      }

      let planData = null;
      try {
        planData = await api.workouts.getPlan();
      } catch (e) {
        console.log("No training plan found.");
      }

      let packRes = null;
      try {
        packRes = await api.payments.getPack();
      } catch (e) {
        console.log("No active subscription pack found.");
      }

      if (profileData && profileData.status === 'ok') {
        setProfile(profileData);
        // Format date for input field (YYYY-MM-DD)
        const rawDob = profileData.dob ? new Date(profileData.dob).toISOString().split('T')[0] : '';

        const initialMetrics = {
          age: profileData.age || 25,
          dob: rawDob,
          height: profileData.height || 175,
          weight: profileData.weight || 75,
          gender: profileData.gender || 'male',
          AF: profileData.AF || 1.375,
          target: profileData.target || 'stay healthy'
        };
        setMetrics(initialMetrics);

        const days = (planData && planData.planWeek) ? Object.keys(planData.planWeek).filter(k => Array.isArray(planData.planWeek[k])).length : 3;
        setNbJourDispo(days || 3);
        setOriginalSettings({ target: initialMetrics.target, days: days || 3 });
      }

      if (packRes && packRes.status === 'ok') {
        setPack(packRes.message);
      }
    } catch (e) {
      console.error("Profile page data fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enhanced Validation Logic
    const checkAFMatch = (af: number, days: number) => {
      if (af <= 1.2 && days > 1) return "Sedentary status is only compatible with 0-1 training days. Increase your Activity Factor to commit to more sessions.";
      if (af > 1.2 && af <= 1.3 && (days < 1 || days > 3)) return "Light Activity is designed for 1-3 days/week. Please align your commitment.";
      if (af > 1.3 && af <= 1.375 && (days < 3 || days > 5)) return "Moderate Activity is designed for 3-5 days/week. Please align your commitment.";
      if (af > 1.375 && af <= 1.45 && (days < 5 || days > 6)) return "Active status is designed for 5-6 days/week. Please align your commitment.";
      if (af > 1.45 && days < 6) return "Athlete status requires 6-7 training days per week.";
      return null;
    };

    const mismatchError = checkAFMatch(metrics.AF, nbJourDispo);
    if (mismatchError) {
      setErrorModal({
        isOpen: true,
        title: "Protocol Mismatch",
        msg: mismatchError
      });
      return;
    }

    setSaving(true);
    setMsg('');
    try {
      await api.user.updateMetrics(metrics);
      const updated = await api.user.getProfile();
      setProfile(updated);
      setMsg('Metrics optimized successfully.');

      if (metrics.target !== originalSettings.target || nbJourDispo !== originalSettings.days) {
        setShowOptimizePrompt(true);
      }
    } catch (e) {
      setMsg('Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setSaving(true);
    try {
      await api.workouts.setPlan(nbJourDispo);
      setOriginalSettings({ target: metrics.target, days: nbJourDispo });
      setShowOptimizePrompt(false);
      setMsg('Training plan synchronized.');
    } catch (e) {
      setMsg('Sync failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDobChange = (newDob: string) => {
    const newAge = calculateAge(newDob);
    setMetrics({ ...metrics, dob: newDob, age: newAge });
  };

  if (loading) return <div className="flex-grow flex items-center justify-center text-neon animate-pulse">ACCESSING RECORDS...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-slate-800">
        <div className="h-12 w-12 bg-slate-800 rounded-sm flex items-center justify-center">
          <UserIcon className="text-neon" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-bold uppercase text-white">Operative Profile</h1>
          <p className="text-slate-400 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-slate-900 border border-slate-800 p-6">
            <h2 className="text-xl font-heading font-bold uppercase mb-6 flex items-center">
              <Settings size={20} className="mr-2 text-neon" /> Bio-Metrics
            </h2>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center">
                    <Calendar size={14} className="mr-2" /> Date of Birth
                  </label>
                  <input
                    type="date"
                    className="w-full bg-slate-850 border border-slate-700 text-white p-3 focus:border-neon focus:outline-none transition-colors font-sans"
                    value={metrics.dob}
                    onChange={(e) => handleDobChange(e.target.value)}
                  />
                </div>
                <Input
                  label="Calculated Age"
                  type="number"
                  value={metrics.age}
                  disabled
                  className="opacity-50 cursor-not-allowed"
                />
                <Input
                  label="Current Weight (kg)"
                  type="number"
                  value={metrics.weight}
                  onChange={(e) => setMetrics({ ...metrics, weight: parseFloat(e.target.value) })}
                />
                <Input
                  label="Height (cm)"
                  type="number"
                  value={metrics.height}
                  onChange={(e) => setMetrics({ ...metrics, height: parseFloat(e.target.value) })}
                />
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Activity Factor (AF)</label>
                  <select
                    className="w-full bg-slate-850 border border-slate-700 text-white p-3 focus:border-neon focus:outline-none transition-colors"
                    value={metrics.AF}
                    onChange={(e) => setMetrics({ ...metrics, AF: parseFloat(e.target.value) })}
                  >
                    <option value={1.2}>Sedentary (No exercise)</option>
                    <option value={1.3}>Light Activity (1-3 days/week)</option>
                    <option value={1.375}>Moderate (3-5 days/week)</option>
                    <option value={1.45}>Active (5-6 days/week)</option>
                    <option value={1.55}>Very Active (Athlete level)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Mission Target</label>
                  <select
                    className="w-full bg-slate-850 border border-slate-700 text-white p-3 focus:border-neon focus:outline-none transition-colors"
                    value={metrics.target}
                    onChange={(e) => setMetrics({ ...metrics, target: e.target.value as any })}
                  >
                    <option value="lose weight">Lose Weight</option>
                    <option value="lose fat">Lose Fat</option>
                    <option value="stay healthy">Stay Healthy</option>
                    <option value="gain muscle">Gain Muscle</option>
                    <option value="gain weight">Gain Weight</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Weekly Commitment</label>
                  <select
                    className="w-full bg-slate-850 border border-slate-700 text-white p-3 focus:border-neon focus:outline-none transition-colors"
                    value={nbJourDispo}
                    onChange={(e) => setNbJourDispo(parseInt(e.target.value))}
                  >
                    <option value={1}>1 Day (Full Body)</option>
                    <option value={2}>2 Days (Upper/Lower)</option>
                    <option value={3}>3 Days (Full Body Protocol)</option>
                    <option value={4}>4 Days (Upper/Lower Split)</option>
                    <option value={5}>5 Days (Advanced Hybrid)</option>
                    <option value={6}>6 Days (High Volume PPL)</option>
                    <option value={7}>7 Days (Pro Athlete Protocol)</option>
                  </select>
                </div>
              </div>

              {showOptimizePrompt && (
                <div className="p-4 bg-neon/10 border border-neon/30 animate-fade-in relative group">
                  <button
                    type="button"
                    onClick={() => setShowOptimizePrompt(false)}
                    className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                  <div className="text-xs font-bold text-neon uppercase mb-2">Optimization Alert</div>
                  <p className="text-xs text-slate-300 mb-4">Your goals or schedule have changed. We recommend re-calculating your training split for maximum efficiency.</p>
                  <div className="flex space-x-3">
                    <Button type="button" size="sm" onClick={handleRegenerate} disabled={saving}>
                      Sync Training Plan
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowOptimizePrompt(false)}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-950 border border-slate-800 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-tighter">BMR</div>
                  <div className="font-bold text-lg text-white">{profile?.BMR}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-tighter">TDEE / Cal</div>
                  <div className="font-bold text-lg text-neon">{profile?.dailyCalorie}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Protein</div>
                  <div className="font-bold text-lg text-white">{profile?.proteineCible}g</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neon text-sm">{msg}</span>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Recalculating...' : 'Update Metrics'}
                </Button>
              </div>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6">
            <h2 className="text-xl font-heading font-bold uppercase mb-6 flex items-center">
              <Lock size={20} className="mr-2 text-neon" /> Security Configuration
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors group">
                <div className="text-sm font-bold text-white uppercase mb-4">Access Credentials</div>
                <Button variant="outline" size="sm" fullWidth onClick={() => setActiveModal('password')}>Update Password</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 relative overflow-hidden group">
            <h2 className="text-xl font-heading font-bold uppercase mb-4">Subscription</h2>
            <div className="mb-6 space-y-4">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-1">Current Tier</div>
                <div className="text-3xl font-heading font-bold text-neon uppercase">
                  {user?.isPro ? 'Pulse / Pro' : 'Free Basic'}
                </div>
              </div>

              {pack && (
                <div className="p-3 bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold">
                    <span className="text-slate-500">Expiry Date</span>
                    <span className="text-white">{new Date(pack.dateFin).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="h-1 bg-slate-800 w-full overflow-hidden">
                    <div
                      className="h-full bg-neon transition-all"
                      style={{
                        width: `${Math.max(0, Math.min(100, ((new Date(pack.dateFin).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)) * 100))}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {user?.isPro ? (
                <>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    You have an active operational protocol. Access to all generative models is currently authorized.
                  </p>
                  <Button fullWidth onClick={() => navigate('/membership')}>Renew / Extend Membership</Button>
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Unlock unlimited AI nutrition logs and advanced metabolic trend visualization.
                  </p>
                  <Button fullWidth onClick={() => navigate('/membership')}>Upgrade to Pulse</Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ERROR MODAL */}
        <Modal
          isOpen={errorModal.isOpen}
          onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
          title={errorModal.title}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{errorModal.msg}</p>
            <Button fullWidth onClick={() => setErrorModal({ ...errorModal, isOpen: false })}>
              Adjust Parameters
            </Button>
          </div>
        </Modal>

        <Modal
          isOpen={activeModal === 'password'}
          onClose={() => { setActiveModal(null); setPasswordMsg(''); }}
          title="Update Protocol Access"
        >
          <form className="space-y-4" onSubmit={async (e) => {
            e.preventDefault();
            setPasswordLoading(true);
            setPasswordMsg('');
            try {
              const res = await api.security.updatePassword(passwordForm);
              if (res.status === 'ok') {
                setPasswordMsg('PROTOCOL_UPDATED: ACCESS SECURED.');
                setTimeout(() => setActiveModal(null), 2000);
              } else {
                setPasswordMsg(res.message || 'UPDATE_FAILED: ACCESS DENIED.');
              }
            } catch (err) {
              setPasswordMsg('ERR: SECURITY_SERVER_TIMEOUT.');
            } finally {
              setPasswordLoading(false);
            }
          }}>
            <Input
              label="Current Password"
              type="password"
              value={passwordForm.currentPassWord}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassWord: e.target.value })}
              required
            />
            <Input
              label="New Password"
              type="password"
              value={passwordForm.newPassWord}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassWord: e.target.value })}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmNewPassWord}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassWord: e.target.value })}
              required
            />

            {passwordMsg && (
              <div className={`p-3 text-xs font-bold uppercase ${passwordMsg.includes('ERR') || passwordMsg.includes('FAILED') ? 'bg-red-500/10 text-red-500 border border-red-500/50' : 'bg-neon/10 text-neon border border-neon/50'}`}>
                {passwordMsg}
              </div>
            )}

            <div className="pt-4">
              <Button fullWidth type="submit" disabled={passwordLoading}>
                {passwordLoading ? 'Encrypting...' : 'Encrypt & Update'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default ProfilePage;
