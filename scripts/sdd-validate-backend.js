#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Determine project root from process cwd
const PROCESS_CWD = process.cwd();
const PROJECT_ROOT = PROCESS_CWD.includes('marketplace-lite')
  ? PROCESS_CWD
  : path.resolve(PROCESS_CWD, '../..');

const SPECS_DIR = path.resolve(PROJECT_ROOT, 'specs');
const AGENTIC_RULES_DIR = path.resolve(PROJECT_ROOT, '.agentic-rules');

function readFileIfExists(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

console.log('=== SDD: Validate - Validating specs and code ===\n');

// 1. Check that all features have the required spec files
const allDirs = fs.existsSync(SPECS_DIR) ? fs.readdirSync(SPECS_DIR) : [];
const features = allDirs.filter(function (f) {
  var fullPath = path.join(SPECS_DIR, f);
  return fs.statSync(fullPath).isDirectory();
});

console.log('Features found: ' + features.length);

for (var i = 0; i < features.length; i++) {
  var feature = features[i];
  var featureDir = path.join(SPECS_DIR, feature);
  var functionalPath = path.join(featureDir, 'functional.md');
  var technicalPath = path.join(featureDir, 'technical.md');
  var tasksPath = path.join(featureDir, 'tasks.md');

  console.log('Feature: ' + feature);

  if (fs.existsSync(functionalPath) === false) {
    console.log('  Missing: functional.md');
  } else {
    console.log('  Present: functional.md');
  }

  if (fs.existsSync(technicalPath) === false) {
    console.log('  Missing: technical.md');
  } else {
    console.log('  Present: technical.md');
  }

  if (fs.existsSync(tasksPath) === false) {
    console.log('  Missing: tasks.md');
  } else {
    console.log('  Present: tasks.md');
  }
}

// 2. Validate Zod usage in generated code
console.log('\n--- Zod Validation Check ---');

var zodFiles = [
  path.resolve(PROJECT_ROOT, 'packages/backend/src/application/*.ts')
];

// Read all use case files and check for Zod
var useCaseDir = path.resolve(PROJECT_ROOT, 'packages/backend/src/application');
if (fs.existsSync(useCaseDir)) {
  var useCaseFiles = fs.readdirSync(useCaseDir).filter(function (f) {
    return f.endsWith('.ts');
  });

  for (var j = 0; j < useCaseFiles.length; j++) {
    var filePath = path.join(useCaseDir, useCaseFiles[j]);
    var content = readFileIfExists(filePath);
    if (content) {
      if (content.includes('zod') || content.includes('Zod')) {
        console.log('  ✅ ' + useCaseFiles[j] + ': Zod validation present');
      } else {
        console.log('  ⚠️ ' + useCaseFiles[j] + ': No Zod validation found');
      }
    }
  }
}

// 3. Check Clean Architecture compliance
console.log('\n--- Architecture Compliance ---');

for (var i = 0; i < features.length; i++) {
  var feature = features[i];
  var technicalPath = path.join(SPECS_DIR, feature, 'technical.md');
  var technicalContent = readFileIfExists(technicalPath) || '';

  if (technicalContent.includes('express') || technicalContent.includes('vite')) {
    console.log('  ⚠️ ' + feature + ': Technical spec mentions Express/Vite - ensure domain purity');
  } else {
    console.log('  ✅ ' + feature + ': No improper domain dependencies');
  }
}

// 4. Check Result pattern usage
console.log('\n--- Result Pattern Check ---');

var appPath = path.resolve(PROJECT_ROOT, 'packages/backend/src/app.ts');
var appContent = readFileIfExists(appPath) || '';

if (appContent.includes('try') && appContent.includes('catch')) {
  console.log('  ⚠️ backend/src/app.ts: Contains try/catch - consider Result pattern');
} else {
  console.log('  ✅ backend/src/app.ts: No try/catch in sight (Result pattern)');
}

console.log('\n=== SDD: Validate completed ===');