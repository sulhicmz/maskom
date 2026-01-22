#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  parseEnginesField,
  checkNodeVersion,
  getCurrentNodeVersion,
  generateRemediationActions,
} from '../src/utils/nodeCompatibility/versionCheck';

const packageJsonPath = join(process.cwd(), 'package.json');

function main() {
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const engines = packageJson.engines?.node;

    if (!engines) {
      console.log('✓ No Node.js version requirement specified in package.json');
      process.exit(0);
    }

    const requirement = parseEnginesField(engines);
    const currentVersion = getCurrentNodeVersion();
    const checkResult = checkNodeVersion(currentVersion, requirement);

    if (checkResult.status === 'fail') {
      console.error(`\n❌ ${checkResult.message}`);
      console.error('\nRemediation Actions:');
      const actions = generateRemediationActions(checkResult);
      actions.forEach((action, index) => {
        console.error(`\n${index + 1}. ${action.action}`);
        console.error(`   Description: ${action.description}`);
        console.error(`   Command: ${action.command}`);
      });
      console.error('\nBuild failed due to Node.js version mismatch.');
      process.exit(1);
    }

    if (checkResult.status === 'warning') {
      console.warn(`\n⚠️  ${checkResult.message}`);
      console.warn('⚠️  Build continuing, but consider using a supported Node.js version.');
      process.exit(0);
    }

    console.log(`✓ ${checkResult.message}`);
    process.exit(0);
  } catch (error) {
    console.error('Error checking Node.js version:', error);
    process.exit(1);
  }
}

main();
