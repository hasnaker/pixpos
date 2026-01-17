import { Injectable, Logger } from '@nestjs/common';
import { Printer } from '../../entities/printer.entity';
import { PrintService } from './print.service';

export interface QueuedPrintJob {
  id: string;
  printerId: string;
  printer: Printer;
  type: 'kitchen' | 'receipt';
  content: Buffer;
  priority: 'high' | 'normal' | 'low';
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  error?: string;
}

export interface PrintJobResult {
  jobId: string;
  success: boolean;
  error?: string;
  retryCount: number;
}

export type PrintEventCallback = (event: {
  jobId: string;
  type: 'kitchen' | 'receipt';
  printerId: string;
  error?: string;
}) => void;

@Injectable()
export class PrintQueueService {
  private readonly logger = new Logger(PrintQueueService.name);
  private readonly queue: Map<string, QueuedPrintJob> = new Map();
  private readonly processingJobs: Set<string> = new Set();
  private isProcessing = false;
  private jobCounter = 0;
  
  // Event callbacks
  private onCompletedCallbacks: PrintEventCallback[] = [];
  private onFailedCallbacks: PrintEventCallback[] = [];

  constructor(private readonly printService: PrintService) {}

  /**
   * Register callback for completed print jobs
   */
  onCompleted(callback: PrintEventCallback): void {
    this.onCompletedCallbacks.push(callback);
  }

  /**
   * Register callback for failed print jobs
   */
  onFailed(callback: PrintEventCallback): void {
    this.onFailedCallbacks.push(callback);
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    this.jobCounter++;
    const timestamp = Date.now().toString(36);
    return `PJ-${timestamp}-${this.jobCounter}`;
  }

  /**
   * Add a print job to the queue
   * Requirements: 6.1.1 - Print queue management
   */
  async addJob(
    printer: Printer,
    content: Buffer,
    type: 'kitchen' | 'receipt',
    priority: 'high' | 'normal' | 'low' = 'normal',
  ): Promise<QueuedPrintJob> {
    const job: QueuedPrintJob = {
      id: this.generateJobId(),
      printerId: printer.id,
      printer,
      type,
      content,
      priority,
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date(),
      status: 'pending',
    };

    this.queue.set(job.id, job);
    this.logger.log(`Print job ${job.id} added to queue (type: ${type}, priority: ${priority})`);

    // Start processing if not already running
    this.processQueue();

    return job;
  }

  /**
   * Process the print queue
   * Requirements: 6.1.2 - Queue processing
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.hasPendingJobs()) {
        const job = this.getNextJob();
        if (!job) break;

        await this.processJob(job);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Check if there are pending jobs
   */
  private hasPendingJobs(): boolean {
    for (const job of this.queue.values()) {
      if (job.status === 'pending') {
        return true;
      }
    }
    return false;
  }

  /**
   * Get next job based on priority
   */
  private getNextJob(): QueuedPrintJob | null {
    const priorityOrder = ['high', 'normal', 'low'];
    
    for (const priority of priorityOrder) {
      for (const job of this.queue.values()) {
        if (job.status === 'pending' && job.priority === priority) {
          return job;
        }
      }
    }
    return null;
  }

  /**
   * Process a single print job
   * Requirements: 6.1.3 - Error handling with retry
   */
  private async processJob(job: QueuedPrintJob): Promise<void> {
    if (this.processingJobs.has(job.id)) {
      return;
    }

    this.processingJobs.add(job.id);
    job.status = 'printing';

    try {
      const success = await this.printService.sendToPrinter(job.printer, job.content);

      if (success) {
        job.status = 'completed';
        this.logger.log(`Print job ${job.id} completed successfully`);
        
        // Notify callbacks
        this.notifyCompleted(job);

        // Remove completed job after a delay
        setTimeout(() => this.queue.delete(job.id), 60000);
      } else {
        await this.handleJobFailure(job, 'Printer connection failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.handleJobFailure(job, errorMessage);
    } finally {
      this.processingJobs.delete(job.id);
    }
  }

  /**
   * Notify completed callbacks
   */
  private notifyCompleted(job: QueuedPrintJob): void {
    const event = {
      jobId: job.id,
      type: job.type,
      printerId: job.printerId,
    };
    for (const callback of this.onCompletedCallbacks) {
      try {
        callback(event);
      } catch (err) {
        this.logger.error(`Error in completed callback: ${err}`);
      }
    }
  }

  /**
   * Notify failed callbacks
   */
  private notifyFailed(job: QueuedPrintJob): void {
    const event = {
      jobId: job.id,
      type: job.type,
      printerId: job.printerId,
      error: job.error,
    };
    for (const callback of this.onFailedCallbacks) {
      try {
        callback(event);
      } catch (err) {
        this.logger.error(`Error in failed callback: ${err}`);
      }
    }
  }

  /**
   * Handle job failure with retry logic
   * Requirements: 6.1.4 - Retry mechanism
   */
  private async handleJobFailure(job: QueuedPrintJob, error: string): Promise<void> {
    job.retryCount++;
    job.error = error;

    if (job.retryCount < job.maxRetries) {
      job.status = 'pending';
      this.logger.warn(
        `Print job ${job.id} failed (attempt ${job.retryCount}/${job.maxRetries}): ${error}. Retrying...`,
      );

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, job.retryCount - 1) * 1000;
      await this.delay(delay);
    } else {
      job.status = 'failed';
      this.logger.error(
        `Print job ${job.id} failed permanently after ${job.maxRetries} attempts: ${error}`,
      );

      // Notify callbacks
      this.notifyFailed(job);
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): QueuedPrintJob | null {
    return this.queue.get(jobId) || null;
  }

  /**
   * Get all jobs for a printer
   */
  getJobsForPrinter(printerId: string): QueuedPrintJob[] {
    const jobs: QueuedPrintJob[] = [];
    for (const job of this.queue.values()) {
      if (job.printerId === printerId) {
        jobs.push(job);
      }
    }
    return jobs;
  }

  /**
   * Get queue statistics
   */
  getQueueStats(): {
    total: number;
    pending: number;
    printing: number;
    completed: number;
    failed: number;
  } {
    let pending = 0;
    let printing = 0;
    let completed = 0;
    let failed = 0;

    for (const job of this.queue.values()) {
      switch (job.status) {
        case 'pending':
          pending++;
          break;
        case 'printing':
          printing++;
          break;
        case 'completed':
          completed++;
          break;
        case 'failed':
          failed++;
          break;
      }
    }

    return {
      total: this.queue.size,
      pending,
      printing,
      completed,
      failed,
    };
  }

  /**
   * Cancel a pending job
   */
  cancelJob(jobId: string): boolean {
    const job = this.queue.get(jobId);
    if (!job || job.status !== 'pending') {
      return false;
    }

    this.queue.delete(jobId);
    this.logger.log(`Print job ${jobId} cancelled`);
    return true;
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<boolean> {
    const job = this.queue.get(jobId);
    if (!job || job.status !== 'failed') {
      return false;
    }

    job.status = 'pending';
    job.retryCount = 0;
    job.error = undefined;
    
    this.logger.log(`Print job ${jobId} queued for retry`);
    this.processQueue();
    
    return true;
  }

  /**
   * Clear completed and failed jobs
   */
  clearFinishedJobs(): number {
    let cleared = 0;
    for (const [id, job] of this.queue.entries()) {
      if (job.status === 'completed' || job.status === 'failed') {
        this.queue.delete(id);
        cleared++;
      }
    }
    return cleared;
  }
}
