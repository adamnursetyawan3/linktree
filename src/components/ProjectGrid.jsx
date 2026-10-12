import React, { memo } from 'react';
import { 
    ArrowUpRight, 
    Globe, 
    ExternalLink, 
    Layers,
    FolderKanban
} from 'lucide-react';
import { settings } from '../settings.js';
import { useReveal } from '../hooks/useReveal.js';
import { playClickHaptic } from '../utils/audioHaptic.js';
import ProjectModal from './ProjectModal.jsx';

// BARIS EDITORIAL PROYEK (TABEL / DAFTAR EDITORIAL TANPA KOTAK KARTU)
const ProjectEditorialRow = memo(({ proj, index, soundEnabled, onOpenModal }) => {
    const num = String(index + 1).padStart(2, '0');

    let domainName = proj.url;
    try {
        domainName = new URL(proj.url).hostname;
    } catch (e) {}

    return (
        <tr
            role="button"
            tabIndex={0}
            className="editorial-project-row"
            onClick={() => {
                playClickHaptic(soundEnabled);
                onOpenModal(index);
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    playClickHaptic(soundEnabled);
                    onOpenModal(index);
                }
            }}
            aria-label={`Buka detail ${proj.title}`}
        >
            {/* 1. NOMOR URUT INDEKS */}
            <td className="editorial-col-num font-mono">
                <span className="editorial-num-accent">{num}</span>
            </td>

            {/* 2. JUDUL DAN SUBTITLE PROYEK */}
            <td className="editorial-col-main">
                <div className="editorial-proj-title-group">
                    <span className="editorial-proj-name">{proj.title}</span>
                    <span className="editorial-proj-tag-inline sm:hidden font-mono text-[11px] text-[var(--blue-4)]">
                        · {proj.tag}
                    </span>
                </div>
                <p className="editorial-proj-desc">{proj.subtitle}</p>
            </td>

            {/* 3. KATEGORI TAG (UNBOXED TEXT DISCIPLINE) */}
            <td className="editorial-col-tag hidden sm:table-cell">
                <span className="font-mono text-xs text-[var(--blue-3)] tracking-wide">
                    {proj.tag}
                </span>
            </td>

            {/* 4. DOMAIN / URL PREVIEW */}
            <td className="editorial-col-domain hidden md:table-cell">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--blue-3)]">
                    <Globe size={11} strokeWidth={1.5} className="text-[var(--blue-4)]" />
                    <span className="truncate max-w-[180px]">{domainName}</span>
                </div>
            </td>

            {/* 5. TOMBOL DETAIL & PANAH */}
            <td className="editorial-col-action text-right">
                <div className="editorial-action-indicator">
                    <span className="hidden lg:inline text-xs font-mono text-[var(--blue-3)] mr-2 group-hover:text-[var(--blue-1)]">
                        Detail
                    </span>
                    <ArrowUpRight size={15} strokeWidth={1.5} className="editorial-arrow-icon" />
                </div>
            </td>
        </tr>
    );
});

export const ProjectGrid = memo(({ 
    soundEnabled, 
    onShowToast, 
    selectedProjectIndex, 
    onSelectProject 
}) => {
    const [sectionRef, isRevealed] = useReveal({ threshold: 0.08 });
    const projects = settings.projects || [];

    const handleOpenModal = (index) => {
        onSelectProject(index);
    };

    const handleCloseModal = () => {
        onSelectProject(null);
    };

    const handlePrevProject = () => {
        if (selectedProjectIndex === null) return;
        const prevIdx = (selectedProjectIndex - 1 + projects.length) % projects.length;
        onSelectProject(prevIdx);
    };

    const handleNextProject = () => {
        if (selectedProjectIndex === null) return;
        const nextIdx = (selectedProjectIndex + 1) % projects.length;
        onSelectProject(nextIdx);
    };

    return (
        <section 
            id="project" 
            ref={sectionRef} 
            className={`editorial-section ${isRevealed ? 'revealed' : ''}`}
            aria-label="Katalog Proyek Terkurasi"
        >
            <div className="section-container">
                {/* HEADER SECTION EDITORIAL */}
                <header className="editorial-section-header">
                    <div className="editorial-kicker-row">
                        <span className="editorial-kicker-num">03</span>
                        <span className="editorial-kicker-slash">/</span>
                        <h2 className="editorial-kicker-title">PROYEK & KARYA REKAYASA</h2>
                    </div>

                    <div className="editorial-header-actions">
                        <span className="text-xs font-mono text-[var(--blue-3)]">
                            {projects.length} REPOSITORY TERVERIFIKASI
                        </span>
                    </div>
                </header>

                {/* TABEL DAFTAR EDITORIAL PROYEK (BUKAN CARD BOX) */}
                <div className="editorial-table-container">
                    <table className="editorial-projects-table">
                        <thead>
                            <tr className="editorial-table-head-row">
                                <th className="editorial-th editorial-col-num">ID</th>
                                <th className="editorial-th editorial-col-main">PROYEK & SPESIFIKASI</th>
                                <th className="editorial-th editorial-col-tag hidden sm:table-cell">KATEGORI</th>
                                <th className="editorial-th editorial-col-domain hidden md:table-cell">DOMAIN</th>
                                <th className="editorial-th editorial-col-action text-right">AKSI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((proj, idx) => (
                                <ProjectEditorialRow
                                    key={proj.id || idx}
                                    proj={proj}
                                    index={idx}
                                    soundEnabled={soundEnabled}
                                    onOpenModal={handleOpenModal}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER NOTE DAFTAR PROYEK */}
                <div className="editorial-section-meta-footer">
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--blue-3)]">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--blue-5)]" />
                        <span>Klik baris proyek untuk membuka lembar spesifikasi & tautan langsung.</span>
                    </div>
                </div>
            </div>

            {/* MODAL SPESIFIKASI PROYEK (DILETAKKAN DI LUAR TABEL) */}
            {selectedProjectIndex !== null && (
                <ProjectModal 
                    project={projects[selectedProjectIndex]}
                    index={selectedProjectIndex}
                    totalProjects={projects.length}
                    isOpen={selectedProjectIndex !== null}
                    onClose={handleCloseModal}
                    onPrev={handlePrevProject}
                    onNext={handleNextProject}
                    soundEnabled={soundEnabled}
                    onShowToast={onShowToast}
                />
            )}
        </section>
    );
});

export default ProjectGrid;
