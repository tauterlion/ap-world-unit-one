// Original synthesized cues. No recordings, samples, music, or external assets.
export class SoundStage {
  constructor(enabled = true) { this.enabled = enabled; this.context = null; }
  unlock() {
    if (!this.enabled) return;
    try {
      const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AudioContext) return;
      this.context ||= new AudioContext();
      if (this.context.state === 'suspended') this.context.resume().catch(() => {});
    } catch { /* Audio is optional; studying never depends on it. */ }
  }
  play(kind, index = 0) {
    if (!this.enabled) return;
    this.unlock();
    if (!this.context) return;
    if (this.context.state === 'suspended') {
      this.context.resume().then(() => { if (this.enabled && this.context.state === 'running') this.play(kind,index); }).catch(() => {});
      return;
    }
    if (this.context.state !== 'running') return;
    const cues = {
      menu: [392, 523], open: [196, 294, 392, 587], category: [330 + index * 55, 495 + index * 55],
      tile: [262, 524], question: [196, 294], reveal: [330, 440, 660],
      correct: [392, 494, 587], incorrect: [330, 294], score: [784, 988],
      complete: [262, 330, 392, 523, 659, 784], results: [392, 523, 659], undo: [392, 330]
    };
    (cues[kind] || cues.menu).forEach((frequency, i) => {
      const start = this.context.currentTime + i * 0.07;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.07, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
      oscillator.connect(gain); gain.connect(this.context.destination);
      oscillator.start(start); oscillator.stop(start + 0.24);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
  }
}
