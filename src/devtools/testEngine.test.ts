// Test to verify testEngine.ts exports the required functions
import { registerSuite, getSuites, runSuites, type TestSuite, type TestCategory } from './testEngine';

describe('testEngine exports', () => {
  it('should export registerSuite function', () => {
    expect(registerSuite).toBeDefined();
    expect(typeof registerSuite).toBe('function');
  });

  it('should export getSuites function', () => {
    expect(getSuites).toBeDefined();
    expect(typeof getSuites).toBe('function');
  });

  it('should export runSuites function', () => {
    expect(runSuites).toBeDefined();
    expect(typeof runSuites).toBe('function');
  });

  it('should allow registering a test suite', () => {
    const testSuite: TestSuite = {
      id: 'test-suite',
      name: 'Test Suite',
      category: 'api' as TestCategory,
      run: async () => []
    };

    // This should not throw
    registerSuite(testSuite);
    
    // Verify the suite was registered
    const suites = getSuites('api');
    expect(suites.some(s => s.id === 'test-suite')).toBe(true);
  });

  it('should retrieve all suites when no category is specified', () => {
    const allSuites = getSuites();
    expect(Array.isArray(allSuites)).toBe(true);
    expect(allSuites.length).toBeGreaterThan(0);
  });

  it('should filter suites by category', () => {
    const navigationSuites = getSuites('navigation');
    expect(Array.isArray(navigationSuites)).toBe(true);
    navigationSuites.forEach(suite => {
      expect(suite.category).toBe('navigation');
    });
  });

  it('should run suites and return results', async () => {
    const results = await runSuites('navigation');
    expect(Array.isArray(results)).toBe(true);
    results.forEach(result => {
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('timestamp');
    });
  });

  it('should call onProgress callback during test execution', async () => {
    const progressResults: any[] = [];
    const onProgress = (result: any) => {
      progressResults.push(result);
    };

    await runSuites('navigation', onProgress);
    
    expect(progressResults.length).toBeGreaterThan(0);
  });

  it('should invoke onProgress callback for each individual test result', async () => {
    const progressResults: any[] = [];
    const onProgress = (result: any) => {
      progressResults.push(result);
    };

    // Run a specific category to get predictable results
    const finalResults = await runSuites('navigation', onProgress);
    
    // Verify that onProgress was called for each result
    expect(progressResults.length).toBe(finalResults.length);
    
    // Verify each result passed to onProgress matches the final results
    progressResults.forEach((progressResult, index) => {
      expect(progressResult).toEqual(finalResults[index]);
    });
  });

  it('should pass correct TestResult object to onProgress callback', async () => {
    const progressResults: any[] = [];
    const onProgress = (result: any) => {
      progressResults.push(result);
    };

    await runSuites('navigation', onProgress);
    
    // Verify each result has the correct TestResult structure
    progressResults.forEach(result => {
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('timestamp');
      
      // Verify types
      expect(typeof result.id).toBe('string');
      expect(typeof result.name).toBe('string');
      expect(typeof result.category).toBe('string');
      expect(['pass', 'fail', 'warning', 'skipped']).toContain(result.status);
      expect(typeof result.message).toBe('string');
      expect(typeof result.duration).toBe('number');
      expect(typeof result.timestamp).toBe('string');
      
      // Verify timestamp is valid ISO 8601
      expect(() => new Date(result.timestamp)).not.toThrow();
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });
  });

  it('should invoke onProgress for each test result across multiple suites', async () => {
    const progressResults: any[] = [];
    const callOrder: string[] = [];
    
    const onProgress = (result: any) => {
      progressResults.push(result);
      callOrder.push(`${result.category}-${result.id}`);
    };

    // Run all suites (no category filter)
    const finalResults = await runSuites(undefined, onProgress);
    
    // Verify onProgress was called for every single test result
    expect(progressResults.length).toBe(finalResults.length);
    expect(progressResults.length).toBeGreaterThan(0);
    
    // Verify results from different categories were captured
    const categories = new Set(progressResults.map(r => r.category));
    expect(categories.size).toBeGreaterThan(1); // Should have multiple categories
    
    // Verify each progress result matches the corresponding final result
    finalResults.forEach((finalResult, index) => {
      expect(progressResults[index]).toEqual(finalResult);
    });
  });

  it('should execute all registered suites sequentially when no category is provided', async () => {
    // Track execution order
    const executionOrder: string[] = [];
    const executionTimestamps: number[] = [];
    
    // Register test suites with tracking
    const suite1: TestSuite = {
      id: 'seq-test-1',
      name: 'Sequential Test 1',
      category: 'api' as TestCategory,
      run: async () => {
        executionOrder.push('suite1-start');
        executionTimestamps.push(Date.now());
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async work
        executionOrder.push('suite1-end');
        executionTimestamps.push(Date.now());
        return [{
          id: 'seq-1',
          name: 'Test 1',
          category: 'api' as TestCategory,
          status: 'pass' as const,
          message: 'Test 1 passed',
          duration: 50,
          timestamp: new Date().toISOString()
        }];
      }
    };

    const suite2: TestSuite = {
      id: 'seq-test-2',
      name: 'Sequential Test 2',
      category: 'database' as TestCategory,
      run: async () => {
        executionOrder.push('suite2-start');
        executionTimestamps.push(Date.now());
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async work
        executionOrder.push('suite2-end');
        executionTimestamps.push(Date.now());
        return [{
          id: 'seq-2',
          name: 'Test 2',
          category: 'database' as TestCategory,
          status: 'pass' as const,
          message: 'Test 2 passed',
          duration: 50,
          timestamp: new Date().toISOString()
        }];
      }
    };

    const suite3: TestSuite = {
      id: 'seq-test-3',
      name: 'Sequential Test 3',
      category: 'forms' as TestCategory,
      run: async () => {
        executionOrder.push('suite3-start');
        executionTimestamps.push(Date.now());
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async work
        executionOrder.push('suite3-end');
        executionTimestamps.push(Date.now());
        return [{
          id: 'seq-3',
          name: 'Test 3',
          category: 'forms' as TestCategory,
          status: 'pass' as const,
          message: 'Test 3 passed',
          duration: 50,
          timestamp: new Date().toISOString()
        }];
      }
    };

    // Register the test suites
    registerSuite(suite1);
    registerSuite(suite2);
    registerSuite(suite3);

    // Run all suites without specifying a category
    const results = await runSuites();

    // Verify all suites were executed
    expect(results.length).toBeGreaterThanOrEqual(3); // At least our 3 test suites
    expect(results.some(r => r.id === 'seq-1')).toBe(true);
    expect(results.some(r => r.id === 'seq-2')).toBe(true);
    expect(results.some(r => r.id === 'seq-3')).toBe(true);

    // Verify sequential execution (suite1 completes before suite2 starts, etc.)
    expect(executionOrder).toContain('suite1-start');
    expect(executionOrder).toContain('suite1-end');
    expect(executionOrder).toContain('suite2-start');
    expect(executionOrder).toContain('suite2-end');
    expect(executionOrder).toContain('suite3-start');
    expect(executionOrder).toContain('suite3-end');

    // Verify sequential order: suite1 must complete before suite2 starts
    const suite1EndIndex = executionOrder.indexOf('suite1-end');
    const suite2StartIndex = executionOrder.indexOf('suite2-start');
    const suite2EndIndex = executionOrder.indexOf('suite2-end');
    const suite3StartIndex = executionOrder.indexOf('suite3-start');

    expect(suite1EndIndex).toBeLessThan(suite2StartIndex);
    expect(suite2EndIndex).toBeLessThan(suite3StartIndex);

    // Verify timestamps confirm sequential execution (with small tolerance for timing)
    // suite1 end should be before suite2 start
    const suite1EndTime = executionTimestamps[executionOrder.indexOf('suite1-end')];
    const suite2StartTime = executionTimestamps[executionOrder.indexOf('suite2-start')];
    expect(suite1EndTime).toBeLessThanOrEqual(suite2StartTime);
  });

  // Error handling tests
  describe('error handling', () => {
    it('should catch suite execution errors and record as fail status', async () => {
      const errorSuite: TestSuite = {
        id: 'error-suite',
        name: 'Error Suite',
        category: 'api' as TestCategory,
        run: async () => {
          throw new Error('Test suite error');
        }
      };

      registerSuite(errorSuite);

      const results = await runSuites();
      
      // Find the error result
      const errorResult = results.find(r => r.id === 'error-suite-error');
      
      expect(errorResult).toBeDefined();
      expect(errorResult?.status).toBe('fail');
      expect(errorResult?.message).toContain('Suite threw exception');
      expect(errorResult?.message).toContain('Test suite error');
      expect(errorResult?.name).toContain('Error Suite');
    });

    it('should continue executing remaining suites after one suite fails', async () => {
      const suite1: TestSuite = {
        id: 'before-error',
        name: 'Before Error',
        category: 'api' as TestCategory,
        run: async () => [{
          id: 'before-1',
          name: 'Before Test',
          category: 'api' as TestCategory,
          status: 'pass' as const,
          message: 'Passed',
          duration: 0,
          timestamp: new Date().toISOString()
        }]
      };

      const errorSuite: TestSuite = {
        id: 'error-middle',
        name: 'Error Middle',
        category: 'api' as TestCategory,
        run: async () => {
          throw new Error('Middle error');
        }
      };

      const suite2: TestSuite = {
        id: 'after-error',
        name: 'After Error',
        category: 'api' as TestCategory,
        run: async () => [{
          id: 'after-1',
          name: 'After Test',
          category: 'api' as TestCategory,
          status: 'pass' as const,
          message: 'Passed',
          duration: 0,
          timestamp: new Date().toISOString()
        }]
      };

      registerSuite(suite1);
      registerSuite(errorSuite);
      registerSuite(suite2);

      const results = await runSuites();

      // Verify all three suites produced results
      expect(results.some(r => r.id === 'before-1')).toBe(true);
      expect(results.some(r => r.id === 'error-middle-error')).toBe(true);
      expect(results.some(r => r.id === 'after-1')).toBe(true);

      // Verify the error was recorded correctly
      const errorResult = results.find(r => r.id === 'error-middle-error');
      expect(errorResult?.status).toBe('fail');
      expect(errorResult?.message).toContain('Middle error');
    });

    it('should invoke onProgress callback for error results', async () => {
      const progressResults: any[] = [];
      const onProgress = (result: any) => {
        progressResults.push(result);
      };

      const errorSuite: TestSuite = {
        id: 'progress-error',
        name: 'Progress Error',
        category: 'api' as TestCategory,
        run: async () => {
          throw new Error('Progress test error');
        }
      };

      registerSuite(errorSuite);

      await runSuites(undefined, onProgress);

      // Find the error result in progress callbacks
      const errorResult = progressResults.find(r => r.id === 'progress-error-error');
      
      expect(errorResult).toBeDefined();
      expect(errorResult?.status).toBe('fail');
      expect(errorResult?.message).toContain('Progress test error');
    });

    it('should include error stack trace in detail field', async () => {
      const errorSuite: TestSuite = {
        id: 'stack-error',
        name: 'Stack Error',
        category: 'api' as TestCategory,
        run: async () => {
          throw new Error('Stack trace test');
        }
      };

      registerSuite(errorSuite);

      const results = await runSuites();
      
      const errorResult = results.find(r => r.id === 'stack-error-error');
      
      expect(errorResult).toBeDefined();
      expect(errorResult?.detail).toBeDefined();
      expect(errorResult?.detail).toContain('Error: Stack trace test');
    });

    it('should handle non-Error thrown values', async () => {
      const errorSuite: TestSuite = {
        id: 'string-error',
        name: 'String Error',
        category: 'api' as TestCategory,
        run: async () => {
          throw 'String error message';
        }
      };

      registerSuite(errorSuite);

      const results = await runSuites();
      
      const errorResult = results.find(r => r.id === 'string-error-error');
      
      expect(errorResult).toBeDefined();
      expect(errorResult?.status).toBe('fail');
      expect(errorResult?.message).toContain('String error message');
      expect(errorResult?.detail).toBeUndefined(); // No stack for non-Error
    });
  });
});
