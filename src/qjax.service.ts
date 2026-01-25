/*!           __
   ____ _    / /___ __  __
  / __ `/_  / / __ `/ |/_/
 / /_/ / /_/ / /_/ />  <
 \__, /\____/\__,_/_/|_|
   /_/  Angular/RxJS version v2.0.0 - https://github.com/PortableSheep/qJax
        Copyright 2011-2026, Michael Gunderson - Dual licensed under the MIT or GPL Version 2 licenses.
*/

import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, defer, EMPTY, throwError } from 'rxjs';
import { concatMap, finalize, tap, catchError, map } from 'rxjs/operators';

export interface QJaxConfig {
  /** Maximum number of pending requests allowed in queue. If exceeded, new requests will be rejected. */
  maxPendingRequests?: number;
  /** Timeout in milliseconds for individual requests (not yet implemented) */
  timeout?: number;
  /** Callback when queue starts processing (first item) */
  onStart?: () => void;
  /** Callback when queue stops processing (queue empty) */
  onStop?: () => void;
  /** Callback when an error occurs */
  onError?: (error: any) => void;
  /** Callback when a timeout occurs (not yet implemented) */
  onTimeout?: () => void;
  /** Callback when queue length changes */
  onQueueChange?: (queueLength: number) => void;
}

interface QueueItem<T> {
  request: () => Observable<T>;
  subject: Subject<T>;
}

/**
 * QJax Service - Angular/RxJS Queue Management for HTTP Requests
 * 
 * Allows multiple async requests to be queued and executed in order,
 * responding as if they were synchronous while maintaining async execution.
 * 
 * Features:
 * - Queue async requests that execute in order
 * - Max pending requests limit with cooldown
 * - Progress events for queue changes
 * - Compatible with Angular HttpClient and RxJS
 * 
 * @example
 * ```typescript
 * const qjax = new QJaxService({
 *   maxPendingRequests: 5,
 *   onQueueChange: (length) => console.log('Queue length:', length)
 * });
 * 
 * // Queue multiple requests
 * for (let i = 0; i < 20; i++) {
 *   qjax.queue(() => this.http.get(`/api/data/${i}`))
 *     .subscribe(data => console.log('Response', i, data));
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class QJaxService {
  private config: QJaxConfig;
  private requestQueue: QueueItem<any>[] = [];
  private queueSubject = new Subject<QueueItem<any>>();
  private queueLengthSubject = new BehaviorSubject<number>(0);
  private isProcessing = false;
  private currentRequest: QueueItem<any> | null = null;

  /**
   * Observable that emits the current queue length whenever it changes
   */
  public queueLength$: Observable<number> = this.queueLengthSubject.asObservable();

  /**
   * Observable that emits progress information about the queue
   */
  public progress$: Observable<{ current: number; total: number; percentage: number }>;

  constructor(config: QJaxConfig = {}) {
    this.config = {
      maxPendingRequests: undefined,
      timeout: undefined,
      onStart: undefined,
      onStop: undefined,
      onError: undefined,
      onTimeout: undefined,
      onQueueChange: undefined,
      ...config
    };

    // Setup queue processor using concatMap to ensure sequential execution
    this.queueSubject.pipe(
      concatMap(item => this.processQueueItem(item))
    ).subscribe();

    // Setup progress observable
    this.progress$ = this.queueLength$.pipe(
      map(length => {
        // Calculate progress based on items processed
        const total = length + (this.isProcessing ? 1 : 0);
        const current = total - length;
        const percentage = total > 0 ? Math.round((current / total) * 100) : 100;
        return { current, total, percentage };
      })
    );
  }

  /**
   * Updates the configuration
   */
  public configure(config: Partial<QJaxConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Queue an observable request for sequential execution
   * 
   * @param requestFn Function that returns an Observable to execute
   * @returns Observable that emits when the request completes in order
   * @throws Error if max pending requests limit is exceeded
   */
  public queue<T>(requestFn: () => Observable<T>): Observable<T> {
    // Check if we've hit the max pending requests limit
    if (this.config.maxPendingRequests !== undefined && 
        this.requestQueue.length >= this.config.maxPendingRequests) {
      return throwError(() => new Error(
        `Queue limit reached. Maximum ${this.config.maxPendingRequests} pending requests allowed. ` +
        `Please wait for the queue to reduce before adding more requests.`
      ));
    }

    const subject = new Subject<T>();
    const queueItem: QueueItem<T> = {
      request: requestFn,
      subject
    };

    this.requestQueue.push(queueItem);
    this.updateQueueLength();
    this.queueSubject.next(queueItem);

    return subject.asObservable();
  }

  /**
   * Queue a simple function (non-observable) for sequential execution
   * 
   * @param fn Function to execute
   * @returns Observable that completes when the function executes
   */
  public queueFunction(fn: () => void): Observable<void> {
    return this.queue(() => defer(() => {
      fn();
      return EMPTY;
    }));
  }

  /**
   * Clear all pending requests from the queue
   */
  public clear(): void {
    // Complete all pending subjects
    this.requestQueue.forEach(item => {
      item.subject.complete();
    });
    this.requestQueue = [];
    this.updateQueueLength();
  }

  /**
   * Get the current queue length
   */
  public getQueueLength(): number {
    return this.requestQueue.length;
  }

  /**
   * Check if queue is currently processing
   */
  public isQueueProcessing(): boolean {
    return this.isProcessing;
  }

  /**
   * Get the maximum pending requests limit
   */
  public getMaxPendingRequests(): number | undefined {
    return this.config.maxPendingRequests;
  }

  /**
   * Check if the queue can accept more requests
   */
  public canAcceptRequests(): boolean {
    if (this.config.maxPendingRequests === undefined) {
      return true;
    }
    return this.requestQueue.length < this.config.maxPendingRequests;
  }

  private processQueueItem<T>(item: QueueItem<T>): Observable<T> {
    // Remove from queue as we start processing
    const index = this.requestQueue.indexOf(item);
    if (index > -1) {
      this.requestQueue.splice(index, 1);
      this.updateQueueLength();
    }

    // Track if this is the first item being processed
    const isFirstItem = !this.isProcessing;
    this.isProcessing = true;
    this.currentRequest = item;

    if (isFirstItem && this.config.onStart) {
      this.config.onStart();
    }

    return defer(() => item.request()).pipe(
      tap({
        next: (value) => {
          item.subject.next(value);
        },
        complete: () => {
          item.subject.complete();
        }
      }),
      catchError((error) => {
        if (this.config.onError) {
          this.config.onError(error);
        }
        item.subject.error(error);
        return EMPTY;
      }),
      finalize(() => {
        this.currentRequest = null;
        
        // Check if queue is now empty
        if (this.requestQueue.length === 0) {
          this.isProcessing = false;
          if (this.config.onStop) {
            this.config.onStop();
          }
        }
      })
    );
  }

  private updateQueueLength(): void {
    const length = this.requestQueue.length;
    this.queueLengthSubject.next(length);
    
    if (this.config.onQueueChange) {
      this.config.onQueueChange(length);
    }
  }
}
