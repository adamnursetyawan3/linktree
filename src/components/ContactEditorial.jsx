import React, { useState, memo } from 'react';
import { 
    ExternalLink, 
    Copy, 
    Check, 
    Globe, 
    Share2,
    ArrowUpRight
} from 'lucide-react';
import { settings } from '../settings.js';
import SociaBuzzIcon from './SociaBuzzIcon.jsx';
import { useReveal } from '../hooks/useReveal.js';
import { playClickHaptic } from '../utils/audioHaptic.js';

// BARIS TAUTAN EDITORIAL (TANPA KOTAK KARTU)
const EditorialLinkRow = memo(({ link, index, soundEnabled, onShowToast }) => {
    const [copied, setCopied] = useState(false);
    const num = String(index + 1).padStart(2, '0');

    let cleanDisplayUrl = link.url;
    try {
        const u = new URL(link.url);
        cleanDisplayUrl = `${u.hostname}${u.pathname.length > 1 ? u.pathname : ''}`;
    } catch (e) {}

    const handleCopy = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        playClickHaptic(soundEnabled);
        try {
            await navigator.clipboard.writeText(link.url);
            setCopied(true);
            onShowToast?.(`Tautan ${link.title} disalin ke papan klip`);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            onShowToast?.("Gagal menyalin tautan");
        }
    };

    return (
        <tr className="editorial-link-row">
            {/* 1. NOMOR URUT */}
            <td className="editorial-col-num font-mono">
                <span className="editorial-num-accent">{num}</span>
            </td>

            {/* 2. PLATFORM & IDENTITAS */}
            <td className="editorial-col-main">
                <div className="flex items-center gap-3">
                    <div className="editorial-link-icon-wrap" aria-hidden="true">
                        {link.icon === 'sociabuzz' ? (
                            <SociaBuzzIcon size={16} />
                        ) : (
                            <i className={`${link.icon} text-sm`}></i>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="editorial-link-title">{link.title}</span>
                            {link.tag && (
                                <span className="font-mono text-[11px] text-[var(--blue-4)]">
                                    · {link.tag}
                                </span>
                            )}
                        </div>
                        <span className="editorial-link-sub">{link.subtitle}</span>
                    </div>
                </div>
            </td>

            {/* 3. URL LENGKAP PREVIEW */}
            <td className="editorial-col-url hidden md:table-cell font-mono text-xs text-[var(--blue-3)]">
                <span className="truncate max-w-[260px] block opacity-85" title={link.url}>
                    {cleanDisplayUrl}
                </span>
            </td>

            {/* 4. AKSI: SALIN & BUKA */}
            <td className="editorial-col-action text-right">
                <div className="editorial-link-actions-group">
                    <button
                        type="button"
                        className="editorial-action-btn secondary"
                        onClick={handleCopy}
                        title="Salin tautan"
                        aria-label={`Salin tautan ${link.title}`}
                    >
                        {copied ? (
                            <>
                                <Check size={12} strokeWidth={1.5} className="text-emerald-400" />
                                <span className="text-emerald-400">Tersalin</span>
                            </>
                        ) : (
                            <>
                                <Copy size={12} strokeWidth={1.5} />
                                <span>Salin</span>
                            </>
                        )}
                    </button>

                    <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="editorial-action-btn primary"
                        onClick={() => playClickHaptic(soundEnabled)}
                        title={`Buka ${link.title}`}
                        aria-label={`Buka tautan ${link.title}`}
                    >
                        <span>Buka</span>
                        <ArrowUpRight size={12} strokeWidth={1.5} />
                    </a>
                </div>
            </td>
        </tr>
    );
});

export const ContactEditorial = memo(({ soundEnabled, onShowToast }) => {
    const [sectionRef, isRevealed] = useReveal({ threshold: 0.08 });
    const links = settings.links || [];

    return (
        <section 
            id="kontak" 
            ref={sectionRef}
            className={`editorial-section ${isRevealed ? 'revealed' : ''}`}
            aria-label="Jaringan dan Komunikasi Resmi"
        >
            <div className="section-container">
                {/* HEADER SECTION EDITORIAL */}
                <header className="editorial-section-header">
                    <div className="editorial-kicker-row">
                        <span className="editorial-kicker-num">05</span>
                        <span className="editorial-kicker-slash">/</span>
                        <h2 className="editorial-kicker-title">JARINGAN & KOMUNIKASI RESMI</h2>
                    </div>

                    <div className="editorial-header-actions">
                        <span className="text-xs font-mono text-[var(--blue-3)]">
                            {links.length} TAUTAN TERVERIFIKASI
                        </span>
                    </div>
                </header>

                {/* TABEL BARIS EDITORIAL TAUTAN */}
                <div className="editorial-table-container">
                    <table className="editorial-projects-table">
                        <thead>
                            <tr className="editorial-table-head-row">
                                <th className="editorial-th editorial-col-num">ID</th>
                                <th className="editorial-th editorial-col-main">PLATFORM & IDENTITAS</th>
                                <th className="editorial-th editorial-col-url hidden md:table-cell">URL / ENDPOINT</th>
                                <th className="editorial-th editorial-col-action text-right">AKSI CEPAT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {links.map((link, idx) => (
                                <EditorialLinkRow
                                    key={link.id || idx}
                                    link={link}
                                    index={idx}
                                    soundEnabled={soundEnabled}
                                    onShowToast={onShowToast}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER NOTE TAUTAN */}
                <div className="editorial-section-meta-footer">
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--blue-3)]">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Semua saluran dan direct endpoint diverifikasi aktif oleh Adam Nur Setyawan.</span>
                    </div>
                </div>
            </div>
        </section>
    );
});

export default ContactEditorial;
