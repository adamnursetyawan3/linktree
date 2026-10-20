import React, { memo } from 'react';
import { Terminal, Code2 } from 'lucide-react';
import { settings } from '../settings.js';

export const StackMarquee = memo(() => {
    const stackItems = settings.profile.stack || [];
    // Gandakan item untuk perulangan loop
    const row1 = [...stackItems, ...stackItems, ...stackItems, ...stackItems];
    const row2 = [...stackItems, ...stackItems, ...stackItems, ...stackItems].reverse();

    return (
        <section id="stack" className="portfolio-section stack-section">
            <div className="section-header-row">
                <span className="section-index-num">01 /</span>
                <h2 className="section-title-heading">Stack</h2>
                <div className="section-header-line" aria-hidden="true" />
                <span className="section-meta-count">Core Technologies</span>
            </div>

            <div className="stack-marquee-wrapper" aria-label="Keahlian Teknologi">
                {/* BARIS 1: MARQUEE KE KIRI */}
                <div className="marquee-track track-left">
                    <div className="marquee-inner">
                        {row1.map((tech, idx) => (
                            <div key={`r1-${idx}`} className="stack-chip-badge">
                                <Terminal size={12} strokeWidth={1.5} className="chip-icon text-[var(--blue-4)]" />
                                <span className="chip-tech-name">{tech}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* BARIS 2: MARQUEE KE KANAN */}
                <div className="marquee-track track-right">
                    <div className="marquee-inner reverse">
                        {row2.map((tech, idx) => (
                            <div key={`r2-${idx}`} className="stack-chip-badge">
                                <Code2 size={12} strokeWidth={1.5} className="chip-icon text-[var(--blue-4)]" />
                                <span className="chip-tech-name">{tech}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
});

export default StackMarquee;
