import React, { useEffect, useRef, useState, memo } from 'react';
import { 
    X, 
    ExternalLink, 
    Copy, 
    Check, 
    ChevronLeft, 
    ChevronRight,
    Globe
} from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { playClickHaptic } from '../utils/audioHaptic.js';

export const ProjectModal = memo(({ 
    isOpen, 
    project, 
    projects = [], 
    currentIndex = 0, 
    onClose, 
    onSelectProject,
    onShowToast,
    soundEnabled 
}) => {
    useScrollLock(isOpen);
    const modalRef = useFocusTrap(isOpen, onClose);
    const [copied, setCopied] = useState(false);
    const [touchStartY, setTouchStartY] = useState(null);
    const [touchDeltaY, setTouchDeltaY] = useState(0);

    useEffect(() => {
        setCopied(false);
        setTouchDeltaY(0);
    }, [project]);

    if (!isOpen || !project) return null;

    const totalProjects = projects.length;
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < totalProjects - 1;
    const num = String(currentIndex + 1).padStart(2, '0');

    let hostname = project.url;
    try {
        hostname = new URL(project.url).hostname;
    } catch (e) {}

    const handleCopy = async () => {
        playClickHaptic(soundEnabled);
        try {
            await navigator.clipboard.writeText(project.url);
            setCopied(true);
            onShowToast?.("Tautan project berhasil disalin");
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            onShowToast?.("Gagal menyalin tautan");
        }
    };

    const handlePrev = () => {
        if (!hasPrev) return;
        playClickHaptic(soundEnabled);
        onSelectProject?.(currentIndex - 1);
    };

    const handleNext = () => {
        if (!hasNext) return;
        playClickHaptic(soundEnabled);
        onSelectProject?.(currentIndex + 1);
    };

    // SWIPE DOWN TO CLOSE DI HP
    const handleTouchStart = (e) => {
        setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
        if (touchStartY === null) return;
        const currentY = e.touches[0].clientY;
        const delta = currentY - touchStartY;
        if (delta > 0) {
            setTouchDeltaY(delta);
        }
    };

    const handleTouchEnd = () => {
        if (touchDeltaY > 100) {
            playClickHaptic(soundEnabled);
            onClose();
        }
        setTouchStartY(null);
        setTouchDeltaY(0);
    };

    return (
        <div 
            className="project-modal-backdrop"
            onClick={onClose}
            role="presentation"
        >
            <div 
                ref={modalRef}
                className="project-modal-sheet"
                role="dialog"
                aria-modal="true"
                aria-labelledby="project-modal-title"
                style={{
                    transform: touchDeltaY > 0 ? `translateY(${touchDeltaY}px)` : undefined,
                    transition: touchStartY ? 'none' : 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)'
                }}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* DRAG HANDLE BAR UNTUK HP */}
                <div className="sheet-drag-handle" aria-hidden="true">
                    <span className="sheet-drag-pill" />
                </div>

                {/* HEADER MODAL */}
                <div className="project-modal-header">
                    <div className="modal-index-meta">
                        <span className="modal-num-badge">{num}</span>
                        <span className="modal-slash">/</span>
                        <span className="modal-tag-badge">{project.tag || "Project"}</span>
                    </div>

                    <div className="modal-header-actions">
                        <div className="modal-nav-pagers" role="group" aria-label="Navigasi Proyek">
                            <button
                                className="modal-pager-btn"
                                onClick={handlePrev}
                                disabled={!hasPrev}
                                title="Project Sebelumnya"
                                aria-label="Project sebelumnya"
                            >
                                <ChevronLeft size={16} strokeWidth={1.5} />
                            </button>
                            <span className="modal-counter-text">
                                {currentIndex + 1} / {totalProjects}
                            </span>
                            <button
                                className="modal-pager-btn"
                                onClick={handleNext}
                                disabled={!hasNext}
                                title="Project Berikutnya"
                                aria-label="Project berikutnya"
                            >
                                <ChevronRight size={16} strokeWidth={1.5} />
                            </button>
                        </div>

                        <button 
                            className="modal-close-icon-btn"
                            onClick={() => {
                                playClickHaptic(soundEnabled);
                                onClose();
                            }}
                            title="Tutup (Esc)"
                            aria-label="Tutup jendela detail"
                        >
                            <X size={17} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>

                {/* BADAN MODAL */}
                <div className="project-modal-body">
                    <div className="project-modal-identity">
                        <h2 id="project-modal-title" className="project-modal-heading">
                            {project.title}
                        </h2>
                        <p className="project-modal-subtitle">
                            {project.subtitle}
                        </p>
                    </div>

                    <div className="project-modal-url-box">
                        <div className="modal-url-label">
                            <Globe size={13} strokeWidth={1.5} className="text-[var(--blue-4)]" />
                            <span className="modal-url-host">{hostname}</span>
                        </div>
                        <div className="modal-url-full" title={project.url}>
                            {project.url}
                        </div>
                    </div>
                </div>

                {/* FOOTER TOMBOL AKSI */}
                <div className="project-modal-footer">
                    <a 
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="modal-open-action-btn"
                        onClick={() => playClickHaptic(soundEnabled)}
                    >
                        <span>Buka Project</span>
                        <ExternalLink size={15} strokeWidth={1.5} />
                    </a>

                    <button 
                        className="modal-copy-action-btn"
                        onClick={handleCopy}
                        title="Salin Tautan"
                        aria-label="Salin tautan proyek"
                    >
                        {copied ? (
                            <>
                                <Check size={15} strokeWidth={1.5} className="text-[var(--status-online)]" />
                                <span>Tersalin</span>
                            </>
                        ) : (
                            <>
                                <Copy size={15} strokeWidth={1.5} />
                                <span>Salin Link</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
});

export default ProjectModal;
