# QJax Angular Example

This example demonstrates how to use the QJaxService in an Angular application.

## Features Demonstrated

1. **Queued Async Requests**: Fire off multiple async requests that execute in order
2. **Max Pending Requests**: Limit the queue to prevent overwhelming the system
3. **Queue Progress**: Visual feedback showing queue status
4. **Ordered Responses**: Responses arrive in the same order as requests, despite async execution
5. **Cooldown Period**: When queue is full, users must wait for it to reduce

## Usage in Your Angular App

### 1. Import the Module

```typescript
import { QJaxModule } from 'qjax';

@NgModule({
  imports: [
    QJaxModule,
    // ... other imports
  ]
})
export class AppModule { }
```

### 2. Inject and Configure the Service

```typescript
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QJaxService } from 'qjax';

@Component({
  selector: 'app-my-component',
  template: `...`
})
export class MyComponent implements OnInit {
  private qjaxService: QJaxService;

  constructor(private http: HttpClient) {
    this.qjaxService = new QJaxService({
      maxPendingRequests: 5,
      onQueueChange: (length) => {
        console.log('Queue length:', length);
      },
      onStart: () => console.log('Queue started'),
      onStop: () => console.log('Queue stopped')
    });
  }

  ngOnInit(): void {
    // Queue multiple requests
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

### 3. Monitor Queue Progress

```typescript
// Subscribe to queue length changes
this.qjaxService.queueLength$.subscribe(length => {
  console.log('Current queue length:', length);
});

// Check if queue can accept more requests
if (this.qjaxService.canAcceptRequests()) {
  this.qjaxService.queue(() => this.http.get('/api/data'))
    .subscribe(data => console.log(data));
} else {
  alert('Queue is full. Please wait.');
}
```

## Running the Example

To run this example in your Angular application:

1. Copy the component to your project
2. Import it in your module
3. Add it to your routing or use it directly in a template
4. Install dependencies: `npm install rxjs @angular/core @angular/common`

## API Reference

### QJaxService Configuration

```typescript
interface QJaxConfig {
  maxPendingRequests?: number;  // Max queue size (undefined = unlimited)
  timeout?: number;              // Request timeout (not implemented yet)
  onStart?: () => void;          // Called when queue starts
  onStop?: () => void;           // Called when queue empties
  onError?: (error: any) => void; // Called on request error
  onQueueChange?: (length: number) => void; // Called on queue change
}
```

### QJaxService Methods

- `queue<T>(requestFn: () => Observable<T>): Observable<T>` - Queue an observable
- `queueFunction(fn: () => void): Observable<void>` - Queue a simple function
- `clear(): void` - Clear all pending requests
- `getQueueLength(): number` - Get current queue length
- `canAcceptRequests(): boolean` - Check if more requests can be queued
- `configure(config: Partial<QJaxConfig>): void` - Update configuration

### Observables

- `queueLength$: Observable<number>` - Emits current queue length
- `progress$: Observable<{current, total, percentage}>` - Emits progress info
