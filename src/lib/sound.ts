import { useSettingsStore } from '../state/useSettingsStore'
import type { Rarity } from '../types'

let audioCtx: AudioContext | null = null

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume()
  }
  return audioCtx
}

function soundEnabled(): boolean {
  return useSettingsStore.getState().settings.soundEnabled
}

function hapticsEnabled(): boolean {
  return useSettingsStore.getState().settings.hapticsEnabled
}

export function vibrate(pattern: number | number[]): void {
  if (!hapticsEnabled()) return
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

function envelopeGain(ctx: AudioContext, attack: number, decay: number, peak: number, delay = 0): GainNode {
  const gain = ctx.createGain()
  const start = ctx.currentTime + delay
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(peak, start + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay)
  gain.connect(ctx.destination)
  return gain
}

function tone(freq: number, duration: number, type: OscillatorType, peak: number, delay = 0): void {
  const ctx = getContext()
  const osc = ctx.createOscillator()
  osc.type = type
  osc.frequency.value = freq
  const gain = envelopeGain(ctx, 0.008, duration, peak, delay)
  osc.connect(gain)
  osc.start(ctx.currentTime + delay)
  osc.stop(ctx.currentTime + delay + duration + 0.05)
}

// Layers a few detuned sawtooth oscillators for a brighter, brassier timbre than a plain tone.
function brassNote(freq: number, duration: number, peak: number, delay = 0): void {
  const ctx = getContext()
  const gain = envelopeGain(ctx, 0.015, duration, peak, delay)
  for (const detune of [-6, 0, 6]) {
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = freq
    osc.detune.value = detune
    osc.connect(gain)
    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + duration + 0.05)
  }
}

function noiseBurst(
  duration: number,
  filterType: BiquadFilterType,
  freqFrom: number,
  freqTo: number,
  peak: number,
  delay = 0,
): void {
  const ctx = getContext()
  const start = ctx.currentTime + delay
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration))
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = filterType
  filter.frequency.setValueAtTime(freqFrom, start)
  filter.frequency.exponentialRampToValueAtTime(freqTo, start + duration)
  filter.Q.value = 0.9

  const gain = envelopeGain(ctx, 0.005, duration, peak, delay)
  noise.connect(filter)
  filter.connect(gain)
  noise.start(start)
}

export function playRustle(): void {
  if (!soundEnabled()) return
  const crinkles = 4
  for (let i = 0; i < crinkles; i++) {
    const delay = i * 0.045 + Math.random() * 0.02
    const freqFrom = 1200 + Math.random() * 900
    noiseBurst(0.09, 'bandpass', freqFrom, freqFrom + 900, 0.07, delay)
  }
}

export function playTabRip(): void {
  if (!soundEnabled()) return
  noiseBurst(0.32, 'highpass', 400, 3200, 0.16)
}

export function playWrapperRip(): void {
  if (!soundEnabled()) return
  noiseBurst(0.22, 'highpass', 700, 4500, 0.14)
}

export function playCardFlip(): void {
  if (!soundEnabled()) return
  noiseBurst(0.1, 'bandpass', 1800, 2400, 0.08)
  tone(660, 0.08, 'triangle', 0.06, 0.02)
}

export function playDing(): void {
  if (!soundEnabled()) return
  tone(1318.51, 0.5, 'sine', 0.16)
  tone(2637.02, 0.35, 'sine', 0.06, 0.01)
}

type RevealStep = { freq: number; duration: number; delay: number; peak: number; brass?: boolean }

const REVEAL_SEQUENCES: Record<Rarity, RevealStep[]> = {
  common: [{ freq: 523.25, duration: 0.4, delay: 0, peak: 0.14 }],
  rare: [
    { freq: 523.25, duration: 0.45, delay: 0, peak: 0.14 },
    { freq: 659.25, duration: 0.45, delay: 0.09, peak: 0.14 },
    { freq: 783.99, duration: 0.55, delay: 0.18, peak: 0.15 },
  ],
  'ultra-rare': [
    { freq: 523.25, duration: 0.3, delay: 0, peak: 0.17, brass: true },
    { freq: 659.25, duration: 0.3, delay: 0.1, peak: 0.17, brass: true },
    { freq: 783.99, duration: 0.3, delay: 0.2, peak: 0.17, brass: true },
    { freq: 1046.5, duration: 0.5, delay: 0.3, peak: 0.19, brass: true },
  ],
  legendary: [
    { freq: 261.63, duration: 0.22, delay: 0, peak: 0.15, brass: true },
    { freq: 523.25, duration: 0.26, delay: 0.11, peak: 0.18, brass: true },
    { freq: 659.25, duration: 0.26, delay: 0.21, peak: 0.18, brass: true },
    { freq: 783.99, duration: 0.26, delay: 0.31, peak: 0.19, brass: true },
    { freq: 1046.5, duration: 0.7, delay: 0.41, peak: 0.22, brass: true },
  ],
}

export function playReveal(rarity: Rarity): void {
  if (!soundEnabled()) return
  for (const step of REVEAL_SEQUENCES[rarity]) {
    if (step.brass) brassNote(step.freq, step.duration, step.peak, step.delay)
    else tone(step.freq, step.duration, 'triangle', step.peak, step.delay)
  }
}

type MusicNodes = {
  oscillators: OscillatorNode[]
  masterGain: GainNode
  lfo: OscillatorNode
  lfoGain: GainNode
}

let musicNodes: MusicNodes | null = null

const PAD_FREQS = [130.81, 164.81, 196.0, 261.63]

export function startBackgroundMusic(): void {
  if (musicNodes) return
  const ctx = getContext()

  const masterGain = ctx.createGain()
  masterGain.gain.setValueAtTime(0, ctx.currentTime)
  masterGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.2)
  masterGain.connect(ctx.destination)

  const oscillators = PAD_FREQS.map((freq, i) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    osc.detune.value = i % 2 === 0 ? -4 : 4
    osc.connect(masterGain)
    osc.start()
    return osc
  })

  const lfo = ctx.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 0.06
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 0.018
  lfo.connect(lfoGain)
  lfoGain.connect(masterGain.gain)
  lfo.start()

  musicNodes = { oscillators, masterGain, lfo, lfoGain }
}

export function stopBackgroundMusic(): void {
  if (!musicNodes) return
  const { oscillators, masterGain, lfo } = musicNodes
  const ctx = getContext()
  masterGain.gain.cancelScheduledValues(ctx.currentTime)
  masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime)
  masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)

  window.setTimeout(() => {
    oscillators.forEach((osc) => osc.stop())
    lfo.stop()
  }, 550)

  musicNodes = null
}

export function isMusicPlaying(): boolean {
  return musicNodes !== null
}
