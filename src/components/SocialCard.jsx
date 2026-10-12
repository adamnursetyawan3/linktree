import React, { useRef, useState, memo } from 'react';
import { 
    ChevronDown, 
    ExternalLink, 
    Copy, 
    Check, 
    X,
    Globe
} from 'lucide-react';
import SociaBuzzIcon from './SociaBuzzIcon.jsx';
import { playClickHaptic } from '../utils/audioHaptic.js';

export const SocialCard = memo(({ 
    link, 
    index, 
    isExpanded, 
    onToggle, 
    onShowToast, 
    soundEnabled 
}) => {
    const cardRef = useRef(null);
    const [copied, setCopied] = useState(false);
    const num = String(index + 1).padStart(2, '0');

    const handlePointerMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cardRef.current.style.setProperty('--mouse-x', `${x}px`);
        cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    const handleCopy = async (e) => {
        e.stopPropagation();
        playClickHaptic(soundEnabled);
        try {
            await navigator.clipboard.writeText(link.url);
            setCopied(true);
            onShowToast?.(`Tautan ${link.title} berhasil disalin`);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            onShowToast?.("Gagal menyalin tautan");
        }
    };

    return (
        <div 
            ref={cardRef}
            className={`social-interactive-card card-interactive-glow ${isExpanded ? 'expanded' : ''}`}
            onPointerMove={handlePointerMove}
            style={{ animationDelay: `${index * 60}ms` }}
        >
            {/* KARTU ATAS YANG DAPAT DIKLIK */}
            <div 
                className="social-card-clickable"
                onClick={() => {
                    playClickHaptic(soundEnabled);
                    onToggle();
                }}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-controls={`social-panel-${link.id}`}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        playClickHaptic(soundEnabled);
                        onToggle();
                    }
                }}
            >
                {/* KIRI: NOMOR + IKON PLATFORM */}
                <div className="social-card-left">
                    <span className="social-card-num">{num}</span>
                    <div className="social-icon-wrapper">
                        {link.icon === 'sociabuzz' ? (
                            <SociaBuzzIcon size={18} />
                        ) : (
                            <i className={link.icon}></i>
                        )}
                    </div>
                </div>

                {/* TENGAH: PLATFORM TITLE & SUBTITLE */}
                <div className="social-card-center">
                    <div className="social-title-line">
                        <span className="social-platform-title">{link.title}</span>
                        {link.tag && (
                            <span className="social-tag-badge">{link.tag}</span>
                        )}
                    </div>
                    <span className="social-handle-sub">{link.subtitle}</span>
                </div>

                {/* KANAN: INDIKATOR CHEVRON EXPAND */}
                <div className={`social-chevron-box ${isExpanded ? 'rotated' : ''}`}>
                    <ChevronDown size={16} strokeWidth={1.5} />
                </div>
            </div>

            {/* PANEL EXPAND ACCORDION (GRID-TEMPLATE-ROWS 0FR -> 1FR UNTUK ANIMASI HALUS) */}
            <div 
                id={`social-panel-${link.id}`}
                className={`social-accordion-content ${isExpanded ? 'open' : ''}`}
                aria-hidden={!isExpanded}
            >
                <div className="social-accordion-inner">
                    <div className="social-url-row">
                        <Globe size={12} strokeWidth={1.5} className="text-[var(--blue-4)] shrink-0" />
                        <span className="social-url-string" title={link.url}>{link.url}</span>
                    </div>

                    <div className="social-panel-actions">
                        <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="social-action-btn primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                playClickHaptic(soundEnabled);
                            }}
                        >
                            <span>Buka</span>
                            <ExternalLink size={13} strokeWidth={1.5} />
                        </a>

                        <button 
                            type="button"
                            className="social-action-btn secondary"
                            onClick={handleCopy}
                            title="Salin Tautan"
                            aria-label={`Salin tautan ${link.title}`}
                        >
                            {copied ? (
                                <>
                                    <Check size={13} strokeWidth={1.5} className="text-[var(--status-online)]" />
                                    <span>Tersalin</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={13} strokeWidth={1.5} />
                                    <span>Salin</span>
                                </>
                            )}
                        </button>

                        <button 
                            type="button"
                            className="social-action-btn close"
                            onClick={(e) => {
                                e.stopPropagation();
                                playClickHaptic(soundEnabled);
                                onToggle();
                            }}
                            title="Tutup Panel"
                            aria-label="Tutup panel tautan"
                        >
                            <X size={13} strokeWidth={1.5} />
                            <span>Tutup</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default SocialCard;
