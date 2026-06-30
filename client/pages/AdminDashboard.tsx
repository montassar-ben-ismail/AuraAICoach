import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { Button } from '../components/ui/Button';
import {
    UserCheck, UserX, Users, ShieldAlert, Search,
    RefreshCw, UserPlus, Settings, Lock, CheckCircle2, AlertCircle,
    Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Toast, ToastType } from '../components/ui/Toast';
import { navigate } from '../utils/navigation';

const AdminDashboard = () => {
    const { user: authUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'manage' | 'create' | 'settings'>('manage');
    const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    // Create User Form State
    const [newUserForm, setNewUserForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });
    const [showCreatePass, setShowCreatePass] = useState(false);
    const [createStatus, setCreateStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    // Settings Form State
    const [passwordForm, setPasswordForm] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
    const [passStatus, setPassStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    useEffect(() => {
        if (activeTab === 'manage') fetchUsers();
    }, [activeTab]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.admin.getAllUsers();
            if (res.status === 'ok') {
                setApprovedUsers(res.approver);
                setPendingUsers(res.attente);
            }
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (email: string) => {
        setActionLoading(email);
        try {
            const res = await api.admin.approveUser(email);
            if (res.status === 'ok') {
                fetchUsers();
            }
        } catch (err) {
            console.error('Approval failed', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleIgnore = async (email: string) => {
        if (!confirm('Are you sure you want to delete this identity?')) return;
        setActionLoading(email);
        try {
            const res = await api.admin.ignoreUser(email);
            if (res.status === 'ok') {
                fetchUsers();
            }
        } catch (err) {
            console.error('Deletion failed', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setCreateStatus(null);
        try {
            const res = await api.admin.createUser(newUserForm);
            if (res.status === 'ok') {
                setCreateStatus({ type: 'success', msg: 'Identity created and verified successfully.' });
                setNewUserForm({ name: '', email: '', password: '', role: 'user' });
            } else {
                setCreateStatus({ type: 'error', msg: res.message || 'Creation failed.' });
            }
        } catch (err) {
            setCreateStatus({ type: 'error', msg: 'System error during initialization.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.new !== passwordForm.confirm) {
            setPassStatus({ type: 'error', msg: 'Confirm password mismatch.' });
            return;
        }
        setLoading(true);
        setPassStatus(null);
        try {
            const res = await api.security.updatePassword({
                currentPassWord: passwordForm.current,
                newPassWord: passwordForm.new,
                confirmNewPassWord: passwordForm.confirm
            });
            if (res.status === 'ok') {
                setPassStatus({ type: 'success', msg: 'Password credentials updated successfully.' });
                setPasswordForm({ current: '', new: '', confirm: '' });
            } else {
                setPassStatus({ type: 'error', msg: res.message || 'Update failed.' });
            }
        } catch (err) {
            setPassStatus({ type: 'error', msg: 'Security gateway error.' });
        } finally {
            setLoading(false);
        }
    };



    const filteredPending = pendingUsers.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredApproved = approvedUsers.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && approvedUsers.length === 0 && activeTab === 'manage') {
        return (
            <div className="flex-grow flex items-center justify-center text-neon animate-pulse">
                ACCESSING SECURE DATA TERMINAL...
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-heading font-bold uppercase text-white flex items-center">
                        <ShieldAlert className="text-neon mr-3" size={32} /> Central Command
                    </h1>
                    <p className="text-slate-500 font-mono text-sm uppercase tracking-widest mt-1">Identity & Access Management</p>
                </div>

                <nav className="flex bg-slate-900 border border-slate-800 p-1">
                    {[
                        { id: 'manage', icon: Users, label: 'Manage' },
                        { id: 'create', icon: UserPlus, label: 'Initialize' },
                        { id: 'settings', icon: Settings, label: 'Security' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-neon text-black' : 'text-slate-500 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            <tab.icon size={16} className="mr-2" />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'manage' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-end">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Filter Identities..."
                                className="bg-slate-900 border border-slate-800 text-white pl-10 pr-4 py-2 focus:border-neon focus:outline-none transition-colors text-sm w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <section className="space-y-4">
                        <h2 className="text-lg font-bold uppercase tracking-tighter text-amber-500 flex items-center">
                            <Users size={20} className="mr-2" /> Pending Clearance ({pendingUsers.length})
                        </h2>
                        {filteredPending.length === 0 ? (
                            <div className="p-12 text-center bg-slate-900/30 border border-dashed border-slate-800 text-slate-600 uppercase text-xs tracking-widest font-mono">
                                No pending identities detected.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredPending.map(user => (
                                    <div key={user.email} className="bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between group hover:border-amber-500/50 transition-all border-l-4 border-l-amber-500/30">
                                        <div className="mb-4">
                                            <div className="text-white font-bold text-lg leading-tight mb-1">{user.name}</div>
                                            <div className="text-slate-500 text-xs font-mono">{user.email}</div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                fullWidth
                                                onClick={() => handleApprove(user.email)}
                                                disabled={actionLoading === user.email}
                                                className="border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-black"
                                            >
                                                {actionLoading === user.email ? 'Processing...' : <span className="flex items-center uppercase tracking-widest font-bold text-[10px]"><UserCheck className="mr-2" size={14} /> Grant Access</span>}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleIgnore(user.email)}
                                                disabled={actionLoading === user.email}
                                                className="text-slate-600 hover:text-red-500"
                                            >
                                                <UserX size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-lg font-bold uppercase tracking-tighter text-neon flex items-center">
                            <CheckCircle2 size={20} className="mr-2" /> Verified Personnel ({approvedUsers.length})
                        </h2>
                        <div className="bg-slate-900 border border-slate-800 overflow-x-auto shadow-2xl">
                            <table className="w-full text-left font-sans">
                                <thead className="bg-slate-950 border-b border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Operator</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Email</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {filteredApproved.map(user => (
                                        <tr key={user.email} className="hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-white">{user.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-400 font-mono">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-neon/10 text-neon uppercase tracking-tighter border border-neon/20">
                                                    Active Duty
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleIgnore(user.email)}
                                                    disabled={actionLoading === user.email}
                                                    className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                                                    title="Terminate Access"
                                                >
                                                    <UserX size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredApproved.length === 0 && (
                                <div className="p-12 text-center text-slate-600 uppercase text-xs tracking-widest font-mono">
                                    No verified personnel found in database.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'create' && (
                <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-900 border border-slate-800 p-8 shadow-2xl">
                        <div className="mb-8">
                            <h2 className="text-xl font-heading font-bold uppercase text-white flex items-center">
                                <UserPlus className="text-neon mr-3" size={24} /> Initialize New Identity
                            </h2>
                            <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider">Manual operator provisioning</p>
                        </div>

                        {createStatus && (
                            <div className={`p-4 mb-6 text-xs font-bold uppercase tracking-widest flex items-center ${createStatus.type === 'success' ? 'bg-neon/10 text-neon border border-neon/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}>
                                {createStatus.type === 'success' ? <CheckCircle2 className="mr-3" size={16} /> : <AlertCircle className="mr-3" size={16} />}
                                {createStatus.msg}
                            </div>
                        )}

                        <form onSubmit={handleCreateUser} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 focus:border-neon focus:outline-none transition-colors"
                                        placeholder="Enter operator name"
                                        value={newUserForm.name}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 focus:border-neon focus:outline-none transition-colors font-mono"
                                        placeholder="email@system.com"
                                        value={newUserForm.email}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Security Clearance (Role)</label>
                                    <select
                                        className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 focus:border-neon focus:outline-none transition-colors font-bold uppercase text-xs"
                                        value={newUserForm.role}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                                    >
                                        <option value="user">Operator (User)</option>
                                        <option value="admin">Commander (Admin)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Initial Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                        <input
                                            required
                                            type={showCreatePass ? "text" : "password"}
                                            className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-10 py-3 focus:border-neon focus:outline-none transition-colors font-mono"
                                            placeholder="••••••••"
                                            value={newUserForm.password}
                                            onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCreatePass(!showCreatePass)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-neon transition-colors"
                                        >
                                            {showCreatePass ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" fullWidth disabled={loading}>
                                {loading ? 'ACCESSING SYSTEM SERVER...' : 'PROVISION IDENTITY'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-900 border border-slate-800 p-8 shadow-2xl">
                        <div className="mb-8">
                            <h2 className="text-xl font-heading font-bold uppercase text-white flex items-center">
                                <Lock className="text-amber-500 mr-3" size={24} /> Security Protocol
                            </h2>
                            <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider">Update your administrative credentials</p>
                        </div>

                        {passStatus && (
                            <div className={`p-4 mb-6 text-xs font-bold uppercase tracking-widest flex items-center ${passStatus.type === 'success' ? 'bg-neon/10 text-neon border border-neon/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}>
                                {passStatus.type === 'success' ? <CheckCircle2 className="mr-3" size={16} /> : <AlertCircle className="mr-3" size={16} />}
                                {passStatus.msg}
                            </div>
                        )}

                        <form onSubmit={handleUpdatePassword} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Credentials</label>
                                <div className="relative">
                                    <input
                                        required
                                        type={showPass.current ? "text" : "password"}
                                        className="w-full bg-slate-950 border border-slate-800 text-white px-4 pr-10 py-3 focus:border-neon focus:outline-none transition-colors font-mono"
                                        placeholder="Enter current password"
                                        value={passwordForm.current}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass({ ...showPass, current: !showPass.current })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-neon transition-colors"
                                    >
                                        {showPass.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">New Credentials</label>
                                <div className="relative">
                                    <input
                                        required
                                        type={showPass.new ? "text" : "password"}
                                        className="w-full bg-slate-950 border border-slate-800 text-white px-4 pr-10 py-3 focus:border-neon focus:outline-none transition-colors font-mono"
                                        placeholder="Enter new password"
                                        value={passwordForm.new}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass({ ...showPass, new: !showPass.new })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-neon transition-colors"
                                    >
                                        {showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Confirm New Credentials</label>
                                <div className="relative">
                                    <input
                                        required
                                        type={showPass.confirm ? "text" : "password"}
                                        className="w-full bg-slate-950 border border-slate-800 text-white px-4 pr-10 py-3 focus:border-neon focus:outline-none transition-colors font-mono"
                                        placeholder="Confirm new password"
                                        value={passwordForm.confirm}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-neon transition-colors"
                                    >
                                        {showPass.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" fullWidth disabled={loading}>
                                {loading ? 'VALIDATING SECURITY PROTOCOLS...' : 'UPDATE CREDENTIALS'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default AdminDashboard;
