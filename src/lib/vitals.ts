import { onCLS, onINP, onLCP, type Metric } from 'web-vitals';
import { track } from './track';

/**
 * Real-user Core Web Vitals, reported through the same beacon path as click
 * telemetry -- no exact numbers (that would need a body-reading backend),
 * just each metric's official good/needs-improvement/poor bucket, which
 * web-vitals already computes. Shows up in the VPS's goaccess report
 * alongside page views and click events; harmlessly ignored on GitHub Pages.
 */
function report(metric: Metric): void {
  track(`vital-${metric.name.toLowerCase()}-${metric.rating}`);
}

export function initWebVitals(): void {
  onLCP(report);
  onCLS(report);
  onINP(report);
}
