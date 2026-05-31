// ─── TestEngine Module Export Verification Tests ─────────────────────────────
// Task 1.2: Verify registerSuite(), getSuites(), runSuites() functions are exported

import { describe, it, expect } from '@jest/globals';
import {
  registerSuite,
  getSuites,
  runSuites,
  TestSuite,
  TestResult,
  TestCategory,
} from './testEngine';

describe('TestEngine Module Exports', () => {
  describe('registerSuite() function', () => {
    it('should be exported as a function', () => {
      expect(typeof registerSuite).toBe('function');
    });

    it('should accept a TestSuite parameter', () => {
      const mockSuite: TestSuite = {
        id: 'test-suite',
        name: 'Test Suite',
        category: 'navigation',
        run: async () => [],
      };

      // Should not throw
      expect(() => registerSuite(mockSuite)).not.toThrow();
    });
  });

  describe('getSuites() function', () => {
    it('should be exported as a function', () => {
      expect(typeof getSuites).toBe('function');
    });

    it('should return an array of TestSuite objects', () => {
      const suites = getSuites();
      expect(Array.isArray(suites)).toBe(true);
    });

    it('should accept an optional TestCategory parameter', () => {
      const category: TestCategory = 'navigation';
      const suites = getSuites(category);
      expect(Array.isArray(suites)).toBe(true);
    });

    it('should filter suites by category when category is provided', () => {
      const navigationSuites = getSuites('navigation');
      navigationSuites.forEach((suite) => {
        expect(suite.category).toBe('navigation');
      });
    });

    it('should return all suites when no category is provided', () => {
      const allSuites = getSuites();
      expect(allSuites.length).toBeGreaterThan(0);
    });
  });

  describe('runSuites() function', () => {
    it('should be exported as a function', () => {
      expect(typeof runSuites).toBe('function');
    });

    it('should return a Promise', () => {
      const result = runSuites();
      expect(result).toBeInstanceOf(Promise);
      return result; // Ensure promise resolves
    });

    it('should accept optional category parameter', async () => {
      const category: TestCategory = 'navigation';
      const results = await runSuites(category);
      expect(Array.isArray(results)).toBe(true);
    });

    it('should accept optional onProgress callback parameter', async () => {
      const progressResults: TestResult[] = [];
      const onProgress = (result: TestResult) => {
        progressResults.push(result);
      };

      await runSuites(undefined, onProgress);
      expect(progressResults.length).toBeGreaterThan(0);
    });

    it('should return an array of TestResult objects', async () => {
      const results = await runSuites();
      expect(Array.isArray(results)).toBe(true);
      
      if (results.length > 0) {
        const firstResult = results[0];
        expect(firstResult).toHaveProperty('id');
        expect(firstResult).toHaveProperty('name');
        expect(firstResult).toHaveProperty('category');
        expect(firstResult).toHaveProperty('status');
        expect(firstResult).toHaveProperty('message');
        expect(firstResult).toHaveProperty('duration');
        expect(firstResult).toHaveProperty('timestamp');
      }
    });

    it('should invoke onProgress callback for each test result', async () => {
      let callCount = 0;
      const onProgress = () => {
        callCount++;
      };

      const results = await runSuites(undefined, onProgress);
      expect(callCount).toBe(results.length);
    });
  });

  describe('Function Signatures', () => {
    it('registerSuite should match design specification: (suite: TestSuite) => void', () => {
      const mockSuite: TestSuite = {
        id: 'signature-test',
        name: 'Signature Test',
        category: 'api',
        run: async () => [],
      };

      const result = registerSuite(mockSuite);
      expect(result).toBeUndefined(); // void return type
    });

    it('getSuites should match design specification: (category?: TestCategory) => TestSuite[]', () => {
      // Test without parameter
      const allSuites = getSuites();
      expect(Array.isArray(allSuites)).toBe(true);

      // Test with parameter
      const categorySuites = getSuites('buttons');
      expect(Array.isArray(categorySuites)).toBe(true);
    });

    it('runSuites should match design specification: (category?, onProgress?) => Promise<TestResult[]>', async () => {
      // Test without parameters
      const results1 = await runSuites();
      expect(Array.isArray(results1)).toBe(true);

      // Test with category only
      const results2 = await runSuites('forms');
      expect(Array.isArray(results2)).toBe(true);

      // Test with both parameters
      const progressCallback = (result: TestResult) => {
        expect(result).toHaveProperty('id');
      };
      const results3 = await runSuites('api', progressCallback);
      expect(Array.isArray(results3)).toBe(true);
    });
  });

  describe('Integration with DevConsole', () => {
    it('should support DevConsole workflow: register → get → run', async () => {
      // 1. Register a custom suite
      const customSuite: TestSuite = {
        id: 'custom-integration',
        name: 'Custom Integration Test',
        category: 'api',
        run: async () => [
          {
            id: 'custom-1',
            name: 'Custom Test 1',
            category: 'api',
            status: 'pass',
            message: 'Test passed',
            duration: 10,
            timestamp: new Date().toISOString(),
          },
        ],
      };
      registerSuite(customSuite);

      // 2. Retrieve suites by category
      const apiSuites = getSuites('api');
      const customFound = apiSuites.some((s) => s.id === 'custom-integration');
      expect(customFound).toBe(true);

      // 3. Run suites with progress callback
      const progressResults: TestResult[] = [];
      const results = await runSuites('api', (result) => {
        progressResults.push(result);
      });

      expect(results.length).toBeGreaterThan(0);
      expect(progressResults.length).toBe(results.length);
    });
  });
});
