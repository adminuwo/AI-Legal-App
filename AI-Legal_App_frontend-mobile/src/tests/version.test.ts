/**
 * AI Legal Mobile - Centralized App Update System Test Suite
 * Validates semantic version comparison, optional update detection,
 * mandatory update classification, and resilience against invalid version metadata.
 */

import { compareVersions, isUpdateAvailable, isMandatoryUpdate, parseVersion } from '../utils/version';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

export function runVersionTests() {
  console.log('--- Running AI LEGAL™ Version Unit Tests ---');

  // Section 8 Semantic Version Comparisons:
  assert(compareVersions('1.0.0', '1.1.0') === -1, '1.0.0 < 1.1.0 -> TRUE');
  assert(compareVersions('1.1.0', '1.2.0') === -1, '1.1.0 < 1.2.0 -> TRUE');
  assert(compareVersions('1.2.0', '1.2.0') === 0, '1.2.0 < 1.2.0 -> FALSE');
  assert(compareVersions('1.10.0', '1.9.0') === 1, '1.10.0 > 1.9.0 -> TRUE');

  // TEST 1: Current = Latest -> No update available
  assert(isUpdateAvailable('1.2.0', '1.2.0') === false, 'TEST 1: Current = Latest => no update');
  assert(isMandatoryUpdate('1.2.0', '1.1.0') === false, 'TEST 1: Current > Minimum => no mandatory');

  // TEST 2: Current < Latest, Current >= Minimum -> Optional update
  assert(isUpdateAvailable('1.0.0', '1.1.0') === true, 'TEST 2: Current < Latest => update available');
  assert(isMandatoryUpdate('1.0.0', '1.0.0') === false, 'TEST 2: Current >= Minimum => not mandatory');

  // TEST 6: Current < Minimum -> Mandatory update
  assert(isUpdateAvailable('1.0.0', '1.2.0') === true, 'TEST 6: Current < Minimum => update available');
  assert(isMandatoryUpdate('1.0.0', '1.1.0') === true, 'TEST 6: Current < Minimum => mandatory update required');

  // TEST 10: Current >= Latest -> No optional or mandatory update
  assert(isUpdateAvailable('1.3.0', '1.3.0') === false, 'TEST 10: Installed = Latest => no update');
  assert(isMandatoryUpdate('1.3.0', '1.1.0') === false, 'TEST 10: Installed > Minimum => no mandatory');
  assert(isUpdateAvailable('1.4.0', '1.3.0') === false, 'TEST 10: Installed > Latest => no update');

  // SECTION 14 EDGE CASES: Latest = 1.3.0, Minimum = 1.1.0
  // Current 1.2.0: Optional update to 1.3.0
  assert(isUpdateAvailable('1.2.0', '1.3.0') === true, 'Edge case 1.2.0 < 1.3.0');
  assert(isMandatoryUpdate('1.2.0', '1.1.0') === false, 'Edge case 1.2.0 >= 1.1.0 (Optional)');

  // Current 1.0.0: Mandatory update
  assert(isUpdateAvailable('1.0.0', '1.3.0') === true, 'Edge case 1.0.0 < 1.3.0');
  assert(isMandatoryUpdate('1.0.0', '1.1.0') === true, 'Edge case 1.0.0 < 1.1.0 (Mandatory)');

  // Current 1.3.0: No update UI
  assert(isUpdateAvailable('1.3.0', '1.3.0') === false, 'Edge case 1.3.0 = 1.3.0 (No update UI)');

  // Patch version updates (1.0.0 vs 1.0.1)
  assert(compareVersions('1.0.0', '1.0.1') === -1, 'Patch version comparison');
  assert(isUpdateAvailable('1.0.0', '1.0.1') === true, 'Patch update available');

  // Pre-release tags and build metadata
  const parsed1 = parseVersion('1.2.0-rc.1');
  assert(parsed1[0] === 1 && parsed1[1] === 2 && parsed1[2] === 0, 'Pre-release tag handling');
  
  const parsed2 = parseVersion('v2.5.1+102');
  assert(parsed2[0] === 2 && parsed2[1] === 5 && parsed2[2] === 1, 'Build metadata tag handling');

  // Malformed and missing version input resilience
  assert(compareVersions(null as any, '1.2.0') === -1, 'Null version handling');
  assert(compareVersions('1.0.0', undefined as any) === 1, 'Undefined version handling');
  assert(compareVersions('invalid-version', '1.2.0') === -1, 'Malformed version handling');
  assert(compareVersions('invalid', 'invalid') === 0, 'Equal invalid strings handling');

  console.log('✅ ALL AI LEGAL™ VERSION TEST CASES PASSED SUCCESSFULLY!');
}

try {
  runVersionTests();
} catch (err: any) {
  console.error('❌ Version test failure:', err.message);
  process.exit(1);
}
