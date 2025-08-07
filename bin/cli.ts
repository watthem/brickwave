#!/usr/bin/env node
import { Command } from 'commander';
import { generateNoise } from '../src/generateNoise.js';
import { writeWav, applyEnvelope, convertToStereo } from '../src/wavWriter.js';
const VERSION = '0.1.0';
const program = new Command();

program
  .name('brickwave')
  .description('🎵 Offline deterministic noise generator for DSP devs, AI researchers, and sound designers')
  .version(VERSION)
  .option('--noise <type>', 'Noise type: white, pink, or brown')
  .option('--duration <seconds>', 'Duration in seconds', parseFloat)
  .option('--samplerate <rate>', 'Sample rate in Hz', parseInt, 44100)
  .option('--out <path>', 'Output .wav file path')
  .option('--seed <number>', 'Seed for deterministic generation', parseInt)
  .option('--stereo', 'Generate stereo output')
  .option('--fade-in <seconds>', 'Fade in duration in seconds', parseFloat, 0)
  .option('--fade-out <seconds>', 'Fade out duration in seconds', parseFloat, 0)
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

let noiseBuffer = generateNoise(options.noise, options.duration, options.samplerate, options.seed);

// Apply envelope if requested
if (options.fadeIn > 0 || options.fadeOut > 0) {
  console.log(`   🎚️  Applying envelope (fade in: ${options.fadeIn}s, fade out: ${options.fadeOut}s)`);
  noiseBuffer = applyEnvelope(noiseBuffer, options.fadeIn, options.fadeOut, options.samplerate);
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
  sampleRate: options.samplerate, 
  outPath: options.out,
  channels
});

const duration = Date.now() - startTime;
console.log(`✅ Generated ${options.noise} noise`);
console.log(`   📊 ${options.duration}s @ ${options.samplerate}Hz ${channels === 2 ? '(stereo)' : '(mono)'}`);
console.log(`   📁 ${options.out}`);
console.log(`   ⚡ Generated in ${duration}ms`);
if (options.seed) {
  console.log(`   🎲 Seed: ${options.seed}`);
}
if (options.fadeIn > 0 || options.fadeOut > 0) {
  console.log(`   🎚️  Envelope: ${options.fadeIn}s fade-in, ${options.fadeOut}s fade-out`);
}

