import { TestBed } from '@angular/core/testing';
import { QJaxService } from './qjax.service';
import { of, throwError, delay } from 'rxjs';

describe('QJaxService', () => {
  let service: QJaxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = new QJaxService();
  });

  afterEach(() => {
    service.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should queue requests and execute them in order', (done) => {
    const results: number[] = [];
    const requests = [1, 2, 3, 4, 5];

    let completed = 0;
    requests.forEach((num, index) => {
      service.queue(() => of(num).pipe(delay(100))).subscribe({
        next: (value) => {
          results.push(value);
          completed++;
          
          if (completed === requests.length) {
            expect(results).toEqual([1, 2, 3, 4, 5]);
            done();
          }
        }
      });
    });
  });

  it('should track queue length correctly', (done) => {
    const queueLengths: number[] = [];
    
    service.queueLength$.subscribe(length => {
      queueLengths.push(length);
    });

    service.queue(() => of(1).pipe(delay(50))).subscribe();
    service.queue(() => of(2).pipe(delay(50))).subscribe();
    service.queue(() => of(3).pipe(delay(50))).subscribe();

    setTimeout(() => {
      // Should have seen: 0 (initial), 1, 2, 3 (adding), then decreasing as processed
      expect(queueLengths[0]).toBe(0); // Initial
      expect(queueLengths[1]).toBe(1); // First added
      expect(queueLengths[2]).toBe(2); // Second added
      expect(queueLengths[3]).toBe(3); // Third added
      done();
    }, 100);
  });

  it('should enforce max pending requests limit', () => {
    const serviceWithLimit = new QJaxService({ maxPendingRequests: 3 });
    
    // Add 3 requests (should succeed)
    serviceWithLimit.queue(() => of(1).pipe(delay(1000))).subscribe();
    serviceWithLimit.queue(() => of(2).pipe(delay(1000))).subscribe();
    serviceWithLimit.queue(() => of(3).pipe(delay(1000))).subscribe();
    
    // Try to add 4th request (should fail)
    serviceWithLimit.queue(() => of(4)).subscribe({
      error: (error) => {
        expect(error.message).toContain('Queue limit reached');
      }
    });
    
    serviceWithLimit.clear();
  });

  it('should call onStart when processing begins', (done) => {
    let startCalled = false;
    const serviceWithCallbacks = new QJaxService({
      onStart: () => {
        startCalled = true;
      }
    });

    serviceWithCallbacks.queue(() => of(1).pipe(delay(50))).subscribe({
      complete: () => {
        expect(startCalled).toBe(true);
        serviceWithCallbacks.clear();
        done();
      }
    });
  });

  it('should call onStop when queue is empty', (done) => {
    let stopCalled = false;
    const serviceWithCallbacks = new QJaxService({
      onStop: () => {
        stopCalled = true;
      }
    });

    serviceWithCallbacks.queue(() => of(1).pipe(delay(50))).subscribe({
      complete: () => {
        setTimeout(() => {
          expect(stopCalled).toBe(true);
          serviceWithCallbacks.clear();
          done();
        }, 100);
      }
    });
  });

  it('should call onError when request fails', (done) => {
    let errorCalled = false;
    const serviceWithCallbacks = new QJaxService({
      onError: (error) => {
        errorCalled = true;
        expect(error.message).toBe('Test error');
      }
    });

    serviceWithCallbacks.queue(() => throwError(() => new Error('Test error'))).subscribe({
      error: () => {
        expect(errorCalled).toBe(true);
        serviceWithCallbacks.clear();
        done();
      }
    });
  });

  it('should call onQueueChange when queue length changes', (done) => {
    const queueLengths: number[] = [];
    const serviceWithCallbacks = new QJaxService({
      onQueueChange: (length) => {
        queueLengths.push(length);
      }
    });

    serviceWithCallbacks.queue(() => of(1).pipe(delay(50))).subscribe();
    serviceWithCallbacks.queue(() => of(2).pipe(delay(50))).subscribe();

    setTimeout(() => {
      expect(queueLengths.length).toBeGreaterThan(0);
      expect(queueLengths[0]).toBe(1);
      serviceWithCallbacks.clear();
      done();
    }, 100);
  });

  it('should clear the queue', () => {
    service.queue(() => of(1).pipe(delay(1000))).subscribe();
    service.queue(() => of(2).pipe(delay(1000))).subscribe();
    service.queue(() => of(3).pipe(delay(1000))).subscribe();

    expect(service.getQueueLength()).toBe(3);
    
    service.clear();
    
    expect(service.getQueueLength()).toBe(0);
  });

  it('should queue functions', (done) => {
    let functionCalled = false;
    
    service.queueFunction(() => {
      functionCalled = true;
    }).subscribe({
      complete: () => {
        expect(functionCalled).toBe(true);
        done();
      }
    });
  });

  it('should report if queue can accept requests', () => {
    const serviceWithLimit = new QJaxService({ maxPendingRequests: 2 });
    
    expect(serviceWithLimit.canAcceptRequests()).toBe(true);
    
    serviceWithLimit.queue(() => of(1).pipe(delay(1000))).subscribe();
    serviceWithLimit.queue(() => of(2).pipe(delay(1000))).subscribe();
    
    expect(serviceWithLimit.canAcceptRequests()).toBe(false);
    
    serviceWithLimit.clear();
  });

  it('should handle 20 requests in order', (done) => {
    const results: number[] = [];
    const requests = Array.from({ length: 20 }, (_, i) => i + 1);

    let completed = 0;
    requests.forEach((num) => {
      service.queue(() => of(num).pipe(delay(10))).subscribe({
        next: (value) => {
          results.push(value);
          completed++;
          
          if (completed === requests.length) {
            expect(results).toEqual(requests);
            done();
          }
        }
      });
    });
  });
});
