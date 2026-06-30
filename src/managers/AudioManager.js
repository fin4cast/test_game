class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.enabled = false;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  _playTone(freq, duration, type = 'sine', volume = 0.15) {
    if (!this.enabled || !this.ctx) return;
    try {
      this.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (_) {}
  }

  _playNoise(duration, volume = 0.08) {
    if (!this.enabled || !this.ctx) return;
    try {
      this.resume();
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      source.connect(gain);
      gain.connect(this.ctx.destination);
      source.start();
    } catch (_) {}
  }

  _playSweep(startFreq, endFreq, duration, type = 'sine', volume = 0.12) {
    if (!this.enabled || !this.ctx) return;
    try {
      this.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (_) {}
  }

  jump() { this._playSweep(200, 600, 0.15, 'square', 0.08); }
  shoot() { this._playSweep(800, 400, 0.1, 'sine', 0.06); }
  hit() { this._playNoise(0.12, 0.1); }
  coin() {
    this._playTone(1000, 0.06, 'sine', 0.08);
    setTimeout(() => this._playTone(1500, 0.08, 'sine', 0.08), 60);
  }
  heal() {
    this._playTone(400, 0.08, 'sine', 0.07);
    setTimeout(() => this._playTone(800, 0.08, 'sine', 0.07), 80);
    setTimeout(() => this._playTone(1200, 0.1, 'sine', 0.07), 160);
  }
  death() { this._playSweep(400, 80, 0.5, 'sawtooth', 0.1); }
  dash() { this._playSweep(300, 800, 0.2, 'square', 0.05); }
  bossHit() { this._playTone(100, 0.12, 'square', 0.12); }
  enemyDie() { this._playSweep(300, 80, 0.15, 'square', 0.06); }
  victory() {
    this._playTone(523, 0.15, 'sine', 0.1);
    setTimeout(() => this._playTone(659, 0.15, 'sine', 0.1), 150);
    setTimeout(() => this._playTone(784, 0.2, 'sine', 0.1), 300);
  }
  buttonHover() { this._playTone(600, 0.04, 'sine', 0.04); }
  buttonClick() { this._playTone(800, 0.06, 'sine', 0.06); }
}

const audio = new AudioManager();
export default audio;
