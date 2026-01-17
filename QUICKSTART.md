# Quick Start Guide - QJax 2.0

This guide shows you how to quickly get started with QJax 2.0 for Angular/RxJS.

## Installation

```bash
npm install queuejax
```

## Basic Usage

### 1. Import and Create Service Instance

```typescript
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QJaxService } from 'queuejax';

@Component({
  selector: 'app-my-component',
  template: `...`
})
export class MyComponent {
  private qjaxService: QJaxService;

  constructor(private http: HttpClient) {
    this.qjaxService = new QJaxService({
      maxPendingRequests: 5,
      onQueueChange: (length) => {
        console.log(`Queue has ${length} pending requests`);
      }
    });
  }
}
```

### 2. Queue Requests

```typescript
// Queue a single request
this.qjaxService.queue(() => 
  this.http.get('/api/data')
).subscribe(data => {
  console.log('Response:', data);
});

// Queue multiple requests - they execute in order!
for (let i = 0; i < 20; i++) {
  this.qjaxService.queue(() => 
    this.http.get(`/api/item/${i}`)
  ).subscribe(item => {
    console.log(`Item ${i}:`, item);
  });
}
```

### 3. Monitor Queue Progress

```typescript
// Subscribe to queue length changes
this.qjaxService.queueLength$.subscribe(length => {
  this.currentQueueLength = length;
  this.updateProgressBar(length);
});

// Subscribe to progress percentage
this.qjaxService.progress$.subscribe(progress => {
  console.log(`Progress: ${progress.percentage}%`);
});
```

### 4. Handle Queue Limits

```typescript
// Check if queue can accept more requests
if (this.qjaxService.canAcceptRequests()) {
  this.qjaxService.queue(() => this.http.post('/api/data', payload))
    .subscribe(result => console.log(result));
} else {
  this.showMessage('Queue is full. Please wait.');
}

// Or handle the error when queue is full
this.qjaxService.queue(() => this.http.get('/api/data'))
  .subscribe({
    next: data => console.log(data),
    error: err => {
      if (err.message.includes('Queue limit reached')) {
        this.showMessage('Please wait for current requests to complete');
      }
    }
  });
```

## Complete Example

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QJaxService } from 'queuejax';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-data-loader',
  template: `
    <div class="controls">
      <button (click)="loadBatch()" [disabled]="!canLoadMore">
        Load Data Batch
      </button>
      <button (click)="clearQueue()">Clear Queue</button>
    </div>
    
    <div class="status">
      <p>Queue Length: {{ queueLength }}</p>
      <p>Progress: {{ progress }}%</p>
      <p>Status: {{ status }}</p>
    </div>
    
    <div class="results">
      <div *ngFor="let item of items">{{ item }}</div>
    </div>
  `
})
export class DataLoaderComponent implements OnInit, OnDestroy {
  queueLength = 0;
  progress = 0;
  status = 'Ready';
  canLoadMore = true;
  items: any[] = [];
  
  private qjaxService: QJaxService;
  private subscriptions: Subscription[] = [];

  constructor(private http: HttpClient) {
    this.qjaxService = new QJaxService({
      maxPendingRequests: 10,
      onStart: () => {
        this.status = 'Processing...';
      },
      onStop: () => {
        this.status = 'Completed';
      },
      onQueueChange: (length) => {
        this.queueLength = length;
        this.canLoadMore = this.qjaxService.canAcceptRequests();
      }
    });
  }

  ngOnInit() {
    // Monitor queue length
    this.subscriptions.push(
      this.qjaxService.queueLength$.subscribe(length => {
        this.queueLength = length;
      })
    );
    
    // Monitor progress
    this.subscriptions.push(
      this.qjaxService.progress$.subscribe(prog => {
        this.progress = prog.percentage;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.qjaxService.clear();
  }

  loadBatch() {
    // Load 20 items in order
    for (let i = 0; i < 20; i++) {
      this.qjaxService.queue(() => 
        this.http.get(`/api/items/${i}`)
      ).subscribe({
        next: (item: any) => {
          this.items.push(item);
        },
        error: (err) => {
          console.error('Failed to load item:', err);
        }
      });
    }
  }

  clearQueue() {
    this.qjaxService.clear();
    this.items = [];
    this.status = 'Queue cleared';
  }
}
```

## Key Features Demonstrated

1. **Ordered Execution**: Requests execute sequentially and respond in order
2. **Max Pending Limit**: Prevent queue overflow with `maxPendingRequests`
3. **Progress Tracking**: Monitor queue with observables
4. **Event Callbacks**: React to queue state changes
5. **Error Handling**: Gracefully handle queue limits and request failures

## Common Patterns

### Pattern 1: Batch Processing with Feedback

```typescript
processBatch(items: any[]) {
  items.forEach((item, index) => {
    this.qjaxService.queue(() => 
      this.http.post('/api/process', item)
    ).subscribe({
      next: () => {
        console.log(`Processed ${index + 1}/${items.length}`);
      }
    });
  });
}
```

### Pattern 2: Sequential Form Submissions

```typescript
submitForms(forms: Form[]) {
  forms.forEach(form => {
    this.qjaxService.queue(() => 
      this.http.post('/api/submit', form)
    ).subscribe(
      response => this.handleSuccess(response),
      error => this.handleError(error)
    );
  });
}
```

### Pattern 3: Controlled Rate Limiting

```typescript
// Limit to 3 concurrent requests with user feedback
const qjax = new QJaxService({
  maxPendingRequests: 3,
  onQueueChange: (length) => {
    if (length >= 3) {
      this.showWarning('Queue is full. Please wait...');
    } else {
      this.hideWarning();
    }
  }
});
```

## Next Steps

- Read the [full Angular documentation](./ANGULAR-README.md)
- Check out the [example component](./example-angular/qjax-example.component.ts)
- Run the [demo script](./demo.js) to see it in action

## Need Help?

- Check the [main README](./README.markdown) for more information
- Review the [API documentation](./ANGULAR-README.md#api-reference)
- See the [example component](./example-angular/) for a complete implementation
