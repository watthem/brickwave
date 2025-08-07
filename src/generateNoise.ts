class SeededRandom {
  private seed: number;
  
  constructor(seed?: number) {
    this.seed = seed ?? Math.floor(Math.random() * 0x7fffffff);
  }
  
  random(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
}

export function generateNoise(
  type: 'white' | 'pink' | 'brown',
  duration: number,
  sampleRate = 44100,
  seed?: number
): Float32Array {
  const length = Math.floor(duration * sampleRate);
  const buffer = new Float32Array(length);
  const rng = new SeededRandom(seed);

  if (type === 'white') {
    for (let i = 0; i < length; i++) {
      buffer[i] = rng.random() * 2 - 1;
    }
  } else if (type === 'brown') {
    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      const white = rng.random() * 2 - 1;
      buffer[i] = lastOut = Math.max(-1, Math.min(1, (lastOut + (0.02 * white)) * 0.98));
    }
  } else if (type === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = rng.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      buffer[i] = pink * 0.11;
    }
  } else {
    throw new Error(`Unknown noise type: ${type}`);
  }

  return buffer;
}

