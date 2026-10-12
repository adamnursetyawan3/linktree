import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { settings } from '../settings.js';
import { playClickHaptic } from '../utils/audioHaptic.js';
import { useReveal } from '../hooks/useReveal.js';

const QUICK_COMMANDS = ['whoami', 'stack', 'projects', 'links', 'contact', 'help', 'clear'];

export const HeroTerminal = memo(({ 
    soundEnabled = true, 
    onSelectProject, 
    onSelectSocial, 
    onShowToast 
}) => {
    const [sectionRef, isRevealed] = useReveal();
    const [outputHistory, setOutputHistory] = useState([]);
    const [inputVal, setInputVal] = useState('');
    const [typingText, setTypingText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const lastCommandRef = useRef('whoami');
    const outputContainerRef = useRef(null);
    const hasAutoTypedRef = useRef(false);

    // AUTO-SCROLL KE BARIS TERBARU DI DALAM TERMINAL
    useEffect(() => {
        if (outputContainerRef.current) {
            outputContainerRef.current.scrollTop = outputContainerRef.current.scrollHeight;
        }
    }, [outputHistory, typingText]);

    // EKSEKUSI PERINTAH
    const runCommand = useCallback((cmd) => {
        playClickHaptic(soundEnabled);
        const trimmed = cmd.trim();
        if (!trimmed) return;

        const lower = trimmed.toLowerCase();
        lastCommandRef.current = lower;

        if (lower === 'clear') {
            setOutputHistory([]);
            return;
        }

        let resultBlock = null;

        if (lower === 'whoami') {
            resultBlock = {
                type: 'whoami',
                data: {
                    name: settings.profile.name,
                    handle: settings.profile.handle,
                    title: settings.profile.title,
                    location: settings.profile.location,
                    status: settings.profile.status
                }
            };
        } else if (lower === 'stack') {
            resultBlock = {
                type: 'stack',
                data: settings.profile.stack.join(' // ')
            };
        } else if (lower === 'projects') {
            resultBlock = {
                type: 'projects',
                items: settings.projects.map((p, idx) => {
                    let host = p.url;
                    try {
                        host = new URL(p.url).hostname;
                    } catch (e) {}
                    return {
                        index: idx,
                        num: String(idx + 1).padStart(2, '0'),
                        title: p.title,
                        tag: p.tag,
                        domain: host,
                        url: p.url
                    };
                })
            };
        } else if (lower === 'links') {
            resultBlock = {
                type: 'links',
                items: settings.links.map((l, idx) => ({
                    id: l.id,
                    num: String(idx + 1).padStart(2, '0'),
                    title: l.title,
                    subtitle: l.subtitle,
                    url: l.url
                }))
            };
        } else if (lower === 'contact') {
            resultBlock = {
                type: 'contact',
                items: settings.links.filter(l => 
                    ['Telegram', 'WhatsApp Channel', 'WhatsApp Group', 'GitHub', 'SociaBuzz'].includes(l.title) || l.tag === 'Direct Chat' || l.tag === 'Social'
                )
            };
        } else if (lower === 'help') {
            resultBlock = {
                type: 'help',
                commands: [
                    { cmd: 'whoami', desc: 'Informasi profil & status identitas' },
                    { cmd: 'stack', desc: 'Daftar tumpukan teknologi inti' },
                    { cmd: 'projects', desc: 'Daftar proyek (klik untuk detail modal)' },
                    { cmd: 'links', desc: 'Daftar platform terverifikasi (klik untuk ekspansi)' },
                    { cmd: 'contact', desc: 'Tautan kontak langsung & komunitas' },
                    { cmd: 'help', desc: 'Panduan daftar perintah terminal' },
                    { cmd: 'clear', desc: 'Bersihkan seluruh riwayat terminal' }
                ]
            };
        } else {
            resultBlock = {
                type: 'unknown',
                query: trimmed
            };
        }

        setOutputHistory(prev => {
            const next = [...prev, { id: Date.now() + Math.random(), command: trimmed, result: resultBlock }];
            // Batasi 200 riwayat terakhir
            return next.slice(-200);
        });
    }, [soundEnabled]);

    // PENGETIKAN OTOMATIS "whoami" KETIKA PERTAMA KALI MASUK VIEWPORT (1X PER KUNJUNGAN)
    useEffect(() => {
        if (!isRevealed || hasAutoTypedRef.current) return;
        hasAutoTypedRef.current = true;

        let hasDoneBefore = false;
        try {
            hasDoneBefore = sessionStorage.getItem('terminal_auto_typed') === 'true';
        } catch (e) {}

        const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (hasDoneBefore || isReduced) {
            // Tampilkan output whoami langsung tanpa animasi ketik
            runCommand('whoami');
            return;
        }

        // Jalankan efek ketik "whoami" santai
        setIsTyping(true);
        const targetWord = 'whoami';
        let charIndex = 0;

        const interval = setInterval(() => {
            charIndex++;
            setTypingText(targetWord.slice(0, charIndex));

            if (charIndex >= targetWord.length) {
                clearInterval(interval);
                setTimeout(() => {
                    setIsTyping(false);
                    setTypingText('');
                    runCommand('whoami');
                    try {
                        sessionStorage.setItem('terminal_auto_typed', 'true');
                    } catch (e) {}
                }, 250);
            }
        }, 110);

        return () => clearInterval(interval);
    }, [isRevealed, runCommand]);

    // HANDLER INPUT FORM
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputVal.trim()) return;
        runCommand(inputVal);
        setInputVal('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setInputVal(lastCommandRef.current || 'whoami');
        }
    };

    const usernamePrompt = (settings?.profile?.handle?.replace(/^@/, '') || 'adamnurs') + '@portfolio';

    return (
        <section 
            id="terminal" 
            ref={sectionRef} 
            className="hero-terminal-section"
            aria-label="Terminal Interaktif Portofolio"
        >
            <div className="section-container">
                {/* 1. BAR JUDUL MINI DENGAN PENANDA PERSEGI KANAN */}
                <div className="terminal-titlebar">
                    <div className="terminal-titlebar-left">
                        <span className="terminal-user-badge font-mono">{usernamePrompt}</span>
                        <span className="terminal-titlebar-dot" aria-hidden="true" />
                        <span className="terminal-titlebar-tag font-mono">console.noir</span>
                    </div>

                    <div className="terminal-titlebar-right" aria-hidden="true">
                        <span className="terminal-marker-sq" />
                        <span className="terminal-marker-sq" />
                        <span className="terminal-marker-sq" />
                    </div>
                </div>

                {/* 2. AREA OUTPUT (MAX 280PX, SCROLL OVERFLOW-Y, ACCESSIBLE LOG) */}
                <div 
                    ref={outputContainerRef}
                    className="terminal-screen-area"
                    role="log"
                    aria-live="polite"
                    aria-atomic="false"
                >
                    {outputHistory.map((block) => (
                        <div key={block.id} className="terminal-log-block">
                            {/* BARIS PERINTAH */}
                            <div className="terminal-cmd-echo font-mono">
                                <span className="terminal-prompt-arrow text-[var(--blue-4)]">&gt;</span>
                                <span className="text-[var(--blue-1)] font-semibold">{block.command}</span>
                            </div>

                            {/* OUTPUT HASIL */}
                            <div className="terminal-output-body font-mono">
                                {block.result.type === 'whoami' && (
                                    <div className="terminal-whoami-grid">
                                        <div className="terminal-kv-row">
                                            <span className="terminal-kv-key">NAME:</span>
                                            <span className="terminal-kv-val text-[var(--blue-1)]">{block.result.data.name}</span>
                                        </div>
                                        <div className="terminal-kv-row">
                                            <span className="terminal-kv-key">HANDLE:</span>
                                            <span className="terminal-kv-val text-[var(--blue-2)]">{block.result.data.handle}</span>
                                        </div>
                                        <div className="terminal-kv-row">
                                            <span className="terminal-kv-key">TITLE:</span>
                                            <span className="terminal-kv-val text-[var(--blue-3)]">{block.result.data.title}</span>
                                        </div>
                                        <div className="terminal-kv-row">
                                            <span className="terminal-kv-key">LOCATION:</span>
                                            <span className="terminal-kv-val">{block.result.data.location}</span>
                                        </div>
                                        <div className="terminal-kv-row">
                                            <span className="terminal-kv-key">STATUS:</span>
                                            <span className="terminal-kv-val text-[var(--status-online)]">{block.result.data.status}</span>
                                        </div>
                                    </div>
                                )}

                                {block.result.type === 'stack' && (
                                    <div className="terminal-text-block text-[var(--blue-2)]">
                                        {block.result.data}
                                    </div>
                                )}

                                {block.result.type === 'projects' && (
                                    <div className="terminal-projects-list">
                                        {block.result.items.map((proj) => (
                                            <button
                                                key={proj.index}
                                                type="button"
                                                className="terminal-item-btn"
                                                onClick={() => {
                                                    playClickHaptic(soundEnabled);
                                                    onSelectProject?.(proj.index);
                                                }}
                                                title="Klik untuk membuka spesifikasi proyek"
                                            >
                                                <span className="text-[var(--blue-4)]">[{proj.num}]</span>
                                                <span className="text-[var(--blue-1)] font-semibold">{proj.title}</span>
                                                <span className="text-[var(--blue-5)]">·</span>
                                                <span className="text-[var(--blue-3)] text-xs">{proj.tag}</span>
                                                <span className="text-[var(--blue-7)] ml-auto text-xs">{proj.domain}</span>
                                                <span className="text-[var(--blue-4)] text-xs ml-1">↗</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {block.result.type === 'links' && (
                                    <div className="terminal-links-list">
                                        {block.result.items.map((link) => (
                                            <button
                                                key={link.id}
                                                type="button"
                                                className="terminal-item-btn"
                                                onClick={() => {
                                                    playClickHaptic(soundEnabled);
                                                    onSelectSocial?.(link.id);
                                                    const el = document.getElementById('kontak');
                                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                title="Klik untuk navigasi ke kontak"
                                            >
                                                <span className="text-[var(--blue-4)]">[{link.num}]</span>
                                                <span className="text-[var(--blue-1)]">{link.title}</span>
                                                <span className="text-[var(--blue-5)]">·</span>
                                                <span className="text-[var(--blue-3)] text-xs">{link.subtitle}</span>
                                                <span className="text-[var(--blue-4)] text-xs ml-auto">LIHAT ↓</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {block.result.type === 'contact' && (
                                    <div className="terminal-contacts-list">
                                        {block.result.items.map((c, i) => (
                                            <div key={i} className="terminal-contact-row">
                                                <span className="text-[var(--blue-2)]">{c.title}</span>
                                                <span className="text-[var(--blue-5)]">·</span>
                                                <span className="text-[var(--blue-3)] text-xs truncate max-w-[180px]">{c.subtitle}</span>
                                                <a 
                                                    href={c.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="terminal-ext-btn"
                                                    onClick={() => playClickHaptic(soundEnabled)}
                                                >
                                                    Buka ↗
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {block.result.type === 'help' && (
                                    <div className="terminal-help-table">
                                        {block.result.commands.map((h, i) => (
                                            <div key={i} className="terminal-help-row">
                                                <span className="terminal-help-cmd text-[var(--blue-1)]">{h.cmd}</span>
                                                <span className="terminal-help-sep text-[var(--blue-7)]">-</span>
                                                <span className="terminal-help-desc text-[var(--blue-3)]">{h.desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {block.result.type === 'unknown' && (
                                    <div className="terminal-unknown-text text-[var(--blue-4)]">
                                        Perintah "{block.result.query}" tidak dikenal, ketik <button type="button" className="underline text-[var(--blue-2)]" onClick={() => runCommand('help')}>help</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* EFEK KETIK OTOMATIS AKTIF */}
                    {isTyping && (
                        <div className="terminal-typing-line font-mono">
                            <span className="terminal-prompt-arrow text-[var(--blue-4)]">&gt;</span>
                            <span className="text-[var(--blue-1)]">{typingText}</span>
                            <span className="terminal-cursor-box" aria-hidden="true" />
                        </div>
                    )}
                </div>

                {/* 3. INPUT PROMPT FORM KECIL */}
                <form onSubmit={handleSubmit} className="terminal-input-bar">
                    <span className="terminal-input-prompt font-mono text-[var(--blue-4)]" aria-hidden="true">&gt;</span>
                    <input 
                        type="text"
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ketik perintah (contoh: whoami, projects, help)..."
                        className="terminal-input-field font-mono"
                        aria-label="Input baris perintah terminal"
                    />
                    <button 
                        type="submit" 
                        className="terminal-submit-btn font-mono"
                        aria-label="Jalankan perintah"
                    >
                        RUN
                    </button>
                </form>

                {/* 4. BARIS TOMBOL PERINTAH CEPAT (TARGET SENTUH MIN 44PX) */}
                <div className="terminal-quick-buttons" role="toolbar" aria-label="Perintah cepat terminal">
                    <span className="terminal-quick-label font-mono">QUICK:</span>
                    {QUICK_COMMANDS.map((cmd) => (
                        <button
                            key={cmd}
                            type="button"
                            className="terminal-quick-btn font-mono"
                            onClick={() => runCommand(cmd)}
                        >
                            {cmd}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
});

HeroTerminal.displayName = 'HeroTerminal';
export default HeroTerminal;
