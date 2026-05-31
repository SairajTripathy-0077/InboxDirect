"use client";

import React, { useState, useCallback } from 'react';

export default function EmailExtraction({ onEmailsExtracted }) {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [emails, setEmails] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [newEmailInput, setNewEmailInput] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    // Handle drag events
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    // Process file upload request
    const uploadFile = async (selectedFile) => {
        if (!selectedFile) return;
        setFile(selectedFile);
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setEmails(data.emails || []);
                if (onEmailsExtracted) {
                    onEmailsExtracted(data.emails || []);
                }
            } else {
                setError(data.message || 'Failed to process file.');
            }
        } catch (err) {
            setError('An error occurred during file upload.');
        } finally {
            setLoading(false);
        }
    };

    // Handle drop event
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            uploadFile(e.dataTransfer.files[0]);
        }
    }, []);

    // Handle manual file input
    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            uploadFile(e.target.files[0]);
        }
    };

    // Add individual email manually
    const handleAddEmail = (e) => {
        e.preventDefault();
        const trimmed = newEmailInput.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!trimmed) return;
        if (!emailRegex.test(trimmed)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (emails.includes(trimmed)) {
            setError('This email is already in the list.');
            return;
        }

        const updated = [...emails, trimmed];
        setEmails(updated);
        setNewEmailInput('');
        setError(null);
        if (onEmailsExtracted) {
            onEmailsExtracted(updated);
        }
    };

    // Remove individual email
    const handleRemoveEmail = (emailToRemove) => {
        const updated = emails.filter(email => email !== emailToRemove);
        setEmails(updated);
        if (onEmailsExtracted) {
            onEmailsExtracted(updated);
        }
    };

    // Clear entire list
    const handleClearAll = () => {
        setEmails([]);
        setFile(null);
        setError(null);
        if (onEmailsExtracted) {
            onEmailsExtracted([]);
        }
    };

    // Copy to clipboard
    const handleCopyToClipboard = () => {
        if (emails.length === 0) return;
        navigator.clipboard.writeText(emails.join(', ')).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    // Filter emails based on search query
    const filteredEmails = emails.filter(email =>
        email.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 rounded-full pointer-events-none"
                     style={{ background: 'radial-gradient(circle, rgba(0,255,65,0.06) 0%, transparent 70%)', filter: 'blur(30px)' }} />
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 rounded-full pointer-events-none"
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
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                        </span>
                        <div>
                            <h2 className="text-xl font-black tracking-widest mono-terminal"
                                style={{ color: '#00FF41', textShadow: '0 0 10px rgba(0,255,65,0.4)' }}>
                                EXTRACT_RECIPIENT_LIST
                            </h2>
                            <p className="text-xs mono-terminal mt-0.5" style={{ color: 'rgba(0,255,65,0.45)' }}>
                                &gt; Load recipient array via file upload or manual input
                            </p>
                        </div>
                    </div>

                    {/* ── Drag and Drop Zone ───────────────────── */}
                    <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className="relative cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 flex flex-col items-center justify-center gap-3"
                        style={dragActive ? {
                            borderColor: '#00FF41',
                            background: 'rgba(0,255,65,0.05)',
                            boxShadow: '0 0 20px rgba(0,255,65,0.12), inset 0 0 20px rgba(0,255,65,0.03)',
                            transform: 'scale(1.01)',
                        } : {
                            borderColor: 'rgba(0,255,65,0.25)',
                            background: 'rgba(0,8,2,0.5)',
                        }}
                    >
                        <input
                            type="file"
                            id="email-file-input"
                            className="hidden"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileInput}
                            disabled={loading}
                        />
                        <label htmlFor="email-file-input" className="w-full cursor-pointer flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded flex items-center justify-center transition-all duration-300"
                                 style={{
                                     background: 'rgba(0,20,5,0.8)',
                                     border: '1px solid rgba(0,255,65,0.25)',
                                     color: '#00FF41',
                                     boxShadow: dragActive ? '0 0 16px rgba(0,255,65,0.3)' : 'none',
                                 }}>
                                {loading ? (
                                    <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24" style={{ color: '#00FF41' }}>
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex flex-col gap-1 items-center">
                                <span className="text-sm font-bold mono-terminal" style={{ color: '#00FF41' }}>
                                    {loading ? '> PROCESSING_FILE...' : file ? `> LOADED: ${file.name}` : '> DROP_FILE_HERE / CLICK_TO_BROWSE'}
                                </span>
                                <span className="text-xs mono-terminal" style={{ color: 'rgba(0,255,65,0.4)' }}>
                                    Supports CSV, Excel (.xlsx, .xls)
                                </span>
                            </div>
                        </label>
                    </div>

                    {/* ── Error Notification ───────────────────── */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded border text-sm animate-scale-up mono-terminal"
                             style={{ borderColor: 'rgba(255,36,66,0.4)', background: 'rgba(255,36,66,0.05)', color: '#FF2442' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                            <span>ERR: {error}</span>
                        </div>
                    )}

                    {/* ── Manual Input + Controls ──────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <form onSubmit={handleAddEmail} className="md:col-span-8 flex gap-2 w-full">
                            <input
                                type="email"
                                id="manual-email-input"
                                placeholder="> enter_custom_email@domain.com..."
                                value={newEmailInput}
                                onChange={(e) => setNewEmailInput(e.target.value)}
                                className="flex-1 px-4 py-2.5 rounded text-sm mono-terminal transition-all outline-none"
                                style={{
                                    background: 'rgba(0,12,3,0.8)',
                                    border: '1px solid rgba(0,255,65,0.22)',
                                    color: '#00FF41',
                                    caretColor: '#00FF41',
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(0,255,65,0.6)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(0,255,65,0.22)'}
                            />
                            <button
                                type="submit"
                                id="add-email-btn"
                                className="px-4 py-2.5 rounded text-sm font-black mono-terminal text-black flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                                style={{ background: '#00FF41', boxShadow: '0 0 14px rgba(0,255,65,0.4)', letterSpacing: '0.08em' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                                onMouseUp={e => e.currentTarget.style.transform = 'scale(1.03)'}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                ADD
                            </button>
                        </form>

                        {emails.length > 0 && (
                            <div className="md:col-span-4 flex justify-end gap-2">
                                <button
                                    id="copy-emails-btn"
                                    onClick={handleCopyToClipboard}
                                    className="px-3.5 py-2.5 rounded text-xs font-semibold mono-terminal flex items-center gap-1.5 cursor-pointer transition-all"
                                    style={{
                                        background: 'rgba(0,15,4,0.7)',
                                        border: '1px solid rgba(0,255,65,0.25)',
                                        color: copySuccess ? '#00FF41' : 'rgba(0,255,65,0.65)',
                                    }}
                                    title="Copy all emails"
                                >
                                    {copySuccess ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                            COPIED
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5" />
                                            </svg>
                                            COPY_ALL
                                        </>
                                    )}
                                </button>
                                <button
                                    id="clear-emails-btn"
                                    onClick={handleClearAll}
                                    className="px-3.5 py-2.5 rounded text-xs font-semibold mono-terminal flex items-center gap-1.5 cursor-pointer transition-all"
                                    style={{
                                        background: 'rgba(15,0,2,0.7)',
                                        border: '1px solid rgba(255,36,66,0.25)',
                                        color: 'rgba(255,36,66,0.7)',
                                    }}
                                    title="Clear all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                    FLUSH
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── Recipient Array Panel ────────────────── */}
                    {emails.length > 0 && (
                        <div className="flex flex-col gap-3.5 rounded-xl p-4"
                             style={{ border: '1px solid rgba(0,255,65,0.18)', background: 'rgba(0,8,2,0.6)' }}>

                            {/* Header + Search */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold mono-terminal" style={{ color: '#00FF41' }}>
                                        RECIPIENT_ARRAY
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-xs font-bold mono-terminal"
                                          style={{ background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.3)', color: '#00FF41' }}>
                                        {emails.length}
                                    </span>
                                </div>
                                <div className="relative w-full sm:w-64">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center" style={{ color: 'rgba(0,255,65,0.4)' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        id="email-search"
                                        placeholder="SEARCH_EMAILS..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-1.5 rounded text-xs mono-terminal outline-none transition-all"
                                        style={{
                                            background: 'rgba(0,12,3,0.7)',
                                            border: '1px solid rgba(0,255,65,0.2)',
                                            color: '#00FF41',
                                            caretColor: '#00FF41',
                                        }}
                                        onFocus={e => e.target.style.borderColor = 'rgba(0,255,65,0.5)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(0,255,65,0.2)'}
                                    />
                                </div>
                            </div>

                            {/* Email Chips */}
                            <div className="max-h-48 overflow-y-auto pr-1 flex flex-wrap gap-2">
                                {filteredEmails.length > 0 ? (
                                    filteredEmails.map((email, idx) => (
                                        <div
                                            key={`${email}-${idx}`}
                                            className="group flex items-center gap-1.5 px-3 py-1.5 rounded text-xs mono-terminal transition-all duration-200 animate-scale-up"
                                            style={{
                                                background: 'rgba(0,20,5,0.8)',
                                                border: '1px solid rgba(0,255,65,0.2)',
                                                color: 'rgba(0,255,65,0.8)',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,255,65,0.55)'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,255,65,0.2)'}
                                        >
                                            <span className="font-medium truncate max-w-[200px]" title={email}>{email}</span>
                                            <button
                                                onClick={() => handleRemoveEmail(email)}
                                                className="w-4 h-4 rounded flex items-center justify-center transition-all cursor-pointer"
                                                title="Remove"
                                                style={{ color: 'rgba(0,255,65,0.4)' }}
                                                onMouseEnter={e => e.currentTarget.style.color = '#FF2442'}
                                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,255,65,0.4)'}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="w-full text-center py-6 text-xs mono-terminal" style={{ color: 'rgba(0,255,65,0.3)' }}>
                                        &gt; NO_MATCHES_FOUND_
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
