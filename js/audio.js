/**
 * Pelican Cycling 3D - Procedural Web Audio Engine
 * Zero external audio files, 100% synthesized coastal sounds, music, and SFX
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.ambientGain = null;
    this.isMuted = false;
    this.isPlayingMusic = false;
    this.musicTimer = null;
    this.step = 0;
    this.tempo = 120; // BPM
    this.waveNoiseNode = null;
    this.lastTickTime = 0;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.bgmGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    this.ambientGain.connect(this.masterGain);

    this.startAmbientWaves();
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    if (!this.ctx) this.init();
    this.resume();
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.7, now + 0.1);
    }
    return !this.isMuted;
  }

  startAmbientWaves() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    // LFO for wave swelling
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime); // Wave swell period ~5.5s
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    whiteNoise.connect(filter);
    filter.connect(this.ambientGain);

    whiteNoise.start();
    lfo.start();
  }

  // Realistic Dual-Tone Bicycle Bell (Ding-Ding!)
  playBell() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;

    const chime = (freq1, freq2, startTime, vol = 1.0) => {
      [freq1, freq2].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.4 * vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.9);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(startTime);
        osc.stop(startTime + 0.95);
      });
    };

    chime(1860, 2420, now, 0.9);
    chime(2100, 2750, now + 0.12, 1.0);
  }

  // Pelican Catch & Gulp Fish SFX
  playCatchFish(isGolden = false) {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;

    // 1. Water Splash / Gulp
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.22);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.26);

    // 2. Cheerful Coin / Catch Sparkle
    const notes = isGolden ? [523.25, 659.25, 783.99, 1046.5, 1318.5] : [440, 554.37, 659.25];
    notes.forEach((freq, i) => {
      const noteOsc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      noteOsc.type = 'sine';
      noteOsc.frequency.setValueAtTime(freq, now + 0.05 + i * 0.05);

      noteGain.gain.setValueAtTime(0.25, now + 0.05 + i * 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35 + i * 0.05);

      noteOsc.connect(noteGain);
      noteGain.connect(this.sfxGain);
      noteOsc.start(now + 0.05 + i * 0.05);
      noteOsc.stop(now + 0.4 + i * 0.05);
    });
  }

  // Pedal Mechanical Click
  playPedalTick(speedRatio = 1.0) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    if (now - this.lastTickTime < 0.15 / Math.max(0.4, speedRatio)) return;
    this.lastTickTime = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800 + Math.random() * 200, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.025);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  // Sprint / Boost Whoosh
  playBoostWhoosh() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 0.15);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.4);
    filter.Q.setValueAtTime(2.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
    noise.stop(now + 0.42);
  }

  // Procedural Coastal Chiptune / Synth BGM
  startMusic() {
    if (!this.ctx) this.init();
    this.resume();
    if (this.isPlayingMusic) return;
    this.isPlayingMusic = true;

    // Pentatonic happy coastal progression (C major / A minor breeze)
    const melody = [
      523.25, 0, 587.33, 659.25,  0, 783.99, 659.25, 587.33,
      523.25, 659.25, 783.99, 880.00, 783.99, 0, 659.25, 523.25,
      440.00, 0, 523.25, 659.25,  587.33, 0, 523.25, 440.00,
      392.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.5, 0
    ];

    const bass = [
      130.81, 130.81, 130.81, 130.81, // C3
      164.81, 164.81, 164.81, 164.81, // E3
      174.61, 174.61, 174.61, 174.61, // F3
      196.00, 196.00, 196.00, 196.00  // G3
    ];

    const stepDuration = 60 / this.tempo / 2; // 16th notes
    let noteIdx = 0;

    const playNext = () => {
      if (!this.isPlayingMusic || !this.ctx) return;
      const now = this.ctx.currentTime;

      // Melody note
      const freq = melody[noteIdx % melody.length];
      if (freq > 0 && !this.isMuted) {
        const mOsc = this.ctx.createOscillator();
        const mGain = this.ctx.createGain();
        mOsc.type = 'triangle';
        mOsc.frequency.setValueAtTime(freq, now);

        mGain.gain.setValueAtTime(0.12, now);
        mGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 0.95);

        mOsc.connect(mGain);
        mGain.connect(this.bgmGain);
        mOsc.start(now);
        mOsc.stop(now + stepDuration);
      }

      // Bass note every 2 steps
      if (noteIdx % 2 === 0 && !this.isMuted) {
        const bFreq = bass[(Math.floor(noteIdx / 2)) % bass.length];
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(bFreq, now);

        bGain.gain.setValueAtTime(0.2, now);
        bGain.gain.exponentialRampToValueAtTime(0.005, now + stepDuration * 1.8);

        bOsc.connect(bGain);
        bGain.connect(this.bgmGain);
        bOsc.start(now);
        bOsc.stop(now + stepDuration * 1.9);
      }

      // Snare / Hat click
      if ((noteIdx % 4 === 2) && !this.isMuted) {
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(1400, now);
        clickGain.gain.setValueAtTime(0.02, now);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        clickOsc.connect(clickGain);
        clickGain.connect(this.bgmGain);
        clickOsc.start(now);
        clickOsc.stop(now + 0.045);
      }

      noteIdx++;
      this.musicTimer = setTimeout(playNext, stepDuration * 1000);
    };

    playNext();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  toggleMusic() {
    if (this.isPlayingMusic) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }
}

window.soundEngine = new SoundEngine();
