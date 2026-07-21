import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { StripeCardElement } from '@stripe/stripe-js';
import { ShieldCheck, Zap, Star, CheckCircle2, Loader2, Lock, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';
import { navigate } from '@/utils/navigation';
import { useAuth } from '@/context/AuthContext';

const stripePromise = loadStripe('pk_test_51THODIDbu5um8X68mIlGGVpbeLmIgzpeg2Xpj0UeL8BIjbiMPnxEfpsdsxecmY2Z7T9kJQjmseWcAlmURGrCkdQB002JBb9i8D');

const PLANS = [
    { id: 'weekly', name: 'Weekly Protocol', price: 3.99, amount: 399, duration: '7 Days' },
    { id: 'monthly', name: 'Monthly Access', price: 9.99, amount: 999, duration: '30 Days', popular: true },
    { id: 'quarterly', name: 'Quarterly Sync', price: 19.99, amount: 1999, duration: '90 Days', savings: 'Best Value' },
];

const CheckoutForm = ({ plan }: { plan: typeof PLANS[0] }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [succeeded, setSucceeded] = useState(false);
    const { user, updateUser } = useAuth();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setError(null);

        try {
            const { status, clientSecret, error: intentError } = await api.payments.createIntent(plan.amount, plan.id);
            if (status !== 'ok' || !clientSecret) throw new Error(intentError || "Initialization failed");

            const cardElement = elements.getElement(CardElement) as unknown as StripeCardElement | null;
            if (!cardElement) throw new Error("Element missing");

            const payload = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: user?.name || 'Authorized User',
                        email: user?.email || '',
                    },
                },
            });

            if (payload.error) {
                setError(payload.error.message || "Auth error");
                setProcessing(false);
            } else if (payload.paymentIntent) {
                const confirmRes = await api.payments.confirmPayment(payload.paymentIntent.id);
                if (confirmRes.status === 'ok') {
                    updateUser({ isPro: true });
                    setProcessing(false);
                    setSucceeded(true);
                    setTimeout(() => navigate('/dashboard'), 2000);
                } else {
                    throw new Error(confirmRes.message || "Fulfillment failed");
                }
            }
        } catch (err: any) {
            setError(err.message);
            setProcessing(false);
        }
    };

    if (succeeded) return (
        <div className="text-center py-12 animate-fade-in">
            <CheckCircle2 className="text-neon mx-auto mb-4" size={48} />
            <h3 className="text-2xl font-heading font-bold text-neon uppercase">Access Authorized</h3>
            <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">Protocol Syncing... Redirecting to Mainframe</p>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-5 bg-slate-950 border border-slate-800 focus-within:border-neon transition-colors shadow-inner">
                <CardElement options={{ style: { base: { fontSize: '16px', color: '#fff', '::placeholder': { color: '#475569' } }, invalid: { color: '#ef4444' } } }} />
            </div>

            {error && <div className="text-red-500 text-[10px] font-bold uppercase p-3 bg-red-500/10 border border-red-500/50">{error}</div>}

            <Button type="submit" fullWidth disabled={!stripe || processing} className="relative py-4 group">
                {processing ? <Loader2 className="animate-spin mr-2" /> : <Lock className="mr-2" size={16} />}
                {processing ? 'Authorizing...' : `Confirm Payment: $${plan.price}`}
            </Button>
        </form>
    );
};

const MembershipPage = () => {
    const [selectedPlan, setSelectedPlan] = useState(PLANS[1]);

    return (
        <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="text-center mb-16">
                <div className="inline-flex items-center text-neon space-x-2 mb-4">
                    <ShieldCheck size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Operational Upgrade Terminal</span>
                </div>
                <h1 className="text-5xl font-heading font-bold text-white uppercase tracking-tighter mb-4">Aura Pro Protocol</h1>
                <p className="text-slate-400 max-w-lg mx-auto text-sm leading-relaxed uppercase tracking-wider">
                    Full integration with the AI Vision Core and unlimited metabolic history vaults.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.3em] mb-4">Select Period</h3>
                    <div className="space-y-3">
                        {PLANS.map((plan) => (
                            <div 
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan)}
                                className={`p-5 border-2 cursor-pointer transition-all flex items-center justify-between group ${selectedPlan.id === plan.id ? 'border-neon bg-neon/5 shadow-[0_0_20px_rgba(173,255,47,0.1)]' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'}`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`h-4 w-4 rounded-full border-2 transition-all ${selectedPlan.id === plan.id ? 'border-neon bg-neon' : 'border-slate-700'}`}></div>
                                    <div>
                                        <div className="text-white font-bold uppercase tracking-tight text-sm">{plan.name}</div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-widest">{plan.duration} Protocol</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-white">${plan.price}</div>
                                    {plan.savings && <div className="text-[8px] bg-neon text-black px-1.5 font-bold uppercase">{plan.savings}</div>}
                                    {plan.popular && <div className="text-[8px] text-neon uppercase font-bold tracking-widest">Most Stable</div>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-slate-800 space-y-4">
                        <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.3em]">Included Features</h3>
                        <ul className="space-y-2">
                            {['Unlimited AI Meal Analysis', 'Full Metabolic History', 'Dynamic Training Evolution', 'Priority Lab Access'].map((f) => (
                                <li key={f} className="flex items-center text-[11px] text-slate-400 uppercase tracking-wider font-medium">
                                    <Star className="text-neon mr-2" size={10} fill="currentColor" /> {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="bg-slate-900 border-t-4 border-neon p-10 shadow-2xl relative">
                    <div className="absolute top-4 right-4 text-slate-800"><Zap size={40} /></div>
                    <h3 className="text-xl font-heading font-bold text-white uppercase mb-8 flex items-center">
                        <Lock className="text-neon mr-3" size={20} />
                        Secure Payment
                    </h3>
                    <Elements stripe={stripePromise}>
                        <CheckoutForm plan={selectedPlan} />
                    </Elements>
                </div>
            </div>
        </div>
    );
};

export default MembershipPage;
