export class PerformanceMonitor {
  private observer: PerformanceObserver | null = null;
  
  init() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handleMetric(entry);
        }
      });
      
      this.observer.observe({ 
        entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] 
      });
    }
  }
  
  private handleMetric(entry: PerformanceEntry) {
    const metric = {
      name: entry.name,
      value: entry.startTime,
      type: entry.entryType,
      timestamp: Date.now(),
    };
    
    // Send to analytics service
    this.sendMetric(metric);
  }
  
  private async sendMetric(metric: any) {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      });
    } catch (error) {
      console.error('Failed to send metric:', error);
    }
  }
  
  // Track custom metrics
  trackCustomMetric(name: string, value: number) {
    const metric = {
      name,
      value,
      type: 'custom',
      timestamp: Date.now(),
    };
    
    this.sendMetric(metric);
  }
  
  // Track user interactions
  trackInteraction(action: string, duration: number) {
    this.trackCustomMetric(`interaction_${action}`, duration);
  }
  
  // Track resource loading
  trackResourceLoad(url: string, duration: number) {
    this.trackCustomMetric(`resource_${url}`, duration);
  }
}
