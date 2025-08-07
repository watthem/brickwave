# brickwave

Offline deterministic noise generator for DSP devs, AI researchers, and sound designers.

## Features

- Generate white, pink, and brown noise
- Seed-based deterministic generation for reproducible results
- Stereo output support
- Envelope shaping with fade-in/fade-out
- Pacific Northwest ambient layers (rain, birds, running water)
- Configurable duration and sample rate
- High-quality 16-bit PCM WAV output
- Minimal dependencies (only `commander`)
- Fast TypeScript implementation

## Installation

```bash
git clone https://github.com/watthem/brickwave.git
cd brickwave
npm install
npm run build
```

## Usage

### Basic Examples

```bash
# Generate 10 seconds of pink noise
npm start -- --noise pink --duration 10 --out ambient.wav

# Generate deterministic white noise with seed
npm start -- --noise white --duration 5 --seed 42 --out white-42.wav

# Generate stereo brown noise with fade effects
npm start -- --noise brown --duration 30 --stereo --fade-in 2 --fade-out 2 --out epic-brown.wav

# Generate Pacific Northwest soundscape
npm start -- --noise pink --duration 60 --ambient rain,birds,water --ambient-intensity 0.7 --stereo --out pacific-northwest.wav
```

### CLI Options

```
Offline deterministic noise generator for DSP devs, AI researchers, and sound designers

Options:
  -V, --version                output the version number
  --noise <type>               Noise type: white, pink, or brown
  --duration <seconds>         Duration in seconds
  --samplerate <rate>          Sample rate in Hz (default: 44100)
  --out <path>                 Output .wav file path
  --seed <number>              Seed for deterministic generation
  --stereo                     Generate stereo output
  --fade-in <seconds>          Fade in duration in seconds (default: 0)
  --fade-out <seconds>         Fade out duration in seconds (default: 0)
  --ambient <layers>           Pacific Northwest ambient layers:
                               rain,birds,water (comma-separated)
  --ambient-intensity <level>  Ambient layer intensity (0-1) (default: 0.5)
  --ambient-variation <level>  Ambient layer variation (0-1) (default: 0.3)
  -h, --help                   display help for command
```

## Noise Types

- **White Noise**: Equal power across all frequencies
- **Pink Noise**: 1/f noise, equal power per octave (natural, pleasing)  
- **Brown Noise**: Brownian motion, deeper bass response

## Development

```bash
# Development with hot reload
npm run dev -- --noise pink --duration 5 --out test.wav

# Build TypeScript to JavaScript
npm run build

# Run tests
npm test

# Run built version
npm start -- [options]
```

## Technical Details

- **Format**: WAV (RIFF), 16-bit PCM
- **Channels**: Mono (default) or Stereo
- **Default Sample Rate**: 44.1 kHz (configurable)
- **Deterministic**: Same seed produces identical output
- **Algorithms**: 
  - Pink noise uses Paul Kellett's filter method
  - Brown noise uses integrated white noise with feedback

## File Structure

```
brickwave/
├── bin/cli.ts           # CLI entry point
├── src/
│   ├── generateNoise.ts # Noise generation algorithms
│   ├── wavWriter.ts     # WAV file writing & effects
│   └── ambientLayers.ts # Pacific Northwest ambient layers
├── test/                # Test suite  
├── dist/                # Compiled JavaScript
└── package.json
```

## Examples

```bash
# Quick ambient texture
npm start -- --noise pink --duration 60 --fade-in 5 --fade-out 5 --out ambient.wav

# Reproducible test signal  
npm start -- --noise white --duration 1 --seed 1337 --samplerate 48000 --out test-signal.wav

# Stereo soundscape with ambient layers
npm start -- --noise brown --duration 120 --stereo --fade-in 10 --fade-out 10 --out soundscape.wav

# Forest rain soundscape
npm start -- --noise brown --duration 300 --ambient rain --ambient-intensity 0.8 --stereo --fade-in 5 --fade-out 5 --out forest-rain.wav

# Birdsong with gentle water
npm start -- --noise pink --duration 180 --ambient birds,water --ambient-intensity 0.6 --out nature-birds.wav
```

## License

MIT License - feel free to use in your projects!

---

Built for the community of DSP developers, AI researchers, and sound designers who need reliable, deterministic noise generation. 🎧