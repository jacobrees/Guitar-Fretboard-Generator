const tonePresets = Object.freeze({
  clean: {
    fundamentalType: "triangle",
    harmonicType: "sawtooth",
    harmonicMix: 0.18,
    attackGain: 0.22,
    sustainGain: 0.17,
    outputGain: 0.6,
    drive: 6,
    pickGain: 0.12,
    pickQ: 1.6,
    attackTime: 0.006,
    decayTime: 0.14,
    toneFrequency: 3600,
    cabinetFrequency: 2800,
    presenceGain: 1.5,
    bodyGain: 3.2,
  },
  overdriven: {
    fundamentalType: "triangle",
    harmonicType: "square",
    harmonicMix: 0.22,
    attackGain: 0.2,
    sustainGain: 0.18,
    outputGain: 0.5,
    drive: 24,
    pickGain: 0.09,
    pickQ: 1.8,
    attackTime: 0.005,
    decayTime: 0.11,
    toneFrequency: 2600,
    cabinetFrequency: 2100,
    presenceGain: 2.1,
    bodyGain: 2.7,
  },
  distorted: {
    fundamentalType: "sawtooth",
    harmonicType: "square",
    harmonicMix: 0.2,
    attackGain: 0.18,
    sustainGain: 0.16,
    outputGain: 0.4,
    drive: 54,
    pickGain: 0.06,
    pickQ: 2,
    attackTime: 0.004,
    decayTime: 0.09,
    toneFrequency: 1900,
    cabinetFrequency: 1550,
    presenceGain: 1.3,
    bodyGain: 2.2,
  },
});

const clamp = (value, minValue, maxValue) =>
  Math.min(Math.max(value, minValue), maxValue);

const getAudioContextConstructor = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.AudioContext || window.webkitAudioContext || null;
};

const midiNumberToFrequency = (midiNumber) =>
  440 * 2 ** ((midiNumber - 69) / 12);

class GuitarPlaybackEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.masterVolume = 0.7;
    this.compressor = null;
    this.distortionCurves = new Map();
    this.noiseBuffer = null;
    this.activeVoices = new Map();
  }

  isSupported() {
    return Boolean(getAudioContextConstructor());
  }

  async ensureReady() {
    if (!this.isSupported()) {
      return false;
    }

    if (!this.audioContext) {
      const AudioContextConstructor = getAudioContextConstructor();

      this.audioContext = new AudioContextConstructor();
      this.compressor = this.audioContext.createDynamicsCompressor();
      this.compressor.threshold.value = -18;
      this.compressor.knee.value = 12;
      this.compressor.ratio.value = 3;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.2;

      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.getMasterGainValue();

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);
    }

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    return true;
  }

  getMasterGainValue() {
    return Math.pow(clamp(this.masterVolume, 0, 1), 1.35) * 0.45;
  }

  setMasterVolume(volumeRatio) {
    this.masterVolume = clamp(volumeRatio, 0, 1);

    if (!this.masterGain || !this.audioContext) {
      return;
    }

    const now = this.audioContext.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(this.getMasterGainValue(), now, 0.02);
  }

  getDistortionCurve(amount) {
    if (this.distortionCurves.has(amount)) {
      return this.distortionCurves.get(amount);
    }

    const sampleCount = 44_100;
    const curve = new Float32Array(sampleCount);
    const k = clamp(amount, 0, 100);
    const normalizer = Math.PI + k;

    for (let index = 0; index < sampleCount; index += 1) {
      const x = (index * 2) / sampleCount - 1;
      curve[index] = ((3 + k) * x * Math.PI) / (normalizer + k * Math.abs(x));
    }

    this.distortionCurves.set(amount, curve);

    return curve;
  }

  getNoiseBuffer() {
    if (!this.audioContext) {
      return null;
    }

    if (this.noiseBuffer) {
      return this.noiseBuffer;
    }

    const bufferLength = Math.round(this.audioContext.sampleRate * 0.06);
    const buffer = this.audioContext.createBuffer(
      1,
      bufferLength,
      this.audioContext.sampleRate,
    );
    const channelData = buffer.getChannelData(0);

    for (let index = 0; index < bufferLength; index += 1) {
      channelData[index] = Math.random() * 2 - 1;
    }

    this.noiseBuffer = buffer;

    return buffer;
  }

  getScheduledStartTime(leadTimeSeconds = 0.005) {
    if (!this.audioContext) {
      return null;
    }

    return this.audioContext.currentTime + leadTimeSeconds;
  }

  async playVoice({
    voiceId,
    midiNumber,
    tone = "overdriven",
    stringPosition = 1,
    stringCount = 6,
    startTime = null,
    onEnded,
  }) {
    const isReady = await this.ensureReady();

    if (!isReady) {
      return false;
    }

    const context = this.audioContext;
    const preset = tonePresets[tone] ?? tonePresets.overdriven;
    const frequency = midiNumberToFrequency(midiNumber);
    const now = Math.max(
      startTime ?? this.getScheduledStartTime(),
      context.currentTime + 0.001,
    );
    const voiceGain = context.createGain();
    const inputGain = context.createGain();
    const highpassFilter = context.createBiquadFilter();
    const bodyFilter = context.createBiquadFilter();
    const toneFilter = context.createBiquadFilter();
    const presenceFilter = context.createBiquadFilter();
    const driveNode = context.createWaveShaper();
    const cabinetFilter = context.createBiquadFilter();
    const stereoPanner = context.createStereoPanner();
    const fundamentalOscillator = context.createOscillator();
    const harmonicOscillator = context.createOscillator();
    const harmonicGain = context.createGain();
    const noiseSource = context.createBufferSource();
    const noiseFilter = context.createBiquadFilter();
    const noiseGain = context.createGain();
    const panPosition =
      stringCount <= 1
        ? 0
        : ((stringPosition - 1) / (stringCount - 1) - 0.5) * 0.28;

    inputGain.gain.value = 1;
    voiceGain.gain.setValueAtTime(0.0001, now);

    highpassFilter.type = "highpass";
    highpassFilter.frequency.value = 75;
    highpassFilter.Q.value = 0.8;

    bodyFilter.type = "peaking";
    bodyFilter.frequency.value = 220;
    bodyFilter.Q.value = 0.9;
    bodyFilter.gain.value = preset.bodyGain;

    toneFilter.type = "lowpass";
    toneFilter.frequency.setValueAtTime(preset.toneFrequency * 1.45, now);
    toneFilter.frequency.exponentialRampToValueAtTime(
      preset.toneFrequency,
      now + 0.16,
    );
    toneFilter.Q.value = 0.6;

    presenceFilter.type = "peaking";
    presenceFilter.frequency.value = 1850;
    presenceFilter.Q.value = 0.7;
    presenceFilter.gain.value = preset.presenceGain;

    driveNode.curve = this.getDistortionCurve(preset.drive);
    driveNode.oversample = "4x";

    cabinetFilter.type = "lowpass";
    cabinetFilter.frequency.value = preset.cabinetFrequency;
    cabinetFilter.Q.value = 0.5;

    stereoPanner.pan.value = panPosition;

    fundamentalOscillator.type = preset.fundamentalType;
    fundamentalOscillator.frequency.value = frequency;
    fundamentalOscillator.detune.value = -1.5;

    harmonicOscillator.type = preset.harmonicType;
    harmonicOscillator.frequency.value = frequency * 2;
    harmonicOscillator.detune.value = 1.5;
    harmonicGain.gain.value = preset.harmonicMix;

    noiseSource.buffer = this.getNoiseBuffer();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = clamp(frequency * 7, 1200, 4200);
    noiseFilter.Q.value = preset.pickQ;
    noiseGain.gain.setValueAtTime(preset.pickGain, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

    fundamentalOscillator.connect(inputGain);
    harmonicOscillator.connect(harmonicGain);
    harmonicGain.connect(inputGain);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(inputGain);

    inputGain.connect(highpassFilter);
    highpassFilter.connect(bodyFilter);
    bodyFilter.connect(toneFilter);
    toneFilter.connect(presenceFilter);
    presenceFilter.connect(driveNode);
    driveNode.connect(cabinetFilter);
    cabinetFilter.connect(voiceGain);
    voiceGain.connect(stereoPanner);
    stereoPanner.connect(this.compressor);

    voiceGain.gain.linearRampToValueAtTime(
      preset.attackGain,
      now + preset.attackTime,
    );
    voiceGain.gain.exponentialRampToValueAtTime(
      preset.sustainGain,
      now + preset.attackTime + preset.decayTime,
    );

    fundamentalOscillator.start(now);
    harmonicOscillator.start(now);
    noiseSource.start(now);
    noiseSource.stop(now + 0.06);

    const voice = {
      voiceId,
      context,
      envelopeGain: voiceGain,
      nodes: [
        inputGain,
        highpassFilter,
        bodyFilter,
        toneFilter,
        presenceFilter,
        driveNode,
        cabinetFilter,
        voiceGain,
        stereoPanner,
        harmonicGain,
        noiseFilter,
        noiseGain,
      ],
      sources: [fundamentalOscillator, harmonicOscillator, noiseSource],
      cleanupTimeoutId: null,
      onEnded,
    };

    this.activeVoices.set(voiceId, voice);

    return true;
  }

  scheduleVoiceStop(voiceId, stopTime) {
    const voice = this.activeVoices.get(voiceId);

    if (!voice) {
      return;
    }

    if (voice.cleanupTimeoutId) {
      window.clearTimeout(voice.cleanupTimeoutId);
    }

    for (const source of voice.sources) {
      try {
        source.stop(stopTime + 0.02);
      } catch {
        // Ignore sources that have already been scheduled to stop.
      }
    }

    const cleanupDelayMs =
      Math.max(stopTime - voice.context.currentTime, 0) * 1000 + 120;

    voice.cleanupTimeoutId = window.setTimeout(() => {
      this.destroyVoice(voiceId);
    }, cleanupDelayMs);
  }

  stopVoice(voiceId, { releaseMs = 90 } = {}) {
    const voice = this.activeVoices.get(voiceId);

    if (!voice) {
      return;
    }

    const now = voice.context.currentTime;

    if (voice.cleanupTimeoutId) {
      window.clearTimeout(voice.cleanupTimeoutId);
    }

    voice.envelopeGain.gain.cancelScheduledValues(now);
    voice.envelopeGain.gain.setTargetAtTime(
      0.0001,
      now,
      Math.max(releaseMs / 1000 / 4, 0.015),
    );

    this.scheduleVoiceStop(voiceId, now + Math.max(releaseMs / 1000, 0.06));
  }

  stopAll({ releaseMs = 90 } = {}) {
    for (const voiceId of this.activeVoices.keys()) {
      this.stopVoice(voiceId, { releaseMs });
    }
  }

  destroyVoice(voiceId) {
    const voice = this.activeVoices.get(voiceId);

    if (!voice) {
      return;
    }

    this.activeVoices.delete(voiceId);

    if (voice.cleanupTimeoutId) {
      window.clearTimeout(voice.cleanupTimeoutId);
    }

    for (const source of voice.sources) {
      try {
        source.disconnect();
      } catch {
        // Ignore sources that have already been disconnected.
      }
    }

    for (const node of voice.nodes) {
      try {
        node.disconnect();
      } catch {
        // Ignore nodes that have already been disconnected.
      }
    }

    voice.onEnded?.();
  }
}

export const guitarPlaybackEngine = new GuitarPlaybackEngine();
