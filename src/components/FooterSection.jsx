import React, { memo } from 'react';
import { ArrowUp } from 'lucide-react';
import { settings } from '../settings.js';
import { playClickHaptic } from '../utils/audioHaptic.js';

export const FooterSection = memo(({ soundEnabled }) => {
    const scrollToTop = () => {
        playClickHaptic(soundEnabled);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="portfolio-footer-section">
            {/* NAMA BESAR SEMI-TRANSPARAN (OUTLINE TEXT STROKE) */}
            <div className="footer-giant-outline-wrap" aria-hidden="true">
                <span className="footer-giant-text">{settings.profile.name}</span>
            </div>

            <div className="footer-bottom-bar">
                <div className="footer-meta-left">
                    <span className="footer-copy-text">
                        © {new Date().getFullYear()} <strong>{settings.profile.name}</strong> • {settings.profile.handle}
                    </span>
                    <span className="footer-tagline-text">{settings.profile.title}</span>
                </div>

                {/* TOMBOL KEMBALI KE ATAS */}
                <button 
                    className="back-to-top-btn"
                    onClick={scrollToTop}
                    title="Kembali ke atas"
                    aria-label="Kembali ke atas"
                >
                    <span>Kembali ke atas</span>
                    <ArrowUp size={14} strokeWidth={1.5} />
                </button>
            </div>
        </footer>
    );
});

export default FooterSection;
