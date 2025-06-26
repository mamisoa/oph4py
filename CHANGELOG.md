# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

NEW CHANGLOG ENTRIES SHOULD BE **NEWEST AT THE TOP OF THE FILE, OLDEST  AT BOTTOM**.

## [2025-06-26T22:50:20.540561]

### Changed

- **JavaScript Modernization - jQuery Dependency Removal**: Completely eliminated jQuery dependencies from core utility functions in `useful.js` module
  - **Functions Modernized**:
    - `crudp()` - Converted from jQuery `$.ajax()` to native Fetch API with async/await
    - `getUuid()` - Replaced jQuery AJAX with modern fetch() implementation
    - `getTableInfo()` - Migrated from jQuery to vanilla JavaScript with proper error handling
    - `getUserInfo()` - Updated to use Fetch API instead of jQuery promises
    - `refreshTables()` - Enhanced to work without jQuery while maintaining bootstrap-table compatibility
    - `disableBtn()` - Converted from jQuery element manipulation to native DOM methods
  - **Technical Improvements**:
    - **Modern JavaScript**: All functions now use async/await, const/let, and ES6+ features
    - **Better Error Handling**: Enhanced try/catch blocks with descriptive error messages
    - **Performance**: Eliminated jQuery overhead for these core utility functions
    - **Framework Independence**: Functions no longer require jQuery to be loaded
    - **Graceful Degradation**: Bootstrap-table refresh maintains compatibility when jQuery is available
  - **API Consistency**: All functions maintain identical interfaces and return promises for backward compatibility
  - **Documentation**: Updated JSDoc comments with proper parameter types and usage examples

### Technical Details

- **File Modified**: `static/js/utils/useful.js` - Comprehensive jQuery removal across 6 core functions
- **Fetch API Integration**: Modern HTTP client using native browser APIs instead of jQuery AJAX
- **DOM Manipulation**: Direct use of `document.querySelector()` and native element properties
- **Element Selection**: Functions accept both string selectors and DOM elements for flexibility
- **Error Handling**: Comprehensive error logging and graceful fallbacks for missing elements
- **Bootstrap Compatibility**: Maintains bootstrap-table functionality while reducing jQuery dependency

### User Experience Impact

- **✅ No Functional Changes**: All existing functionality preserved with identical API interfaces
- **✅ Improved Performance**: Faster execution without jQuery overhead for these utility functions
- **✅ Better Error Messages**: Enhanced debugging with more descriptive error reporting
- **✅ Framework Flexibility**: Reduced dependency on jQuery for core application functions

### Code Quality Benefits

- **Modern Standards**: Updated to current JavaScript best practices and ES6+ syntax
- **Maintainability**: Cleaner, more readable code with consistent async/await patterns
- **Type Safety**: Better parameter validation and null safety checks
- **Documentation**: Comprehensive JSDoc comments with usage examples and parameter types
- **Testing**: Functions can now be tested independently without jQuery dependency

### Migration Strategy

This modernization follows a gradual approach to reduce jQuery dependencies across the codebase while maintaining backward compatibility. Core utility functions have been updated first, with plans to modernize other modules based on usage patterns and dependencies.

## [2025-06-26T22:29:49.454092]

### Changed

- **JavaScript Code Organization - Worklist Bootstrap Table Functions**: Refactored worklist-related JavaScript code to improve maintainability and follow modular architecture principles
  - **Code Consolidation**: Moved core worklist bootstrap-table functions from `templates/worklist.html` to centralized `static/js/wl/wl_bt.js` module:
    - `queryParams_wl()` - Query parameter building and filtering logic
    - `initWorklist()` - Bootstrap table initialization and configuration  
    - `setupDateInputHandlers()` - Date range filter event handling with validation
    - `setupDropdownHandlers()` - Practitioner and provider filter change handling
  - **Modular Architecture**: All worklist bootstrap-table functionality now centralized in dedicated JavaScript module
  - **Template Cleanup**: Removed 60+ lines of inline JavaScript from template, replacing with organized function calls
  - **Better Separation of Concerns**: Template now handles only server-side data injection and page-specific initialization
  - **Enhanced Maintainability**: Bootstrap table logic changes now require edits to only one file instead of template inspection

### Technical Details

- **Files Modified**:
  - `templates/worklist.html` - Removed inline `queryParams_wl()`, `initWorklist()`, date handlers, and dropdown handlers
  - `static/js/wl/wl_bt.js` - Added consolidated worklist bootstrap-table functions with proper documentation
- **Function Organization**: All worklist table functions now colocated with related formatter and event handler functions
- **Initialization Flow**: Template calls centralized functions `initWorklist()`, `setupDateInputHandlers()`, and `setupDropdownHandlers()` from wl_bt.js
- **Code Documentation**: Added comprehensive JSDoc comments for all moved functions explaining purpose and dependencies
- **Framework Integration**: Functions properly integrate with existing WorklistState management and performance profiling systems

### User Experience Impact

- **✅ No Functional Changes**: All worklist filtering, sorting, and table functionality remains identical
- **✅ Improved Development**: Easier to maintain and enhance worklist table features
- **✅ Better Debugging**: Bootstrap table issues can be debugged in dedicated JavaScript file
- **✅ Code Reusability**: Worklist functions could potentially be reused by other components

### Architecture Benefits

- **Modular Design**: Follows project's modular code generation rules for maintainability
- **Single Responsibility**: wl_bt.js now serves as the complete worklist bootstrap-table module
- **Reduced Template Complexity**: Templates focus on server-side data and page structure
- **Easier Testing**: Bootstrap table logic can be tested independently of template rendering
- **Code Discovery**: Developers can find all worklist table code in one predictable location

## [2025-06-24T00:38:01+02:00]

### Fixed

- **🚨 CRITICAL: Bootstrap Autocomplete jQuery Compatibility**: Fixed "e.fail is not a function" error in medication autocomplete after database commit refactor
  - **Root Cause**: Bootstrap-autocomplete library was incompatible with py4web's response handling changes made during database commit refactor
  - **Error Pattern**: Library was trying to call `.fail()` method on jQuery AJAX promises, but the method was not available due to response format changes
  - **Solution**: Replaced built-in `ajax` resolver with custom `search` function that handles jQuery AJAX promises properly
  - **Technical Implementation**:
    - Changed from `resolverSettings` to custom `resolver: 'custom'` with manual AJAX handling
    - Added explicit `dataType: 'json'` to ensure proper response parsing
    - Implemented proper `.done()` and `.fail()` promise handling
    - Added error logging with `console.warn()` for debugging
  - **Impact**: Medication autocomplete in MD view new medication modal now works without JavaScript errors
  - **Backward Compatibility**: Maintains all existing functionality while fixing jQuery compatibility

### Technical Details

- **File Modified**: `static/js/md/md.js` - Updated medication autocomplete configuration
- **jQuery Compatibility**: Custom AJAX handler ensures proper promise chain handling
- **Error Handling**: Added graceful fallback to empty array on API failures
- **Response Format**: Properly handles py4web's JSON response structure with `response.items`
- **Debugging**: Added console warnings for API errors to aid troubleshooting

### Root Cause Analysis

This issue was introduced during the database commit refactor when changes to `api/core/base.py` affected how API responses are handled. The bootstrap-autocomplete library expects specific jQuery AJAX promise methods that were not available after the response handling changes. The custom resolver approach bypasses the library's internal AJAX handling and provides explicit jQuery compatibility.

## [2025-06-24T00:30:21+02:00]

### Fixed

- **🚨 CRITICAL: Bootstrap Autocomplete Undefined Response Handling**: Fixed "Cannot read properties of undefined (reading 'length')" errors in medication and other autocomplete fields
  - **Root Cause**: Autocomplete `searchPost` functions were not handling cases where API responses return `undefined` or `null` instead of expected `{items: [], count: 0}` structure
  - **Error Pattern**: JavaScript was trying to access `.length` on undefined `res.items` when API endpoints returned malformed or empty responses
  - **Affected Autocomplete Fields**: Fixed all 8 autocomplete implementations across MD and GP views:
    - **MD View**: Medication, Agent, Disease, Lens (left/right), Cleaning Solution (left/right) autocomplete fields
    - **GP View**: Medication, Agent, Disease autocomplete fields
  - **API Endpoints Involved**: `/api/medic_ref`, `/api/agent`, `/api/disease_ref`, `/api/cl`, `/api/cleaning_solution`
  - **Impact**: All autocomplete fields in medical record forms now handle API response errors gracefully without JavaScript crashes

### Technical Details

- **Files Fixed**: 
  - `static/js/md/md.js` - Enhanced 6 autocomplete implementations with null safety
  - `static/js/md/gp.js` - Enhanced 3 autocomplete implementations with null safety
- **Response Validation**: Added existence checks `!res || res.count == 0` to handle null/undefined API responses
- **Fallback Implementation**: Changed `return res.items` to `return res && res.items ? res.items : []` to provide empty array fallback
- **Consistency**: Applied same defensive programming pattern to all autocomplete `searchPost` functions
- **Bootstrap Autocomplete Compatibility**: Maintains compatibility with bootstrap-autocomplete library expectations

### User Experience Impact

- **✅ Form Functionality**: New medication modal and other autocomplete forms now work without JavaScript errors
- **✅ Graceful Degradation**: When API endpoints are unavailable, autocomplete fields show empty results instead of crashing
- **✅ Error Prevention**: Eliminates "Cannot read properties of undefined" console errors that blocked form functionality
- **✅ Medical Workflow**: Doctors can now add medications, agents, diseases, and equipment without JavaScript interruptions

### Root Cause Analysis

This issue was triggered by API response format inconsistencies where some endpoints might return `null`, `undefined`, or error responses instead of the expected `{items: array, count: number}` structure. The autocomplete library expected a valid response structure, but the `searchPost` functions lacked defensive programming to handle edge cases. This demonstrates the importance of null-safety checks in JavaScript when consuming API data.

## [2025-06-24T00:23:07+02:00]

### Fixed

- **🚨 CRITICAL: Worklist API Database Transaction Management**: Fixed improper manual database transaction management in worklist API endpoints to follow py4web best practices
  - **Root Cause**: Manual `db.commit()`, `db.rollback()`, and `db._adapter.connection.begin()` calls were redundant and potentially harmful when used with `@action.uses(db)` decorator
  - **py4web Transaction Management**: With `@action.uses(db)` decorator, py4web automatically handles transaction lifecycle:
    - `on_request`: starts transaction
    - `on_success`: commits transaction automatically 
    - `on_error`: rolls back transaction automatically
  - **Endpoints Fixed**:
    - `/api/worklist/batch` - Removed manual transaction management, now uses automatic py4web transactions
    - `/api/worklist/transaction/<transaction_id>` - Added missing `@action.uses(db)` decorator
    - `/api/worklist/transaction/<transaction_id>/retry` - Added missing `@action.uses(db)` decorator and removed manual transaction management
  - **Manual Operations Removed**:
    - 3 instances of `db.commit()` calls eliminated
    - 2 instances of `db.rollback()` calls eliminated  
    - 2 instances of `db._adapter.connection.begin()` calls eliminated
  - **Impact**: Worklist batch operations now use proper py4web transaction management ensuring consistency and automatic rollback on errors

### Technical Details

- **File Modified**: `api/endpoints/worklist.py` - Comprehensive transaction management cleanup
- **Framework Compliance**: All endpoints now follow py4web best practices for database transaction handling
- **Automatic Rollback**: Database automatically rolls back on any exception, ensuring data consistency
- **Decorator Addition**: Missing `@action.uses(db)` decorators added to transaction status and retry endpoints
- **Code Simplification**: Removed complex manual transaction blocks in favor of framework automation
- **Error Handling**: Simplified error handling since rollback is now automatic on exceptions

### Database Operations Enhanced

- **Batch Creation**: `/api/worklist/batch` endpoint now relies on automatic transaction management for atomic operations
- **Transaction Recovery**: `/api/worklist/transaction/<id>/retry` endpoint now uses proper py4web transaction lifecycle
- **Status Queries**: `/api/worklist/transaction/<id>` endpoint now has proper database access decorators
- **Audit Trail**: Transaction audit entries still created properly but with automatic commit/rollback handling

### Design Philosophy

- **Framework Best Practices**: Use py4web's built-in transaction management instead of manual control
- **Database Consistency**: Automatic transaction lifecycle management ensures proper ACID properties
- **Code Maintainability**: Reduced complexity by removing manual transaction management code
- **Error Safety**: Automatic rollback prevents data corruption on failures

## [2025-01-22T10:30:00.000000]

### Fixed

- **🚨 CRITICAL: Certificates JS Module API Response Handling**: Fixed "Cannot read properties of undefined (reading 'length')" errors in certificates.js module after database refactor
  - **Root Cause**: After API response format changes, certificates.js was still using jQuery response array format `response[0]["items"]` instead of direct JSON object access `response["items"]`
  - **Error Pattern**: JavaScript was trying to access `.length` on undefined objects when API responses were in the new direct JSON format
  - **Affected Functions**: Fixed all 4 data fetching patterns:
    - `getRightAutoRx()` / `getLeftAutoRx()` - AutoRx data for certificate generation
    - `getRightCycloRx()` / `getLeftCycloRx()` - Cycloplegic refraction data  
    - `getRightTrialRx()` / `getLeftTrialRx()` - Trial lens refraction data
    - `getRightTono()` / `getLeftTono()` - Tonometry/pachymetry data
  - **API Parameter Fix**: Fixed tono API endpoints to use proper pyDAL syntax `id_auth_user.eq=` instead of `id_auth_user=`
  - **Impact**: Certificate generation in MD view now works correctly with proper data population from examination results

### Technical Details

- **File Fixed**: `static/js/md/certificates.js` - Updated all API response handling patterns
- **Response Format Change**: Changed from `response[0]["items"]` to `response["items"]` to match new JSON serialization
- **Null Safety**: Added existence checks with `response["items"] && response["items"].length > 0` pattern
- **API Parameters**: Fixed `templates/modalityCtr/js-sections/md-apis.html` tono endpoints to use correct query syntax
- **Data Flow**: Certificate generation objects (`autorxObjFill`, `cyclorxObjFill`, `trialrxObjFill`, `tonoObjFill`) now populate correctly

### User Experience Impact

- **✅ Certificate Generation**: Doctors can now generate certificates with proper examination data inclusion
- **✅ Data Integration**: AutoRx, cyclo, trial lens, and tonometry measurements properly appear in certificates
- **✅ Error Elimination**: Removed JavaScript console errors that were preventing certificate functionality
- **✅ Medical Workflow**: Complete certificate workflow restoration for MD examinations

### Root Cause Analysis

This issue was a follow-on effect from the API JSON serialization fixes. While the main API endpoints were corrected to return proper JSON, the certificates.js module was still using the older jQuery response array format. This demonstrates the importance of comprehensive testing across all JavaScript modules that consume API data after framework-level changes.

## [2025-01-21T22:05:00.000000]

### Fixed

- **🚨 CRITICAL: Modality Options API Broken After Database Refactor**: Fixed worklist modality dropdown not loading options due to JSON serialization issues introduced during database commit cleanup
  - **Root Cause**: Database commit refactor accidentally broke JSON serialization in `handle_rest_api_request()` function by using `str()` on RestAPI response objects instead of proper JSON serialization
  - **API Response Issue**: Server was returning Python dict representation with single quotes and datetime objects instead of valid JSON:
    ```python
    # Before Fix (Invalid JSON)
    {'items': [{'created_on': datetime.datetime(2021, 4, 19, 2, 1, 29), ...}]}
    
    # After Fix (Valid JSON)  
    {"items": [{"created_on": "2021-04-19 02:01:29", ...}]}
    ```
  - **Frontend Error**: JavaScript was receiving malformed JSON causing "Expected property name or '}' in JSON" parsing errors
  - **Secondary Issue**: Lookup field access pattern required bracket notation for flattened field names with dots

### Technical Details

- **File Fixed**: `api/core/base.py` - `handle_rest_api_request()` function
- **JSON Serialization**: Replaced `str(json_resp)` with proper `json.dumps()` with datetime handling
- **Datetime Handling**: Added custom serializer for `datetime.datetime` and `datetime.date` objects
- **Frontend Fix**: Updated field access pattern in `static/js/wl/wl.js` for py4web lookup fields
- **Field Access Pattern**: Used bracket notation `item['id_modality.id']` for flattened lookup field names

### API Endpoint Corrections

- **Modality API Endpoint**: Changed from non-existent `/api/modality` to proper `/api/procedure_family` with lookup
- **Database Relationships**: Correctly uses `procedure_family` junction table to get modalities for procedures  
- **Lookup Syntax**: Added `@lookup=id_modality!:id_modality[id,modality_name]` for proper field joins
- **Field Access**: Fixed JavaScript to handle py4web's flattened field naming convention

### User Experience Impact

- **✅ Modality Dropdown**: Now properly loads available modalities when procedure is selected
- **✅ Form Validation**: Prevents API calls with undefined procedure IDs
- **✅ Error Handling**: Enhanced debugging and user feedback for API failures
- **✅ Worklist Creation**: Users can now create worklist items with proper modality selection

### Root Cause Analysis

This issue demonstrates the importance of comprehensive testing after framework-level changes. The database commit refactor, while correct for transaction management, inadvertently affected a core utility function used by multiple API endpoints. The fix ensures proper JSON serialization while maintaining the improved transaction management.

## [2025-01-21T15:30:00.000000]

### Fixed

- **🚨 CRITICAL: Database Commit Implementation Fixes**: Comprehensive cleanup of manual database transaction management across multiple modules to follow py4web best practices
  - **Root Cause**: Manual `db.commit()` calls were redundant and potentially harmful when used with `@action.uses(db)` decorator which provides automatic transaction management
  - **py4web Transaction Management**: With `@action.uses(db)` decorator, py4web automatically handles transaction lifecycle:
    - `on_request`: starts transaction
    - `on_success`: commits transaction automatically 
    - `on_error`: rolls back transaction automatically
  - **Files Fixed**:
    - **`manage.py`**: Removed manual `db.commit()` from `change_password()` function and added missing `@action.uses(db)` decorators to 6 database management functions
    - **`api/core/base.py`**: Removed manual `db.commit()` from `handle_rest_api_request()` utility function and improved type safety
    - **`api/endpoints/billing.py`**: Removed 4 manual `db.commit()` calls and eliminated manual transaction management in `apply_billing_combo()` function
  - **Impact**: Database operations now use proper py4web transaction management ensuring consistency and automatic rollback on errors

### Technical Details

- **Manual Commits Removed**: 6 instances of `db.commit()` eliminated across 3 files
- **Missing Decorators Added**: 6 functions in `manage.py` now have proper `@action.uses(db)` decorators
- **Transaction Simplification**: Removed complex manual transaction blocks with `db.begin()`, `db.commit()`, and `db.rollback()`
- **Type Safety Improvements**: Enhanced return type handling in `api/core/base.py`
- **Framework Compliance**: All database operations now follow py4web best practices

### Database Operations Enhanced

- **Management Functions**: `save_table()`, `save_all_tables()`, `save_db()`, `init_db()`, `restore_db()`, `restore()` now have proper decorators
- **Password Management**: `change_password()` function now relies on automatic transaction management
- **API Utilities**: `handle_rest_api_request()` no longer performs manual commits, trusting endpoint decorators
- **Billing Operations**: All CRUD operations in billing endpoints now use automatic transaction management

### Design Philosophy

- **Framework Best Practices**: Use py4web's built-in transaction management instead of manual control
- **Database Consistency**: Automatic transaction lifecycle management ensures proper ACID properties
- **Error Handling**: Simplified error handling since rollback is now automatic on exceptions
- **Code Maintainability**: Reduced complexity by removing manual transaction management code

## [2025-01-20T17:32:00.000000]

### Fixed

- **🚨 CRITICAL: Payment Transaction Processing Database Commit Issues**: Fixed payment processing endpoints not using py4web's automatic transaction management
- **Controllers Transaction Management**: Removed manual `db.commit()` calls from `facilities()` and `testtable()` functions in `controllers.py` that already use `@action.uses(db)` decorator
- **Auth API Transaction Management**: Fixed `api/endpoints/auth.py` by adding `@action.uses(db)` decorator to `api()` and `octopus()` functions and removing manual `db.commit()` call
  - **Root Cause**: Payment API endpoints were missing `@action.uses(db)` decorator while manually calling `db.commit()` and `db.rollback()`, which is incorrect in py4web
  - **py4web Transaction Management**: With `@action.uses(db)` decorator, py4web automatically handles transaction lifecycle:
    - `on_request`: starts transaction
    - `on_success`: commits transaction automatically 
    - `on_error`: rolls back transaction automatically
  - **Endpoints Fixed**:
    - `/api/worklist/<worklist_id>/payment_summary` - Added `@action.uses(db)`
    - `/api/worklist/<worklist_id>/billing_breakdown` - Added `@action.uses(db)`
    - `/api/worklist/<worklist_id>/payment` - Added `@action.uses(db)` and removed manual `db.commit()`
    - `/api/worklist/<worklist_id>/transactions` - Added `@action.uses(db)`
    - `/api/worklist/<worklist_id>/transactions/<transaction_id>/cancel` - Added `@action.uses(db)` and removed manual commits/rollbacks
    - `/api/worklist/<worklist_id>/md_summary` - Added `@action.uses(db)`
    - `/api/worklist/<worklist_id>/md_summary_modal` - Added `@action.uses(db)`
    - `/api/patient/<patient_id>/md_summary` - Added `@action.uses(db)`
  - **Impact**: Payment transactions now process reliably with proper database consistency and automatic rollback on errors
  - **Database Integrity**: Eliminates potential transaction state issues and ensures proper cleanup on failures

### Technical Details

- **File Modified**: `api/endpoints/payment.py` - Added proper py4web decorators and removed manual transaction management
- **Framework Compliance**: Now follows py4web best practices for database transaction handling
- **Automatic Rollback**: Database automatically rolls back on any exception, ensuring data consistency
- **Performance**: Eliminates unnecessary manual transaction management overhead
- **Error Handling**: Simplified error handling since rollback is now automatic

### Design Philosophy

- **Framework Best Practices**: Use py4web's built-in transaction management instead of manual control
- **Database Consistency**: Automatic transaction lifecycle management ensures proper ACID properties
- **Simplified Code**: Remove manual commit/rollback complexity and rely on framework automation

## [2025-06-23T02:43:29.436622]

### Fixed

- **🚨 CRITICAL: WorklistState ReferenceError**: Fixed "ReferenceError: WorklistState is not defined" in worklist.html
  - **Root Cause**: Premature call to `WorklistState.Manager.startAutoRefresh()` before `wl-state-manager.js` script was loaded
  - **Solution**: Removed duplicate auto-refresh initialization from main script block (line 950)
  - **Script Loading Order**: Now properly loads external scripts before attempting to use WorklistState object
  - **Impact**: Eliminates JavaScript console errors and ensures proper worklist functionality
  - **Preserved Functionality**: Correct auto-refresh initialization remains in place within the post-load setTimeout

### Technical Details

- **File Modified**: `templates/worklist.html` - Removed premature WorklistState call
- **Script Loading Pattern**: External scripts → DOM ready → setTimeout → WorklistState usage
- **Redundancy Removed**: Eliminated duplicate auto-refresh calls (kept the properly timed one)
- **Error Prevention**: Ensures all dependencies are loaded before object method calls
- **Fallback Preserved**: Maintains fallback timer logic for cases where WorklistState fails to load

## [2025-06-23T02:37:47.744546]

### Fixed

- **🔧 Username and Email Sanitization**: Fixed autofill functionality in new user modal to remove accents and illegal characters from username and email fields
  - **Root Cause**: When first name contained accented characters (é, à, ç, etc.) or spaces, the auto-generated username and email contained invalid characters
  - **Solution**: Added `sanitizeForUsername()` function that uses existing `norm()` utility to remove accents and filters out non-alphanumeric characters (except underscores)
  - **Sanitization Process**:
    - Converts text to lowercase
    - Removes accents using Unicode normalization (`norm()` function from `useful.js`)
    - Removes spaces and any characters that are not letters, numbers, or underscores
    - Preserves timestamp suffix for uniqueness
  - **Impact**: Username and email fields now contain only valid characters, preventing validation errors and database issues
  - **User Experience**: Automatic username/email generation works reliably for users with accented names (common in French, Belgian, and other European contexts)

### Technical Details

- **File Modified**: `static/js/manage/users.js` - Enhanced autofill username functionality
- **Function Added**: `sanitizeForUsername(text)` - Handles accent removal and character filtering
- **Integration**: Works with both manual first name entry and Belgian ID card import (EID button)
- **Dependencies**: Uses existing `norm()` function from `static/js/utils/useful.js` for Unicode normalization
- **Pattern**: Follows existing codebase pattern of using utility functions for text processing
- **Backward Compatibility**: No impact on existing user records; only affects new user creation workflow

### Design Philosophy

- **Input Sanitization**: Proactive cleaning of user input to prevent downstream validation issues
- **Internationalization**: Proper handling of accented characters common in European names
- **Consistent Data**: Ensures username fields contain only database-safe characters

## [2025-06-23T02:33:23.213355]

### Changed

- **🔄 Worklist MD Modality Button Logic Update**: Modified summary and payment button display logic for MD modality in worklist
  - **New Logic**: 
    - When MD modality is **NOT done**: Show summary button, hide payment button
    - When MD modality is **done**: Show payment button, hide summary button
  - **Other Modalities**: GP and other main modalities maintain existing behavior (show summary when done)
  - **User Experience**: Clearer workflow separation between examination summary (pre-completion) and payment processing (post-completion) for MD procedures
  - **Impact**: Reduces button clutter and provides more intuitive workflow for medical staff

### Technical Details

- **File Modified**: `static/js/wl/wl_bt.js` - Updated `operateFormatter_wl()` function
- **Implementation**: Replaced generic main modality check with specific MD modality handling
- **Button Logic**: 
  - MD + not done = summary button only
  - MD + done = payment button only  
  - GP + done = summary button (unchanged)
- **Backward Compatibility**: No impact on existing GP or other modality workflows

## [2025-06-23T02:28:43.911450]

### Added

- **🔄 Bootstrap Table Refresh Buttons**: Added toolbar refresh buttons to all bootstrap tables in autorx and tono views
  - **AutoRx Tables Enhanced**: 
    - `rxRight_tbl` and `rxLeft_tbl` - Rx data tables now have refresh buttons
    - `kmRight_tbl` and `kmLeft_tbl` - Keratometry tables now have refresh buttons
    - `visionixRight_tbl` and `visionixLeft_tbl` - Machine import tables now have refresh buttons
    - `cvRx_tbl` and `cvKm_tbl` - CV5000 import tables now have refresh buttons
  - **Tono Tables Enhanced**:
    - `airPachyRight_tbl` and `airPachyLeft_tbl` - Air tonometry/pachymetry tables now have refresh buttons
    - `aplaRight_tbl` and `aplaLeft_tbl` - Aplanation tonometry tables now have refresh buttons
  - **User Experience**: Manual refresh capability allows users to update table data without full page reload
  - **Implementation**: Added `data-show-refresh="true"` and `data-buttons-align="right"` attributes to all bootstrap tables
  - **Consistent UI**: Refresh buttons aligned to the right for consistent user interface across all tables

### Technical Details

- **Bootstrap Table Integration**: Uses built-in bootstrap-table refresh functionality with `data-show-refresh="true"`
- **Button Alignment**: All refresh buttons positioned on the right side of tables for consistent UX
- **Async Compatibility**: Refresh buttons work seamlessly with existing Promise-based refresh patterns
- **No Backend Changes**: Pure frontend enhancement using bootstrap-table's native refresh capability
- **Files Modified**: 
  - `templates/modalityCtr/autorx.html` - Added refresh buttons to all 6 bootstrap tables
  - `templates/modalityCtr/tono.html` - Added refresh buttons to all 4 bootstrap tables

### Design Philosophy

- **Manual Control**: Provides users with manual refresh capability alongside automatic refresh patterns
- **Consistent Interface**: Standardized refresh button placement across all medical measurement tables
- **Bootstrap Standards**: Uses bootstrap-table's built-in refresh functionality rather than custom implementations

## [2025-06-23T02:15:49.526789]

### Fixed

- **🔧 Worklist Actions Simplified**: Fixed race conditions and missing table refreshes across all worklist actions
  - **Root Cause**: Complex async patterns with stale data checks and multiple refresh mechanisms were creating race conditions
  - **Solution**: Reverted to simple synchronous approach using proven patterns from MD views
  - **Actions Simplified**:
    - `"click .done"` - Now uses simple `setWlItemStatus()` call with table refresh
    - `"click .unlock"` - Reverted to synchronous pattern with table refresh
    - `"click .stopwatch"` - Simplified counter updates with table refresh
    - `"click .remove"` - Reverted to simple bootbox confirmation + crudp DELETE with table refresh
  - **Impact**: Eliminates ghosting effect where UI shows "done" status that reverts on refresh
  - **Performance**: Faster response for single operations, eliminates unnecessary complexity
  - **User Experience**: Consistent status updates and table refreshes without confusing visual artifacts

### Technical Details

- **Pattern Change**: Moved from async/await with race condition checks back to proven synchronous pattern
- **Removed Complexity**: Eliminated "fresh data" checks that were causing more problems than they solved  
- **Simple Flow**: Click → Create data object → Call function → Function handles crudp + table refresh
- **Race Condition Fix**: Single atomic operation instead of multiple async operations that could interfere
- **Files Modified**: `static/js/wl/wl_bt.js` - Simplified event handlers for done, unlock, stopwatch, and remove actions
- **Dependencies**: Uses existing `setWlItemStatus()` function from `useful.js` and `bootbox` confirmation dialogs
- **Delete Pattern**: Uses same pattern as MD views: bootbox confirmation → crudp DELETE → table refresh

### Design Philosophy

- **Single Operations**: Use simple synchronous patterns for individual status changes
- **Batch Operations**: Reserve complex async patterns only for multi-item operations where coordination is needed
- **Proven Patterns**: Revert to working implementations rather than over-engineering simple operations

## [2025-06-23T02:07:00.613046]

### Fixed

- **🔧 Billing Codes by Worklist Endpoint Auth Signature Support**: Fixed `/api/billing_codes/by_worklist/<id>` endpoint to properly return user information for Created by/Modified by fields
  - **Root Cause**: Custom endpoint implementation was not handling `@lookup` parameter to join with `auth_user` table
  - **Solution**: Replaced custom implementation with standard `handle_rest_api_request` function that properly handles `@lookup` parameters
  - **API Enhancement**: Endpoint now automatically includes user lookups: `@lookup=mod!:modified_by[id,first_name,last_name],creator!:created_by[id,first_name,last_name]`
  - **Response Format**: API now returns `mod.first_name`, `mod.last_name`, `creator.first_name`, `creator.last_name` fields for proper user display
  - **Backward Compatibility**: Maintains all existing functionality while adding user information support
  - **Impact**: Bootstrap-table detail formatter in MD billing codes section can now properly display actual user names

### Technical Details

- **File Modified**: `api/endpoints/billing.py` - `billing_codes_by_worklist()` function
- **Implementation**: Switched from custom pyDAL queries to standard REST API handler with `@lookup` support
- **Database Joins**: Now properly performs LEFT JOINs with `auth_user` table using aliases (`mod` and `creator`)
- **Query Parameters**: Automatically adds `@lookup`, `@count`, and `@order` parameters if not provided
- **Meta Enhancement**: Preserves existing meta calculation functionality (totals, secondary codes count, etc.)
- **Error Handling**: Maintains comprehensive error handling and logging for debugging

## [2025-06-23T01:44:32.479649]

### Fixed

- **🔧 Billing Codes Auth Signature Display**: Fixed "undefined undefined" appearing in Created by/Modified by fields in billing codes detail view
  - **Root Cause**: API call for billing codes was missing `@lookup` parameter to join with `auth_user` table
  - **Solution**: Added `@lookup=mod!:modified_by[id,first_name,last_name],creator!:created_by[id,first_name,last_name]&@count=true` to billing codes API URL
  - **Impact**: Detail view in MD billing codes section now properly displays actual user names instead of "undefined undefined"
  - **API Enhancement**: Billing codes API now returns enriched data with user information for audit trail display
  - **User Experience**: Healthcare professionals can now see who created/modified billing codes for proper audit tracking

### Technical Details

- **File Modified**: `templates/modalityCtr/js-sections/md-apis.html`
- **API Pattern**: Aligned billing codes API call with other medical record APIs that properly display user information
- **Database Joins**: Added LEFT JOIN with `auth_user` table to retrieve `first_name` and `last_name` for both created_by and modified_by fields
- **Consistent Pattern**: Now follows same lookup pattern used by other medical record tables (allergies, medications, keratometry, etc.)

## [2025-06-23T01:39:31.784648]

### Fixed

- **🚨 CRITICAL: Auth Signature Fields Not Populated**: Fixed missing authentication on API endpoints causing "undefined undefined" in Created by/Modified by fields
  - **Root Cause**: Multiple API endpoints lacked `@action.uses(auth.user)` decorator, preventing py4web from populating `auth.signature` fields (`created_by`, `modified_by`, `created_on`, `modified_on`)
  - **Endpoints Fixed**:
    - `/api/worklist/batch` - Worklist creation now requires authentication
    - `/api/billing_codes` - Billing codes CRUD operations now require authentication  
    - `/api/billing_codes/by_worklist/<id>` - Billing codes retrieval now requires authentication
    - `/api/billing_combo/<id>/apply` - Combo application now requires authentication
    - `/api/billing_combo_usage` - Combo usage tracking now requires authentication
  - **Impact**: All new records created through these endpoints will now properly track who created/modified them with authenticated user information
  - **User Experience**: "Created by" and "Modified by" fields in MD view billing codes and other interfaces will now show actual user names instead of "undefined undefined"

### Security

- **Enhanced API Security**: All billing and worklist creation endpoints now require user authentication, improving audit trails and access control
- **Data Integrity**: Auth signature fields now properly populated for all new records, ensuring complete audit history

### Technical Details

- **py4web Auth Integration**: Proper use of `@action.uses(auth.user, db)` decorator ensures authenticated user context is available during record creation
- **Automatic Field Population**: py4web's `auth.signature` mechanism now works correctly to populate `created_by`, `modified_by`, `created_on`, and `modified_on` fields
- **Backward Compatibility**: Existing records remain unchanged; only new records created after this fix will have proper auth signature data

## [2025-06-22T23:30:52.410661]

### Fixed

- A critical bug causing a 500 server error ("list index out of range") when filtering the worklist by date. The issue was resolved by changing the API query parameters from `gte`/`lte` to the `pydal`-compatible `ge`/`le` in `templates/worklist.html`.

### Added

- The worklist date filter now defaults to today's date on page load.
- Auto-refresh functionality to the worklist date filter; the table now updates automatically when the start or end dates are changed.
- Date validation to the worklist filter to ensure the start date cannot be set after the end date.

### Changed

- The provider and practitioner selectors on the worklist page now automatically adjust their width to fit their content, improving the layout.

### Removed

- The manual "Filter" button from the worklist page, as filtering is now automatic and triggered by date changes.

## [2025-06-22T22:21:06.430780]

### Changed

- Replaced 'Full list' and 'Today's list' buttons in worklist.html with a date range filter (start/end date inputs, defaulting to today).
- Updated JS logic to build API query with requested_time.gte/lte and provider/practitioner filters.
- Table now refreshes based on date range and filters; default load is today-to-today.
- No backend/API change required; uses py4web RestAPI filtering best practices.
