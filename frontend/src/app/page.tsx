'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-bold text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            LexGuard <span className="text-blue-400">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="btn-secondary text-sm px-4 py-2 rounded-lg">
            Sign In
          </Link>
          <Link href="/register" className="btn-primary text-sm px-4 py-2 rounded-lg">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-xs text-cyan-400 font-medium tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            AI-Powered Legal Intelligence
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <span className="text-white">Know What You're</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Signing Before You Sign
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload any contract. LexGuard AI audits every clause, flags risky terms in red,
            and gives you a Legal Health Score — in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-primary px-8 py-4 text-base rounded-xl">
              Audit Your First Contract Free →
            </Link>
            <Link href="/login" className="btn-secondary px-8 py-4 text-base rounded-xl">
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-16 animate-fade-in">
          {[
            { icon: '🔴', label: 'RED clause detection' },
            { icon: '⚖️', label: 'Legal Health Score' },
            { icon: '🌐', label: 'Cross-border law checks' },
            { icon: '📝', label: 'Counter-draft suggestions' },
            { icon: '🌏', label: 'Hindi & Punjabi support' },
          ].map((f) => (
            <div key={f.label} className="glass px-4 py-2 rounded-full text-sm text-slate-300 flex items-center gap-2">
              <span>{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>

        {/* Score preview card */}
        <div className="mt-20 glass rounded-2xl p-6 max-w-sm w-full mx-auto animate-float">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Sample Audit</span>
            <span className="badge badge-red">HIGH RISK</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-red-500/30 flex items-center justify-center bg-red-500/10">
              <span className="text-2xl font-bold text-red-400" style={{ fontFamily: 'Space Grotesk' }}>23</span>
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Employment Contract</div>
              <div className="text-slate-500 text-xs mt-1">6 RED · 1 YELLOW · 0 GREEN</div>
            </div>
          </div>
          <div className="space-y-2">
            {['Unlimited liability clause detected', 'IP grab — waives personal time work', 'Forced arbitration — no court access'].map((c) => (
              <div key={c} className="clause-red pl-3 py-1 text-xs text-slate-400 bg-red-500/5 rounded-r-lg">
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-slate-600 text-xs border-t border-white/5">
        LEXGUARD AI · BUILT WITH FASTAPI + GEMINI + NEXT.JS · 2026
      </footer>
    </main>
  );
}