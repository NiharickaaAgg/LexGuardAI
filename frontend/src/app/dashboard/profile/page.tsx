'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { getMe } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, setAuth, clearAuth, token } = useAuthStore();
    const router = useRouter();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Rehydrate from localStorage if store is empty
        const storedToken = localStorage.getItem('lexguard_token');
        const storedUser = localStorage.getItem('lexguard_user');
        if (!storedToken) { router.push('/login'); return; }
        if (storedUser && !user) {
            const parsed = JSON.parse(storedUser);
            setAuth(parsed, storedToken);
        }
        // Fetch fresh data from server
        getMe().then((res) => {
            setAuth(res.data.user, storedToken!);
            setLoaded(true);
        }).catch(() => {
            clearAuth();
            router.push('/login');
        });
    }, []);

    const joinDate = new Date().toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const planDetails = {
        free: { label: 'Free', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', audits: '10 audits/month', features: ['PDF, DOCX, TXT support', 'Basic clause detection', 'Legal Health Score', 'English summaries'] },
        pro: { label: 'Pro', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', audits: 'Unlimited audits', features: ['All Free features', 'Multilingual summaries', 'Cross-border checks', 'Counter-draft suggestions', 'Priority processing'] },
        enterprise: { label: 'Enterprise', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', audits: 'Unlimited audits', features: ['All Pro features', 'API access', 'Custom jurisdictions', 'Dedicated support', 'Team collaboration'] },
    };

    const plan = planDetails[(user?.plan as keyof typeof planDetails) || 'free'];

    return (
        <main className="relative min-h-screen">
            <div className="relative z-10 flex h-screen">

                {/* Sidebar */}
                <aside className="w-64 glass border-r border-white/5 flex flex-col p-6 shrink-0">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">L</span>
                        </div>
                        <span className="font-bold" style={{ fontFamily: 'Space Grotesk' }}>
                            LexGuard <span className="text-blue-400">AI</span>
                        </span>
                    </div>
                    <nav className="flex-1 space-y-1">
                        {[
                            { icon: '⊞', label: 'Dashboard', href: '/dashboard' },
                            { icon: '📄', label: 'My Audits', href: '/dashboard' },
                            { icon: '👤', label: 'Profile', href: '/dashboard/profile' },
                        ].map((item) => (
                            <Link
                                href={item.href}
                                key={item.label}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${item.label === 'Profile'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                    }`}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="border-t border-white/5 pt-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-white font-medium truncate">{user?.name || 'User'}</div>
                                <div className="text-xs text-slate-500">{user?.auditCount || 0} audits</div>
                            </div>
                        </div>
                        <button
                            onClick={() => { clearAuth(); router.push('/'); }}
                            className="btn-secondary w-full text-sm py-2 rounded-lg"
                        >
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* Main content */}
                <div className="flex-1 overflow-auto p-8">
                    <div className="max-w-3xl mx-auto space-y-6">

                        <div className="animate-fade-in">
                            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                                Profile
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">Your account details and usage</p>
                        </div>

                        {/* Profile card */}
                        <div className="glass rounded-2xl p-6 animate-fade-in">
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-3xl font-bold shrink-0" style={{ fontFamily: 'Space Grotesk' }}>
                                    {user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                                        {user?.name || 'Loading...'}
                                    </h2>
                                    <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className={`badge border ${plan.bg} ${plan.color}`}>
                                            ✦ {plan.label} Plan
                                        </span>
                                        <span className="text-slate-600 text-xs">Member since {joinDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-4 animate-fade-in">
                            {[
                                { label: 'Total Audits', value: user?.auditCount || 0, color: 'text-blue-400', icon: '📄' },
                                { label: 'Documents Analyzed', value: user?.auditCount || 0, color: 'text-cyan-400', icon: '🔍' },
                                { label: 'Current Plan', value: plan.label, color: plan.color, icon: '✦' },
                            ].map((stat) => (
                                <div key={stat.label} className="glass rounded-xl p-5 text-center">
                                    <div className="text-2xl mb-2">{stat.icon}</div>
                                    <div className={`text-2xl font-bold ${stat.color}`} style={{ fontFamily: 'Space Grotesk' }}>
                                        {stat.value}
                                    </div>
                                    <div className="text-slate-500 text-xs mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Account details */}
                        <div className="glass rounded-2xl p-6 animate-fade-in">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                                Account Details
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Full Name', value: user?.name || '—' },
                                    { label: 'Email Address', value: user?.email || '—' },
                                    { label: 'Account Type', value: `${plan.label} Plan` },
                                    { label: 'Total Audits Run', value: `${user?.auditCount || 0} audits` },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                        <span className="text-slate-500 text-sm">{item.label}</span>
                                        <span className="text-white text-sm font-medium">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Plan details */}
                        <div className={`glass rounded-2xl p-6 border ${plan.bg} animate-fade-in`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                                    Your Plan — {plan.label}
                                </h3>
                                <span className={`badge border ${plan.bg} ${plan.color}`}>{plan.audits}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {plan.features.map((feature) => (
                                    <div key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                                        <span className="text-emerald-400 text-xs">✓</span>
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}