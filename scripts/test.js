#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Freelancer Marketplace API Tests...\n');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';

// Run tests
const testProcess = spawn('npx', ['jest', '--verbose', '--coverage'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  shell: true
});

testProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log('\n❌ Some tests failed.');
    process.exit(code);
  }
});

testProcess.on('error', (error) => {
  console.error('Error running tests:', error);
  process.exit(1);
});