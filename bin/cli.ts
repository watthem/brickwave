#!/usr/bin/env node
import { Command } from 'commander';
import { generateNoise } from '../src/generateNoise.js';
import { writeWav, applyEnvelope, convertToStereo } from '../src/wavWriter.js';
import { generateRainLayer, generateBirdLayer, generateWaterLayer, mixAmbientLayers, LayerOptions } from '../src/ambientLayers.js';
const VERSION = '0.1.0';
const program = new Command();

program
  .name('brickwave')
  .description('🎵 Offline deterministic noise generator for DSP devs, AI researchers, and sound designers')
  .version(VERSION)
  .option('--noise <type>', 'Noise type: white, pink, or brown')
  .option('--duration <seconds>', 'Duration in seconds', parseFloat)
  .option('--samplerate <rate>', 'Sample rate in Hz', (val) => parseInt(val) || 44100, 44100)
  .option('--out <path>', 'Output .wav file path')
  .option('--seed <number>', 'Seed for deterministic generation', parseInt)
  .option('--stereo', 'Generate stereo output')
  .option('--fade-in <seconds>', 'Fade in duration in seconds', parseFloat, 0)
  .option('--fade-out <seconds>', 'Fade out duration in seconds', parseFloat, 0)
  .option('--ambient <layers>', 'Pacific Northwest ambient layers: rain,birds,water (comma-separated)')
  .option('--ambient-intensity <level>', 'Ambient layer intensity (0-1)', parseFloat, 0.5)
  .option('--ambient-variation <level>', 'Ambient layer variation (0-1)', parseFloat, 0.3)
  .parse(process.argv);

const options = program.opts();

if (!options.noise || !options.duration || !options.out) {
  console.error('❌ Missing required flags. Example usage:');
  console.error('   brickwave --noise pink --duration 60 --out pink.wav');
  console.error('\n📖 For help: brickwave --help');
  process.exit(1);
}

if (!['white', 'pink', 'brown'].includes(options.noise)) {
  console.error(`❌ Invalid noise type: ${options.noise}`);
  console.error('   Valid types: white, pink, brown');
  process.exit(1);
}

if (options.duration <= 0) {
  console.error('❌ Duration must be greater than 0');
  process.exit(1);
}

console.log(`🎵 Generating ${options.noise} noise...`);
const startTime = Date.now();

// Ensure sample rate is a number
const sampleRate = parseInt(options.samplerate) || 44100;

let noiseBuffer = generateNoise(options.noise, options.duration, sampleRate, options.seed);

// Generate ambient layers if requested
const ambientLayers = [];
if (options.ambient) {
  const layerTypes = options.ambient.split(',').map((s: string) => s.trim());
  const layerOptions: LayerOptions = {
    intensity: options.ambientIntensity || 0.5,
    variation: options.ambientVariation || 0.3,
    seed: options.seed
  };
  
  console.log('   🌲 Generating Pacific Northwest ambient layers...');
  
  for (const layerType of layerTypes) {
    switch (layerType.toLowerCase()) {
      case 'rain':
        console.log('     ☔ Rain layer...');
        ambientLayers.push(generateRainLayer(noiseBuffer, sampleRate, layerOptions));
        break;
      case 'birds':
        console.log('     🐦 Bird layer...');
        ambientLayers.push(generateBirdLayer(noiseBuffer, sampleRate, layerOptions));
        break;
      case 'water':
        console.log('     🌊 Water layer...');
        ambientLayers.push(generateWaterLayer(noiseBuffer, sampleRate, layerOptions));
        break;
      default:
        console.error(`   ⚠️  Unknown ambient layer: ${layerType}`);
    }
  }
  
  if (ambientLayers.length > 0) {
    console.log('   🎵 Mixing ambient layers with base noise...');
    noiseBuffer = mixAmbientLayers(noiseBuffer, ambientLayers);
  }
}

// Apply envelope if requested
if (options.fadeIn > 0 || options.fadeOut > 0) {
  console.log(`   🎚️  Applying envelope (fade in: ${options.fadeIn}s, fade out: ${options.fadeOut}s)`);
  noiseBuffer = applyEnvelope(noiseBuffer, options.fadeIn, options.fadeOut, sampleRate);
}

// Convert to stereo if requested
let channels = 1;
if (options.stereo) {
  console.log('   🎧 Converting to stereo');
  noiseBuffer = convertToStereo(noiseBuffer);
  channels = 2;
}

writeWav({ 
  data: noiseBuffer, 
  sampleRate: sampleRate, 
  outPath: options.out,
  channels
});

const duration = Date.now() - startTime;

console.log(`✅ Generated ${options.noise} noise`);
console.log(`   📊 ${options.duration}s @ ${sampleRate}Hz ${channels === 2 ? '(stereo)' : '(mono)'}`);
console.log(`   📁 ${options.out}`);
console.log(`   ⚡ Generated in ${duration}ms`);
if (options.seed) {
  console.log(`   🎲 Seed: ${options.seed}`);
}
if (options.fadeIn > 0 || options.fadeOut > 0) {
  console.log(`   🎚️  Envelope: ${options.fadeIn}s fade-in, ${options.fadeOut}s fade-out`);
}
if (ambientLayers.length > 0) {
  console.log(`   🌲 Ambient layers: ${ambientLayers.map(l => l.description).join(', ')}`);
}

