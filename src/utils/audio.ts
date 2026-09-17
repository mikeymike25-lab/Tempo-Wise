/**
 * Audio & Haptic notification utility using Web Audio API.
 * Synthesizes a gentle, harmonic chime without needing external sound files.
 */

export const playSessionCompletionSound = (): void => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic chords (C5, G5, C6) for a soothing, uplifting chime
    const frequencies = [523.25, 659.25, 783.99, 1046.50];

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      // Attack and gentle decay
      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, now + index * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 1.3);
    });
  } catch (err) {
    console.warn('Audio playback not supported or blocked by browser policy', err);
  }

  // Trigger device vibration if available
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 300]);
    }
  } catch {
    // Ignore vibration failures
  }
};
