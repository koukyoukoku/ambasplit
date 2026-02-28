class AudioEngine {
  constructor() {
    this.audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);

    this.stems = [];
    this.isPlaying = false;
    this.startTime = 0;
    this.pauseTime = 0;
  }

  async loadStem(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    this.stems.push({
      buffer: audioBuffer,
      gainNode: this.audioContext.createGain(),
      source: null,
    });
  }

  createSources(offset = 0) {
    this.stems.forEach((stem) => {
      const source = this.audioContext.createBufferSource();
      source.buffer = stem.buffer;

      source.connect(stem.gainNode);
      stem.gainNode.connect(this.masterGain);

      stem.source = source;
    });
  }

  play() {
    if (this.isPlaying) return;

    this.createSources(this.pauseTime);

    const now = this.audioContext.currentTime;
    this.startTime = now - this.pauseTime;

    this.stems.forEach((stem) => {
      stem.source.start(now, this.pauseTime);
    });

    this.isPlaying = true;
  }

  pause() {
    if (!this.isPlaying) return;

    const now = this.audioContext.currentTime;
    this.pauseTime = now - this.startTime;

    this.stems.forEach((stem) => {
      if (stem.source) stem.source.stop();
    });

    this.isPlaying = false;
  }

  setVolume(index, value) {
    this.stems[index].gainNode.gain.value = value;
  }

  toggleMute(index) {
    const stem = this.stems[index];
    stem.isMuted = !stem.isMuted;

    stem.gainNode.gain.value = stem.isMuted ? 0 : 1;
  }

  solo(index) {
    this.stems.forEach((stem, i) => {
      stem.gainNode.gain.value = i === index ? 1 : 0;
    });
  }
}

export default AudioEngine;
