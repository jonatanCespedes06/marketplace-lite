#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Determine project root from process cwd
const PROCESS_CWD = process.cwd();
const PROJECT_ROOT = PROCESS_CWD.includes('marketplace-lite')
  ? PROCESS_CWD
  : path.resolve(PROCESS_CWD, '../..');

const SPECS_DIR = path.resolve(PROJECT_ROOT, 'specs');

console.log('=== SDD: Close - Verifying specs completion ===\n');

if (fs.existsSync(SPECS_DIR) === false) {
  console.log('No specs/ directory found. Nothing to close.');
  process.exit(0);
}

const allDirs = fs.readdirSync(SPECS_DIR);
const features = allDirs.filter(function (f) {
  return fs.statSync(path.join(SPECS_DIR, f)).isDirectory();
});

let incomplete = 0;

for (const feature of features) {
  const featureDir = path.join(SPECS_DIR, feature);
  const tasksPath = path.join(featureDir, 'tasks.md');

  console.log('Feature: ' + feature);

  if (fs.existsSync(tasksPath) === false) {
    console.log('  Missing: tasks.md');
    incomplete += 1;
    continue;
  }

  const content = fs.readFileSync(tasksPath, 'utf-8');
  const total = (content.match(/- \[[ xX]\]/g) || []).length;
  const done = (content.match(/- \[[xX]\]/g) || []).length;

  console.log('  Tasks: ' + done + '/' + total + ' done');

  if (total === 0 || done < total) {
    incomplete += 1;
  }
}

if (incomplete > 0) {
  console.log('\n' + incomplete + ' feature(s) with pending tasks. Close aborted.');
  process.exitCode = 1;
} else {
  console.log('\nAll features complete. Spec closed.');
}
