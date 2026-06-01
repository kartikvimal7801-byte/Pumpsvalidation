// Simple verification script to check testEngine.ts exports
import { registerSuite, getSuites, runSuites } from './src/devtools/testEngine.ts';

console.log('✓ Verifying testEngine.ts exports...\n');

// Check if functions are exported
const checks = [
  { name: 'registerSuite', fn: registerSuite },
  { name: 'getSuites', fn: getSuites },
  { name: 'runSuites', fn: runSuites }
];

let allPassed = true;

checks.forEach(({ name, fn }) => {
  if (typeof fn === 'function') {
    console.log(`✓ ${name}() is exported and is a function`);
  } else {
    console.log(`✗ ${name}() is NOT properly exported`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✓ All required functions are exported correctly!');
  process.exit(0);
} else {
  console.log('✗ Some functions are missing or not properly exported');
  process.exit(1);
}
