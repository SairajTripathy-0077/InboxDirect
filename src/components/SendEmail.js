"use client";

import React, { useState, useEffect } from 'react';

export default function SendEmail({ initialEmails = [] }) {
    const [recipients, setRecipients] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusInfo, setStatusInfo] = useState(null);
    const [sendResults, setSendResults] = useState([]);
    const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0 });
    const [attachments, setAttachments] = useState([]);
    const [links, setLinks] = useState([]);
    const [linkInput, setLinkInput] = useState('');

    // Update recipients whenever initialEmails prop changes (e.g. from parent tab)
    useEffect(() => {
        if (initialEmails.length > 0) {
            setRecipients(initialEmails.join(', '));
        } else {
            setRecipients('');
        }
    }, [initialEmails]);

    const handleFileChange = (e) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setAttachments((prev) => {
                const existingNames = new Set(prev.map(f => f.name));
                const uniqueNewFiles = selectedFiles.filter(f => !existingNames.has(f.name));
                return [...prev, ...uniqueNewFiles];
            });
        }
    };

    const removeAttachment = (indexToRemove) => {
        setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleAddLink = (e) => {
        e.preventDefault();
        if (!linkInput.trim()) return;

        let url = linkInput.trim();
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }

        if (!links.includes(url)) {
            setLinks((prev) => [...prev, url]);
        }
        setLinkInput('');
    };

    const removeLink = (indexToRemove) => {
        setLinks((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const formatBytes = (bytes, decimals = 1) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const handleSend = async (e) => {
        e.preventDefault();

        if (!recipients.trim() || !subject.trim() || !message.trim()) {
            setStatusInfo({
                success: false,
                message: 'All fields are required. Please check your inputs.'
            });
            return;
        }

        setLoading(true);
        setStatusInfo(null);
        setSendResults([]);
        setStats({ total: 0, sent: 0, failed: 0 });

        try {
            const formData = new FormData();
            formData.append('emails', recipients);
            formData.append('subject', subject);
            formData.append('message', message);
            formData.append('links', JSON.stringify(links));
            attachments.forEach((file) => {
                formData.append('attachments', file);
            });

            const response = await fetch('/api/send', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            setStatusInfo({
                success: data.success,
                message: data.message || (data.success ? 'Emails sent successfully!' : 'Failed to send emails.')
            });

            if (data.success) {
                setAttachments([]);
                setLinks([]);
            }

            if (data.results) {
                setSendResults(data.results);
                const total = data.results.length;
                const sent = data.results.filter(r => r.status === 'sent').length;
                const failed = data.results.filter(r => r.status === 'failed').length;
                setStats({ total, sent, failed });
            }
        } catch {
            setStatusInfo({
                success: false,
                message: 'A network or system error occurred while sending emails.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Derived counts
    const characterCount = message.length;
    const wordCount = message.trim() === '' ? 0 : message.trim().split(/\s+/).length;
    const recipientListCount = recipients.split(',').map(e => e.trim()).filter(e => e.length > 0).length;

    return (
        <div className="w-full max-w-4xl mx-auto p-1 animate-fade-in">
            <div className="relative overflow-hidden rounded-xl border matrix-panel"
                 style={{ borderColor: 'rgba(0,255,65,0.2)' }}>

                {/* Corner brackets */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t border-l pointer-events-none" style={{ borderColor: '#00FF41' }} />
                <div className="absolute top-3 right-3 w-4 h-4 border-t border-r pointer-events-none" style={{ borderColor: '#00FF41' }} />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l pointer-events-none" style={{ borderColor: '#00FF41' }} />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r pointer-events-none" style={{ borderColor: '#00FF41' }} />

                {/* Green glow blobs */}
                <div className="absolute top-0 left-0 -mt-16 -ml-16 w-48 h-48 rounded-full pointer-events-none"
                     style={{ background: 'radial-gradient(circle, rgba(0,255,65,0.06) 0%, transparent 70%)', filter: 'blur(30px)' }} />
                <div className="absolute bottom-0 right-0 -mb-16 -mr-16 w-48 h-48 rounded-full pointer-events-none"
                     style={{ background: 'radial-gradient(circle, rgba(0,200,50,0.05) 0%, transparent 70%)', filter: 'blur(30px)' }} />

                <div className="flex flex-col gap-6 p-6 sm:p-8">

                    {/* ── Header ──────────────────────────────── */}
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded flex items-center justify-center"
                              style={{
                                  background: 'rgba(0,255,65,0.1)',
                                  border: '1px solid rgba(0,255,65,0.3)',
                                  color: '#00FF41',
                                  boxShadow: '0 0 12px rgba(0,255,65,0.2)',
                              }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        </span>
                        <div>
                            <h2 className="text-xl font-black tracking-widest mono-terminal"
                                style={{ color: '#00FF41', textShadow: '0 0 10px rgba(0,255,65,0.4)' }}>
                                COMPOSE_AND_SEND_RELAY
                            </h2>
                            <p className="text-xs mono-terminal mt-0.5" style={{ color: 'rgba(0,255,65,0.45)' }}>
                                &gt; Draft your mass email campaign via nodemailer relay engine
                            </p>
                        </div>
                    </div>

                    {/* ── Compose Form ─────────────────────────── */}
                    <form onSubmit={handleSend} className="flex flex-col gap-5">

                        {/* Recipients */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold mono-terminal flex items-center gap-2" style={{ color: 'rgba(0,255,65,0.85)' }}>
                                    &gt; RECIPIENTS
                                    {recipientListCount > 0 && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold mono-terminal"
                                              style={{ background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.3)', color: '#00FF41' }}>
                                            {recipientListCount} LOADED
                                        </span>
                                    )}
                                </label>
                                <span className="text-[10px] mono-terminal" style={{ color: 'rgba(0,255,65,0.35)' }}>
                                    comma-separated addresses
                                </span>
                            </div>
                            <textarea
                                id="recipients-field"
                                placeholder="> example1@domain.com, example2@domain.com..."
                                value={recipients}
                                onChange={(e) => setRecipients(e.target.value)}
                                disabled={loading}
                                className="w-full px-4 py-3 rounded text-sm mono-terminal transition-all outline-none resize-none min-h-[80px] max-h-[200px]"
                                style={{
                                    background: 'rgba(0,12,3,0.8)',
                                    border: '1px solid rgba(0,255,65,0.22)',
                                    color: '#00FF41',
                                    caretColor: '#00FF41',
                                    opacity: loading ? 0.5 : 1,
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(0,255,65,0.6)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(0,255,65,0.22)'}
                            />
                        </div>

                        {/* Subject */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold mono-terminal" style={{ color: 'rgba(0,255,65,0.85)' }}>
                                &gt; SUBJECT_LINE
                            </label>
                            <input
                                id="subject-field"
                                type="text"
                                placeholder="> Enter email subject..."
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                disabled={loading}
                                className="w-full px-4 py-3 rounded text-sm mono-terminal transition-all outline-none"
                                style={{
                                    background: 'rgba(0,12,3,0.8)',
                                    border: '1px solid rgba(0,255,65,0.22)',
                                    color: '#00FF41',
                                    caretColor: '#00FF41',
                                    opacity: loading ? 0.5 : 1,
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(0,255,65,0.6)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(0,255,65,0.22)'}
                            />
                        </div>

                        {/* Message Body */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold mono-terminal" style={{ color: 'rgba(0,255,65,0.85)' }}>
                                    &gt; MESSAGE_BODY
                                </label>
                                <div className="flex gap-3 text-[10px] mono-terminal" style={{ color: 'rgba(0,255,65,0.4)' }}>
                                    <span>{wordCount} WORDS</span>
                                    <span style={{ color: 'rgba(0,255,65,0.2)' }}>|</span>
                                    <span>{characterCount} CHARS</span>
                                </div>
                            </div>
                            <textarea
                                id="message-field"
                                placeholder="> Type your email content here. HTML tags supported..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={loading}
                                className="w-full px-4 py-3 rounded text-sm mono-terminal transition-all outline-none resize-none min-h-[160px] max-h-[400px]"
                                style={{
                                    background: 'rgba(0,12,3,0.8)',
                                    border: '1px solid rgba(0,255,65,0.22)',
                                    color: '#00FF41',
                                    caretColor: '#00FF41',
                                    opacity: loading ? 0.5 : 1,
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(0,255,65,0.6)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(0,255,65,0.22)'}
                            />
                        </div>

                        {/* ── File Attachments & Associated Links ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                            
                            {/* File Attachments */}
                            <div className="flex flex-col gap-2 p-4 rounded border transition-all"
                                 style={{ 
                                     borderColor: 'rgba(0,255,65,0.15)', 
                                     background: 'rgba(0,10,3,0.5)' 
                                 }}>
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold mono-terminal flex items-center gap-1.5" style={{ color: 'rgba(0,255,65,0.85)' }}>
                                        &gt; FILE_ATTACHMENTS
                                        {attachments.length > 0 && (
                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold mono-terminal"
                                                  style={{ background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.3)', color: '#00FF41' }}>
                                                {attachments.length} ATTACHED
                                            </span>
                                        )}
                                    </label>
                                </div>
                                
                                <div className="flex flex-col gap-3">
                                    <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded text-xs font-bold mono-terminal transition-all cursor-pointer select-none"
                                           style={{
                                               background: 'rgba(0,25,8,0.3)',
                                               border: '1px dashed rgba(0,255,65,0.3)',
                                               color: '#00FF41',
                                           }}
                                           onMouseEnter={e => {
                                               e.currentTarget.style.borderStyle = 'solid';
                                               e.currentTarget.style.borderColor = 'rgba(0,255,65,0.6)';
                                               e.currentTarget.style.background = 'rgba(0,25,8,0.5)';
                                           }}
                                           onMouseLeave={e => {
                                               e.currentTarget.style.borderStyle = 'dashed';
                                               e.currentTarget.style.borderColor = 'rgba(0,255,65,0.3)';
                                               e.currentTarget.style.background = 'rgba(0,25,8,0.3)';
                                           }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l4.5-4.5a3 3 0 1 1 4.243 4.243l-4.5 4.5a1.5 1.5 0 1 1-2.122-2.122l4.5-4.5" />
                                        </svg>
                                        &gt; ATTACH_FILES
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileChange}
                                            disabled={loading}
                                            className="hidden"
                                        />
                                    </label>

                                    {/* Selected Files Display */}
                                    {attachments.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                                            {attachments.map((file, idx) => (
                                                <div key={`${file.name}-${idx}`}
                                                     className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all duration-300"
                                                     style={{
                                                         background: 'rgba(0,25,8,0.6)',
                                                         border: '1px solid rgba(0,255,65,0.25)',
                                                         color: '#00FF41'
                                                     }}
                                                     onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,255,65,0.5)'}
                                                     onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,255,65,0.25)'}>
                                                    <span className="truncate max-w-[120px] font-mono select-all" title={file.name}>
                                                        {file.name}
                                                    </span>
                                                    <span className="text-[9px] opacity-60 font-mono select-none">
                                                        ({formatBytes(file.size)})
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttachment(idx)}
                                                        disabled={loading}
                                                        className="hover:text-red-500 font-black cursor-pointer text-xs leading-none shrink-0"
                                                        title="Remove attachment"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-[10px] text-center mono-terminal py-2" style={{ color: 'rgba(0,255,65,0.3)' }}>
                                            &gt; NO_FILES_ATTACHED
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Hyperlink Embedder */}
                            <div className="flex flex-col gap-2 p-4 rounded border transition-all"
                                 style={{ 
                                     borderColor: 'rgba(0,255,65,0.15)', 
                                     background: 'rgba(0,10,3,0.5)' 
                                 }}>
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold mono-terminal flex items-center gap-1.5" style={{ color: 'rgba(0,255,65,0.85)' }}>
                                        &gt; ASSOCIATED_LINKS
                                        {links.length > 0 && (
                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold mono-terminal"
                                                  style={{ background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.3)', color: '#00FF41' }}>
                                                {links.length} ADDED
                                            </span>
                                        )}
                                    </label>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="> Enter URL (e.g. google.com)..."
                                        value={linkInput}
                                        onChange={(e) => setLinkInput(e.target.value)}
                                        disabled={loading}
                                        className="flex-1 px-3 py-2 rounded text-xs mono-terminal transition-all outline-none"
                                        style={{
                                            background: 'rgba(0,12,3,0.8)',
                                            border: '1px solid rgba(0,255,65,0.22)',
                                            color: '#00FF41',
                                            caretColor: '#00FF41',
                                            opacity: loading ? 0.5 : 1,
                                        }}
                                        onFocus={e => e.target.style.borderColor = 'rgba(0,255,65,0.6)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(0,255,65,0.22)'}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddLink(e);
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddLink}
                                        disabled={loading || !linkInput.trim()}
                                        className="px-3 rounded text-xs font-bold mono-terminal text-black transition-all cursor-pointer shrink-0"
                                        style={{
                                            background: loading || !linkInput.trim() ? 'rgba(0,80,20,0.4)' : '#00FF41',
                                            color: loading || !linkInput.trim() ? 'rgba(0,255,65,0.3)' : '#000000',
                                            border: '1px solid rgba(0,255,65,0.4)',
                                            cursor: loading || !linkInput.trim() ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        EMBED
                                    </button>
                                </div>

                                {/* Active Links Display */}
                                {links.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                                        {links.map((link, idx) => (
                                            <div key={`${link}-${idx}`}
                                                 className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all duration-300"
                                                 style={{
                                                     background: 'rgba(0,25,8,0.6)',
                                                     border: '1px solid rgba(0,255,65,0.25)',
                                                     color: '#00FF41'
                                                 }}
                                                 onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,255,65,0.5)'}
                                                 onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,255,65,0.25)'}>
                                                <span className="truncate max-w-[150px] font-mono select-all" title={link}>
                                                    {link}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeLink(idx)}
                                                    disabled={loading}
                                                    className="hover:text-red-500 font-black cursor-pointer text-xs leading-none shrink-0"
                                                    title="Remove link"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-[10px] text-center mono-terminal py-2" style={{ color: 'rgba(0,255,65,0.3)' }}>
                                        &gt; NO_LINKS_EMBEDDED
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Send Action Row */}
                        <div className="flex justify-between items-center pt-2 gap-4">
                            <div className="text-xs mono-terminal max-w-[65%]" style={{ color: 'rgba(0,255,65,0.38)' }}>
                                <span style={{ color: 'rgba(0,255,65,0.55)' }}>NOTE:</span> Ensure Gmail SMTP credentials are configured in your{' '}
                                <code className="px-1.5 py-0.5 rounded mono-terminal text-[10px]"
                                      style={{ background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.2)', color: '#00FF41' }}>
                                    .env
                                </code>{' '}
                                file.
                            </div>
                            <button
                                id="send-campaign-btn"
                                type="submit"
                                disabled={loading || recipientListCount === 0}
                                className="flex items-center gap-2 px-6 py-3.5 rounded font-black mono-terminal text-black transition-all cursor-pointer"
                                style={{
                                    background: loading || recipientListCount === 0 ? 'rgba(0,80,20,0.4)' : '#00FF41',
                                    color: loading || recipientListCount === 0 ? 'rgba(0,255,65,0.3)' : '#000000',
                                    boxShadow: loading || recipientListCount === 0
                                        ? 'none'
                                        : '0 0 20px rgba(0,255,65,0.45), 0 0 40px rgba(0,255,65,0.15)',
                                    border: '1px solid rgba(0,255,65,0.6)',
                                    cursor: loading || recipientListCount === 0 ? 'not-allowed' : 'pointer',
                                    transform: 'scale(1)',
                                    letterSpacing: '0.08em',
                                }}
                                onMouseEnter={e => {
                                    if (!loading && recipientListCount > 0) e.currentTarget.style.transform = 'scale(1.03)';
                                }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                                onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" style={{ color: 'rgba(0,255,65,0.5)' }}>
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        TRANSMITTING...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                        </svg>
                                        LAUNCH_CAMPAIGN
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* ── Status Alert ─────────────────────────── */}
                    {statusInfo && (
                        <div className="flex items-start gap-3.5 p-4 rounded border text-sm animate-scale-up mono-terminal"
                             style={statusInfo.success ? {
                                 borderColor: 'rgba(0,255,65,0.35)',
                                 background: 'rgba(0,255,65,0.05)',
                                 color: '#00FF41',
                             } : {
                                 borderColor: 'rgba(255,36,66,0.35)',
                                 background: 'rgba(255,36,66,0.05)',
                                 color: '#FF2442',
                             }}>
                            <span className="mt-0.5 shrink-0">
                                {statusInfo.success ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                    </svg>
                                )}
                            </span>
                            <div>
                                <h4 className="font-bold tracking-wider">
                                    {statusInfo.success ? '> CAMPAIGN_COMPLETED' : '> CAMPAIGN_FAILED / ERRORS_DETECTED'}
                                </h4>
                                <p className="mt-0.5 text-xs opacity-80">{statusInfo.message}</p>
                            </div>
                        </div>
                    )}

                    {/* ── Transmission Report ───────────────────── */}
                    {sendResults.length > 0 && (
                        <div className="flex flex-col gap-4 rounded-xl p-5 animate-fade-in"
                             style={{ border: '1px solid rgba(0,255,65,0.18)', background: 'rgba(0,8,2,0.6)' }}>

                            {/* Report Header */}
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                <div>
                                    <h3 className="text-sm font-bold mono-terminal" style={{ color: '#00FF41', textShadow: '0 0 8px rgba(0,255,65,0.4)' }}>
                                        TRANSMISSION_REPORT
                                    </h3>
                                    <p className="text-xs mono-terminal mt-0.5" style={{ color: 'rgba(0,255,65,0.4)' }}>
                                        &gt; per-recipient telemetry log
                                    </p>
                                </div>
                                <div className="flex gap-2 text-xs mono-terminal">
                                    <span className="px-2.5 py-1 rounded font-bold"
                                          style={{ background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.3)', color: '#00FF41' }}>
                                        SENT: {stats.sent}
                                    </span>
                                    {stats.failed > 0 && (
                                        <span className="px-2.5 py-1 rounded font-bold"
                                              style={{ background: 'rgba(255,36,66,0.08)', border: '1px solid rgba(255,36,66,0.3)', color: '#FF2442' }}>
                                            FAIL: {stats.failed}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center text-[10px] mono-terminal" style={{ color: 'rgba(0,255,65,0.45)' }}>
                                    <span>DELIVERY_PROGRESS</span>
                                    <span>{Math.round((stats.sent / stats.total) * 100)}% SUCCESS_RATE</span>
                                </div>
                                <div className="w-full h-2 rounded-full overflow-hidden flex"
                                     style={{ background: 'rgba(0,20,5,0.8)', border: '1px solid rgba(0,255,65,0.15)' }}>
                                    <div
                                        className="h-full transition-all duration-700"
                                        style={{
                                            width: `${(stats.sent / stats.total) * 100}%`,
                                            background: 'linear-gradient(90deg, #00C032, #00FF41)',
                                            boxShadow: '0 0 8px rgba(0,255,65,0.5)',
                                        }}
                                    />
                                    <div
                                        className="h-full transition-all duration-700"
                                        style={{
                                            width: `${(stats.failed / stats.total) * 100}%`,
                                            background: 'linear-gradient(90deg, #CC1A30, #FF2442)',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Logs List */}
                            <div className="max-h-40 overflow-y-auto pr-1 flex flex-col gap-1 rounded p-3"
                                 style={{ border: '1px solid rgba(0,255,65,0.12)', background: 'rgba(0,5,1,0.7)' }}>
                                {sendResults.map((result, idx) => (
                                    <div
                                        key={`${result.email}-${idx}`}
                                        className="flex items-center justify-between text-xs py-1.5 mono-terminal"
                                        style={{ borderBottom: '1px solid rgba(0,255,65,0.06)' }}
                                    >
                                        <span className="truncate max-w-[70%]"
                                              style={{ color: 'rgba(0,255,65,0.7)' }}
                                              title={result.email}>
                                            &gt; {result.email}
                                        </span>
                                        {result.status === 'sent' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold"
                                                  style={{ background: 'rgba(0,255,65,0.08)', color: '#00FF41' }}>
                                                <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: '#00FF41' }} />
                                                OK
                                            </span>
                                        ) : (
                                            <span
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold"
                                                style={{ background: 'rgba(255,36,66,0.08)', color: '#FF2442' }}
                                                title={result.error || 'Unknown error'}
                                            >
                                                <span className="w-1 h-1 rounded-full" style={{ background: '#FF2442' }} />
                                                ERR
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
