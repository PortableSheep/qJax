import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { QJaxService } from '../../../src/qjax.service';
import { Subscription, Observable, timer } from 'rxjs';
import { delay, take } from 'rxjs/operators';

/**
 * QJax Angular Example - Standalone Application
 * 
 * Demonstrates QJaxService for ordered async request queuing with rate limiting
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="qjax-example">
      <header>
        <h1>🚀 QJax 2.0 - Angular/RxJS Example</h1>
        <p class="subtitle">Ordered Async Request Queue with Rate Limiting</p>
      </header>

      <section class="info-card">
        <h2>📋 What This Demonstrates</h2>
        <ul>
          <li><strong>Ordered Execution:</strong> Requests fire asynchronously but respond in order</li>
          <li><strong>Rate Limiting:</strong> Max 5 pending requests prevents server overload</li>
          <li><strong>Progress Tracking:</strong> Real-time queue monitoring</li>
          <li><strong>User Feedback:</strong> Button disables when queue is full</li>
        </ul>
      </section>

      <section class="queue-status-card">
        <h2>📊 Queue Status</h2>
        <div class="meter-container">
          <div class="meter" [style.width.%]="queuePercentage">
            <span class="meter-text" *ngIf="queuePercentage > 15">{{ queueLength }}/{{ maxPending }}</span>
          </div>
        </div>
        <div class="status-grid">
          <div class="status-item">
            <label>Queue Length:</label>
            <span class="value">{{ queueLength }} / {{ maxPending }}</span>
          </div>
          <div class="status-item">
            <label>Status:</label>
            <span class="value" [class.processing]="status === 'Processing...'">{{ status }}</span>
          </div>
          <div class="status-item">
            <label>Can Accept:</label>
            <span class="value" [class.yes]="canMakeRequest" [class.no]="!canMakeRequest">
              {{ canMakeRequest ? 'Yes ✓' : 'No (Queue Full)' }}
            </span>
          </div>
        </div>
      </section>

      <section class="controls-card">
        <h2>🎮 Controls</h2>
        <div class="button-group">
          <button 
            class="btn btn-primary" 
            (click)="makeRequest()" 
            [disabled]="!canMakeRequest">
            <span class="icon">➕</span> Make Single Request
          </button>
          <button 
            class="btn btn-secondary" 
            (click)="makeMultipleRequests()" 
            [disabled]="!canMakeRequest">
            <span class="icon">🔥</span> Fire 20 Requests
          </button>
          <button 
            class="btn btn-danger" 
            (click)="clearQueue()">
            <span class="icon">🗑️</span> Clear Queue
          </button>
        </div>
        <p class="help-text" *ngIf="!canMakeRequest">
          ⚠️ Queue is full. Wait for requests to complete before adding more.
        </p>
      </section>

      <section class="responses-card">
        <h2>📥 Responses (in order)</h2>
        <div class="response-count" *ngIf="responses.length > 0">
          Total responses: {{ responses.length }}
        </div>
        <div class="responses-container">
          <div 
            *ngFor="let response of responses; let i = index" 
            class="response-item"
            [class.new]="i === responses.length - 1">
            <span class="response-number">{{ i + 1 }}</span>
            <span class="response-text">{{ response }}</span>
          </div>
          <div *ngIf="responses.length === 0" class="empty-state">
            Click "Make Request" to see ordered responses appear here
          </div>
        </div>
      </section>

      <footer>
        <p>Built with Angular {{ angularVersion }} + RxJS</p>
      </footer>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .qjax-example {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f7fa;
      min-height: 100vh;
    }

    header {
      text-align: center;
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .subtitle {
      font-size: 1.1rem;
      opacity: 0.95;
    }

    section {
      background: white;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    h2 {
      color: #2d3748;
      margin-bottom: 20px;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .info-card ul {
      list-style: none;
      padding: 0;
    }

    .info-card li {
      padding: 12px 0;
      border-bottom: 1px solid #e2e8f0;
      color: #4a5568;
      line-height: 1.6;
    }

    .info-card li:last-child {
      border-bottom: none;
    }

    .info-card strong {
      color: #667eea;
    }

    .meter-container {
      width: 100%;
      height: 40px;
      background: #e2e8f0;
      border-radius: 20px;
      overflow: hidden;
      margin-bottom: 20px;
      position: relative;
    }

    .meter {
      height: 100%;
      background: linear-gradient(90deg, #48bb78, #ecc94b, #f56565);
      transition: width 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 40px;
    }

    .meter-text {
      color: white;
      font-weight: 600;
      font-size: 14px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .status-item {
      padding: 15px;
      background: #f7fafc;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .status-item label {
      display: block;
      font-size: 0.875rem;
      color: #718096;
      margin-bottom: 5px;
      font-weight: 500;
    }

    .status-item .value {
      font-size: 1.25rem;
      color: #2d3748;
      font-weight: 600;
    }

    .value.processing {
      color: #667eea;
    }

    .value.yes {
      color: #48bb78;
    }

    .value.no {
      color: #f56565;
    }

    .button-group {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      margin-bottom: 15px;
    }

    .btn {
      padding: 14px 28px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-secondary {
      background: #48bb78;
      color: white;
    }

    .btn-danger {
      background: #f56565;
      color: white;
    }

    .icon {
      font-size: 1.2rem;
    }

    .help-text {
      color: #f56565;
      font-size: 0.95rem;
      padding: 12px;
      background: #fff5f5;
      border-radius: 6px;
      border-left: 4px solid #f56565;
    }

    .response-count {
      background: #667eea;
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      display: inline-block;
      margin-bottom: 15px;
      font-weight: 600;
    }

    .responses-container {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
    }

    .response-item {
      padding: 12px 16px;
      margin: 8px 0;
      background: #fff8e1;
      border: 1px solid #ffd54f;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideIn 0.3s ease;
    }

    .response-item.new {
      animation: slideIn 0.3s ease, pulse 0.5s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(255, 213, 79, 0.7);
      }
      50% {
        box-shadow: 0 0 0 10px rgba(255, 213, 79, 0);
      }
    }

    .response-number {
      background: #ffa726;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .response-text {
      color: #333;
      flex: 1;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #a0aec0;
      font-style: italic;
    }

    footer {
      text-align: center;
      padding: 20px;
      color: #718096;
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      h1 {
        font-size: 1.75rem;
      }

      .button-group {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  queueLength = 0;
  maxPending = 5;
  queuePercentage = 0;
  status = 'Idle';
  canMakeRequest = true;
  responses: string[] = [];
  angularVersion = '19';
  
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
      'Why can\'t I buy ham pants?',
      'The cake is a lie!',
      'All your base are belong to us',
      'Do a barrel roll!',
      'It\'s dangerous to go alone',
      'Would you kindly?'
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
        // Silently ignore queue limit errors - UI already shows queue status
        console.log('Request rejected:', error.message);
      }
    });
    
    this.subscriptions.push(sub);
  }

  makeMultipleRequests(): void {
    // Fire off 20 requests - they will queue and execute in order
    // Using RxJS timer for proper subscription management
    const sub = timer(0, 50).pipe(take(20)).subscribe(() => {
      this.makeRequest();
    });
    
    this.subscriptions.push(sub);
  }

  clearQueue(): void {
    this.qjaxService.clear();
    this.responses = [];
  }
}
