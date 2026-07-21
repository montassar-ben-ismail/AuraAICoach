import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

export const Toast = ({ message, type = 'info', onClose, duration = 4000 }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const icons = {
        success: <CheckCircle2 className="text-neon" size={18} />,
        error: <AlertCircle className="text-red-500" size={18} />,
        warning: <AlertTriangle className="text-amber-500" size={18} />,
        info: <Info className="text-blue-500" size={18} />,
    };

    const borders = {
        success: 'border-neon/50 bg-neon/5',
        error: 'border-red-500/50 bg-red-500/5',
        warning: 'border-amber-500/50 bg-amber-500/5',
        info: 'border-blue-500/50 bg-blue-500/5',
    };

    return (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center p-4 border min-w-[300px] shadow-2xl backdrop-blur-md animate-slide-up ${borders[type]}`}>
            <div className="mr-3">{icons[type]}</div>
            <div className="flex-grow">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-0.5">{type}</p>
                <p className="text-sm text-white font-medium">{message}</p>
            </div>
            <button onClick={onClose} className="ml-4 text-slate-500 hover:text-white transition-colors">
                <X size={16} />
            </button>
        </div>
    );
};
