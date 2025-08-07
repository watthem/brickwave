#!/usr/bin/env node

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

function compareVersions() {
  const samplesDir = 'samples';
  const versions = [];
  
  // Find all version directories
  if (existsSync(samplesDir)) {
    const entries = readdirSync(samplesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('v')) {
        const version = entry.name.substring(1); // Remove 'v' prefix
        const summaryFile = join(samplesDir, entry.name, 'library-summary.json');
        
        if (existsSync(summaryFile)) {
          try {
            const summary = JSON.parse(readFileSync(summaryFile, 'utf8'));
            versions.push({
              name: entry.name,
              version: version,
              summary: summary
            });
          } catch (error) {
            console.log(`⚠️  Could not read summary for ${entry.name}: ${error.message}`);
          }
        }
      }
    }
  }
  
  if (versions.length === 0) {
    console.log('❌ No version directories found in samples/');
    console.log('Run "npm run library:dev" to generate a library first.');
    return;
  }
  
  // Sort by version
  versions.sort((a, b) => a.version.localeCompare(b.version));
  
  console.log('📊 Brickwave Version Comparison');
  console.log('================================');
  console.log('');
  
  // Display version summary
  for (const v of versions) {
    const summary = v.summary;
    console.log(`🎵 ${v.name} (${summary.version})`);
    console.log(`   📅 Generated: ${summary.timestamp}`);
    console.log(`   📊 Samples: ${summary.success}/${summary.total} successful`);
    console.log(`   ⚡ Average time: ${Math.round(summary.samples.reduce((acc, s) => acc + (s.duration || 0), 0) / summary.success)}ms`);
    console.log('');
  }
  
  // Compare sample counts
  if (versions.length > 1) {
    console.log('📈 Sample Count Comparison:');
    const sampleCounts = versions.map(v => ({
      version: v.version,
      count: v.summary.total,
      success: v.summary.success
    }));
    
    const maxCount = Math.max(...sampleCounts.map(s => s.count));
    const maxSuccess = Math.max(...sampleCounts.map(s => s.success));
    
    for (const sample of sampleCounts) {
      const countBar = '█'.repeat(Math.round((sample.count / maxCount) * 20));
      const successBar = '█'.repeat(Math.round((sample.success / maxSuccess) * 20));
      console.log(`   ${sample.version.padEnd(10)} | ${sample.count.toString().padStart(3)} samples | ${countBar}`);
      console.log(`   ${' '.repeat(10)} | ${sample.success.toString().padStart(3)} success | ${successBar}`);
    }
    console.log('');
  }
  
  // Show file sizes for latest version
  const latest = versions[versions.length - 1];
  const latestDir = join(samplesDir, latest.name);
  
  if (existsSync(latestDir)) {
    console.log(`📁 File sizes for ${latest.name}:`);
    try {
      const files = readdirSync(latestDir).filter(f => f.endsWith('.wav'));
      files.sort();
      
      for (const file of files) {
        const filePath = join(latestDir, file);
        const stats = readFileSync(filePath).length;
        const sizeKB = (stats / 1024).toFixed(1);
        console.log(`   ${file.padEnd(30)} ${sizeKB.padStart(8)} KB`);
      }
    } catch (error) {
      console.log(`   ⚠️  Could not read file sizes: ${error.message}`);
    }
    console.log('');
  }
  
  // Show differences between versions
  if (versions.length > 1) {
    console.log('🔄 Version Differences:');
    const baseVersion = versions[0];
    const latestVersion = versions[versions.length - 1];
    
    const baseSamples = new Set(baseVersion.summary.samples.map(s => s.name));
    const latestSamples = new Set(latestVersion.summary.samples.map(s => s.name));
    
    const added = [...latestSamples].filter(s => !baseSamples.has(s));
    const removed = [...baseSamples].filter(s => !latestSamples.has(s));
    
    if (added.length > 0) {
      console.log(`   ➕ Added in ${latestVersion.version}: ${added.join(', ')}`);
    }
    
    if (removed.length > 0) {
      console.log(`   ➖ Removed in ${latestVersion.version}: ${removed.join(', ')}`);
    }
    
    if (added.length === 0 && removed.length === 0) {
      console.log('   ✅ No sample changes between versions');
    }
    console.log('');
  }
  
  console.log('💡 Usage:');
  console.log('   npm run library:dev          # Generate dev version');
  console.log('   npm run library              # Generate current version');
  console.log('   node scripts/compare-versions.js  # Compare versions');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  compareVersions();
} 