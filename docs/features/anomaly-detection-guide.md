# Anomaly Detection User Guide

## Overview

Maskom's **Anomaly Detection Dashboard** provides real-time monitoring of application metrics to identify unusual activity that may indicate security incidents, deployment failures, or performance regressions. The system uses statistical analysis (z-score, moving average) to detect deviations from normal behavior patterns.

## Features

### 1. Real-Time Anomaly Detection

**Monitor application metrics** for unusual patterns using statistical analysis.

**Location**: `/admin/anomalies` (requires `MANAGE_CONTENT` permission)

**Detection Methods**:

**Z-Score Method**:
- Calculates statistical deviation from expected values
- Default threshold: 3σ (99.7% of normal data falls within)
- Higher z-score = more significant anomaly

**Moving Average Method**:
- Compares current values to 7-day rolling average
- Triggers alert if deviation exceeds 50%
- Window size: 168 samples (7 days × 24 hours)

**Monitored Metrics**:

| Metric Type | Description | Indicators |
|-------------|-------------|-------------|
| **Traffic** | Request rate, unique visitors | Sudden spikes, unexpected drops |
| **Errors** | Error rate, error type frequency | Increased error frequency, new error types |
| **Performance** | LCP (Largest Contentful Paint), FID (First Input Delay) | Degraded loading times, delayed interactions |

### 2. Anomaly Severity Levels

Anomalies are classified by severity based on deviation from expected values:

| Severity | Description | Example |
|----------|-------------|---------|
| **Rendah** (Low) | Minor deviation, monitor | 5-10% traffic increase |
| **Sedang** (Medium) | Noticeable deviation, investigate | 10-25% error rate increase |
| **Tinggi** (High) | Significant deviation, urgent | 25-50% performance degradation |
| **Kritis** (Critical) | Major deviation, immediate action | >50% traffic drop or spike |

### 3. Dashboard Interface

**View and manage detected anomalies** with filtering and actions.

**Location**: `/admin/anomalies`

**Dashboard Components**:

**Statistics Overview**:
- Total anomalies detected
- Active anomalies (not confirmed)
- Confirmed anomalies
- False positive count

**Filtering Options**:
- Filter by type (Traffic, Errors, Performance)
- Filter by severity (Low, Medium, High, Critical)
- Filter by status (Detected, Confirmed, False Positive, Investigating)

**Anomaly List**:
- Each anomaly shows:
  - Type and severity badge
  - Metric name and value
  - Expected value and deviation
  - Detection time (Indonesian format)
  - Status label
- Actions available per anomaly

### 4. Anomaly Status Management

**Manage anomaly lifecycle** through confirmation and false positive marking.

**Status Types**:

| Status | Description | When to Use |
|--------|-------------|--------------|
| **Terdeteksi** (Detected) | Newly detected, unreviewed | Default for all new anomalies |
| **Dikonfirmasi** (Confirmed) | Verified as real anomaly | After investigation confirms issue |
| **Positif Palsu** (False Positive) | Not actually anomalous | When detection was incorrect |
| **Diselidiki** (Investigating) | Under investigation | Currently being reviewed |

**Actions**:

1. **Confirm Anomaly** (`Dikonfirmasi`)
   - Click "Konfirmasi" button
   - Marks anomaly as verified
   - Useful for tracking confirmed issues

2. **Mark as False Positive** (`Positif Palsu`)
   - Click "Positif Palsu" button
   - Marks detection as incorrect
   - Helps improve detection accuracy

3. **Acknowledge Anomaly** (`Diselidiki`)
   - Click "Akui" button
   - Marks as under investigation
   - Records who acknowledged

### 5. Threshold Configuration

**Customize detection sensitivity** for each metric type.

**Location**: Dashboard → "Konfigurasi Threshold" section

**Threshold Settings**:

| Metric | Threshold Method | Sensitivity | Default Z-Score |
|--------|-----------------|-------------|-----------------|
| Traffic | Z-Score, Moving Average | Low/Medium/High | 3.0 |
| Errors | Z-Score, Moving Average | Low/Medium/High | 3.0 |
| Performance | Z-Score, Moving Average | Low/Medium/High | 3.0 |

**Sensitivity Levels**:
- **Low**: More sensitive (lower threshold, more detections)
- **Medium**: Balanced sensitivity
- **High**: Less sensitive (higher threshold, fewer detections)

**How to Update Thresholds**:
1. Click "Konfigurasi Threshold" button
2. Select metric type (Traffic, Errors, Performance)
3. Adjust sensitivity level
4. Click "Simpan" to save changes

### 6. Alert System

**Receive notifications** when anomalies are detected.

**Alert Channels**:

| Channel | Description | Severity Threshold |
|----------|-------------|-------------------|
| **Dasbor** (Dashboard) | Display in dashboard UI | All severities |
| **Email** | Email notification | Medium, High, Critical |
| **Webhook** | HTTP webhook call | High, Critical |
| **SMS** | SMS message (if configured) | Critical only |

**Alert Routing**:
- **Critical** → SMS, Email, Webhook, Dashboard
- **High** → Email, Webhook, Dashboard
- **Medium** → Dashboard, Email
- **Low** → Dashboard only

**Alert Configuration**:
- Set per-metric alert channels
- Configure webhook URLs
- Configure SMS recipients (if available)

## Usage Examples

### Example 1: Detecting Traffic Spike

**Scenario**: Unusual traffic spike detected

**Steps**:
1. Navigate to `/admin/anomalies`
2. Notice new anomaly with:
   - Type: "Lalu Lintas" (Traffic)
   - Severity: "Tinggi" (High) or "Kritis" (Critical)
   - Metric: "request_rate"
   - Actual: 2000 req/s (vs expected 1000 req/s)
3. Click "Akui" to acknowledge
4. Investigate cause (campaign, viral content, attack)
5. If real issue, click "Konfirmasi"
6. If false positive (e.g., planned traffic spike), click "Positif Palsu"

### Example 2: Monitoring Performance Regression

**Scenario**: LCP degradation detected after deployment

**Steps**:
1. Navigate to `/admin/anomalies`
2. New anomaly detected:
   - Type: "Kinerja" (Performance)
   - Severity: "Tinggi" (High)
   - Metric: "lcp"
   - Actual: 5000ms (vs expected 2500ms)
3. Check deployment timeline
4. Correlate with recent code changes
5. If regression confirmed, click "Konfirmasi"
6. Rollback or fix performance issue
7. Anomaly tracked for audit

### Example 3: Configuring Sensitivity

**Scenario**: Too many false positive detections

**Steps**:
1. Navigate to `/admin/anomalies`
2. Click "Konfigurasi Threshold"
3. Select metric with false positives (e.g., "Traffic")
4. Change sensitivity from "Medium" to "High"
5. Click "Simpan"
6. Monitor detection rate
7. Adjust as needed

### Example 4: Monitoring Error Spike

**Scenario**: Error rate increases suddenly

**Steps**:
1. Navigate to `/admin/anomalies`
2. New anomaly detected:
   - Type: "Kesalahan" (Errors)
   - Severity: "Kritis" (Critical)
   - Metric: "error_rate"
   - Actual: 15% (vs expected 2%)
3. Check error logs for patterns
4. Identify root cause (service down, database issue, bug)
5. Click "Akui" to acknowledge
6. Fix issue
7. Click "Konfirmasi" to verify resolution

## Data Management

### Clearing Anomalies

**Remove all anomaly records** from dashboard:

1. Navigate to `/admin/anomalies`
2. Click "Hapus Semua Anomali" button
3. Confirm: "Apakah Anda yakin ingin menghapus semua anomali?"
4. All anomalies removed from dashboard

### Resetting Detection

**Reset all detection data** including anomalies, baselines, and thresholds:

1. Navigate to `/admin/anomalies`
2. Click "Reset Deteksi" button
3. Confirm: "Apakah Anda yakin ingin mereset semua data deteksi anomali?"
4. All data cleared:
   - Anomalies
   - Baseline data (7-day history)
   - Threshold configurations
   - Alert history

### Local Storage Persistence

All anomaly data persists in browser's localStorage:

- **Anomalies**: Detected and confirmed anomalies
- **Baselines**: Rolling 7-day average calculations
- **Thresholds**: Custom detection sensitivity settings
- **Alert History**: When and where alerts were sent

**Important**:
- Data is stored per-browser
- Clearing browser data removes anomaly history
- No account/login required for storage

## Technical Details

### Detection Algorithm

**Z-Score Calculation**:
```
z_score = (current_value - mean) / standard_deviation
```

**Moving Average Calculation**:
```
moving_avg = average(samples over 168-hour window)
deviation_percent = |current_value - moving_avg| / moving_avg * 100
```

### Baseline Establishment

- **7-day rolling average** calculated from historical data
- Automatically updated as new data arrives
- Stored in localStorage for persistence

### Performance Impact

- Detection runs on-demand (not continuous)
- Minimal performance overhead
- Baseline calculations cached
- Suitable for production use

## Troubleshooting

### Anomalies Not Detected

**Symptom**: Expected anomalies not appearing in dashboard

**Solutions**:
1. Check threshold sensitivity (may be too high)
2. Verify baseline has enough data (needs 7+ days)
3. Confirm detection method is appropriate for metric type
4. Check if anomalies were marked as false positives

### Too Many False Positives

**Symptom**: Dashboard flooded with insignificant detections

**Solutions**:
1. Increase sensitivity level (Low → Medium → High)
2. Adjust z-score threshold (default: 3.0)
3. Mark false positives to improve future accuracy
4. Consider if expected variance is normal

### Dashboard Not Loading

**Symptom**: Anomaly dashboard shows loading spinner

**Solutions**:
1. Check `MANAGE_CONTENT` permission
2. Verify localStorage is enabled
3. Check browser console for errors
4. Refresh page (F5)

### Alerts Not Received

**Symptom**: Anomalies detected but no alerts sent

**Solutions**:
1. Check alert channel configuration
2. Verify webhook URL is correct
3. Check email settings (if using email alerts)
4. Confirm severity threshold for channel

## Security and Privacy

### Data Privacy

- No user-specific data in anomalies
- Only aggregated metrics monitored
- Baseline calculations use anonymous data
- localStorage storage (browser-local only)

### Access Control

- **Permission Required**: `MANAGE_CONTENT`
- Protected route at `/admin/anomalies`
- RBAC (Role-Based Access Control) enforced
- Unauthorized users redirected

### Audit Trail

- Anomaly status changes tracked
- Acknowledgement recorded with user info
- False positive markings logged
- Historical data preserved in localStorage

## Related Documentation

- [Blueprint - Anomaly Detection Architecture](../blueprint.md#data-architecture---real-time-anomaly-detection) - Implementation details
- [APM Manager Documentation](../api.md#apm-manager) - Performance monitoring
- [API Documentation - Health and Metrics](../api/health-api.md) - Metrics endpoints
- [Troubleshooting Guide](../troubleshooting-guide.md) - Common issues

---

**Last Updated**: January 22, 2026
