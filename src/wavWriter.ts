import { writeFileSync } from 'fs';

export function float32ToPCM(buffer: Float32Array, channels = 1): Uint8Array {
  const pcm = new Uint8Array(buffer.length * 2);
  for (let i = 0; i < buffer.length; i++) {
    const sample = Math.max(-1, Math.min(1, buffer[i]));
    const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    pcm[i * 2] = int16 & 0xFF;
    pcm[i * 2 + 1] = (int16 >> 8) & 0xFF;
  }
  return pcm;
}

export function applyEnvelope(buffer: Float32Array, fadeInSec = 0, fadeOutSec = 0, sampleRate = 44100): Float32Array {
  const result = new Float32Array(buffer.length);
  const fadeInSamples = Math.floor(fadeInSec * sampleRate);
  const fadeOutSamples = Math.floor(fadeOutSec * sampleRate);
  
  for (let i = 0; i < buffer.length; i++) {
    let gain = 1;
    
    // Fade in
    if (i < fadeInSamples) {
      gain *= i / fadeInSamples;
    }
    
    // Fade out
    if (i >= buffer.length - fadeOutSamples) {
      const fadeOutProgress = (buffer.length - i) / fadeOutSamples;
      gain *= fadeOutProgress;
    }
    
    result[i] = buffer[i] * gain;
  }
  
  return result;
}

export function convertToStereo(monoBuffer: Float32Array, spread = 0): Float32Array {
  const stereoBuffer = new Float32Array(monoBuffer.length * 2);
  
  for (let i = 0; i < monoBuffer.length; i++) {
    const sample = monoBuffer[i];
    const leftGain = 1 - (spread * 0.5);
    const rightGain = 1 - (spread * 0.5);
    
    stereoBuffer[i * 2] = sample * leftGain;
    stereoBuffer[i * 2 + 1] = sample * rightGain;
  }
  
  return stereoBuffer;
}

export function writeWav({
  data,
  sampleRate,
  outPath,
  channels = 1
}: {
  data: Float32Array;
  sampleRate: number;
  outPath: string;
  channels?: number;
}) {
  const pcmData = float32ToPCM(data, channels);
  const header = Buffer.alloc(44);
  const totalLen = pcmData.length + 44;
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;

  header.write("RIFF", 0);
  header.writeUInt32LE(totalLen - 8, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);  // PCM format
  header.writeUInt16LE(channels, 22);  // Number of channels
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34);  // Bits per sample
  header.write("data", 36);
  header.writeUInt32LE(pcmData.length, 40);

  const wav = Buffer.concat([header, Buffer.from(pcmData)]);
  writeFileSync(outPath, wav);
}

