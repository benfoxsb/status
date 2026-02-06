#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// CI vs Local Path detection
const isCI = process.env.GITHUB_ACTIONS === 'true';
const basePath = isCI ? process.cwd() : path.join(__dirname, '..', 'projects/active/benfoxsb.github.io');

const vitalsPath = path.join(basePath, 'vitals.json');
const indexPath = path.join(basePath, 'index.html');
const schemaPath = isCI ? path.join(basePath, 'scripts/schema.json') : path.join(__dirname, '..', 'projects/active/benfoxsb.github.io/scripts/schema.json');

console.log('🚀 Starting Pre-Flight Validation...');
console.log(`📍 Context: ${isCI ? 'CI Environment' : 'Local Workspace'}`);
console.log(`📍 Base Path: ${basePath}`);

// 1. Check if files exist
const files = [vitalsPath, indexPath, schemaPath];
for (const file of files) {
    if (!fs.existsSync(file)) {
        console.error(`❌ Error: ${path.basename(file)} missing!`);
        process.exit(1);
    }
}

// 2. Validate vitals.json syntax and schema
try {
    const vitals = JSON.parse(fs.readFileSync(vitalsPath, 'utf8'));
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    console.log('✅ vitals.json is valid JSON');
    
    // Recursive validation against schema
    function validate(data, schema, path = 'root') {
        if (schema.type === 'object') {
            if (typeof data !== 'object' || data === null) throw new Error(`${path} should be an object`);
            if (schema.required) {
                for (const key of schema.required) {
                    if (!(key in data)) throw new Error(`${path} missing required key: ${key}`);
                }
            }
        } else if (schema.type === 'array') {
            if (!Array.isArray(data)) throw new Error(`${path} should be an array`);
        } else if (schema.type === 'string') {
            if (typeof data !== 'string') throw new Error(`${path} should be a string`);
        }
    }
    
    validate(vitals, schema);
    console.log('✅ vitals.json schema check passed');

    // 2.1 Freshness Check
    const updated = new Date(vitals.updated);
    const now = new Date();
    const diffMins = (now - updated) / 1000 / 60;
    if (diffMins > 60) {
        console.warn(`⚠️ Warning: Data is ${Math.round(diffMins)} minutes old.`);
    } else {
        console.log(`✅ Data freshness: ${Math.round(diffMins)}m old`);
    }

} catch (e) {
    console.error(`❌ Error validating vitals.json: ${e.message}`);
    process.exit(1);
}

// 3. Validate index.html syntax (basic)
const indexContent = fs.readFileSync(indexPath, 'utf8');
if (!indexContent.includes('<!DOCTYPE html>') || !indexContent.includes('</html>')) {
    console.error('❌ Error: index.html seems corrupted or incomplete');
    process.exit(1);
}

// Check for unclosed script tags or basic JS errors in templates
if ((indexContent.match(/<script/g) || []).length !== (indexContent.match(/<\/script>/g) || []).length) {
    console.error('❌ Error: Unbalanced <script> tags in index.html');
    process.exit(1);
}

console.log('✅ index.html basic syntax check passed');
console.log('🟢 Validation Successful. Ready for staging.');
process.exit(0);
