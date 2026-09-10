#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const SPECS_DIR = path.resolve('./specs');
const BACKEND_SRC = path.resolve('./packages/backend/src');
const SHARED_SRC = path.resolve('./packages/shared/src');

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Read the specs directory to find all features
const features = fs.existsSync(SPECS_DIR) ? fs.readdirSync(SPECS_DIR).filter(f => fs.statSync(path.join(SPECS_DIR, f)).isDirectory()) : [];

console.log('=== SDD: Start - Initializing features ===\n');

for (const feature of features) {
  const featureDir = path.join(SPECS_DIR, feature);
  const functionalPath = path.join(featureDir, 'functional.md');
  const technicalPath = path.join(featureDir, 'technical.md');
  const tasksPath = path.join(featureDir, 'tasks.md');

  console.log(`Processing feature: ${feature}`);

  if (!fs.existsSync(functionalPath) || !fs.existsSync(technicalPath) || !fs.existsSync(tasksPath)) {
    console.log(`  ⚠️  Feature ${feature} is missing one or more spec files (functional.md, technical.md, tasks.md)`);
    continue;
  }

  // Read spec files
  const functionalContent = fs.readFileSync(functionalPath, 'utf-8');
  const technicalContent = fs.readFileSync(technicalPath, 'utf-8');
  const tasksContent = fs.readFileSync(tasksPath, 'utf-8');

  // Extract feature name from functional.md (first heading)
  const nameMatch = functionalContent.match(/^# (.+)$/m);
  const featureName = nameMatch ? nameMatch[1] : feature;

  console.log(`  ✓ Feature "${featureName}" structure is complete`);

  // TODO: Here we would generate the boilerplate code based on the spec
  // For now, we just confirm the structure is in place
}

console.log('\n=== SDD: Start completed ===');
console.log('Run `pnpm sdd:generate` to generate boilerplate code for all features.');