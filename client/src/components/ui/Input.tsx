import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', type, ...props }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const displayType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={displayType}
          className={`
            w-full bg-slate-850 border border-slate-700 rounded-none px-4 py-3 
            text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon
            transition-colors font-sans ${error ? 'border-red-500' : ''} ${className}
            ${isPassword ? 'pr-10' : ''}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-neon transition-colors"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
