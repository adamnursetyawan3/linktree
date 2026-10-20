/**
 * Single source of truth for WIB (Asia/Jakarta) clock.
 * Ensures only ONE setInterval runs across all components in the app.
 */

const listeners = new Set();
let timerId = null;
let cachedTime = '';

function formatWib(date = new Date()) {
    return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta'
    });
}

function startTimer() {
    if (timerId !== null) return;
    cachedTime = formatWib();
    timerId = setInterval(() => {
        cachedTime = formatWib();
        listeners.forEach(callback => {
            try {
                callback(cachedTime);
            } catch (err) {
                console.error("WIB clock listener error:", err);
            }
        });
    }, 1000);
}

function stopTimer() {
    if (listeners.size === 0 && timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
}

/**
 * Subscribe to the shared WIB clock.
 * Calls callback immediately with current time, then on every tick.
 * Returns unsubscribe function.
 */
export function subscribeWibClock(callback) {
    if (typeof callback !== 'function') return () => {};
    listeners.add(callback);
    startTimer();
    callback(cachedTime || formatWib());
    return () => {
        listeners.delete(callback);
        stopTimer();
    };
}

export function getCurrentWibString() {
    return cachedTime || formatWib();
}
