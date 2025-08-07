import { generateNoise } from '../dist/src/generateNoise.js';
import { writeWav } from '../dist/src/wavWriter.js';
import { existsSync, unlinkSync } from 'fs';

console.log('🧪 Running brickwave tests...');

// Test noise generation
const whiteNoise = generateNoise('white', 1, 44100);
const pinkNoise = generateNoise('pink', 1, 44100);
const brownNoise = generateNoise('brown', 1, 44100);

console.log('✅ Generated white noise:', whiteNoise.length, 'samples');
console.log('✅ Generated pink noise:', pinkNoise.length, 'samples');
console.log('✅ Generated brown noise:', brownNoise.length, 'samples');

// Test WAV writing
const testFile = 'test-output.wav';
writeWav({ data: whiteNoise, sampleRate: 44100, outPath: testFile });

if (existsSync(testFile)) {
  console.log('✅ WAV file created successfully');
  unlinkSync(testFile);
  console.log('✅ Test file cleaned up');
} else {
  console.log('❌ WAV file creation failed');
  process.exit(1);
}

console.log('🎉 All tests passed!');