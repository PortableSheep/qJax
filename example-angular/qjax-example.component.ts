import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QJaxService } from '../src/qjax.service';
import { Subscription, Observable, timer } from 'rxjs';
import { delay, take } from 'rxjs/operators';

/**
 * Example Angular component demonstrating QJaxService usage
 * 
 * This component shows how to:
 * - Queue multiple async HTTP requests
 * - Limit max pending requests
 * - Display queue progress
 * - Handle responses in order
 */
@Component({
  selector: 'app-qjax-example',
  template: `
    <div class="qjax-example">
      <h2>QJax Angular/RxJS Example</h2>
      
      <div class="info">
        <p>
          This example queues HTTP requests that execute in order, 
          maintaining the appearance of synchronous execution while 
          remaining asynchronous.
        </p>
      </div>

      <div class="queue-status">
        <h3>Queue Status</h3>
        <div class="meter-container">
          <div class="meter" [style.width.%]="queuePercentage"></div>
        </div>
        <p>Queue Length: {{ queueLength }} / {{ maxPending }}</p>
        <p>Status: {{ status }}</p>
      </div>

      <div class="controls">
        <button 
          (click)="makeRequest()" 
          [disabled]="!canMakeRequest">
          Make Request
        </button>
        <button 
          (click)="makeMultipleRequests()" 
          [disabled]="!canMakeRequest">
          Make 20 Requests
        </button>
        <button (click)="clearQueue()">Clear Queue</button>
      </div>

      <div class="responses">
        <h3>Responses (in order):</h3>
        <div 
          *ngFor="let response of responses; let i = index" 
          class="response-item">
          <strong>{{ i + 1 }}.</strong> {{ response }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .qjax-example {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .info {
      background-color: #e3f2fd;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }

    .queue-status {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }

    .meter-container {
      width: 100%;
      height: 30px;
      background-color: #ddd;
      border-radius: 5px;
      overflow: hidden;
      margin: 10px 0;
    }

    .meter {
      height: 100%;
      background: linear-gradient(90deg, #4caf50, #ff9800, #f44336);
      transition: width 0.3s ease;
    }

    .controls {
      margin: 20px 0;
    }

    .controls button {
      padding: 10px 20px;
      margin-right: 10px;
      background-color: #2196f3;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    }

    .controls button:hover:not(:disabled) {
      background-color: #1976d2;
    }

    .controls button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .responses {
      margin-top: 20px;
    }

    .response-item {
      padding: 10px;
      margin: 5px 0;
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 3px;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    h2 {
      color: #333;
      border-bottom: 2px solid #2196f3;
      padding-bottom: 10px;
    }

    h3 {
      color: #555;
      margin-top: 0;
    }
  `]
})
export class QJaxExampleComponent implements OnInit, OnDestroy {
  queueLength = 0;
  maxPending = 5;
  queuePercentage = 0;
  status = 'Idle';
  canMakeRequest = true;
  responses: string[] = [];
  
  private qjaxService: QJaxService;
  private subscriptions: Subscription[] = [];

  constructor(private http: HttpClient) {
    // Initialize QJaxService with configuration
    this.qjaxService = new QJaxService({
      maxPendingRequests: this.maxPending,
      onStart: () => {
        this.status = 'Processing...';
      },
      onStop: () => {
        this.status = 'Idle';
      },
      onQueueChange: (length) => {
        this.queueLength = length;
        this.queuePercentage = (length / this.maxPending) * 100;
        this.canMakeRequest = this.qjaxService.canAcceptRequests();
      },
      onError: (error) => {
        console.error('QJax Error:', error);
      }
    });
  }

  ngOnInit(): void {
    // Subscribe to queue length changes
    const sub = this.qjaxService.queueLength$.subscribe(length => {
      this.queueLength = length;
      this.queuePercentage = (length / this.maxPending) * 100;
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.qjaxService.clear();
  }

  makeRequest(): void {
    const requestId = this.responses.length + 1;
    const mockResponses = [
      'Waffles aren\'t pancakes!',
      'Beep Boop',
      'Why can\'t monkeys fly?',
      'Jimminy Jerooo',
      'There is no spoon!',
      'I ate the worm!',
      'Spider monkey madness.',
      'Hash browns are evil!',
      'Don\'t take the red pill.',
      'Why can\'t I buy ham pants?'
    ];

    // Simulate an HTTP request with delay
    const request$ = this.qjaxService.queue(() => 
      // Simulate HTTP call with delay
      new Observable(observer => {
        setTimeout(() => {
          const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
          observer.next({ id: requestId, message: randomResponse });
          observer.complete();
        }, 750); // Simulate network delay
      })
    );

    const sub = request$.subscribe({
      next: (data: any) => {
        this.responses.push(`Request ${data.id}: ${data.message}`);
      },
      error: (error) => {
        if (error.message.includes('Queue limit reached')) {
          alert(error.message);
        }
      }
    });
    
    this.subscriptions.push(sub);
  }

  makeMultipleRequests(): void {
    // Fire off 20 requests - they will queue and execute in order
    // Using RxJS timer for proper subscription management
    const sub = timer(0, 50).pipe(take(20)).subscribe((i) => {
      this.makeRequest();
    });
    
    this.subscriptions.push(sub);
  }

  clearQueue(): void {
    this.qjaxService.clear();
    this.responses = [];
  }
}
