import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { MealLog } from '@/types';
import { Utensils, Calendar, Search, Filter, ChevronRight, Crown, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { navigate } from '@/utils/navigation';

const HistoryPage = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState<MealLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            if (!user?.isPro) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.nutrition.getHistory();
                if (res.status === 'ok' && Array.isArray(res.message)) {
                    const mappedLogs = res.message.map((log: any) => ({
                        id: log._id,
                        mealName: log.textBrut,
                        calories: log.calories,
                        protein: log.protein,
                        carbs: log.carb,
                        fats: log.fat,
                        timestamp: log.createdAt
                    }));
                    setLogs(mappedLogs);
                }
            } catch (e) {
                console.error("History fetch blocked or failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.mealName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex-grow flex items-center justify-center text-neon animate-pulse">RETRIEVING ARCHIVES...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-heading font-bold uppercase text-white mb-2">Nutrition <span className="text-neon">History</span></h1>
                    <p className="text-slate-400">Review your past consumption and maintain metabolic consistency.</p>
                </div>

                <div className="flex w-full md:w-auto space-x-4">
                    <div className="relative flex-grow md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search meals..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-none p-3 pl-10 text-white focus:border-neon focus:outline-none transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="bg-slate-900 border border-slate-800 p-3 text-slate-400 hover:text-neon transition-colors">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            <div className="relative">
                {!user?.isPro && (
                    <div className="absolute inset-x-0 -inset-y-4 z-30 flex items-center justify-center backdrop-blur-md bg-slate-950/60 min-h-[400px]">
                        <div className="text-center p-12 bg-slate-900 border border-white/10 shadow-[0_0_50px_-12px_rgba(173,255,47,0.2)] max-w-lg transform transition-all">
                            <div className="inline-flex items-center justify-center h-16 w-16 bg-neon/10 rounded-full mb-6 border border-neon/20 shadow-[0_0_30px_rgba(173,255,47,0.1)]">
                                <Crown className="text-neon" size={32} />
                            </div>
                            <h2 className="text-3xl font-heading font-bold text-white uppercase tracking-tight mb-4">Historical Vault Locked</h2>
                            <p className="text-slate-400 text-sm uppercase tracking-[0.2em] mb-8 leading-relaxed">
                                Subscription to the <span className="text-neon font-bold">Pro Protocol</span> is required to access permanent nutrition archives and metabolic trend data.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button onClick={() => navigate('/membership')}>
                                    Authorize Access
                                </Button>
                                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                                    Return to Terminal
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {filteredLogs.length > 0 ? (
                        filteredLogs.map((log) => (
                            <div
                                key={log.id}
                                className="bg-slate-900 border border-slate-800 p-6 hover:border-neon/30 transition-all group flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                            >
                                <div className="flex items-center space-x-6">
                                    <div className="h-12 w-12 bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:bg-neon transition-colors">
                                        <Utensils className="text-neon group-hover:text-black transition-colors" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-heading font-bold uppercase text-white group-hover:text-neon transition-colors">{log.mealName}</h3>
                                        <div className="flex items-center text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">
                                            <Calendar size={12} className="mr-1" /> {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-8 w-full md:w-auto">
                                    <div className="text-center">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mb-1">Calories</div>
                                        <div className="text-lg font-heading font-bold text-white">{log.calories}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mb-1">Protein</div>
                                        <div className="text-lg font-heading font-bold text-slate-300">{log.protein}g</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mb-1">Carbs</div>
                                        <div className="text-lg font-heading font-bold text-slate-300">{log.carbs}g</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mb-1">Fats</div>
                                        <div className="text-lg font-heading font-bold text-slate-300">{log.fats}g</div>
                                    </div>
                                </div>

                                <button className="hidden md:block text-slate-600 group-hover:text-neon transition-colors">
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center border border-dashed border-slate-800 bg-slate-950/50">
                            <Utensils className="mx-auto text-slate-700 mb-4" size={48} />
                            <p className="text-slate-500 font-heading uppercase text-xl">No logs found in this cycle.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;
