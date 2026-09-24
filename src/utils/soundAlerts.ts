/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Synthesized audio feedback using standard browser Web Audio API & SpeechSynthesis
export function playAlertChime(type: 'critical' | 'warning' | 'info' = 'warning') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    if (type === 'critical') {
      // 3-tone urgency chime: F5 -> A5 -> C6
      osc.frequency.setValueAtTime(698.46, now);
      osc.frequency.setValueAtTime(880.00, now + 0.12);
      osc.frequency.setValueAtTime(1046.50, now + 0.24);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } else {
      // 2-tone alert chime: E5 -> B5
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.setValueAtTime(987.77, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch {
    // Browsers require prior interaction to play audio; fail silently if not allowed
  }
}

export function speakAlertWarning(title: string, recommendation?: string) {
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const cleanTitle = title.replace(/[^\w\s.,%°-]/g, '');
      const cleanRec = recommendation ? recommendation.replace(/[^\w\s.,%°-]/g, '') : '';
      const textToSpeak = `NagarShield Warning: ${cleanTitle}. ${cleanRec}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  } catch {
    // Speech synthesis unavailable or permission blocked; safe ignore
  }
}
