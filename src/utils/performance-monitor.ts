'use client';

// Performance monitoring utility for tracking Core Web Vitals and other metrics
// Helps monitor the performance of the Cloudflare Worker deployment

interface PerformanceMetrics {
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  ttfb?: number; // Time to First Byte
  navigation?: number; // Total navigation time
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observer?: PerformanceObserver;
  
  constructor() {
    this.initMetrics();
  }
  
  private initMetrics(): void {
    // Track FCP (First Contentful Paint)
    this.trackFCP();
    
    // Track LCP (Largest Contentful Paint)
    this.trackLCP();
    
    // Track CLS (Cumulative Layout Shift)
    this.trackCLS();
    
    // Track TTFB (Time to First Byte)
    this.trackTTFB();
  }
  
  private trackFCP(): void {
    if ('paint' in performance) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            this.reportMetric('FCP', entry.startTime);
            break;
          }
        }
      });
      
      observer.observe({ entryTypes: ['paint'] });
    }
  }
  
  private trackLCP(): void {
    if ('LargestContentfulPaint' in PerformanceObserver?.prototype) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        this.reportMetric('LCP', this.metrics.lcp);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }
  
  private trackCLS(): void {
    if ('layoutShift' in PerformanceEntry?.prototype) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.cls = clsValue;
        this.reportMetric('CLS', clsValue);
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }
  
  private trackTTFB(): void {
    // TTFB is available from navigation entries
    if (typeof PerformanceObserver !== 'undefined') {
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries.length > 0) {
        const navEntry = navEntries[0] as PerformanceNavigationTiming;
        this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
        this.reportMetric('TTFB', this.metrics.ttfb);
      }
    }
  }
  
  private reportMetric(name: string, value: number): void {
    // In production, you might want to send this to an analytics service
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true') {
      console.log(`${name}: ${Math.round(value)} ms`);
    }
    
    // Use environment configuration to decide whether to log
    if (typeof window !== 'undefined') {
      // Access environment variable directly instead of importing to avoid circular deps
      const enableMonitoring = process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true';
      if (enableMonitoring) {
        console.log(`${name}: ${Math.round(value)} ms`);
      }
    }
    
    // Optional: Send metrics to a logging service
    // This could be integrated with Cloudflare Analytics or other services
    if (typeof window !== 'undefined' && (window as any)._paq) {
      // Example integration with Matomo or similar
      // (window as any)._paq.push(['trackEvent', 'Performance', name, 'Value', value]);
    }
  }
  
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  public resetMetrics(): void {
    this.metrics = {};
  }
  
  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Initialize performance monitoring when the module is loaded
let performanceMonitor: PerformanceMonitor | null = null;

export const initPerformanceMonitoring = (): PerformanceMonitor => {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
};

// Hook to use in React components
export const usePerformanceMonitoring = (): PerformanceMetrics => {
  if (typeof window !== 'undefined' && !performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  
  return performanceMonitor?.getMetrics() || {};
};