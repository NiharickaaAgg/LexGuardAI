'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAudit } from '@/lib/api';
import Link from 'next/link';

interface Clause {
    text: string;
    classification: 'RED' | 'YELLOW' | 'GREEN';
    reason: string;
    counterDraft?: string;
}

interface JurisdictionFlag {
    clause: string;
    conflict: string;
    applicable_law: string;
}

interface AuditData {
    _id: string;
    legalScore: number;
    scoreLabel: string;
    clauses: Clause[];
    summary: string[];
    summaryTranslated?: Record<string, string[]>;
    jurisdictionFlags: JurisdictionFlag[];
    status: string;
    document: {
        originalName: string;
        docType: string;
        createdAt: string;
    };
}

export default function AuditPage() {
    const params = useParams();
    const router = useRouter();
    const [audit, setAudit] = useState<AuditData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedClauses, setExpandedClauses] = useState<Set<number>>(new Set());
    const [activeTab, setActiveTab] = useState<'all' | 'red' | 'yellow' | 'green'>('all');

    useEffect(() => {
        fetchAudit();
    }, [params.id]);

    const fetchAudit = async () => {
        try {
            const res = await getAudit(params.id as string);
            setAudit(res.data.audit);
        } catch {
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const toggleClause = (i: number) => {
        const next = new Set(expandedClauses);
        next.has(i) ? next.delete(i) : next.add(i);
        setExpandedClauses(next);
    };

    const filteredClauses = audit?.clauses.filter((c) =>
        activeTab === 'all' ? true : c.classification === activeTab.toUpperCase()
    ) || [];

    const scoreColor = (score: number) =>
        score >= 71 ? '#10b981' : score >= 41 ? '#f59e0b' : '#ef4444';

    const clauseStyle = (cls: string) => {
        if (cls === 'RED') return { border: 'border-red-500/30', bg: 'bg-red-500/5', badge: 'badge-red', dot: 'bg-red-500' };
        if (cls === 'YELLOW') return { border: 'border-amber-500/30', bg: 'bg-amber-500/5', badge: 'badge-yellow', dot: 'bg-amber-500' };
        return { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', badge: 'badge-green', dot: 'bg-emerald-500' };
    };

    if (loading) {
        return (
            <main className="relative min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <p className="text-slate-500 text-sm">Loading audit results...</p>
                </div>
            </main>
        );
    }

    if (!audit) return null;

    const redCount = audit.clauses.filter((c) => c.classification === 'RED').length;
    const yellowCount = audit.clauses.filter((c) => c.classification === 'YELLOW').length;
    const greenCount = audit.clauses.filter((c) => c.classification === 'GREEN').length;

    // Score arc calculation
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const progress = (audit.legalScore / 100) * circumference;

    return (
        <main className="relative min-h-screen">
            <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">

                {/* Back */}
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors">
                    ← Back to Dashboard
                </Link>

                {/* Header */}
                <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">

                        {/* Score Gauge */}
                        <div className="flex flex-col items-center gap-2 shrink-0">
                            <svg width="140" height="140" viewBox="0 0 140 140">
                                <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                                <circle
                                    cx="70" cy="70" r={radius}
                                    fill="none"
                                    stroke={scoreColor(audit.legalScore)}
                                    strokeWidth="10"
                                    strokeDasharray={`${progress} ${circumference}`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 70 70)"
                                    style={{ filter: `drop-shadow(0 0 8px ${scoreColor(audit.legalScore)}60)`, transition: 'stroke-dasharray 1s ease' }}
                                />
                                <text x="70" y="65" textAnchor="middle" fill={scoreColor(audit.legalScore)} fontSize="28" fontWeight="bold" fontFamily="Space Grotesk">
                                    {audit.legalScore}
                                </text>
                                <text x="70" y="82" textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="Inter">
                                    Legal Score
                                </text>
                            </svg>
                            <div className={`badge ${audit.scoreLabel === 'LOW_RISK' ? 'badge-green' :
                                    audit.scoreLabel === 'MEDIUM_RISK' ? 'badge-yellow' : 'badge-red'
                                }`}>
                                {audit.scoreLabel?.replace('_', ' ')}
                            </div>
                        </div>

                        {/* Meta */}
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk' }}>
                                {audit.document?.originalName}
                            </h1>
                            <p className="text-slate-500 text-sm mb-4">
                                {audit.document?.docType} · {new Date(audit.document?.createdAt).toLocaleDateString()}
                            </p>
                            <div className="flex gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-400">{redCount}</div>
                                    <div className="text-xs text-slate-500">Red</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-amber-400">{yellowCount}</div>
                                    <div className="text-xs text-slate-500">Yellow</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-emerald-400">{greenCount}</div>
                                    <div className="text-xs text-slate-500">Green</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                        AI Summary
                    </h2>
                    <ul className="space-y-3">
                        {audit.summary.map((point, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
                                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
                                    {i + 1}
                                </span>
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Jurisdiction Flags */}
                {audit.jurisdictionFlags?.length > 0 && (
                    <div className="glass rounded-2xl p-6 mb-6 border border-amber-500/20 animate-fade-in">
                        <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
                            ⚖️ Cross-Border Law Conflicts
                        </h2>
                        <div className="space-y-3">
                            {audit.jurisdictionFlags.map((flag, i) => (
                                <div key={i} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                                    <p className="text-slate-300 text-sm font-medium mb-1">{flag.clause}</p>
                                    <p className="text-slate-500 text-xs mb-1">{flag.conflict}</p>
                                    <p className="text-amber-400 text-xs font-medium">{flag.applicable_law}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Clause Cards */}
                <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                            Clause Analysis
                        </h2>
                        <div className="flex gap-2">
                            {(['all', 'red', 'yellow', 'green'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${activeTab === tab
                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            : 'text-slate-500 hover:text-slate-300 glass'
                                        }`}
                                >
                                    {tab === 'all' ? `All (${audit.clauses.length})` :
                                        tab === 'red' ? `Red (${redCount})` :
                                            tab === 'yellow' ? `Yellow (${yellowCount})` :
                                                `Green (${greenCount})`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {filteredClauses.map((clause, i) => {
                            const style = clauseStyle(clause.classification);
                            const isExpanded = expandedClauses.has(i);
                            return (
                                <div
                                    key={i}
                                    className={`glass rounded-xl border ${style.border} ${style.bg} transition-all`}
                                >
                                    <div
                                        className="p-4 cursor-pointer flex items-start gap-3"
                                        onClick={() => toggleClause(i)}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${style.dot} mt-2 shrink-0`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-slate-200 text-sm leading-relaxed line-clamp-2">
                                                {clause.text}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`badge ${style.badge}`}>{clause.classification}</span>
                                            <span className="text-slate-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="px-4 pb-4 pt-0 border-t border-white/5 mt-0">
                                            <div className="ml-5 space-y-3 pt-3">
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-medium">Why this is risky</p>
                                                    <p className="text-slate-300 text-sm leading-relaxed">{clause.reason}</p>
                                                </div>
                                                {clause.counterDraft && clause.classification !== 'GREEN' && (
                                                    <div>
                                                        <p className="text-xs text-emerald-500 uppercase tracking-wider mb-1 font-medium">Suggested Counter-Draft</p>
                                                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                                                            <p className="text-emerald-300 text-sm leading-relaxed">{clause.counterDraft}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </main>
    );
}