#!/usr/bin/env node
/**
 * Simple test runner for QJaxService
 * This demonstrates the core functionality without requiring a full Angular app
 */

// Mock minimal Angular Injectable decorator for standalone testing
global.Injectable = function() {
  return function(target) {
    return target;
  };
};

const { QJaxService } = require('./dist/qjax.service');
const { of, throwError } = require('rxjs');
const { delay } = require('rxjs/operators');

console.log('\n=== QJax Service Demo ===\n');

// Test 1: Basic queue with ordered responses
console.log('Test 1: Queue 5 requests and ensure they respond in order');
const qjax1 = new QJaxService({
  onQueueChange: (length) => console.log(`  Queue length: ${length}`),
  onStart: () => console.log('  Queue started processing'),
  onStop: () => console.log('  Queue finished processing')
});

const results1 = [];
const requests = [1, 2, 3, 4, 5];

requests.forEach((num) => {
  qjax1.queue(() => of(num).pipe(delay(Math.random() * 100)))
    .subscribe({
      next: (value) => {
        results1.push(value);
        console.log(`  Received response: ${value}`);
        
        if (results1.length === requests.length) {
          console.log(`  Results: [${results1.join(', ')}]`);
          console.log(`  ✓ Responses received in order: ${JSON.stringify(results1) === JSON.stringify(requests)}\n`);
          runTest2();
        }
      }
    });
});

// Test 2: Max pending requests limit
function runTest2() {
  console.log('Test 2: Max pending requests limit (max = 3)');
  const qjax2 = new QJaxService({
    maxPendingRequests: 3,
    onQueueChange: (length) => console.log(`  Queue length: ${length}`)
  });

  // Try to add 5 requests immediately (last 2 should be rejected)
  let rejectedCount = 0;
  let acceptedCount = 0;
  const startTime = Date.now();

  for (let i = 1; i <= 5; i++) {
    // Add all requests synchronously
    const addTime = Date.now() - startTime;
    qjax2.queue(() => of(i).pipe(delay(100)))
      .subscribe({
        next: (value) => {
          acceptedCount++;
          console.log(`  Request ${value} accepted and completed`);
        },
        error: (err) => {
          rejectedCount++;
          console.log(`  Request ${i} rejected (immediately)`);
        }
      });
  }
  
  // Check results after processing
  setTimeout(() => {
    console.log(`  ✓ Total Accepted: ${acceptedCount}, Rejected: ${rejectedCount}`);
    console.log(`  ✓ Note: Requests are processed sequentially, so max pending is enforced at queue time\n`);
    runTest3();
  }, 1500);
}

// Test 3: Error handling
function runTest3() {
  console.log('Test 3: Error handling');
  let errorCaught = false;
  const qjax3 = new QJaxService({
    onError: (error) => {
      console.log(`  Global error handler called: ${error.message}`);
      errorCaught = true;
    }
  });

  qjax3.queue(() => throwError(() => new Error('Test error')))
    .subscribe({
      error: (err) => {
        console.log(`  Individual error handler called: ${err.message}`);
        console.log(`  ✓ Error handling works: ${errorCaught}\n`);
        runTest4();
      }
    });
}

// Test 4: Queue operations
function runTest4() {
  console.log('Test 4: Queue operations (clear, getQueueLength, canAcceptRequests)');
  const qjax4 = new QJaxService({ maxPendingRequests: 5 });

  qjax4.queue(() => of(1).pipe(delay(5000))).subscribe();
  qjax4.queue(() => of(2).pipe(delay(5000))).subscribe();
  qjax4.queue(() => of(3).pipe(delay(5000))).subscribe();

  // Check immediately after queueing
  setTimeout(() => {
    console.log(`  Queue length: ${qjax4.getQueueLength()}`);
    console.log(`  Can accept requests: ${qjax4.canAcceptRequests()}`);
    console.log(`  ✓ Queue length is 2 (one being processed): ${qjax4.getQueueLength() === 2}`);
    console.log(`  ✓ Can accept more requests: ${qjax4.canAcceptRequests()}`);

    qjax4.clear();
    console.log(`  After clear, queue length: ${qjax4.getQueueLength()}`);
    console.log(`  ✓ Clear works: ${qjax4.getQueueLength() === 0}\n`);
    
    runTest5();
  }, 10);
}

// Test 5: 20 requests in order
function runTest5() {
  console.log('Test 5: Fire off 20 requests and verify they respond in order');
  const qjax5 = new QJaxService({
    maxPendingRequests: 20  // Allow all 20 to queue
  });

  const results5 = [];
  const expected = Array.from({ length: 20 }, (_, i) => i + 1);
  
  expected.forEach((num) => {
    qjax5.queue(() => of(num).pipe(delay(Math.random() * 50)))
      .subscribe({
        next: (value) => {
          results5.push(value);
          
          if (results5.length === expected.length) {
            const isOrdered = JSON.stringify(results5) === JSON.stringify(expected);
            console.log(`  First 5 responses: [${results5.slice(0, 5).join(', ')}]`);
            console.log(`  Last 5 responses: [${results5.slice(-5).join(', ')}]`);
            console.log(`  ✓ All 20 responses received in order: ${isOrdered}\n`);
            
            console.log('=== All Tests Complete ===\n');
            process.exit(0);
          }
        },
        error: (err) => {
          console.log(`  Error: ${err.message}`);
        }
      });
  });
}
