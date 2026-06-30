import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../services/api';
import { PhysicalMetrics } from '../types';
import { Modal } from '../components/ui/Modal';
import { AlertTriangle, Calendar } from 'lucide-react';
import { navigate } from '../utils/navigation';

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [nbJourDispo, setNbJourDispo] = useState(3);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; msg: string }>({ isOpen: false, msg: '' });
  const [formData, setFormData] = useState<PhysicalMetrics>({
    age: 25,
    dob: '2000-01-01',
    height: 175,
    weight: 75,
    gender: 'male',
    AF: 1.375,
    target: 'stay healthy'
  });

  const calculateAge = (birthday: string) => {
    const ageDifMs = Date.now() - new Date(birthday).getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleChange = (field: keyof PhysicalMetrics, value: any) => {
    if (field === 'dob') {
      const age = calculateAge(value);
      setFormData(prev => ({ ...prev, [field]: value, age }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleFinish = async () => {
    const checkAFMatch = (af: number, days: number) => {
      if (af <= 1.2 && days > 1) return "Sedentary activity is only compatible with 0-1 training days.";
      if (af > 1.2 && af <= 1.3 && (days < 1 || days > 3)) return "Light Activity is designed for 1-3 days/week.";
      if (af > 1.3 && af <= 1.375 && (days < 3 || days > 5)) return "Moderate Activity is designed for 3-5 days/week.";
      if (af > 1.375 && af <= 1.45 && (days < 5 || days > 6)) return "Active status is designed for 5-6 days/week.";
      if (af > 1.45 && days < 6) return "Athlete status requires 6-7 training days per week.";
      return null;
    };

    const mismatchError = checkAFMatch(formData.AF, nbJourDispo);
    if (mismatchError) {
      setErrorModal({ isOpen: true, msg: mismatchError });
      return;
    }

    setLoading(true);
    try {
      await api.user.saveMetrics(formData);
      await api.workouts.setPlan(nbJourDispo);
      navigate('/dashboard');
    } catch (error) {
      console.error("Failed to save metrics", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Step {step} of 4</span>
            <span className="text-xs font-bold uppercase tracking-widest text-neon">
              {step === 1 ? 'Basics' : step === 2 ? 'Physique' : step === 3 ? 'Objective' : 'Training'}
            </span>
          </div>
          <div className="h-1 bg-slate-800 w-full">
            <div
              className="h-1 bg-neon transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 shadow-2xl min-h-[400px] flex flex-col justify-between">

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-3xl font-heading font-bold uppercase">The Basics</h2>
              <p className="text-slate-400">Accurate age data ensures precise metabolic modeling.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center">
                    <Calendar size={14} className="mr-2" /> Date of Birth
                  </label>
                  <input
                    type="date"
                    className="w-full bg-slate-850 border border-slate-700 text-white p-3 focus:border-neon focus:outline-none transition-colors font-sans"
                    value={formData.dob}
                    onChange={(e) => handleChange('dob', e.target.value)}
                  />
                  <p className="mt-2 text-[10px] text-slate-500 uppercase font-bold tracking-widest">Calculated Age: <span className="text-neon">{formData.age}</span></p>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Gender</label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleChange('gender', 'male')}
                      className={`flex-1 py-3 border ${formData.gender === 'male' ? 'bg-neon text-black border-neon' : 'border-slate-700 text-slate-400'}`}
                    >
                      Male
                    </button>
                    <button
                      onClick={() => handleChange('gender', 'female')}
                      className={`flex-1 py-3 border ${formData.gender === 'female' ? 'bg-neon text-black border-neon' : 'border-slate-700 text-slate-400'}`}
                    >
                      Female
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-3xl font-heading font-bold uppercase">Your Stats</h2>
              <p className="text-slate-400">Accurate inputs equal accurate outputs. Be precise.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Height (cm)"
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleChange('height', parseInt(e.target.value))}
                />
                <Input
                  label="Weight (kg)"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', parseInt(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Activity Level</label>
                <select
                  className="w-full bg-slate-850 border border-slate-700 text-white p-3 focus:border-neon focus:outline-none"
                  value={formData.AF}
                  onChange={(e) => handleChange('AF', parseFloat(e.target.value))}
                >
                  <option value={1.2}>Sedentary (No exercise)</option>
                  <option value={1.3}>Light Activity (1-3 days/week)</option>
                  <option value={1.375}>Moderate (3-5 days/week)</option>
                  <option value={1.45}>Active (5-6 days/week)</option>
                  <option value={1.55}>Very Active (Athlete level)</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-3xl font-heading font-bold uppercase">The Mission</h2>
              <p className="text-slate-400">What are we engineering your body to do?</p>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'lose weight', label: 'Lose Weight', desc: 'Slight deficit for weight reduction.' },
                  { id: 'lose fat', label: 'Lose Fat (Cut)', desc: 'Focus on body fat reduction.' },
                  { id: 'stay healthy', label: 'Stay Healthy', desc: 'Maintenance and performance.' },
                  { id: 'gain muscle', label: 'Gain Muscle (Bulk)', desc: 'Caloric surplus for hypertrophy.' },
                  { id: 'gain weight', label: 'Gain Weight', desc: 'General mass increase.' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleChange('target', opt.id)}
                    className={`w-full text-left p-4 border transition-all ${formData.target === opt.id
                      ? 'border-neon bg-neon/10'
                      : 'border-slate-700 hover:border-slate-500'
                      }`}
                  >
                    <div className={`font-heading font-bold uppercase text-lg ${formData.target === opt.id ? 'text-neon' : 'text-white'}`}>
                      {opt.label}
                    </div>
                    <div className="text-slate-400 text-sm">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-3xl font-heading font-bold uppercase">Training Schedule</h2>
              <p className="text-slate-400">How many days per week can you dedicate to the protocol?</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { val: 1, label: '1 Day', split: 'Full Body' },
                  { val: 2, label: '2 Days', split: 'Upper/Lower' },
                  { val: 3, label: '3 Days', split: 'Full Body Protocol' },
                  { val: 4, label: '4 Days', split: 'Upper/Lower Split' },
                  { val: 5, label: '5 Days', split: 'Advanced Hybrid' },
                  { val: 6, label: '6 Days', split: 'High Volume PPL' },
                  { val: 7, label: '7 Days', split: 'Pro Athlete' }
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setNbJourDispo(opt.val)}
                    className={`p-4 border text-center transition-all ${nbJourDispo === opt.val
                      ? 'border-neon bg-neon/10'
                      : 'border-slate-700 hover:border-slate-500'
                      }`}
                  >
                    <div className={`font-bold text-lg ${nbJourDispo === opt.val ? 'text-neon' : 'text-white'}`}>
                      {opt.label}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">{opt.split}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-8 border-t border-slate-800">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)}>Back</Button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <Button onClick={() => setStep(s => s + 1)}>Next Step</Button>
            ) : (
              <Button onClick={handleFinish} disabled={loading}>
                {loading ? 'Initializing...' : 'Access Dashboard'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title="Configuration Alert"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-12 w-12 bg-red-500/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{errorModal.msg}</p>
          <Button fullWidth onClick={() => setErrorModal({ ...errorModal, isOpen: false })}>
            Review Settings
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default OnboardingPage;
