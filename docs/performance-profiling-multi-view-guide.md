# Multi-View Performance Profiling Guide

## Overview

The performance profiler has been extended to work across all major views in the ophthalmology application, providing comprehensive performance analysis for different workflows and user interfaces.

## Supported Views

### ✅ **Currently Integrated Views**

1. **Worklist View** (`templates/worklist.html`)
   - View Type: `Worklist`
   - Operations: Queue management, worklist item updates, table refreshes
   - Key Metrics: Item marking as done, editing, batch operations

2. **MD (Medical Data) View** (`templates/modalityCtr/md.html`)
   - View Type: `MD`
   - Operations: Medical examinations, prescription updates, history management
   - Key Metrics: Form submissions, medication adding, patient data updates

3. **Daily Transactions View** (`templates/billing/daily_transactions.html`)
   - View Type: `DailyTransactions`
   - Operations: Transaction filtering, data exports, summary calculations
   - Key Metrics: Table refreshes, filter applications, CSV exports

4. **Billing Summary View** (`templates/billing/summary.html`)
   - View Type: `BillingSummary`
   - Operations: Patient summary loading, consultation history, billing operations
   - Key Metrics: Data loading, patient information retrieval

## Usage Instructions

### 🚀 **Starting Performance Profiling**

#### **Option 1: Basic Profiling (Any View)**

```javascript
// Start profiling on any view
PerformanceProfiler.startProfiling()

// Perform your operations...
// View results
PerformanceProfiler.showReport()  // or press Ctrl+Shift+P
```

#### **Option 2: Debug Mode (Detailed Analysis)**

```javascript
// Start with detailed debugging
PerformanceProfiler.startDebugging()

// This will show:
// - Table refresh events
// - Multiple initialization warnings
// - 30-second status updates
// - View-specific operation tracking

// Stop debugging when done
PerformanceProfiler.stopDebugging()
```

### 📊 **View-Specific Analysis**

Each view automatically tags its operations, allowing for view-specific analysis:

```javascript
// Get performance breakdown by view
const breakdown = PerformanceProfiler.getViewBreakdown()
console.table(breakdown)

// Example output:
// ┌─────────────────┬───────┬──────────────┬─────────────┬─────────────────────┐
// │   View Type     │ Count │ Avg Duration │ Total Time  │   Top Operations    │
// ├─────────────────┼───────┼──────────────┼─────────────┼─────────────────────┤
// │ Worklist        │   45  │    125.2ms   │   5.63s     │ PUT-worklist(23)    │
// │ MD              │   23  │    89.4ms    │   2.06s     │ POST-mx(12)         │
// │ DailyTrans...   │   12  │    234.1ms   │   2.81s     │ GET-billing(8)      │
// └─────────────────┴───────┴──────────────┴─────────────┴─────────────────────┘
```

### 📁 **Cross-View Export Reports**

The exported reports now include multi-view analysis:

```javascript
// Export complete cross-view report
PerformanceProfiler.exportCompleteReport()
```

**Generated Files:**

- `complete-performance-report-[timestamp].json` - Full data with view breakdown
- `performance-summary-[timestamp].txt` - Human-readable cross-view analysis

**Example Report Content:**

```text
PERFORMANCE BY VIEW
--------------------------------------------------
Worklist:
  Operations: 45
  Avg Duration: 125.23ms
  Total Duration: 5635.35ms
  Top Operations: PUT-worklist(23), enqueue(12), processNext(10)

MD:
  Operations: 23
  Avg Duration: 89.41ms
  Total Duration: 2056.43ms
  Top Operations: POST-mx(12), POST-allergy(6), PUT-patient(5)

DailyTransactions:
  Operations: 12
  Avg Duration: 234.12ms
  Total Duration: 2809.44ms
  Top Operations: GET-billing(8), refresh.bs.table(4)
```

## View-Specific Performance Patterns

### 🏥 **Worklist View Patterns**

**Common Operations:**

- `PUT-worklist` - Updating worklist item status
- `queue:enqueue` - Adding operations to request queue
- `queue:processNext` - Processing queued operations
- `ui:lockUI` / `ui:unlockUI` - Button state management

**Performance Focus:**

- Queue processing efficiency
- Table refresh intervals (40-second auto-refresh)
- Concurrent operation handling

### 🔬 **MD View Patterns**

**Common Operations:**

- `POST-mx` - Adding medications
- `POST-allergy` - Adding allergies
- `PUT-patient` - Updating patient information
- `stateManager:addItem` - Medical data state management

**Performance Focus:**

- Form submission responsiveness
- Medical data validation
- Multiple table coordination

### 💰 **Transaction Views Patterns**

**Common Operations:**

- `GET-billing` - Loading billing data
- `refresh.bs.table` - Table refresh events
- Export operations (CSV, PDF)
- Filter applications

**Performance Focus:**

- Data loading for large date ranges
- Export generation time
- Summary calculation performance

## Diagnostic Commands

### 🔍 **View-Specific Diagnostics**

```javascript
// Get current view performance stats
PerformanceProfiler.getDiagnostics()

// Filter metrics by current view
const currentViewMetrics = PerformanceProfiler.getStats().crudp
const currentView = PerformanceProfiler.config.viewType

// Check storage usage
console.log('Storage size:', PerformanceProfiler.getStorageSize())
```

### 📈 **Performance Comparison**

```javascript
// Compare performance across views
const breakdown = PerformanceProfiler.getViewBreakdown()
Object.entries(breakdown).forEach(([view, data]) => {
    console.log(`${view}: Avg ${data.avgDuration.toFixed(2)}ms per operation`)
})
```

## Best Practices

### 🎯 **When to Profile**

1. **Cross-View Workflows**: Profile when users navigate between views
2. **Peak Usage**: Profile during typical high-usage periods
3. **After Updates**: Profile after code changes to identify regressions
4. **Performance Issues**: Use debug mode when investigating slowness

### 📝 **Data Collection Strategy**

```javascript
// 1. Start profiling at beginning of session
PerformanceProfiler.startProfiling()

// 2. Perform typical workflows across multiple views:
//    - Create worklist items
//    - Navigate to MD view
//    - Add medications/allergies
//    - Check billing summary
//    - Review daily transactions

// 3. Export comprehensive report
PerformanceProfiler.exportCompleteReport()
```

### ⚠️ **Performance Considerations**

- **Storage Limit**: 1000 performance entries + 500 console logs per session
- **Auto-Save**: Data persists across page refreshes and view navigation
- **Memory Usage**: Monitor with `PerformanceProfiler.getStorageSize()`

## Integration Status

### ✅ **Completed Integrations**

- [x] Worklist view with queue monitoring
- [x] MD view with medical data operations
- [x] Daily Transactions view with billing operations
- [x] Billing Summary view with patient data loading

### 🔄 **Potential Future Integrations**

- [ ] User management views
- [ ] Settings/configuration pages
- [ ] Report generation views
- [ ] Patient registration flows

## Troubleshooting

### 🚨 **Common Issues**

1. **Profiler Not Loading**

   ```javascript
   // Check if profiler is available
   if (typeof PerformanceProfiler === 'undefined') {
       console.error('Performance profiler not loaded')
   }
   ```

2. **Data Persistence Issues**

   ```javascript
   // Check storage status
   PerformanceProfiler.getDiagnostics()
   
   // Manually save data
   PerformanceProfiler.saveData()
   ```

3. **View Type Not Detected**

   ```javascript
   // Manually set view type
   PerformanceProfiler.config.viewType = 'CustomView'
   ```

## Summary

The multi-view performance profiler provides comprehensive insights across the entire application workflow, enabling:

- **Cross-view performance comparison**
- **Workflow bottleneck identification**  
- **View-specific optimization opportunities**
- **Complete session performance analysis**

This integrated approach gives a complete picture of application performance from the user's perspective across all major interfaces.
