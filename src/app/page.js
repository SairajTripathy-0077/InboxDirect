"use client";

import React, { useState, useEffect, useRef } from 'react';
import EmailExtraction from '../components/EmailExtraction';
import SendEmail from '../components/SendEmail';

// ─── Matrix Digital Rain Canvas ───────────────────────────────
function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const fontSize = 14;
    const drops = Array.from({ length: Math.floor(window.innerWidth / fontSize) }, () => Math.random() * -80);
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*';

    let animId;
    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.055)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px "Share Tech Mono", monospace`;

      const cols = Math.floor(canvas.width / fontSize);
      while (drops.length < cols) drops.push(0);

      for (let i = 0; i < cols; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const r = Math.random();
        ctx.fillStyle = r > 0.96 ? '#FFFFFF' : r > 0.7 ? '#00FF41' : '#008F24';
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.11 }}
    />
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function Home() {
  const [activeTab, setActiveTab] = useState('extract');
  const [extractedEmails, setExtractedEmails] = useState([]);
  const [tick, setTick] = useState(0);

  const handleEmailsExtracted = (emails) => setExtractedEmails(emails);

  // Blinking cursor clock
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });

  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-[#00FF41] flex flex-col grid-dots">

      {/* ── Digital Rain Background ────────────────────────── */}
      <MatrixRain />

      {/* CRT scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-1"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)',
        }}
      />

      {/* Deep green ambient glows */}
      <div className="fixed top-1/3 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none animate-float z-1"
           style={{ background: 'radial-gradient(circle, rgba(0,255,65,0.06) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="fixed bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full pointer-events-none animate-float-delayed z-1"
           style={{ background: 'radial-gradient(circle, rgba(0,180,45,0.04) 0%, transparent 70%)', filter: 'blur(100px)' }} />

      {/* ── HEADER ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full"
              style={{
                borderBottom: '1px solid rgba(0,255,65,0.18)',
                background: 'rgba(0,0,0,0.82)',
                backdropFilter: 'blur(16px)',
              }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[70px] flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded flex items-center justify-center font-black text-sm mono-terminal text-black glow-pulse"
                 style={{
                   background: 'linear-gradient(135deg, #00FF41, #00C032)',
                   boxShadow: '0 0 16px rgba(0,255,65,0.55)',
                   fontFamily: "'Share Tech Mono', monospace",
                 }}>
              ID
            </div>
            <div>
              <h1 className="text-xl font-black mono-terminal tracking-widest"
                  style={{ color: '#00FF41', textShadow: '0 0 12px rgba(0,255,65,0.5)', fontFamily: "'Share Tech Mono', monospace" }}>
                INBOX<span style={{ color: '#00C032' }}>DIRECT</span>
              </h1>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] mono-terminal"
                 style={{ color: 'rgba(0,255,65,0.4)' }}>
                Mass Mailer Terminal v1.0
              </p>
            </div>
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded mono-terminal text-[11px]"
                 style={{ border: '1px solid rgba(0,255,65,0.2)', background: 'rgba(0,15,4,0.7)', color: 'rgba(0,255,65,0.65)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00FF41', boxShadow: '0 0 6px #00FF41' }} />
              SYS_ONLINE
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded mono-terminal text-[11px]"
                 style={{ border: '1px solid rgba(0,255,65,0.2)', background: 'rgba(0,15,4,0.7)', color: 'rgba(0,255,65,0.65)' }}>
              SMTP_ACTIVE
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded mono-terminal text-[11px]"
                 style={{ border: '1px solid rgba(0,255,65,0.3)', background: 'rgba(0,15,4,0.8)', color: '#00FF41' }}>
              <span style={{ color: 'rgba(0,255,65,0.45)' }}>POOL:</span>
              <span className="font-bold" style={{ textShadow: '0 0 6px #00FF41' }}>
                {String(extractedEmails.length).padStart(3, '0')}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN ────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 flex flex-col gap-6">

        {/* ── Hero Banner ─────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-xl border matrix-panel"
             style={{ borderColor: 'rgba(0,255,65,0.2)' }}>
          {/* Corner brackets */}
          <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: '#00FF41' }} />
          <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: '#00FF41' }} />
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: '#00FF41' }} />
          <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: '#00FF41' }} />

          <div className="relative p-7 sm:p-9 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Text block */}
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase mono-terminal mb-4"
                    style={{ background: 'rgba(0,255,65,0.07)', border: '1px solid rgba(0,255,65,0.22)', color: '#00FF41' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00FF41', boxShadow: '0 0 6px #00FF41' }} />
                SYSTEM ONLINE — MATRIX MAILER ENGINE
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-snug"
                  style={{ fontFamily: "'Share Tech Mono', monospace", color: '#00FF41', textShadow: '0 0 22px rgba(0,255,65,0.35)' }}>
                Accelerate Your<br />
                <span style={{ color: '#00C032' }}>Campaign Dispatch</span>
              </h2>
              <p className="mt-3 text-sm sm:text-base leading-relaxed"
                 style={{ color: 'rgba(0,255,65,0.5)', fontFamily: "'Rajdhani', sans-serif" }}>
                Upload database files (CSV/Excel), extract email arrays, and launch high-speed mail relays with real-time delivery telemetry.
              </p>
            </div>

            {/* Tab buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <button
                id="tab-extract"
                onClick={() => setActiveTab('extract')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded font-bold text-sm mono-terminal transition-all duration-200 cursor-pointer"
                style={activeTab === 'extract' ? {
                  background: '#00FF41',
                  color: '#000000',
                  border: '1px solid #00FF41',
                  boxShadow: '0 0 18px rgba(0,255,65,0.45), 0 0 36px rgba(0,255,65,0.15)',
                  letterSpacing: '0.06em',
                } : {
                  background: 'rgba(0,15,4,0.6)',
                  color: 'rgba(0,255,65,0.55)',
                  border: '1px solid rgba(0,255,65,0.22)',
                  letterSpacing: '0.06em',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                [01] EXTRACT_LIST
              </button>
              <button
                id="tab-send"
                onClick={() => setActiveTab('send')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded font-bold text-sm mono-terminal transition-all duration-200 cursor-pointer"
                style={activeTab === 'send' ? {
                  background: '#00FF41',
                  color: '#000000',
                  border: '1px solid #00FF41',
                  boxShadow: '0 0 18px rgba(0,255,65,0.45), 0 0 36px rgba(0,255,65,0.15)',
                  letterSpacing: '0.06em',
                } : {
                  background: 'rgba(0,15,4,0.6)',
                  color: 'rgba(0,255,65,0.55)',
                  border: '1px solid rgba(0,255,65,0.22)',
                  letterSpacing: '0.06em',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                [02] SEND_RELAY
              </button>
            </div>
          </div>
        </div>

        {/* ── Pipeline Status Bar ───────────────────────────── */}
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-3 mono-terminal text-[11px]">
            <span style={{ color: 'rgba(0,255,65,0.35)' }}>SYS_PIPELINE &gt;&gt;</span>
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={extractedEmails.length > 0
                  ? { background: '#00FF41', boxShadow: '0 0 8px #00FF41' }
                  : { background: 'rgba(0,255,65,0.15)', border: '1px solid rgba(0,255,65,0.25)' }}
              />
              <span style={{ color: extractedEmails.length > 0 ? '#00FF41' : 'rgba(0,255,65,0.35)' }}>
                {extractedEmails.length > 0
                  ? `${String(extractedEmails.length).padStart(3, '0')} RECIPIENTS_LOADED`
                  : 'AWAITING_FILE_INGESTION'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="mono-terminal text-[10px]" style={{ color: 'rgba(0,255,65,0.25)' }}>
              {timeStr}{tick % 2 === 0 ? '_' : '\u00a0'}
            </span>
            {extractedEmails.length > 0 && activeTab === 'extract' && (
              <button
                id="proceed-to-dispatch"
                onClick={() => setActiveTab('send')}
                className="text-[11px] font-bold mono-terminal flex items-center gap-1.5 group cursor-pointer transition-all"
                style={{ color: '#00FF41', textShadow: '0 0 6px rgba(0,255,65,0.5)', letterSpacing: '0.06em' }}
              >
                PROCEED_TO_DISPATCH
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
                     className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Active Panel ──────────────────────────────────── */}
        <div className="flex flex-col gap-6 animate-scale-up">
          {activeTab === 'extract' ? (
            <EmailExtraction onEmailsExtracted={handleEmailsExtracted} />
          ) : (
            <SendEmail initialEmails={extractedEmails} />
          )}
        </div>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="relative z-10 w-full mt-auto py-5"
              style={{ borderTop: '1px solid rgba(0,255,65,0.12)', background: 'rgba(0,0,0,0.75)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <span className="mono-terminal text-[10px] tracking-widest" style={{ color: 'rgba(0,255,65,0.28)' }}>
            © {new Date().getFullYear()} INBOXDIRECT SYSTEM
          </span>
          <span className="mono-terminal text-[10px]" style={{ color: 'rgba(0,255,65,0.18)' }}>
            HIGH-SPEED EMAIL RELAY ENGINE
          </span>
        </div>
      </footer>
    </div>
  );
}
