/**
 * Pacific Northwest Ambient Layers
 * Generates rain, bird sounds, and water effects that synchronize with base noise
 */

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

export interface LayerOptions {
  intensity: number; // 0-1, how prominent the layer is
  variation: number; // 0-1, how much randomness/variation
  seed?: number;
}

export interface AmbientLayerResult {
  name: string;
  buffer: Float32Array;
  description: string;
}

/**
 * Generate Pacific Northwest rain layer
 * Creates droplet impacts with varying intensity based on base noise
 */
export function generateRainLayer(
  baseNoise: Float32Array,
  sampleRate: number,
  options: LayerOptions
): AmbientLayerResult {
  const rng = new SeededRandom(options.seed);
  const buffer = new Float32Array(baseNoise.length);
  
  // Rain parameters
  const dropletRate = 20 + (options.intensity * 80); // 20-100 droplets per second
  const dropletDuration = 0.01; // 10ms droplets
  const dropletSamples = Math.floor(dropletDuration * sampleRate);
  
  for (let i = 0; i < buffer.length; i++) {
    // Use base noise to modulate rain intensity
    const noiseIntensity = Math.abs(baseNoise[i]);
    const rainChance = (dropletRate / sampleRate) * (1 + noiseIntensity * options.variation);
    
    if (rng.random() < rainChance) {
      // Generate a droplet impact
      const dropletIntensity = 0.1 + (rng.random() * 0.4); // Variable droplet size
      const frequency = 2000 + (rng.random() * 3000); // 2-5kHz impact frequency
      
      // Create short droplet sound with smoother envelope
      for (let j = 0; j < dropletSamples && (i + j) < buffer.length; j++) {
        const t = j / sampleRate;
        const envelope = Math.exp(-t * 150) * (1 - t / dropletDuration); // Smoother decay
        const oscillation = Math.sin(2 * Math.PI * frequency * t);
        const noise = (rng.random() * 2 - 1) * 0.2;
        
        buffer[i + j] += (oscillation * 0.8 + noise * 0.2) * envelope * dropletIntensity * options.intensity;
      }
    }
  }
  
  return {
    name: 'pacific_rain',
    buffer,
    description: `Pacific Northwest rain (intensity: ${options.intensity.toFixed(2)})`
  };
}

/**
 * Generate Pacific Northwest bird sounds layer
 * Creates various bird calls synchronized with base noise patterns
 */
export function generateBirdLayer(
  baseNoise: Float32Array,
  sampleRate: number,
  options: LayerOptions
): AmbientLayerResult {
  const rng = new SeededRandom(options.seed);
  const buffer = new Float32Array(baseNoise.length);
  
  // Bird call parameters
  const callRate = 0.5 + (options.intensity * 2); // 0.5-2.5 calls per second
  const callDuration = 0.2 + (rng.random() * 0.8); // 200-1000ms calls
  
  for (let i = 0; i < buffer.length; i++) {
    const t = i / sampleRate;
    const noiseLevel = Math.abs(baseNoise[i]);
    
    // More bird activity during certain noise patterns
    const callChance = (callRate / sampleRate) * (1 + noiseLevel * options.variation * 2);
    
    if (rng.random() < callChance) {
      // Generate different types of Pacific Northwest bird calls
      const birdType = rng.random();
      let frequency, modulation, callLength;
      
      if (birdType < 0.3) {
        // Robin-like warble
        frequency = 2000 + (rng.random() * 1000);
        modulation = 200;
        callLength = 0.3;
      } else if (birdType < 0.6) {
        // Crow-like caw
        frequency = 400 + (rng.random() * 300);
        modulation = 50;
        callLength = 0.15;
      } else {
        // Woodpecker-like trill
        frequency = 1500 + (rng.random() * 2000);
        modulation = 400;
        callLength = 0.1;
      }
      
      const callSamples = Math.floor(callLength * sampleRate);
      
      for (let j = 0; j < callSamples && (i + j) < buffer.length; j++) {
        const callTime = j / sampleRate;
        const envelope = Math.sin(Math.PI * callTime / callLength); // Bell curve envelope
        // Reduce modulation frequency to avoid rapid warbling
        const freq = frequency + Math.sin(2 * Math.PI * 3 * callTime) * modulation;
        const signal = Math.sin(2 * Math.PI * freq * callTime);
        
        buffer[i + j] += signal * envelope * 0.3 * options.intensity;
      }
      
      // Skip ahead to avoid overlapping calls
      i += callSamples;
    }
  }
  
  return {
    name: 'pacific_birds',
    buffer,
    description: `Pacific Northwest birds (intensity: ${options.intensity.toFixed(2)})`
  };
}

/**
 * Generate running water layer
 * Creates flowing water sounds that follow base noise dynamics
 */
export function generateWaterLayer(
  baseNoise: Float32Array,
  sampleRate: number,
  options: LayerOptions
): AmbientLayerResult {
  const rng = new SeededRandom(options.seed);
  const buffer = new Float32Array(baseNoise.length);
  
  // Water flow parameters
  const baseFlow = 0.3; // Base water flow intensity
  const bubbleRate = 5 + (options.intensity * 15); // 5-20 bubbles per second
  
  // Use a proper lowpass filter state instead of feedback
  let filterState = 0;
  
  for (let i = 0; i < buffer.length; i++) {
    const noiseLevel = Math.abs(baseNoise[i]);
    
    // Generate continuous water flow (filtered noise)
    const rawNoise = rng.random() * 2 - 1;
    // Apply proper lowpass filter without feedback oscillation
    filterState = filterState * 0.95 + rawNoise * 0.05;
    
    // Modulate water intensity with base noise
    const flowIntensity = baseFlow + (noiseLevel * options.variation * 0.5);
    buffer[i] = filterState * flowIntensity * options.intensity * 0.4;
    
    // Add occasional bubbles/splashes
    const bubbleChance = bubbleRate / sampleRate;
    if (rng.random() < bubbleChance) {
      const bubbleFreq = 800 + (rng.random() * 1200); // 800-2000Hz bubbles
      const bubbleDuration = 0.05 + (rng.random() * 0.1); // 50-150ms
      const bubbleSamples = Math.floor(bubbleDuration * sampleRate);
      
      for (let j = 0; j < bubbleSamples && (i + j) < buffer.length; j++) {
        const bubbleTime = j / sampleRate;
        const bubbleEnv = Math.exp(-bubbleTime * 10); // Quick decay
        const bubbleSound = Math.sin(2 * Math.PI * bubbleFreq * bubbleTime);
        
        buffer[i + j] += bubbleSound * bubbleEnv * 0.2 * options.intensity;
      }
    }
  }
  
  return {
    name: 'running_water',
    buffer,
    description: `Running water (intensity: ${options.intensity.toFixed(2)})`
  };
}

/**
 * Mix multiple ambient layers with the base noise
 */
export function mixAmbientLayers(
  baseNoise: Float32Array,
  layers: AmbientLayerResult[],
  baseLevel = 0.7,
  layerLevel = 0.3
): Float32Array {
  const mixed = new Float32Array(baseNoise.length);
  
  // Add base noise
  for (let i = 0; i < baseNoise.length; i++) {
    mixed[i] = baseNoise[i] * baseLevel;
  }
  
  // Add each layer
  layers.forEach(layer => {
    const layerWeight = layerLevel / layers.length;
    for (let i = 0; i < mixed.length; i++) {
      mixed[i] += layer.buffer[i] * layerWeight;
    }
  });
  
  // Soft limiting to prevent clipping without pumping
  for (let i = 0; i < mixed.length; i++) {
    // Soft tanh limiter instead of hard normalization
    if (Math.abs(mixed[i]) > 0.95) {
      mixed[i] = mixed[i] > 0 ? Math.tanh(mixed[i]) : -Math.tanh(-mixed[i]);
    }
  }
  
  return mixed;
}