import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { Activity, LogOut, Settings, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <nav className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 cursor-pointer z-50" onClick={() => navigate('/')}>
              <div className="h-8 w-8 bg-neon rounded-sm flex items-center justify-center">
                <Activity className="h-5 w-5 text-black" />
              </div>
              <span className="font-heading text-xl font-bold tracking-widest text-white">
                AURA<span className="text-neon">COACH</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' ? (
                    <button onClick={() => navigate('/admin')} className="text-sm font-medium text-amber-500 hover:text-amber-400 transition-colors uppercase">Admin Control</button>
                  ) : (
                    <>
                      <button onClick={() => navigate('/dashboard')} className="text-sm font-medium hover:text-neon transition-colors">DASHBOARD</button>
                      <button onClick={() => navigate('/history')} className="text-sm font-medium hover:text-neon transition-colors">HISTORY</button>
                      <button onClick={() => navigate('/plan')} className="text-sm font-medium hover:text-neon transition-colors">PLAN</button>
                    </>
                  )}
                  <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-slate-800">
                    {user?.role !== 'admin' && (
                      <button onClick={() => navigate('/profile')} className="flex items-center space-x-2 group text-left">
                        <span className="text-xs text-slate-400 uppercase tracking-wider group-hover:text-neon transition-colors">{user?.name}</span>
                        <Settings size={16} className="text-slate-500 group-hover:text-neon transition-colors" />
                      </button>
                    )}
                    <button onClick={() => { logout(); navigate('/login'); }} className="text-slate-400 hover:text-white transition-colors ml-4" title="Logout">
                      <LogOut size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/')} className="text-sm font-medium hover:text-neon transition-colors uppercase">Home</button>
                  <button onClick={() => navigate('/login')} className="text-sm font-medium hover:text-neon transition-colors uppercase">Login</button>
                  <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>
                    GET STARTED
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center z-50">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 hover:text-white focus:outline-none">
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-slate-900 border-b border-slate-800 animate-fade-in shadow-2xl">
            <div className="px-4 py-6 space-y-4 flex flex-col">
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' ? (
                    <button onClick={() => navigate('/admin')} className="text-left text-lg font-heading font-bold uppercase text-amber-500 hover:text-amber-400">Admin Control</button>
                  ) : (
                    <>
                      <button onClick={() => navigate('/dashboard')} className="text-left text-lg font-heading font-bold uppercase text-white hover:text-neon">Dashboard</button>
                      <button onClick={() => navigate('/history')} className="text-left text-lg font-heading font-bold uppercase text-white hover:text-neon">History</button>
                      <button onClick={() => navigate('/plan')} className="text-left text-lg font-heading font-bold uppercase text-white hover:text-neon">Workout Plan</button>
                      <button onClick={() => navigate('/profile')} className="text-left text-lg font-heading font-bold uppercase text-white hover:text-neon">Profile & Settings</button>
                    </>
                  )}
                  <div className="h-px bg-slate-800 my-2"></div>
                  <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center text-slate-400 hover:text-red-500 text-sm font-bold uppercase">
                    <LogOut size={16} className="mr-2" /> Log Out
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/')} className="text-left text-lg font-heading font-bold uppercase text-white hover:text-neon">Home</button>
                  <button onClick={() => navigate('/login')} className="text-left text-lg font-heading font-bold uppercase text-white hover:text-neon">Login</button>
                  <Button fullWidth onClick={() => navigate('/signup')}>Get Started</Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 font-sans text-sm">
            &copy; 2026 AuraCoach AI. Scientific Performance.
          </p>
        </div>
      </footer>
    </div>
  );
};