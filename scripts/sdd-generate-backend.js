#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Determine project root from process cwd
const PROCESS_CWD = process.cwd();
// Extract the project name from cwd to find the marketplace-lite root
// Assume we're in /marketplace-lite/packages/backend/scripts or similar
const PROJECT_ROOT = PROCESS_CWD.includes('marketplace-lite')
  ? PROCESS_CWD
  : path.resolve(PROCESS_CWD, '../..');

const SPECS_DIR = path.resolve(PROJECT_ROOT, 'specs');
const BACKEND_APPLICATION = path.resolve(PROJECT_ROOT, 'packages/backend/src/application');
const BACKEND_DOMAIN = path.resolve(PROJECT_ROOT, 'packages/backend/src/domain');
const BACKEND_INFRASTRUCTURE = path.resolve(PROJECT_ROOT, 'packages/backend/src/infrastructure');

function ensureDir(filePath) {
  var dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Find all feature spec directories
var allDirs = fs.existsSync(SPECS_DIR) ? fs.readdirSync(SPECS_DIR) : [];
var features = allDirs.filter(function (f) {
  var fullPath = path.join(SPECS_DIR, f);
  return fs.statSync(fullPath).isDirectory();
});

console.log('=== SDD: Generate - Generating boilerplate for features ===\n');

console.log('PROJECT_ROOT: ' + PROJECT_ROOT);
console.log('SPECS_DIR: ' + SPECS_DIR);
console.log('Features count: ' + features.length);

for (var i = 0; i < features.length; i++) {
  var feature = features[i];
  var featureDir = path.join(SPECS_DIR, feature);
  var functionalPath = path.join(featureDir, 'functional.md');
  var technicalPath = path.join(featureDir, 'technical.md');
  var tasksPath = path.join(featureDir, 'tasks.md');

  if (fs.existsSync(functionalPath) === false || fs.existsSync(technicalPath) === false || fs.existsSync(tasksPath) === false) {
    console.log('⚠️  Skipping "' + feature + '": missing spec files');
    continue;
  }

  var functionalContent = fs.readFileSync(functionalPath, 'utf-8');
  var technicalContent = fs.readFileSync(technicalPath, 'utf-8');
  var tasksContent = fs.readFileSync(tasksPath, 'utf-8');

  // Extract feature name
  var nameMatch = functionalContent.match(/^# (.+)$/m);
  var featureName = nameMatch ? nameMatch[1] : feature;
  // Sanitize the TypeScript-safe name (use first part of feature name)
  // e.g., "Product Catalog - Functional Specification" -> "ProductCatalog"
  var tsFeatureName = featureName
    .split(/[\s\-]+/)
    .slice(0, 2)
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');

  console.log('Generating for feature: ' + featureName);

  // 1. Generate Domain Entity
  var entityPath = path.join(BACKEND_DOMAIN, feature.toLowerCase() + '.ts');
  if (!fs.existsSync(entityPath)) {
    var entityCode = '// ' + feature + ' Domain Entity\nexport interface ' + tsFeatureName + 'Entity {\n  id: string;\n  createdAt: Date;\n  updatedAt: Date;\n}\n// Export concrete ' + feature + ' entity with business fields\n';
    ensureDir(entityPath);
    fs.writeFileSync(entityPath, entityCode);
    console.log('  📦 Created Domain Entity: ' + entityPath);
  } else {
    console.log('  ⏭️  Domain Entity already exists: ' + entityPath);
  }

  // 2. Generate Repository Interface
  var repoPath = path.join(BACKEND_DOMAIN, feature.toLowerCase() + 'Repository.ts');
  if (!fs.existsSync(repoPath)) {
    var repoCode = '// ' + feature + ' Repository Interface\nexport interface ' + tsFeatureName + 'Repository {\n  findAll(pagination?: { page: number; limit: number }): Promise<' + tsFeatureName + 'Entity[]>;\n  findById(id: string): Promise<' + tsFeatureName + 'Entity | null>;\n  create(entity: ' + tsFeatureName + 'Entity): Promise<' + tsFeatureName + 'Entity>;\n  update(id: string, entity: Partial<' + tsFeatureName + 'Entity>): Promise<' + tsFeatureName + 'Entity | null>;\n  delete(id: string): Promise<boolean>;\n}\n';
    ensureDir(repoPath);
    fs.writeFileSync(repoPath, repoCode);
    console.log('  📦 Created Repository Interface: ' + repoPath);
  } else {
    console.log('  ⏭️  Repository Interface already exists: ' + repoPath);
  }

  // 3. Generate Use Case (Application Layer)
  var useCasePath = path.join(BACKEND_APPLICATION, feature.toLowerCase() + 'UseCase.ts');
  if (!fs.existsSync(useCasePath)) {
    var useCaseCode = '// ' + feature + ' Use Case\nimport { ' + tsFeatureName + 'Entity } from ../domain;\nimport { ' + tsFeatureName + 'Repository } from ../domain/' + feature.toLowerCase() + 'Repository;\n\ninterface ' + tsFeatureName + 'UseCaseInput {\n  // Input parameters for the use case\n}\n\ninterface ' + tsFeatureName + 'UseCaseOutput {\n  data: ' + tsFeatureName + 'Entity[];\n  meta: { page: number; limit: number; total: number };\n}\n\nexport class ' + tsFeatureName + 'UseCase {\n  constructor(private repository: ' + tsFeatureName + 'Repository) {}\n\n  async execute(input: ' + tsFeatureName + 'UseCaseInput): Promise<' + tsFeatureName + 'UseCaseOutput> {\n    // TODO: Implement use case logic\n    var items = await this.repository.findAll();\n    return {\n      data: items,\n      meta: { page: 1, limit: 10, total: items.length },\n    };\n  }\n}\n';
    ensureDir(useCasePath);
    fs.writeFileSync(useCasePath, useCaseCode);
    console.log('  📦 Created Use Case: ' + useCasePath);
  } else {
    console.log('  ⏭️  Use Case already exists: ' + useCasePath);
  }

  // 4. Generate HTTP Controller
  var controllerCode = `import { Router, Request, Response } from "express";
import { ${tsFeatureName}UseCase } from "../application";
import { ${tsFeatureName}UseCaseInput } from "../application/${feature.toLowerCase()}UseCase";

export function ${tsFeatureName}Controller(app) {
  const useCase = new ${tsFeatureName}UseCase();

  // GET /${feature.toLowerCase()}
  app.get("/${feature.toLowerCase()}", async (req, res) => {
    try {
      const result = await useCase.execute({});
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /${feature.toLowerCase()}
  app.post("/${feature.toLowerCase()}", async (req, res) => {
    try {
      const result = await useCase.execute({});
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // GET /${feature.toLowerCase()}/:id
  app.get("/${feature.toLowerCase()}/:id", async (req, res) => {
    try {
      const result = await useCase.execute({});
      if (result.data.length === 0) {
        return res.status(404).json({ error: feature + " not found" });
      }
      res.json(result.data[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

export default ${tsFeatureName}Controller;
`;

  var controllerPath = path.join(BACKEND_INFRASTRUCTURE, feature.toLowerCase() + 'Controller.ts');
  if (!fs.existsSync(controllerPath)) {
    ensureDir(controllerPath);
    fs.writeFileSync(controllerPath, controllerCode);
    console.log('  📦 Created Controller: ' + controllerPath);
  } else {
    console.log('  ⏭️  Controller already exists: ' + controllerPath);
  }
}

console.log('\n=== SDD: Generate completed ===');
console.log('Run `pnpm sdd:validate` to validate the generated code against the rules.');