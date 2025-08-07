# Brickwave Standard Library System

This document describes the standardized library system for Brickwave, which enables consistent comparison of audio output across different builds, versions, and feature changes.

## Overview

The library system provides:
- **Standardized test cases** for all major features
- **Versioned samples** for regression testing
- **Automated generation** with comprehensive reporting
- **Comparison tools** for analyzing changes between versions

## Quick Start

```bash
# Generate library for current version
npm run library

# Generate library for development version
npm run library:dev

# Compare all versions
npm run compare
```

## Library Structure

```
samples/
├── v1.0.0/                    # Version-specific libraries
│   ├── white-noise-basic.wav
│   ├── pink-noise-stereo.wav
│   ├── water-layer-basic.wav  # Tests low pass filter
│   ├── library-summary.json   # Generation metadata
│   └── README.md             # Version-specific docs
├── vdev/                      # Development version
│   ├── [same structure]
│   └── ...
└── README.md                  # Main samples documentation
```

## Standard Library Contents

### Basic Noise Types (5s each)
- `white-noise-basic.wav` - White noise with seed 42
- `pink-noise-basic.wav` - Pink noise with seed 42  
- `brown-noise-basic.wav` - Brown noise with seed 42

### Stereo Examples (10s each)
- `white-noise-stereo.wav` - Stereo white noise
- `pink-noise-stereo.wav` - Stereo pink noise
- `brown-noise-stereo.wav` - Stereo brown noise

### Fade Effects (15s each)
- `pink-noise-fade-in.wav` - Fade-in effect (3s)
- `pink-noise-fade-out.wav` - Fade-out effect (3s)
- `pink-noise-fade-both.wav` - Both fade effects (2s each)

### Ambient Layers (20s each)
- `rain-layer-basic.wav` - Rain layer with pink noise base
- `birds-layer-basic.wav` - Birds layer with pink noise base
- `water-layer-basic.wav` - Water layer with pink noise base (tests low pass filter)

### Combined Ambient (30s each)
- `rain-birds-combined.wav` - Rain and birds combined
- `birds-water-combined.wav` - Birds and water combined (tests shimmer fix)
- `all-ambient-layers.wav` - All three ambient layers combined

### Stress Tests
- `high-intensity-rain.wav` - High intensity rain (20s)
- `high-intensity-water.wav` - High intensity water (20s)
- `high-variation-ambient.wav` - High variation ambient layers (30s)
- `long-ambient-soundscape.wav` - Long duration test (60s)

### Sample Rate Tests (5s each)
- `white-noise-48khz.wav` - White noise at 48kHz
- `pink-noise-22khz.wav` - Pink noise at 22kHz

## Generation Scripts

### `scripts/generate-library.js`

Automatically generates the complete standard library with:
- **21 standardized samples** covering all features
- **Deterministic seeds** for reproducible results
- **Comprehensive reporting** with timing and file sizes
- **JSON metadata** for version tracking
- **Auto-generated README** for each version

**Usage:**
```bash
# Generate with current version
npm run library

# Generate with custom version
BRICKWAVE_VERSION=2.0.0 npm run library

# Generate development version
npm run library:dev
```

### `scripts/compare-versions.js`

Compares different versions and shows:
- **Version summaries** with generation timestamps
- **Sample count comparisons** with visual bars
- **File size analysis** for the latest version
- **Feature differences** between versions
- **Performance metrics** (average generation time)

**Usage:**
```bash
npm run compare
```

## Use Cases

### Regression Testing
```bash
# Before making changes
npm run library:dev

# After making changes  
npm run library:dev

# Compare results
npm run compare
```

### Feature Development
```bash
# Generate baseline
npm run library:dev

# Make feature changes
# ... edit code ...

# Generate new version
npm run library:dev

# Compare to see impact
npm run compare
```

### Quality Assurance
The library includes specific tests for:
- **Low pass filter stability** (`water-layer-basic.wav`)
- **Shimmer reduction** (`birds-water-combined.wav`)
- **High intensity handling** (`high-intensity-*.wav`)
- **Long duration stability** (`long-ambient-soundscape.wav`)
- **Sample rate compatibility** (`*-48khz.wav`, `*-22khz.wav`)

### Performance Benchmarking
Each generation includes timing data for:
- Individual sample generation time
- Total library generation time
- Average time per sample
- Success/failure rates

## Metadata Files

### `library-summary.json`
```json
{
  "version": "dev",
  "timestamp": "2025-08-07T05:12:19.958Z",
  "total": 21,
  "success": 21,
  "errors": 0,
  "samples": [
    {
      "name": "white-noise-basic",
      "file": "samples/vdev/white-noise-basic.wav",
      "description": "Basic white noise with seed for testing",
      "status": "success",
      "duration": 1448
    }
  ]
}
```

### Version README
Each version directory includes an auto-generated README with:
- Version information and generation timestamp
- Complete list of successful samples
- Categorized sample descriptions
- Usage instructions for the library

## Integration with Development

### Pre-commit Testing
```bash
# Add to your pre-commit hooks
npm run library:dev
npm run compare
```

### CI/CD Integration
```bash
# In your CI pipeline
npm run build
npm run library
npm run test
```

### Release Process
```bash
# Before release
npm run library
git add samples/v1.0.0/
git commit -m "Add standard library for v1.0.0"
```

## Troubleshooting

### Common Issues

**Sample rate files are 0 bytes:**
- Check that the sample rate parameter is being parsed correctly
- Ensure the CLI is using the correct sample rate value

**Ambient layers sound harsh:**
- The low pass filter improvements should reduce shimmer
- Test with `water-layer-basic.wav` and `birds-water-combined.wav`

**Generation fails:**
- Check that all dependencies are installed
- Ensure the TypeScript is built (`npm run build`)
- Verify output directory permissions

### Debugging

**Check sample rate parsing:**
```bash
npm start -- --noise white --duration 5 --samplerate 48000 --out test.wav
```

**Test specific features:**
```bash
# Test low pass filter
npm start -- --noise pink --duration 20 --ambient water --ambient-intensity 0.9 --out test-water.wav

# Test high intensity
npm start -- --noise pink --duration 20 --ambient rain --ambient-intensity 0.9 --out test-rain.wav
```

## Future Enhancements

- **Audio analysis tools** for automated quality checking
- **Spectrogram generation** for visual comparison
- **Integration with audio testing frameworks**
- **Web-based comparison interface**
- **Automated regression detection**

---

This library system ensures consistent, reproducible testing of Brickwave's audio generation capabilities across all versions and feature changes. 🎧 