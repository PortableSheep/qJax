# QJax 2.0 - Angular/RxJS Support

This document describes the new Angular/RxJS version of qJax introduced in version 2.0.

## Overview

qJax 2.0 adds full Angular and RxJS support, allowing you to queue HTTP requests that execute asynchronously but respond in order, as if they were synchronous. This is perfect for scenarios where you need to:

- Fire off multiple async requests but maintain order
- Limit concurrent requests to prevent overwhelming the server
- Provide user feedback during queue processing
- Implement cooldown periods when queue limits are reached

## Installation

```bash
npm install queuejax
```

## Quick Start

### Basic Usage

```typescript
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QJaxService } from 'queuejax';

@Component({
  selector: 'app-example',
  template: `<button (click)="makeRequests()">Fire 20 Requests</button>`
})
export class ExampleComponent {
  private qjaxService: QJaxService;

  constructor(private http: HttpClient) {
    this.qjaxService = new QJaxService({
      maxPendingRequests: 5,
      onQueueChange: (length) => console.log('Queue:', length)
    });
  }

  makeRequests() {
    // Fire off 20 requests - they'll execute in order!
    for (let i = 0; i < 20; i++) {
      this.qjaxService.queue(() => 
        this.http.get(`/api/data/${i}`)
      ).subscribe(
        data => console.log(`Response ${i}:`, data)
      );
    }
  }
}
```

## Features

### 1. Ordered Async Execution

Requests are queued and executed sequentially, ensuring responses arrive in the same order as they were queued, even though they execute asynchronously.

```typescript
const qjax = new QJaxService();

// Queue 20 requests
for (let i = 0; i < 20; i++) {
  qjax.queue(() => this.http.get(`/api/item/${i}`))
    .subscribe(data => console.log(`Item ${i}:`, data));
}
// Responses will arrive in order: 0, 1, 2, 3, ... 19
```

### 2. Max Pending Requests Limit

Prevent overwhelming your server or client by limiting the queue size:

```typescript
const qjax = new QJaxService({
  maxPendingRequests: 5  // Only allow 5 pending requests
});

// Try to queue more than 5 requests
for (let i = 0; i < 10; i++) {
  qjax.queue(() => this.http.get(`/api/data/${i}`))
    .subscribe({
      next: data => console.log(data),
      error: err => {
        // Will throw error if queue is full
        console.error(err.message);
        // "Queue limit reached. Maximum 5 pending requests allowed..."
      }
    });
}
```

### 3. Queue Progress Events

Monitor queue status with RxJS observables:

```typescript
const qjax = new QJaxService({
  onQueueChange: (length) => {
    console.log(`Queue has ${length} pending requests`);
  }
});

// Or subscribe to queue length observable
qjax.queueLength$.subscribe(length => {
  console.log('Queue length:', length);
  updateProgressBar(length);
});
```

### 4. Start/Stop Events

Track when queue processing begins and ends:

```typescript
const qjax = new QJaxService({
  onStart: () => {
    console.log('Queue processing started');
    showSpinner();
  },
  onStop: () => {
    console.log('Queue is empty');
    hideSpinner();
  }
});
```

### 5. Error Handling

Handle errors gracefully:

```typescript
const qjax = new QJaxService({
  onError: (error) => {
    console.error('Request failed:', error);
    showErrorNotification(error);
  }
});

qjax.queue(() => this.http.get('/api/failing-endpoint'))
  .subscribe({
    error: (err) => {
      // Individual error handler
      console.log('This request failed:', err);
    }
  });
```

## API Reference

### QJaxService Constructor

```typescript
constructor(config?: QJaxConfig)
```

### QJaxConfig Interface

```typescript
interface QJaxConfig {
  /** Maximum number of pending requests (undefined = unlimited) */
  maxPendingRequests?: number;
  
  /** Timeout in milliseconds for individual requests */
  timeout?: number;
  
  /** Called when queue starts processing */
  onStart?: () => void;
  
  /** Called when queue finishes processing */
  onStop?: () => void;
  
  /** Called when an error occurs */
  onError?: (error: any) => void;
  
  /** Called on timeout (not implemented yet) */
  onTimeout?: () => void;
  
  /** Called when queue length changes */
  onQueueChange?: (queueLength: number) => void;
}
```

### Methods

#### queue<T>(requestFn: () => Observable<T>): Observable<T>

Queue an observable request for sequential execution.

```typescript
qjax.queue(() => this.http.get<User>('/api/user'))
  .subscribe(user => console.log(user));
```

#### queueFunction(fn: () => void): Observable<void>

Queue a simple function (non-observable) for sequential execution.

```typescript
qjax.queueFunction(() => {
  console.log('This will execute in queue order');
}).subscribe();
```

#### clear(): void

Clear all pending requests from the queue.

```typescript
qjax.clear();
```

#### getQueueLength(): number

Get the current number of pending requests.

```typescript
const pending = qjax.getQueueLength();
console.log(`${pending} requests pending`);
```

#### canAcceptRequests(): boolean

Check if the queue can accept more requests (based on maxPendingRequests limit).

```typescript
if (qjax.canAcceptRequests()) {
  qjax.queue(() => this.http.get('/api/data'))
    .subscribe(data => console.log(data));
} else {
  alert('Queue is full. Please wait.');
}
```

#### configure(config: Partial<QJaxConfig>): void

Update the service configuration.

```typescript
qjax.configure({
  maxPendingRequests: 10,
  onQueueChange: (length) => console.log(length)
});
```

### Observables

#### queueLength$: Observable<number>

Observable that emits the current queue length whenever it changes.

```typescript
qjax.queueLength$.subscribe(length => {
  updateProgressBar(length);
});
```

#### progress$: Observable<{current: number, total: number, percentage: number}>

Observable that emits progress information.

```typescript
qjax.progress$.subscribe(progress => {
  console.log(`Progress: ${progress.percentage}%`);
  console.log(`Completed ${progress.current} of ${progress.total}`);
});
```

## Real-World Examples

### Example 1: User Cooldown with Visual Feedback

```typescript
@Component({
  selector: 'app-data-loader',
  template: `
    <div class="queue-meter" [style.width.%]="queuePercentage"></div>
    <button 
      (click)="loadData()" 
      [disabled]="!canMakeRequest">
      Load Data
    </button>
    <p>{{ statusMessage }}</p>
  `
})
export class DataLoaderComponent {
  queuePercentage = 0;
  canMakeRequest = true;
  statusMessage = 'Ready';
  
  private qjax: QJaxService;

  constructor(private http: HttpClient) {
    this.qjax = new QJaxService({
      maxPendingRequests: 5,
      onQueueChange: (length) => {
        this.queuePercentage = (length / 5) * 100;
        this.canMakeRequest = this.qjax.canAcceptRequests();
        
        if (!this.canMakeRequest) {
          this.statusMessage = 'Queue full - please wait';
        } else {
          this.statusMessage = `${length} requests pending`;
        }
      },
      onStop: () => {
        this.statusMessage = 'All requests completed';
      }
    });
  }

  loadData() {
    this.qjax.queue(() => this.http.get('/api/data'))
      .subscribe(data => console.log(data));
  }
}
```

### Example 2: Batch Processing with Progress

```typescript
@Component({
  selector: 'app-batch-processor',
  template: `
    <button (click)="processBatch()">Process 100 Items</button>
    <div class="progress-bar" [style.width.%]="progress"></div>
    <p>Processed {{ completed }} of {{ total }} items</p>
  `
})
export class BatchProcessorComponent {
  progress = 0;
  completed = 0;
  total = 0;
  
  private qjax: QJaxService;

  constructor(private http: HttpClient) {
    this.qjax = new QJaxService({
      maxPendingRequests: 10
    });
  }

  processBatch() {
    const items = Array.from({ length: 100 }, (_, i) => i);
    this.total = items.length;
    this.completed = 0;

    items.forEach(item => {
      this.qjax.queue(() => 
        this.http.post('/api/process', { item })
      ).subscribe({
        next: () => {
          this.completed++;
          this.progress = (this.completed / this.total) * 100;
        },
        error: (err) => {
          console.error(`Failed to process item ${item}:`, err);
          this.completed++;
          this.progress = (this.completed / this.total) * 100;
        }
      });
    });
  }
}
```

## Comparison with jQuery Version

The Angular/RxJS version maintains the same core concepts as the jQuery version but with modern RxJS patterns:

| Feature | jQuery Version | Angular/RxJS Version |
|---------|---------------|---------------------|
| Queue execution | ✓ | ✓ |
| Promise events | jQuery promises | RxJS Observables |
| Queue callbacks | Callbacks | Callbacks + Observables |
| Max queue limit | Via onQueueChange | Built-in canAcceptRequests() |
| Function queuing | ✓ | ✓ |
| Framework | jQuery | Angular (framework-agnostic) |

## Migration from v1.x

The jQuery version (v1.x) continues to be available. The new Angular/RxJS version is a separate implementation that can coexist with the jQuery version.

**jQuery (v1.x):**
```javascript
var qjax = new $.qjax({
  onQueueChange: function(length) {
    console.log('Queue:', length);
  }
});

qjax.Queue({
  url: '/api/data',
  success: function(data) {
    console.log(data);
  }
});
```

**Angular/RxJS (v2.x):**
```typescript
const qjax = new QJaxService({
  onQueueChange: (length) => {
    console.log('Queue:', length);
  }
});

qjax.queue(() => this.http.get('/api/data'))
  .subscribe(data => console.log(data));
```

## TypeScript Support

Full TypeScript support with type definitions:

```typescript
interface User {
  id: number;
  name: string;
}

qjax.queue<User[]>(() => this.http.get<User[]>('/api/users'))
  .subscribe(users => {
    // TypeScript knows 'users' is User[]
    users.forEach(u => console.log(u.name));
  });
```

## License

Dual licensed under the MIT and GPL Version 2 licenses.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
