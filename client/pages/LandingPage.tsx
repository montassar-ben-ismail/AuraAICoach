import React from 'react';
import { Button } from '../components/ui/Button';
import { Activity, Zap, Shield, ChevronRight, Check, Crown } from 'lucide-react';
import { navigate } from '../utils/navigation';

const LandingPage = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern bg-cover bg-center bg-fixed opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/30"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center space-x-2 bg-neon/10 border border-neon/30 rounded-full px-4 py-1 mb-8">
            <span className="w-2 h-2 bg-neon rounded-full animate-pulse"></span>
            <span className="text-neon text-xs font-bold uppercase tracking-widest">Aura OS v2.5 Online</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold uppercase leading-tight mb-6">
            Architect Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon to-white">Peak Physique</span>
          </h1>

          <p className="text-slate-300 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto">
            Metabolic engineering meet generative AI.
            Analyze nutrients, optimize performance, and track evolution with the Aura Intelligence Core.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button size="lg" onClick={() => navigate('/signup')}>
              Initialize Authorization
            </Button>
            <Button variant="outline" size="lg" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
              View Tier Protocols
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Crown,
                title: "Gemini Vision Log",
                desc: "Snap or type. Our AI core breaks down macros and micronutrients from any food source instantly."
              },
              {
                icon: Activity,
                title: "Metabolic Flux",
                desc: "Visualize your caloric burn and intake trends with medical-grade metabolic modeling."
              },
              {
                icon: Shield,
                title: "Biometric History",
                desc: "Maintain a permanent database of your physical evolution with secure, encrypted vaults."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 p-8 hover:border-neon transition-all group">
                <div className="w-12 h-12 bg-slate-800 rounded-sm flex items-center justify-center mb-6 border border-slate-700 group-hover:bg-neon transition-colors">
                  <feature.icon className="text-neon group-hover:text-black transition-colors" size={24} />
                </div>
                <h3 className="text-xl font-heading font-bold uppercase mb-3 text-white tracking-tight">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold uppercase mb-4 tracking-tighter text-white">Choose Your <span className="text-neon">Authorization level</span></h2>
            <p className="text-slate-500 uppercase text-xs font-bold tracking-[0.3em]">Access protocols for every evolution stage</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="bg-slate-900 border border-slate-800 p-10 flex flex-col relative">
              <div className="mb-8">
                <h3 className="text-2xl font-heading font-bold uppercase mb-2 text-white">Standard</h3>
                <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Base Access</p>
              </div>

              <div className="text-4xl font-bold text-white mb-8">$0.00</div>

              <ul className="space-y-4 mb-10 flex-grow">
                {['BMR/TDEE Calculation', 'Daily Training Splits', 'Weight Dashboard', 'Manual Goal Tracking'].map((f) => (
                  <li key={f} className="flex items-center text-sm text-slate-400">
                    <Check size={16} className="text-slate-600 mr-3" /> {f}
                  </li>
                ))}
              </ul>

              <Button variant="outline" fullWidth onClick={() => navigate('/signup')}>Initialize Free</Button>
            </div>

            {/* AuraPro */}
            <div className="bg-slate-900 border-2 border-neon p-10 flex flex-col relative shadow-[0_0_50px_-12px_rgba(173,255,47,0.3)] transform md:scale-105">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neon text-black text-[10px] font-black px-4 py-1 uppercase tracking-[0.2em] shadow-lg">
                Recommended Evolution
              </div>

              <div className="mb-8 text-center md:text-left">
                <h3 className="text-3xl font-heading font-bold uppercase mb-2 text-neon">Aura Pro</h3>
                <p className="text-slate-300 text-xs uppercase tracking-widest font-bold">Total Intelligence Access</p>
              </div>

              <div className="space-y-1 mb-8 text-center md:text-left">
                <div className="text-4xl font-bold text-white leading-none">$9.99<span className="text-sm text-slate-500 font-normal">/mo</span></div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Starting at $3.99/week</div>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {[
                  'Unlimited AI Vision Core (Gemini)',
                  'Automated Nutrients Breakdown',
                  'Comprehensive Progress Analytics',
                  'Quarterly Performance Reports',
                  'Encrypted History Vaults',
                  'Early Access Lab Features'
                ].map((f) => (
                  <li key={f} className="flex items-center text-sm text-white font-medium">
                    <Check size={16} className="text-neon mr-3" /> {f}
                  </li>
                ))}
              </ul>

              <Button fullWidth onClick={() => navigate('/signup')}>Upgrade Protocol</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
