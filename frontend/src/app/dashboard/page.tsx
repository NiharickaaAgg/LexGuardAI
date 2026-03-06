'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { uploadDocument, getAudits, logout } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import Link from 'next/link';

interface Audit {
    _id: string;
    legalScore: number;
    scoreLabel: string;
    status: string;
    language: string;
    createdAt: string;
    document: {
        originalName: string;
        docType: string;
    };
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, token, clearAuth } = useAuthStore();
    const [audits, setAudits] = useState<Audit[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [filters, setFilters] = useState({
        docType: 'other',
        region: 'national',
        country: 'IN',
        language: 'en',
    });
    const fileRef = useRef<HTMLInputElement>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('lexguard_token');
        const storedUser = localStorage.getItem('lexguard_user');
        if (!storedToken) { router.push('/login'); return; }
        if (storedUser && !user) {
            const parsed = JSON.parse(storedUser);
            useAuthStore.getState().setAuth(parsed, storedToken);
        }
        fetchAudits();
        setupSocket();
        return () => { socketRef.current?.disconnect(); };
    }, []);

    const setupSocket = () => {
        const userId = JSON.parse(localStorage.getItem('lexguard_user') || '{}')._id;

        const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
            withCredentials: true,
            auth: { userId }, // ← this is what your server.js expects
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
        });

        socket.on('audit:start', () => setProgress('Analysis started...'));
        socket.on('audit:progress', (data: any) => setProgress(data.message));
        socket.on('audit:complete', (data: any) => {
            setUploading(false);
            setProgress('');
            fetchAudits();
            setTimeout(() => {
                router.push(`/audit/${data.auditId}`);
            }, 800);
        });
        socket.on('audit:error', (data: any) => {
            setUploading(false);
            setProgress(data?.message || 'Analysis failed. Please try again.');
        });
    };

    const fetchAudits = async () => {
        try {
            const res = await getAudits();
            setAudits(res.data.audits);
            // Update audit count in store to keep sidebar in sync
            const storedUser = localStorage.getItem('lexguard_user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                parsed.auditCount = res.data.pagination.total;
                localStorage.setItem('lexguard_user', JSON.stringify(parsed));
                useAuthStore.getState().setAuth(parsed, localStorage.getItem('lexguard_token')!);
            }
        } catch { }
    };

    const handleFile = async (file: File) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('document', file);
        formData.append('docType', filters.docType);
        formData.append('region', filters.region);
        formData.append('country', filters.country);
        formData.append('language', filters.language);
        setUploading(true);
        setProgress('Uploading document...');
        try {
            await uploadDocument(formData);
        } catch (err: any) {
            setUploading(false);
            setProgress(err.response?.data?.message || 'Upload failed.');
        }
    };

    const handleLogout = async () => {
        await logout();
        clearAuth();
        router.push('/');
    };

    const scoreColor = (score: number) =>
        score >= 71 ? 'text-emerald-400' : score >= 41 ? 'text-amber-400' : 'text-red-400';

    const scoreBg = (score: number) =>
        score >= 71 ? 'bg-emerald-500/10 border-emerald-500/20' : score >= 41 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';

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
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${item.label === 'Dashboard' || item.label === 'My Audits'
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
                                <div className="text-sm text-white font-medium truncate">{user?.name}</div>
                                <div className="text-xs text-slate-500">{user?.auditCount || 0} audits</div>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="btn-secondary w-full text-sm py-2 rounded-lg">
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* Main */}
                <div className="flex-1 overflow-auto p-8">
                    <div className="max-w-4xl mx-auto">

                        {/* Header */}
                        <div className="mb-8 animate-fade-in">
                            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                                Document Audit
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">Upload a contract to get your Legal Health Score</p>
                        </div>

                        {/* Filters */}
                        <div className="glass rounded-2xl p-5 mb-6 animate-fade-in">
                            <h3 className="text-sm font-medium text-slate-400 mb-4">Document Settings</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Document Type</label>
                                    <select
                                        className="input-field text-sm py-2"
                                        value={filters.docType}
                                        onChange={(e) => setFilters({ ...filters, docType: e.target.value })}
                                    >
                                        <option value="other">General</option>
                                        <option value="employment">Employment</option>
                                        <option value="rental">Rental</option>
                                        <option value="nda">NDA</option>
                                        <option value="service">Service</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Region</label>
                                    <select
                                        className="input-field text-sm py-2"
                                        value={filters.region}
                                        onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                                    >
                                        <option value="national">National</option>
                                        <option value="international">International</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Jurisdiction</label>
                                    <select
                                        className="input-field text-sm py-2"
                                        value={filters.country}
                                        onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                                    >
                                        <option value="IN">India</option>
                                        <option value="US">USA</option>
                                        <option value="UK">UK</option>
                                        <option value="IN-US">India + USA</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Summary Language</label>
                                    <select
                                        className="input-field text-sm py-2"
                                        value={filters.language}
                                        onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                                    >
                                        <option value="en">English</option>
                                        <option value="hi">Hindi</option>
                                        <option value="pa">Punjabi</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Upload Zone */}
                        <div
                            className={`glass rounded-2xl p-12 text-center mb-8 transition-all cursor-pointer animate-fade-in ${dragOver ? 'border-blue-500 bg-blue-500/5' : 'border-white/10'
                                } ${uploading ? 'pointer-events-none' : ''}`}
                            style={{ border: '2px dashed' }}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragOver(false);
                                const file = e.dataTransfer.files[0];
                                if (file) handleFile(file);
                            }}
                            onClick={() => !uploading && fileRef.current?.click()}
                        >
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".pdf,.docx,.doc,.txt"
                                className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                            />

                            {uploading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                                    <div>
                                        <p className="text-blue-400 font-medium">Analyzing Document</p>
                                        <p className="text-slate-500 text-sm mt-1">{progress}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-3xl animate-float">
                                        📄
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-lg">Drop your contract here</p>
                                        <p className="text-slate-500 text-sm mt-1">or click to browse · PDF, DOCX, TXT · max 20MB</p>
                                    </div>
                                    <div className="btn-primary px-6 py-2.5 rounded-xl text-sm">
                                        Choose File
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Audit History */}
                        <div className="animate-fade-in">
                            <h2 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Space Grotesk' }}>
                                Recent Audits
                            </h2>
                            {audits.length === 0 ? (
                                <div className="glass rounded-2xl p-8 text-center text-slate-500 text-sm">
                                    No audits yet. Upload your first contract above.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {audits.map((audit) => (
                                        <Link href={`/audit/${audit._id}`} key={audit._id}>
                                            <div className="glass glass-hover rounded-xl p-4 flex items-center gap-4 cursor-pointer">
                                                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${scoreBg(audit.legalScore)}`}>
                                                    <span className={`text-lg font-bold ${scoreColor(audit.legalScore)}`} style={{ fontFamily: 'Space Grotesk' }}>
                                                        {audit.status === 'processing' ? '...' : audit.legalScore}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-white text-sm font-medium truncate">
                                                        {audit.document?.originalName || 'Document'}
                                                    </div>
                                                    <div className="text-slate-500 text-xs mt-0.5">
                                                        {audit.document?.docType} · {new Date(audit.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className={`badge ${audit.scoreLabel === 'LOW_RISK' ? 'badge-green' :
                                                    audit.scoreLabel === 'MEDIUM_RISK' ? 'badge-yellow' : 'badge-red'
                                                    }`}>
                                                    {audit.scoreLabel?.replace('_', ' ') || audit.status}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}