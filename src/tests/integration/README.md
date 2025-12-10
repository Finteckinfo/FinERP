# Wallet Authentication Integration Tests

**Author:** Llakterian  
**Date:** November 2025

## Overview

This directory contains comprehensive integration tests for the wallet authentication system, validating encryption, decryption, password management, and security question recovery flows.

## Test Suite Coverage

### Wallet Encryption Service Tests
- **Encryption/Decryption:** Validates AES-256-GCM encryption with PBKDF2 key derivation
- **LocalStorage Operations:** Tests wallet storage, retrieval, and deletion
- **Password Verification:** Validates password checking mechanisms
- **Password Change:** Tests password update functionality
- **Import/Export:** Validates wallet backup and restore operations

### Security Questions Service Tests
- **Answer Storage:** Tests SHA-256 hashing and storage of security answers
- **Answer Verification:** Validates security question recovery flow
- **Normalization:** Tests case-insensitive answer matching
- **Special Characters:** Validates handling of unicode and special characters

### Full Authentication Flow Tests
- **Complete Flow:** End-to-end wallet creation, encryption, and recovery
- **Backup/Restore:** Full wallet export and import cycle
- **Security:** Validates protection against unauthorized access

### Edge Cases and Error Handling
- **Empty Data:** Tests handling of empty wallet data
- **Large Data:** Validates encryption of very long mnemonic phrases
- **Unicode:** Tests support for unicode passwords and data
- **Data Integrity:** Validates consistency across multiple encryption cycles

## Prerequisites

### Installing Vitest

If Vitest is not already installed in the project, add it:

```bash
npm install -D vitest @vitest/ui happy-dom
```

### Configure Vitest

Create or update `vitest.config.ts` in the project root:

```typescript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '*.config.ts',
        '*.config.js'
      ]
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
```

### Test Setup File

Create `src/tests/setup.ts` to configure the test environment:

```typescript
import { vi } from 'vitest';

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

global.localStorage = localStorageMock as any;

// Mock crypto if needed (depending on test environment)
if (typeof global.crypto === 'undefined') {
  const { webcrypto } = await import('crypto');
  global.crypto = webcrypto as any;
}
```

### Update package.json

Add test scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:integration": "vitest run src/tests/integration"
  }
}
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Tests Once (CI Mode)
```bash
npm run test:run
```

### Run Only Integration Tests
```bash
npm run test:integration
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npx vitest src/tests/integration/walletAuth.test.ts
```

### Watch Mode (Re-run on changes)
```bash
npx vitest --watch
```

## Test Structure

```
src/tests/
├── integration/
│   ├── README.md (this file)
│   └── walletAuth.test.ts (wallet authentication tests)
└── setup.ts (test environment configuration)
```

## Writing New Tests

When adding new test cases:

1. Follow the existing test structure with `describe` and `it` blocks
2. Use `beforeEach` and `afterEach` hooks for setup/cleanup
3. Clear localStorage between tests to avoid state pollution
4. Test both success and failure scenarios
5. Include edge cases and error handling
6. Update this README with new test coverage

### Example Test Structure

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup code
  });

  afterEach(() => {
    // Cleanup code
  });

  it('should handle success case', async () => {
    // Test implementation
    expect(result).toBe(expected);
  });

  it('should handle error case', async () => {
    // Test error handling
    await expect(
      dangerousOperation()
    ).rejects.toThrow('Expected error message');
  });
});
```

## Continuous Integration

These tests are designed to run in CI/CD pipelines. Ensure your CI configuration includes:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: npm run test:run

- name: Generate Coverage
  run: npm run test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

## Test Coverage Goals

Target coverage metrics:
- **Statements:** 90%+
- **Branches:** 85%+
- **Functions:** 90%+
- **Lines:** 90%+

## Troubleshooting

### Test Fails with "Cannot find module 'vitest'"

Install Vitest:
```bash
npm install -D vitest
```

### Tests Fail with Crypto Errors

Ensure the test setup file properly mocks the crypto API or use a test environment that supports Web Crypto API (like happy-dom).

### LocalStorage Not Defined

Make sure the test setup file includes localStorage mock.

### Path Alias Not Working

Verify that `vitest.config.ts` includes the correct path alias configuration matching your `tsconfig.json`.

## Security Considerations

These tests validate:
- Encryption strength (AES-256-GCM)
- Key derivation (PBKDF2 with 100,000 iterations)
- Password complexity requirements
- Security question hashing (SHA-256)
- Protection against common attacks
- Data integrity across operations

## Future Enhancements

Potential improvements to the test suite:
- Performance benchmarking for encryption operations
- Fuzzing tests for input validation
- Integration with actual wallet providers
- UI component testing for wallet authentication flow
- E2E tests using Playwright or Cypress
- Security audit automation

## References

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

## Support

For issues or questions about these tests:
1. Check this README for common solutions
2. Review test output for specific error messages
3. Verify test environment setup matches requirements
4. Check that all dependencies are installed
