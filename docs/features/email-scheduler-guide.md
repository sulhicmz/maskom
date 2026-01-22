# Email Scheduler User Guide

## Overview

Maskom's **Intelligent Email Scheduler** analyzes recipient engagement patterns to determine optimal email send times. By tracking opens, clicks, and interactions over time, the system provides data-driven recommendations to maximize email campaign effectiveness.

## Features

### 1. Optimal Send Time Analysis

**Calculate best sending times** based on historical engagement data.

**Location**: `/admin/email-scheduler` (requires `MANAGE_CONTENT` permission)

**Analysis Methods**:

**Confidence Score**:
- Measures reliability of recommendation
- Based on volume of engagement data
- Higher score = more reliable prediction

**Confidence Levels**:
| Score | Label | Description |
|-------|-------|-------------|
| ≥80% | Tinggi | High confidence, reliable recommendation |
| 60-79% | Sedang | Medium confidence, good prediction |
| 40-59% | Rendah | Low confidence, use with caution |
| <40% | Sangat Rendah | Very low confidence, more data needed |

### 2. Send Time Heatmap

**Visualize engagement patterns** across days and hours with color-coded heatmap.

**Location**: Dashboard → "Heatmap Waktu Pengiriman" section

**Heatmap Display**:

**X-Axis**: Hours of day (00:00 - 23:00)
**Y-Axis**: Days of week (Senin - Minggu)
**Cell Colors**: Represent open rates
- **Darker green**: Higher open rates (best times)
- **Lighter colors**: Lower open rates (worse times)
- **Gray/empty**: No data available

**Heatmap Legend**:
- Darker = Better engagement
- Lighter = Lower engagement
- Hover over cells for exact open rate values

**How to Use**:
1. Scroll to heatmap section
2. Identify dark green cells (high open rates)
3. Compare with recommended send time
4. Plan campaigns for optimal engagement periods

### 3. Day-of-Week Analysis

**View engagement breakdown** by day of week.

**Location**: Dashboard → "Analisis Hari" section

**Day Analysis Shows**:
- Total emails sent
- Total opens
- Open rate percentage
- Ranking (best to worst day)

**Days Displayed** (Indonesian):
- Senin (Monday)
- Selasa (Tuesday)
- Rabu (Wednesday)
- Kamis (Thursday)
- Jumat (Friday)
- Sabtu (Saturday)
- Minggu (Sunday)

**How to Use**:
1. Review day analysis chart
2. Identify best-performing days (highest open rates)
3. Schedule campaigns for optimal days
4. Avoid lowest-performing days if possible

### 4. Hourly Engagement Analysis

**View engagement breakdown** by hour of day.

**Location**: Dashboard → "Analisis Jam" section

**Hour Analysis Shows**:
- Total emails sent (per hour)
- Total opens (per hour)
- Open rate percentage
- Ranking (best to worst hour)

**Hours Displayed**: 00:00 - 23:00 (24-hour format)

**How to Use**:
1. Review hourly analysis chart
2. Identify peak engagement hours
3. Schedule campaigns for top hours
4. Time emails for recipient's timezone

### 5. Recipient-Specific Analysis

**Analyze engagement patterns** for specific recipients.

**Location**: Dashboard → "Penerima Email" input field

**How to Analyze Recipient**:
1. Enter recipient ID or email in input field
2. Dashboard updates with recipient-specific data
3. Recommendations become more personalized
4. Heatmap reflects that recipient's patterns

**Benefits**:
- Personalized send time recommendations
- More accurate for high-volume recipients
- Improves individual campaign performance
- Builds recipient-level engagement profiles

### 6. Recommendation Display

**View calculated optimal send time** with confidence score.

**Location**: Dashboard → "Rekomendasi Waktu Pengiriman" card

**Recommendation Shows**:
- **Waktu Terbaik** (Best Time): Optimal send time in Indonesian format
- **Timezone**: Recipient's timezone
- **Confidence Score**: Reliability of recommendation (with badge)
- **Day and Hour**: Specific day and hour recommendation

**Example Recommendation**:
```
Waktu Terbaik: Selasa, 22 Jan 2026, 09:00
Timezone: Asia/Jakarta (WIB)
Confidence: 85% - Tinggi
```

### 7. Engagement Data Management

**Track and manage email engagement data** over time.

**Data Tracked**:
- Email send times
- Open events
- Click events
- Engagement rates
- Recipient information

**Data Storage**:
- Stored in browser's localStorage
- Persistent across sessions
- No account required
- Per-browser storage

**How Engagement is Tracked**:
1. Email sent → Record send time
2. Email opened → Record open event
3. Link clicked → Record click event
4. Data aggregated → Calculate insights
5. Recommendations updated → Reflect new patterns

## Usage Examples

### Example 1: Finding Best Send Time for Campaign

**Scenario**: Planning weekly newsletter campaign

**Steps**:
1. Navigate to `/admin/email-scheduler`
2. Enter recipient ID (if targeting segment)
3. Wait for recommendation to load
4. Review recommendation:
   - "Waktu Terbaik": Senin, 22 Jan 2026, 09:00
   - "Confidence": 85% - Tinggi
5. Confirm with heatmap:
   - Dark green cells at Monday 09:00
6. Schedule campaign for Monday 09:00 WIB
7. Monitor engagement after sending
8. Data improves future recommendations

### Example 2: Analyzing Engagement Patterns

**Scenario**: Understanding audience behavior

**Steps**:
1. Navigate to `/admin/email-scheduler`
2. Scroll to "Analisis Hari" section
3. Review day analysis:
   - Best day: Senin (Monday) - 35% open rate
   - Worst day: Sabtu (Saturday) - 15% open rate
4. Scroll to "Analisis Jam" section
5. Review hourly analysis:
   - Best hour: 09:00 - 38% open rate
   - Worst hour: 02:00 - 5% open rate
6. Plan campaigns for Monday 09:00
7. Avoid Saturday and late-night sends

### Example 3: Optimizing for Specific Recipient

**Scenario**: High-value customer engagement

**Steps**:
1. Navigate to `/admin/email-scheduler`
2. Enter recipient ID in "Penerima Email" field
3. Dashboard updates with recipient-specific data
4. Review recommendation:
   - "Waktu Terbaik": Rabu, 24 Jan 2026, 14:00
   - "Confidence": 72% - Sedang
5. Check recipient's heatmap:
   - High engagement Wednesday afternoons
6. Schedule personalized email for Wednesday 14:00
7. Track engagement for future optimization

### Example 4: Interpreting Low Confidence

**Scenario**: Recommendation shows low confidence

**Steps**:
1. Navigate to `/admin/email-scheduler`
2. View recommendation:
   - "Confidence": 35% - Sangat Rendah
3. Check heatmap:
   - Few dark green cells
   - Many gray cells (no data)
4. Action: Send more emails to collect data
5. Spread sends across different days/times
6. Wait for more engagement events
7. Re-check dashboard in 1-2 weeks
8. Confidence score should improve

### Example 5: Cross-Timezone Scheduling

**Scenario**: Recipients in different timezones

**Steps**:
1. Navigate to `/admin/email-scheduler`
2. Enter recipient ID for target timezone
3. Review recommendation with timezone:
   - "Waktu Terbaik": Selasa, 22 Jan 2026, 21:00
   - "Timezone": Asia/Jakarta (WIB)
4. For New York (EST) recipients:
   - Enter EST recipient ID
   - Get EST-specific recommendation
   - May be: Selasa, 22 Jan 2026, 09:00 EST
5. Schedule separately per timezone
6. Track engagement per segment

## Data Management

### Clearing Engagement Data

**Remove all engagement data** to start fresh:

**Steps**:
1. Navigate to `/admin/email-scheduler`
2. Click "Hapus Data" button (red outline)
3. Confirm: "Apakah Anda yakin ingin menghapus semua data engagement?"
4. All data cleared:
   - Email send records
   - Open events
   - Click events
   - Recipient profiles

**When to Use**:
- Testing recommendation accuracy
- Starting fresh for new campaign strategy
- Removing test data
- Resetting for new audience segment

### Local Storage Persistence

All engagement data persists in browser's localStorage:

- **Send Events**: Email send timestamps
- **Open Events**: Email open timestamps
- **Click Events**: Link click timestamps
- **Recipient Profiles**: Engagement patterns per recipient
- **Aggregated Insights**: Calculated statistics

**Important**:
- Data is stored per-browser
- Clearing browser data removes engagement history
- No account/login required for storage
- Data is not synced across devices

## Technical Details

### Recommendation Algorithm

**Optimal Send Time Calculation**:

1. **Analyze Engagement Data**:
   - Group events by day-of-week and hour
   - Calculate open rate per day/hour combination
   - Weight by recency (recent events have higher weight)

2. **Identify Peak Slots**:
   - Find day/hour combinations with highest open rates
   - Sort by engagement score
   - Select top candidate

3. **Calculate Confidence**:
   - Based on volume of data
   - More data = higher confidence
   - Consistency also factors in

4. **Return Recommendation**:
   - Best day and hour
   - Confidence score
   - Timezone information

### Confidence Scoring

**Confidence Formula**:
```
base_confidence = min(data_volume / target_volume, 1.0)
consistency_bonus = (consistency_score / 100) * 0.1
final_confidence = (base_confidence + consistency_bonus) * 100
```

- **Target volume**: 100+ engagement events per recipient
- **Consistency score**: Standard deviation of open rates (lower = more consistent)

### Data Aggregation

**Hourly Data**:
- Total emails sent per hour
- Total opens per hour
- Open rate calculation: `opens / sent * 100`

**Day Data**:
- Aggregated from hourly data
- Daily totals and averages
- Best/worst ranking

### Performance Impact

- Analysis runs on-demand
- Heatmap calculations cached
- Minimal performance overhead
- Suitable for production use

## Troubleshooting

### No Recommendation Displayed

**Symptom**: Recommendation section empty or shows "No data available"

**Solutions**:
1. Check if engagement data exists (send some emails first)
2. Verify localStorage is enabled
3. Clear and re-enter recipient ID
4. Refresh page (F5)

### Low Confidence Score

**Symptom**: Recommendation shows "Sangat Rendah" or "Rendah" confidence

**Solutions**:
1. Send more emails to collect data
2. Spread sends across different days and times
3. Wait for more engagement events (opens, clicks)
4. Check if data was cleared recently
5. Target 100+ engagement events for high confidence

### Heatmap Shows All Gray

**Symptom**: Heatmap has no color, all cells gray

**Solutions**:
1. Verify engagement data exists
2. Check if recipient ID is correct
3. Ensure emails have been sent and opened
4. Wait for data to accumulate
5. Check browser console for errors

### Recommendation Doesn't Match Heatmap

**Symptom**: Recommended time doesn't align with darkest heatmap cells

**Solutions**:
1. Check if recipient-specific analysis is active
2. Verify recommendation reflects same dataset
3. Recalculate by clicking "Segarkan" button
4. Check if data was recently modified

### Engagement Data Not Tracking

**Symptom**: Sent emails not appearing in dashboard

**Solutions**:
1. Verify email integration is working
2. Check localStorage is enabled
3. Verify send events are being recorded
4. Check browser console for tracking errors
5. Ensure email system calls engagement tracking

## Best Practices

### Data Collection

**Send Strategically**:
- Spread emails across different days
- Test various hours of the day
- Track opens and clicks consistently
- Give recipients time to engage

**Avoid**:
- Sending all emails at same time
- Ignoring engagement events
- Clearing data too frequently
- Relying on small datasets

### Campaign Planning

**Use Recommendations**:
- Schedule for recommended day/time
- Check confidence score before acting
- Verify with heatmap visualization
- Consider recipient timezones

**Plan Ahead**:
- Send test campaigns to collect data
- Build engagement profiles over weeks
- Monitor seasonal patterns
- Adjust for special events/holidays

### Recipient Segmentation

**Segment by**:
- Geography (different timezones)
- Industry (different engagement patterns)
- Role (executives vs customers)
- Engagement level (active vs inactive)

**Benefits**:
- More personalized recommendations
- Higher open rates
- Better campaign performance
- Deeper audience insights

## Related Documentation

- [Blueprint - Email Scheduler Architecture](../blueprint.md#automation---intelligent-email-campaign-scheduler) - Implementation details
- [Email Service Documentation](../api/email-service.md) - Email sending integration
- [API Documentation - Email Queue](../api/email-queue-api.md) - Email queue management
- [Troubleshooting Guide](../troubleshooting-guide.md) - Common issues

---

**Last Updated**: January 22, 2026
