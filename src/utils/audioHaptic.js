// MODUL HAPTIC AUDIO TUNGGAL (HEMAT MEMORI & BEBAS MEMORY LEAK)
let sharedHapticCtx = null;

export const playClickHaptic = (enabled) => {
    if (!enabled || typeof window === 'undefined') return;
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!sharedHapticCtx || sharedHapticCtx.state === 'closed') {
            sharedHapticCtx = new AudioCtx();
        }
        if (sharedHapticCtx.state === 'suspended') {
            sharedHapticCtx.resume().catch(() => {});
        }
        const osc = sharedHapticCtx.createOscillator();
        const gain = sharedHapticCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, sharedHapticCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, sharedHapticCtx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.04, sharedHapticCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, sharedHapticCtx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(sharedHapticCtx.destination);
        osc.start();
        osc.stop(sharedHapticCtx.currentTime + 0.03);
    } catch (e) {}
};
