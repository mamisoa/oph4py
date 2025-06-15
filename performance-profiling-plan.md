# Performance Profiling Plan - Step 1

## Overview
Profiling the current performance to identify bottlenecks in the worklist/MD view after the state manager update.

## Frontend Performance Profiling

### 1. Browser DevTools Performance Analysis

#### A. Network Tab Profiling
**Target Operations:**
- Update worklist item to 'done' status
- Edit worklist item fields
- Add medications in MD view
- Delete worklist items

**Metrics to Capture:**
- Request duration (start to end)
- Time to first byte (TTFB)
- Response size
- Queue time (if visible)

**Test Protocol:**
1. Open Chrome DevTools → Network tab
2. Clear network log
3. Perform each target operation 5 times
4. Record average response times
5. Look for any hanging/delayed requests

#### B. Performance Tab Profiling
**Target Metrics:**
- JavaScript execution time
- DOM manipulation time
- Rendering/painting time
- Heap usage during operations

**Test Protocol:**
1. Open Chrome DevTools → Performance tab
2. Start recording
3. Perform target operations
4. Stop recording and analyze:
   - Call stack for slow functions
   - Time spent in WorklistState.Queue operations
   - Time spent in crudp functions
   - DOM update durations

#### C. Console Timing Analysis
**Add timing logs to key functions:**

```javascript
// In wl-state-manager.js RequestQueue.processNext()
console.time('queue-process');
// ... existing code ...
console.timeEnd('queue-process');

// In useful.js crudp function
console.time('crudp-' + table + '-' + req);
// ... ajax call ...
console.timeEnd('crudp-' + table + '-' + req);

// In WorklistStateManager methods
console.time('state-update-' + id);
// ... state update logic ...
console.timeEnd('state-update-' + id);
```

### 2. JavaScript Profiling Scripts

#### A. Queue Performance Analyzer
Create a monitoring script to track queue performance:

```javascript
// Add to browser console during testing
window.QueueProfiler = {
    operations: [],
    startTime: null,
    
    logOperation: function(type, duration) {
        this.operations.push({
            type: type,
            duration: duration,
            timestamp: Date.now()
        });
    },
    
    getStats: function() {
        const stats = {};
        this.operations.forEach(op => {
            if (!stats[op.type]) {
                stats[op.type] = [];
            }
            stats[op.type].push(op.duration);
        });
        
        for (let type in stats) {
            const durations = stats[type];
            stats[type] = {
                count: durations.length,
                average: durations.reduce((a, b) => a + b, 0) / durations.length,
                min: Math.min(...durations),
                max: Math.max(...durations)
            };
        }
        return stats;
    }
};
```

## Backend Performance Profiling

### 1. API Response Time Analysis

#### A. py4web Logging Setup
**Check current logging configuration:**
- Look for py4web logging settings
- Identify log file locations
- Check if request timing is already logged

#### B. Custom Timing Middleware
**If not already present, add request timing:**

```python
# In controllers or middleware
import time
import logging

def log_request_time(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        duration = (end_time - start_time) * 1000  # ms
        logging.info(f"API {request.method} {request.path} - {duration:.2f}ms")
        return result
    return wrapper
```

#### C. Database Query Profiling
**Monitor database performance:**
- Enable pyDAL query logging
- Track slow queries (>100ms)
- Identify N+1 query patterns

### 2. Test Scenarios for Profiling

#### A. Baseline Performance (Before Queue)
**Simulate direct AJAX calls:**
```javascript
// Bypass queue for testing
function directCrudp(table, id, req, data) {
    console.time('direct-' + table + '-' + req);
    return crudpWithoutToast(table, id, req, data)
        .then(result => {
            console.timeEnd('direct-' + table + '-' + req);
            return result;
        });
}
```

#### B. Current Performance (With Queue)
**Measure queue overhead:**
```javascript
// Wrap queue operations
const originalEnqueue = WorklistState.Queue.enqueue;
WorklistState.Queue.enqueue = function(requestFn, successCallback, errorCallback) {
    const startTime = Date.now();
    return originalEnqueue.call(this, requestFn, 
        function(result) {
            const duration = Date.now() - startTime;
            console.log(`Queue operation took: ${duration}ms`);
            if (successCallback) successCallback(result);
        }, 
        errorCallback
    );
};
```

## Specific Test Cases

### 1. Worklist Operations
**Test each operation 10 times and record:**
- Mark item as 'done'
- Edit item details
- Delete item
- Batch operations

### 2. MD View Operations
**Test medical data operations:**
- Add medication
- Add allergy
- Update patient info
- Form submissions

### 3. Concurrent Operations
**Test race conditions:**
- Multiple rapid clicks on same button
- Simultaneous operations on different items/patients
- Mixed worklist and MD operations

## Expected Outputs

### 1. Performance Metrics Report
- Average response times per operation type
- Queue processing overhead
- UI locking duration
- JavaScript execution profiles

### 2. Bottleneck Identification
- Slowest operations
- Most frequent performance issues
- Queue vs direct call comparisons

### 3. Recommendations for Step 2
- Operations that can be parallelized
- Operations that truly need serialization
- Performance improvement opportunities

## Tools and Setup

### Browser Tools
- Chrome DevTools (Performance, Network, Console)
- Firefox Profiler (alternative)
- Browser extension for automated testing

### Backend Tools
- py4web built-in logging
- Database query profiler
- Custom timing decorators

### Testing Environment
- Production-like data volume
- Multiple browsers/devices
- Various network conditions (fast/slow)

## Timeline
- Setup and instrumentation: 2-3 hours
- Data collection: 2-3 hours
- Analysis and reporting: 1-2 hours
- **Total estimated time: 5-8 hours**

## Next Steps After Profiling
Based on results, proceed to Step 2: Analyze which operations need serial queuing vs can be parallelized. 