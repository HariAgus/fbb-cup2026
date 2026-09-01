// Web Audio API Sound Synthesizer for Doorprize Lucky Draw
// Zero-dependency, lightweight, and works offline in any browser

class DoorprizeAudioController {
  constructor() {
    this.audioCtx = null;
    this.muted = false;
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // Realistic mechanical click / tick sound as wheel passes pegs
  playTick(pitchRatio = 1) {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580 * pitchRatio, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch (e) {
      // Ignore audio failure
    }
  }

  // Celebratory victory fanfare chime when winner is announced
  playFanfare() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const notes = [
        { freq: 523.25, time: 0, duration: 0.12 },    // C5
        { freq: 659.25, time: 0.12, duration: 0.12 }, // E5
        { freq: 783.99, time: 0.24, duration: 0.14 }, // G5
        { freq: 1046.50, time: 0.38, duration: 0.35 },// C6
        { freq: 880.00, time: 0.75, duration: 0.12 }, // A5
        { freq: 1046.50, time: 0.88, duration: 0.55 } // C6 High
      ];

      notes.forEach(({ freq, time, duration }) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + time);

        gain.gain.setValueAtTime(0.28, this.audioCtx.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + time + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(this.audioCtx.currentTime + time);
        osc.stop(this.audioCtx.currentTime + time + duration);
      });
    } catch (e) {
      // Ignore audio failure
    }
  }
}

export const doorprizeAudio = new DoorprizeAudioController();
