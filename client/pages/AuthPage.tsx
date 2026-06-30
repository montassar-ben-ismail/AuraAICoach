import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../services/api';
import { Activity, ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { navigate } from '../utils/navigation';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
}

declare global {
  interface Window {
    google: any;
  }
}

const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');

  // Handle URL sync for mode switching
  useEffect(() => {
    const targetPath = mode === 'signup' ? '/signup' : '/login';
    if (window.location.pathname !== targetPath) {
      window.history.replaceState({}, '', targetPath);
    }
  }, [mode]);

  useEffect(() => {
    /* global google */
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
        callback: handleGoogleResponse
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "square",
          width: "100%",
          locale: navigator.language
        }
      );
    }
  }, [mode]);

  const handleGoogleResponse = async (response: any) => {
    setLoading(true);
    try {
      const res = await api.auth.googleLogin(response.credential);
      if (res.status === 'ok' && res.token) {
        login(res.token, res.user);
        // Check approval first
        if (!res.user?.isApproved && res.user?.role !== 'admin') {
          setError('ACCESS_DENIED: IDENTITY PENDING APPROVAL.');
        } else if (res.isNewUser) {
          navigate('/onboarding');
        } else if (res.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.msg || res.message || 'Google login failed');
      }
    } catch (err) {
      setError('Google authentication service unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const res = await api.auth.signup({ name, email, password, role: 'user' });
        if (res.status === 'ok' || res.token) {
          setError(''); // Clear errors
          setSuccess('IDENTITY_INITIALIZED: ACCESS PENDING ADMIN APPROVAL.');
          setTimeout(() => {
            setSuccess('');
            setMode('login');
          }, 3000);
        } else {
          setError(res.msg || res.message || 'Signup failed');
        }
      } else {
        const res = await api.auth.login({ email, password });
        if ((res.status === 'ok' || res.token) && res.token && res.user) {
          if (!res.user.isApproved && res.user.role !== 'admin') {
            setError('ACCESS_DENIED: IDENTITY PENDING APPROVAL.');
            return;
          }
          login(res.token, res.user);
          if (res.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        } else {
          setError(res.message || res.msg || 'Login failed');
        }
      }
    } catch (err) {
      setError('Connection to security server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Decorative Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-slate-900 border border-slate-800 rounded-sm mb-4 relative">
            <ShieldCheck className="text-neon" size={32} />
            <div className="absolute inset-0 bg-neon/10 animate-pulse"></div>
          </div>
          <h1 className="text-3xl font-heading font-bold uppercase tracking-tighter text-white">
            {mode === 'signup' ? 'Create Identity' : 'Secure Access'}
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-sans">
            {mode === 'signup' ? 'Initialize your biometric profile' : 'Enter your credentials to bypass security'}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
          {/* Scanline Effect */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-neon/20 animate-scan"></div>

          <div className="space-y-6 relative z-10">
            {/* Google Sign In Button Container */}
            <div id="googleSignInDiv" className="w-full mb-4"></div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">OR</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Legal Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-950 border border-slate-700 text-white p-3 pl-10 focus:border-neon focus:outline-none transition-colors"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Comm Channel (Email)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input
                    type="email"
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-white p-3 pl-10 focus:border-neon focus:outline-none transition-colors"
                    placeholder="name@provider.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Access Phrase (Password)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-white p-3 pl-10 pr-10 focus:border-neon focus:outline-none transition-colors"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-neon transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold uppercase animate-shake">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-neon shadow-[0_0_20px_rgba(173,255,47,0.3)] text-black text-xs font-bold uppercase flex items-center animate-fade-in">
                  <ShieldCheck className="mr-3" size={20} />
                  <div>
                    <div className="leading-tight">{success}</div>
                    <div className="text-[8px] opacity-70 mt-1">REDIRECTING TO AUTH TERMINAL...</div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                disabled={loading}
                className="group"
              >
                {loading ? (
                  <Activity className="animate-spin" />
                ) : (
                  <span className="flex items-center">
                    {mode === 'signup' ? 'Initialize' : 'Authenticate'}
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-neon transition-colors"
            >
              {mode === 'login' ? "Switch to identity creation" : "Return to access terminal"}
            </button>
          </div>
        </div>

        {/* System Footer */}
        <div className="mt-8 flex items-center justify-between text-[10px] text-slate-600 font-mono uppercase">
          <div className="flex items-center">
            <div className="h-1 w-1 bg-neon rounded-full mr-2 animate-pulse"></div>
            Security Layer 4.0 Active
          </div>
          <div>v2026.0.1</div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
