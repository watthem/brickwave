# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Build**: `npm run build` - Compiles TypeScript to JavaScript in `dist/`
- **Development**: `npm run dev -- [options]` - Runs CLI using ts-node with ESM support
- **Start**: `npm run start -- [options]` - Runs the built CLI from `dist/bin/cli.js`
- **Test**: `npm run test` - Runs comprehensive test suite including noise generation and WAV file creation

## Project Architecture

Brickwave is a TypeScript-based CLI tool for generating deterministic noise signals with advanced features like stereo output, envelope shaping, and seed-based reproducibility.

### Core Components

- **CLI Entry Point**: `bin/cli.ts` - Commander.js-based CLI with colorful output, comprehensive validation, and feature-rich options
- **Noise Generation**: `src/generateNoise.ts` - Implements white/pink/brown noise algorithms with SeededRandom class for deterministic output
- **WAV File Output**: `src/wavWriter.ts` - Handles PCM conversion, stereo processing, envelope shaping (fade-in/out), and proper WAV headers for mono/stereo

### Key Features

- **Seed-based Generation**: Use `--seed <number>` for reproducible noise patterns
- **Stereo Support**: `--stereo` flag creates dual-channel output with proper WAV formatting
- **Envelope Shaping**: `--fade-in <seconds>` and `--fade-out <seconds>` for smooth audio transitions
- **Multiple Sample Rates**: Configurable via `--samplerate <hz>` (default: 44100)
- **Modern CLI UX**: Colorful emojis, progress timing, comprehensive help, and validation

### Build Configuration

- Uses ES modules (`"type": "module"` in package.json)
- TypeScript target: ES2020 with ESNext modules
- Output directory: `dist/`
- Supports both development (ts-node) and production (compiled JS) execution

### Testing

The test suite (`test/snapshot.test.js`) validates:
- Noise generation for all three types
- WAV file creation and cleanup
- Function exports and basic integration

### Configuration Schema

`brickwave.config.schema.json` defines the structure for potential configuration files, supporting waveform generation parameters including noise type, frequency, duration, sample rate, amplitude, and output path.

### Common Usage Patterns

```bash
# Basic noise generation
npm start -- --noise pink --duration 10 --out output.wav

# Deterministic with seed
npm start -- --noise white --seed 42 --duration 5 --out deterministic.wav

# Stereo with envelope
npm start -- --noise brown --stereo --fade-in 2 --fade-out 2 --duration 30 --out ambient.wav
```