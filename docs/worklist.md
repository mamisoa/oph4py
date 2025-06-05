# Worklist Controller Documentation

## Overview

The Worklist controller is a critical component of the ophthalmology electronic medical records system. It manages patient appointments, procedure scheduling, workflow tracking, and modality-specific task management.

## File Structure

- `worklist.html`: Main view template
- `static/js/wl.js`: Core JavaScript functionality
- `static/js/wl_bt.js`: Bootstrap table configurations and handlers
- `static/js/wl-state-manager.js`: State management for worklist operations

## Key Workflows

### Patient Registration with BeID

The system supports patient registration using Belgian electronic ID cards (BeID):

```mermaid
sequenceDiagram
    actor User
    participant UI as User Interface
    participant API as BeID API
    participant DB as Database
    
    User->>UI: Click "New Patient"
    UI->>UI: Open Patient Form
    User->>UI: Click "Read BeID"
    UI->>API: Request BeID data
    API->>API: Access card reader
    API->>UI: Return BeID data (name, birthdate, address, photo)
    UI->>UI: Populate form fields
    User->>UI: Add phone number
    User->>UI: Verify data and submit
    UI->>DB: Create patient record
    UI->>DB: Create address record
    UI->>DB: Create phone record
    DB->>UI: Confirm successful creation
    UI->>User: Display success message
```

### Adding a Combo to Worklist

Creating multiple related tasks using the combo feature:

```mermaid
sequenceDiagram
    actor User
    participant UI as User Interface
    participant SM as State Manager
    participant API as Batch API
    participant DB as Database
    
    User->>UI: Select patient from list
    User->>UI: Click "Add to Worklist"
    UI->>UI: Open Worklist Modal
    User->>UI: Select procedure
    UI->>UI: Load combo options
    User->>UI: Select multiple modalities
    User->>UI: Fill other details (time, provider)
    User->>UI: Submit form
    UI->>SM: Prepare worklist items
    SM->>SM: Validate patient context
    SM->>SM: Create unique transaction ID
    SM->>SM: Generate uniqueId for each item
    SM->>API: Send batch operation request
    API->>DB: Begin transaction
    API->>DB: Create main worklist item
    API->>DB: Create related modality items
    DB->>API: Confirm creation
    API->>DB: Commit transaction
    API->>DB: Record transaction audit
    API->>SM: Return success with IDs
    SM->>SM: Update state with returned IDs
    SM->>UI: Update UI with new items
    UI->>User: Display success message
```

### Worklist Item Deletion Process

The enhanced deletion process with proper validation and error handling:

```mermaid
sequenceDiagram
    actor User
    participant UI as User Interface
    participant SM as State Manager
    participant Valid as Validation Layer
    participant API as Worklist API
    participant DB as Database
    
    User->>UI: Click delete button on item
    UI->>UI: Open deletion confirmation modal
    User->>UI: Confirm deletion
    UI->>SM: Request item deletion
    SM->>Valid: Validate uniqueId exists
    Valid->>Valid: Check for undefined/null uniqueId
    alt uniqueId is valid
        Valid->>SM: Validation passed
        SM->>SM: Log deletion attempt
        SM->>API: Send DELETE request
        API->>DB: Remove item from worklist
        DB->>API: Confirm deletion
        API->>SM: Return success response
        SM->>SM: Remove from state manager
        SM->>UI: Update table display
        UI->>User: Show success notification
    else uniqueId is invalid
        Valid->>SM: Validation failed
        SM->>SM: Log validation error
        SM->>UI: Show error message
        UI->>User: Display "Cannot delete: Invalid item ID"
        SM->>SM: Trigger debugging if enabled
    end
```

## Features

### 1. Appointment Management

#### Patient Scheduling

- Patient registration
- Appointment booking
- Time slot management
- Provider assignment

#### Procedure Management

- Procedure type selection
- Modality assignment
- Laterality tracking (left/right/both eyes)
- Multiple modality handling

### 2. Workflow Tracking

#### Status Management

- Requested
- Processing
- Done
- Cancelled
- Doctor Done (for main modalities)

#### Time Tracking

- Waiting time monitoring
- Processing time tracking
- Status duration alerts
- Automatic refreshing

### 3. Provider Management

#### Staff Assignment

- Senior doctor assignment
- Provider assignment
- Facility management
- Role-based access control

### 4. Modality Integration

#### Modality Controllers

- Integration with various devices
- Controller-specific workflows
- Multiple modality support
- Device-specific task management

### 5. Facility Management

#### Facility Tracking

- Sending facility management
- Receiving facility management
- Inter-facility communication
- Location tracking

### 6. Combo Management

#### Atomic Operations

- Transaction-based combo creation
- Batch API support for atomic operations
- Transaction status tracking
- Error recovery mechanisms
- Transaction history and audit logs

### 7. Item Deletion Management

#### Enhanced Deletion Process (Fixed 2025-06-05)

- **Validated Deletion**: Proper uniqueId validation before deletion attempts
- **Error Prevention**: Prevents silent deletion failures for combo items
- **State Consistency**: Ensures UI and state manager remain synchronized
- **Debug Support**: Comprehensive debugging tools for troubleshooting deletion issues
- **Improved Feedback**: Clear error messages and user notifications during deletion process

#### Debugging Capabilities

- **debugWorklistState()**: Function for development testing and state inspection
- **addItemWithTracking()**: Helper function for consistent item management
- **testWorklistFunctions()**: Console debugging tools for testing deletion workflows
- **Enhanced Logging**: Detailed logging throughout the deletion process for troubleshooting

## Technical Implementation

### Database Tables

The controller interacts with multiple database tables:

1. **Worklist Management**
   - `worklist`: Main worklist entries (includes transaction_id field)
   - `facility`: Facility information
   - `procedure`: Available procedures
   - `modality`: Equipment and devices
   - `auth_user`: User information

2. **Modality Management**
   - `modality_controller`: Device controllers
   - `combo`: Procedure combinations

3. **Transaction Management**
   - `transaction_audit`: Transaction tracking and status information

### Key Components

#### 1. Bootstrap Tables

The main worklist table (`table-wl`) implements:

- Server-side pagination
- Real-time refresh
- Status-based row coloring
- Detail view expansion
- Action buttons
- Search functionality
- Column sorting
- Time tracking

#### 2. Form Management

The worklist form handles:

- Patient selection
- Procedure assignment
- Provider selection
- Time slot booking
- Status management
- Counter tracking
- Warning messages

#### 3. State Management

The state management system (`wl-state-manager.js`) provides:

- Client-side state tracking for worklist items
- Request queueing to prevent race conditions
- UI protection during operations
- Transaction tracking and history
- Error recovery for failed operations
- Patient context validation

### JavaScript Functions

#### 1. Core Functions

```javascript
function queryParams_wl(params)
function responseHandler_wl(res)
function operateFormatter_wl(value, row, index)
function rowStyle_wl(row, value)
function detailFormatter_wl(index, row)
```

#### 2. Time Management

```javascript
function set_timers(timers)
function styleTimeslot(ts)
function counterFormatter_wl(value, row)
```

#### 3. Modality Management

```javascript
function setModalityOptions(procedureId)
function getModalityOptions(procedureId)
function getCombo(id_procedure)
```

#### 4. State Management

```javascript
class WorklistStateManager
class RequestQueue
class UIManager
```

#### 5. Item Deletion and Debugging (Enhanced 2025-06-05)

```javascript
function delWlItemModal(id)                    // Enhanced deletion with validation
function debugWorklistState()                 // Debug function for development testing
function addItemWithTracking()                // Helper for consistent item management
function testWorklistFunctions()              // Console debugging tools
```

**Enhanced Deletion Process Features:**

- **Validation Layer**: Checks for undefined/null uniqueIds before deletion attempts
- **Error Recovery**: Handles failed deletions gracefully with user feedback
- **State Synchronization**: Ensures UI table and state manager remain consistent
- **Debug Logging**: Comprehensive logging for troubleshooting deletion issues
- **Standardized Handling**: Consistent uniqueId management across combo and single modality workflows

### API Endpoints

The controller uses several API endpoints:

```javascript
const API_USER_LIST = HOSTURL + '/api/auth_user'
const API_PROCEDURE_LIST = HOSTURL + '/api/worklist'
const API_PROCEDURE_LIST_TODAY = HOSTURL + '/api/worklist'
const API_BATCH = HOSTURL + '/api/batch'
```

## Usage Guidelines

### 1. Appointment Creation

1. Select patient
2. Choose procedure
3. Assign providers
4. Select modality
5. Set time slot
6. Add to worklist

### 2. Workflow Management

1. Monitor status
2. Track waiting time
3. Update progress
4. Manage completion
5. Handle cancellations

### 3. Provider Assignment

1. Select senior doctor
2. Assign provider
3. Verify availability
4. Manage workload

### 4. Combo Creation

1. Select patient
2. Choose main procedure
3. Select multiple modalities from combo options
4. Submit the form
5. System creates all items as a single transaction with proper uniqueId generation
6. Transaction status is tracked and displayed
7. In case of failures, recovery options are provided

### 5. Item Deletion (Enhanced Process)

1. **Validation**: System validates item has valid uniqueId before deletion
2. **Confirmation**: User confirms deletion through modal dialog
3. **Processing**: Enhanced deletion function processes with proper error handling
4. **Feedback**: User receives clear success/error messages
5. **State Sync**: UI and state manager automatically synchronized
6. **Debug Support**: Debugging tools available for troubleshooting if needed

## Error Handling

The system implements comprehensive error handling:

### General Error Handling

- Form validation
- API error handling
- Status verification
- Time monitoring alerts
- User feedback messages
- Transaction rollback for failed batch operations
- Recovery mechanisms for partial transaction completion
- Detailed transaction status tracking

### Enhanced Deletion Error Handling (Fixed 2025-06-05)

- **uniqueId Validation**: Prevents deletion attempts with undefined/null identifiers
- **Silent Failure Prevention**: Eliminates cases where items appear deleted but remain in system
- **State Consistency**: Ensures UI table and backend state remain synchronized
- **User Feedback**: Provides clear error messages for failed deletion attempts
- **Debug Logging**: Comprehensive logging for troubleshooting deletion issues
- **Recovery Options**: Debugging tools available for development and troubleshooting

### Non-Intrusive Toast Notifications (Enhanced 2025-01-23)

- **Toast Integration**: Replaced shifting alert notifications with fixed-position toast notifications
- **Layout Stability**: Eliminated content shifting when notifications appear above the worklist
- **Consistent UX**: Uses the same toast system (`displayToast`) as the rest of the application
- **Auto-Dismiss**: Toast notifications automatically disappear after a timeout
- **Backward Compatibility**: Existing `showFeedback()` calls continue to work seamlessly
- **Error Fallback**: Graceful degradation to console warnings if toast system unavailable

### Critical Bug Fixes

**Worklist Item Deletion Bug (2025-06-05)**:

- **Issue**: Multiple modality procedures failed to delete due to undefined uniqueId in combo tasks
- **Root Cause**: uniqueId was not properly set during combo creation, causing silent deletion failures
- **Solution**: Enhanced `delWlItemModal()` with proper validation and error handling
- **Result**: Items no longer remain in system after appearing to be deleted from UI

## Security Considerations

1. **Access Control**
   - Role-based access
   - Session management
   - Data validation
   - Action restrictions

2. **Data Protection**
   - Input sanitization
   - Secure API calls
   - Audit logging
   - Status tracking
   - Transaction boundaries
   - Atomic operations

3. **Item Management Security**
   - uniqueId validation prevents unauthorized deletions
   - State consistency prevents data corruption
   - Enhanced logging provides audit trail for deletions

## Dependencies

- Bootstrap Table 1.22
- jQuery
- Bootstrap 5
- Font Awesome
- Timer.jquery
- Bootbox

## Maintenance

Regular maintenance includes:

1. Monitoring refresh cycles
2. Updating facility information
3. Managing provider lists
4. Verifying modality controllers
5. Checking API endpoints
6. Updating documentation
7. Monitoring transaction audit logs
8. Verifying transaction completion rates
9. **Testing deletion workflows** (Enhanced 2025-06-05)
10. **Validating state consistency** between UI and backend
11. **Monitoring deletion error logs** for systematic issues

### Development and Debugging

For development and troubleshooting, the following debugging tools are available:

```javascript
// Test worklist state and deletion functions
testWorklistFunctions();

// Debug current worklist state
debugWorklistState();

// Add items with proper tracking
addItemWithTracking(itemData);
```

These tools help identify and resolve issues with:

- Item deletion failures
- State synchronization problems
- uniqueId generation issues
- UI consistency problems

## Conclusion

The Worklist Controller provides:

1. Comprehensive appointment management
2. Real-time status tracking
3. Efficient workflow management
4. Modality integration
5. Provider coordination
6. Atomic transaction support for combo operations
7. Reliable data integrity through transaction handling
8. **Enhanced item deletion with proper validation** (Fixed 2025-06-05)
9. **Comprehensive debugging capabilities** for troubleshooting
10. **Improved error handling and user feedback**
11. **Non-intrusive toast notifications** (Enhanced 2025-01-23)

The recent enhancements ensure reliable worklist item management with proper deletion validation, preventing silent failures and maintaining data consistency between the UI and backend systems. The notification system has been improved to use fixed-position toasts that don't disrupt the layout, providing a better user experience.

Regular updates ensure optimal functionality and user experience.
