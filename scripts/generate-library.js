#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const VERSION = process.env.BRICKWAVE_VERSION || 'dev';
const OUTPUT_DIR = `samples/v${VERSION}`;

// Standard library definitions
const LIBRARY = [
  // Basic noise types - short duration for quick testing
  {
    name: 'white-noise-basic',
    command: ['--noise', 'white', '--duration', '5', '--seed', '42'],
    description: 'Basic white noise with seed for testing'
  },
  {
    name: 'pink-noise-basic',
    command: ['--noise', 'pink', '--duration', '5', '--seed', '42'],
    description: 'Basic pink noise with seed for testing'
  },
  {
    name: 'brown-noise-basic',
    command: ['--noise', 'brown', '--duration', '5', '--seed', '42'],
    description: 'Basic brown noise with seed for testing'
  },
  
  // Stereo examples
  {
    name: 'white-noise-stereo',
    command: ['--noise', 'white', '--duration', '10', '--stereo', '--seed', '42'],
    description: 'Stereo white noise for spatial testing'
  },
  {
    name: 'pink-noise-stereo',
    command: ['--noise', 'pink', '--duration', '10', '--stereo', '--seed', '42'],
    description: 'Stereo pink noise for natural ambience'
  },
  {
    name: 'brown-noise-stereo',
    command: ['--noise', 'brown', '--duration', '10', '--stereo', '--seed', '42'],
    description: 'Stereo brown noise for deep bass'
  },
  
  // Fade effects
  {
    name: 'pink-noise-fade-in',
    command: ['--noise', 'pink', '--duration', '15', '--fade-in', '3', '--seed', '42'],
    description: 'Pink noise with fade-in effect'
  },
  {
    name: 'pink-noise-fade-out',
    command: ['--noise', 'pink', '--duration', '15', '--fade-out', '3', '--seed', '42'],
    description: 'Pink noise with fade-out effect'
  },
  {
    name: 'pink-noise-fade-both',
    command: ['--noise', 'pink', '--duration', '15', '--fade-in', '2', '--fade-out', '2', '--seed', '42'],
    description: 'Pink noise with both fade-in and fade-out'
  },
  
  // Ambient layers - individual
  {
    name: 'rain-layer-basic',
    command: ['--noise', 'pink', '--duration', '20', '--ambient', 'rain', '--ambient-intensity', '0.5', '--seed', '42'],
    description: 'Basic rain layer with pink noise base'
  },
  {
    name: 'birds-layer-basic',
    command: ['--noise', 'pink', '--duration', '20', '--ambient', 'birds', '--ambient-intensity', '0.5', '--seed', '42'],
    description: 'Basic birds layer with pink noise base'
  },
  {
    name: 'water-layer-basic',
    command: ['--noise', 'pink', '--duration', '20', '--ambient', 'water', '--ambient-intensity', '0.5', '--seed', '42'],
    description: 'Basic water layer with pink noise base (tests low pass filter)'
  },
  
  // Ambient layers - combined
  {
    name: 'rain-birds-combined',
    command: ['--noise', 'pink', '--duration', '30', '--ambient', 'rain,birds', '--ambient-intensity', '0.6', '--seed', '42'],
    description: 'Rain and birds combined'
  },
  {
    name: 'birds-water-combined',
    command: ['--noise', 'pink', '--duration', '30', '--ambient', 'birds,water', '--ambient-intensity', '0.6', '--seed', '42'],
    description: 'Birds and water combined (tests shimmer fix)'
  },
  {
    name: 'all-ambient-layers',
    command: ['--noise', 'pink', '--duration', '30', '--ambient', 'rain,birds,water', '--ambient-intensity', '0.7', '--seed', '42'],
    description: 'All three ambient layers combined'
  },
  
  // High intensity tests
  {
    name: 'high-intensity-rain',
    command: ['--noise', 'pink', '--duration', '20', '--ambient', 'rain', '--ambient-intensity', '0.9', '--seed', '42'],
    description: 'High intensity rain to test limits'
  },
  {
    name: 'high-intensity-water',
    command: ['--noise', 'pink', '--duration', '20', '--ambient', 'water', '--ambient-intensity', '0.9', '--seed', '42'],
    description: 'High intensity water to test low pass filter stability'
  },
  
  // Variation tests
  {
    name: 'high-variation-ambient',
    command: ['--noise', 'pink', '--duration', '30', '--ambient', 'rain,birds,water', '--ambient-intensity', '0.6', '--ambient-variation', '0.8', '--seed', '42'],
    description: 'High variation ambient layers'
  },
  
  // Long duration tests
  {
    name: 'long-ambient-soundscape',
    command: ['--noise', 'brown', '--duration', '60', '--ambient', 'rain,birds,water', '--ambient-intensity', '0.5', '--stereo', '--fade-in', '5', '--fade-out', '5', '--seed', '42'],
    description: 'Long duration ambient soundscape for stability testing'
  },
  
  // Different sample rates
  {
    name: 'white-noise-48khz',
    command: ['--noise', 'white', '--duration', '5', '--samplerate', '48000', '--seed', '42'],
    description: 'White noise at 48kHz sample rate'
  },
  {
    name: 'pink-noise-22khz',
    command: ['--noise', 'pink', '--duration', '5', '--samplerate', '22050', '--seed', '42'],
    description: 'Pink noise at 22kHz sample rate'
  }
];

// Generate the library
async function generateLibrary() {
  console.log(`🎵 Generating Brickwave Standard Library v${VERSION}`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log('');
  
  // Create output directory
  mkdirSync(OUTPUT_DIR, { recursive: true });
  
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  
  for (const [index, sample] of LIBRARY.entries()) {
    const outputFile = join(OUTPUT_DIR, `${sample.name}.wav`);
    const command = ['npm', 'start', '--', ...sample.command, '--out', outputFile];
    
    console.log(`[${index + 1}/${LIBRARY.length}] Generating ${sample.name}...`);
    console.log(`   ${sample.description}`);
    
    try {
      const startTime = Date.now();
      execSync(command.join(' '), { stdio: 'pipe' });
      const duration = Date.now() - startTime;
      
      console.log(`   ✅ Generated in ${duration}ms`);
      successCount++;
      
      results.push({
        name: sample.name,
        file: outputFile,
        description: sample.description,
        status: 'success',
        duration: duration
      });
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      errorCount++;
      
      results.push({
        name: sample.name,
        file: outputFile,
        description: sample.description,
        status: 'error',
        error: error.message
      });
    }
    
    console.log('');
  }
  
  // Generate summary
  const summary = {
    version: VERSION,
    timestamp: new Date().toISOString(),
    total: LIBRARY.length,
    success: successCount,
    errors: errorCount,
    samples: results
  };
  
  // Write summary file
  const summaryFile = join(OUTPUT_DIR, 'library-summary.json');
  writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  
  // Write README
  const readmeContent = generateReadme(VERSION, results);
  const readmeFile = join(OUTPUT_DIR, 'README.md');
  writeFileSync(readmeFile, readmeContent);
  
  console.log(`📊 Summary:`);
  console.log(`   Total: ${LIBRARY.length}`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   📁 Output: ${OUTPUT_DIR}`);
  console.log(`   📄 Summary: ${summaryFile}`);
  console.log(`   📖 README: ${readmeFile}`);
  
  if (errorCount > 0) {
    console.log(`\n⚠️  ${errorCount} samples failed to generate. Check the summary for details.`);
    process.exit(1);
  }
}

function generateReadme(version, results) {
  const successfulSamples = results.filter(r => r.status === 'success');
  const failedSamples = results.filter(r => r.status === 'error');
  
  return `# Brickwave Standard Library v${version}

This directory contains the standardized library of sounds for Brickwave v${version}.

## Summary

- **Version**: ${version}
- **Generated**: ${new Date().toISOString()}
- **Total Samples**: ${results.length}
- **Successful**: ${successfulSamples.length}
- **Failed**: ${failedSamples.length}

## Successful Samples

${successfulSamples.map(sample => `- **\`${sample.name}.wav\`** - ${sample.description}`).join('\n')}

${failedSamples.length > 0 ? `\n## Failed Samples\n\n${failedSamples.map(sample => `- **\`${sample.name}\`** - ${sample.error}`).join('\n')}` : ''}

## Categories

### Basic Noise Types
- \`white-noise-basic.wav\` - White noise with seed
- \`pink-noise-basic.wav\` - Pink noise with seed  
- \`brown-noise-basic.wav\` - Brown noise with seed

### Stereo Examples
- \`white-noise-stereo.wav\` - Stereo white noise
- \`pink-noise-stereo.wav\` - Stereo pink noise
- \`brown-noise-stereo.wav\` - Stereo brown noise

### Fade Effects
- \`pink-noise-fade-in.wav\` - Fade-in effect
- \`pink-noise-fade-out.wav\` - Fade-out effect
- \`pink-noise-fade-both.wav\` - Both fade effects

### Ambient Layers
- \`rain-layer-basic.wav\` - Rain layer
- \`birds-layer-basic.wav\` - Birds layer
- \`water-layer-basic.wav\` - Water layer (tests low pass filter)
- \`rain-birds-combined.wav\` - Rain + birds
- \`birds-water-combined.wav\` - Birds + water
- \`all-ambient-layers.wav\` - All three layers

### Stress Tests
- \`high-intensity-rain.wav\` - High intensity rain
- \`high-intensity-water.wav\` - High intensity water
- \`high-variation-ambient.wav\` - High variation
- \`long-ambient-soundscape.wav\` - Long duration test

### Sample Rate Tests
- \`white-noise-48khz.wav\` - 48kHz sample rate
- \`pink-noise-22khz.wav\` - 22kHz sample rate

## Usage

This library is designed for:
- **Regression testing** between versions
- **Feature comparison** across builds
- **Quality assurance** of audio output
- **Performance benchmarking** of generation speed

All samples use deterministic seeds for reproducible results.

---

Generated by Brickwave v${version} 🎧
`;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateLibrary().catch(console.error);
} 