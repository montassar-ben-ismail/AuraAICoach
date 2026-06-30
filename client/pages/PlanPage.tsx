import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { WorkoutPlan } from '../types';
import { Button } from '../components/ui/Button';
import { Dumbbell, RotateCcw, Calendar, RefreshCcw } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { navigate } from '../utils/navigation';

const PlanPage = () => {
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [isRegenModalOpen, setIsRegenModalOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState(3);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      const data = await api.workouts.getPlan();
      setPlan(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!plan) return;

    // Auto-detect current commitment from plan
    const activeDays = Object.keys(plan.planWeek).filter(k =>
      Array.isArray((plan.planWeek as any)[k])
    ).length;

    setRegenerating(true);
    setIsRegenModalOpen(false);
    try {
      const newPlan = await api.workouts.regeneratePlan(activeDays || 3);
      setPlan(newPlan);
    } catch (e) {
      console.error(e);
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) return <div className="flex-grow flex items-center justify-center text-neon animate-pulse">LOADING PROTOCOL...</div>;

  const daysLabels = ['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-neon mb-1">
            <Dumbbell size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Training Plan</span>
          </div>
          <h1 className="text-4xl font-heading font-bold uppercase text-white">
            {plan?.typeSplit}
          </h1>
        </div>
        <div className="flex space-x-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            Overview
          </Button>
          <Button variant="outline" onClick={() => setIsRegenModalOpen(true)} disabled={regenerating}>
            {regenerating ? 'Optimizing...' : 'Regenerate Cycle'} <RotateCcw size={16} className="ml-2" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {daysLabels.map((dayKey, index) => {
          const exercises = plan?.planWeek[dayKey];
          const isRest = typeof exercises === 'string' && exercises.toLowerCase().includes('repos');

          return (
            <div
              key={dayKey}
              className={`flex flex-col h-full border p-6 transition-all duration-300 ${isRest
                ? 'bg-slate-950 border-slate-800 opacity-75'
                : 'bg-slate-900 border-slate-800 hover:border-neon/30'
                }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Day {index + 1}
                </span>
                {isRest && <Calendar size={16} className="text-slate-600" />}
              </div>

              <h3 className={`text-xl font-heading font-bold uppercase mb-6 ${isRest ? 'text-slate-400' : 'text-white'}`}>
                {isRest ? 'Recovery' : 'Active Duty'}
              </h3>

              <div className="space-y-4 flex-grow">
                {!isRest && Array.isArray(exercises) ? (
                  exercises.map((ex, idx) => {
                    const name = typeof ex === 'string' ? ex : (ex as any).name;
                    const muscle = typeof ex === 'object' ? (ex as any).muscle : '';
                    const angle = typeof ex === 'object' ? (ex as any).angle : '';
                    const sets = typeof ex === 'object' ? (ex as any).sets : '';
                    const reps = typeof ex === 'object' ? (ex as any).reps : '';
                    const rest = typeof ex === 'object' ? (ex as any).rest : '';

                    return (
                      <div key={idx} className="border-l-2 border-slate-700 pl-3 py-1 hover:border-neon transition-colors cursor-pointer group/ex flex justify-between items-start">
                        <div>
                          <div className="text-sm font-bold text-slate-200 group-hover/ex:text-white transition-colors">{name}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            {muscle && (
                              <span className="text-[10px] text-slate-500 uppercase tracking-tighter group-hover/ex:text-slate-400">
                                {muscle} • {angle}
                              </span>
                            )}
                            {rest && (
                              <span className="text-[9px] text-slate-600 font-mono">
                                {rest} REST
                              </span>
                            )}
                          </div>
                        </div>
                        {sets && (
                          <div className="text-[10px] font-bold text-neon bg-neon/10 px-1.5 py-0.5 rounded">
                            {sets}x{reps}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-20 text-slate-600 text-sm italic">
                    Active Recovery Protocol
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* REGEN MODAL */}
      <Modal
        isOpen={isRegenModalOpen}
        onClose={() => setIsRegenModalOpen(false)}
        title="Protocol Refresh"
      >
        <div className="space-y-6">
          <div className="bg-neon/5 border border-neon/20 p-4">
            <p className="text-slate-300 text-sm leading-relaxed">
              You are about to regenerate your <span className="text-neon font-bold uppercase tracking-tighter">{plan?.typeSplit}</span>.
              The system will maintain your current <span className="text-white font-bold">{Object.keys(plan?.planWeek || {}).filter(k => Array.isArray((plan?.planWeek as any)[k])).length}-day commitment</span> but will optimize exercise selection and sequencing.
            </p>
          </div>

          <div className="pt-4 flex flex-col space-y-3">
            <Button fullWidth onClick={handleRegenerate} disabled={regenerating}>
              {regenerating ? <RefreshCcw className="animate-spin mr-2" size={18} /> : null}
              Confirm Regeneration
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setIsRegenModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PlanPage;
