# Changelog

All notable changes to this project will be documented in this file.

## [2025-06-08T15:14:42.791746] - Documentation Updates and UI Positioning Fix

### Enhanced

- **Documentation System**: Updated memory bank and system patterns documentation
  - **Memory Bank Update** (`memory-bank/activeContext.md`): Updated to reflect the completed fee preservation enhancement with "N/A" value handling
    - **Status Update**: Changed from "LATEST ENHANCEMENT" to "COMPLETED ENHANCEMENT" with comprehensive feature documentation
    - **Enhanced Export Format**: Documented complete v1.1 format with fee preservation and "N/A" value filtering
    - **Smart Import Processing**: Documented dual processing logic and version-aware validation
    - **Final Implementation Status**: Marked all core functionality as production-ready
  - **System Patterns Update** (`memory-bank/systemPatterns.md`): Added new billing combo fee preservation pattern
    - **New Pattern**: "Billing Combo Fee Preservation Import/Export Pattern" with comprehensive implementation guide
    - **Problem Context**: Documents challenges with fee data loss, API dependency, and null value handling
    - **Implementation Pattern**: Complete code examples for versioned export format evolution
    - **Architecture Diagram**: Mermaid diagram showing export/import flow with "N/A" handling
    - **Implementation Checklist**: Detailed checklist for export/import enhancement implementation

- **UI/UX Improvements**: Fixed modal positioning for better user experience
  - **Bootbox Dialog Positioning**: Added CSS to position delete confirmation dialogs below the fixed navbar
    - **Margin Adjustment**: Added 70px top margin to `.bootbox.modal` elements
    - **Z-Index Management**: Proper z-index hierarchy (navbar: 10000, backdrop: 9999, modal: 9998)
    - **Backdrop Handling**: Ensured modal backdrop doesn't interfere with navbar interaction
  - **Enhanced Accessibility**: Confirmation dialogs now appear in proper viewport position
  - **Consistent Modal Behavior**: All billing combo modals now follow consistent positioning rules

### Fixed

- **Modal Overlay Issue**: Delete confirmation dialog positioning
  - **Problem**: Bootbox confirmation dialogs appeared behind or overlapping the fixed navbar
  - **Solution**: Added targeted CSS styles in `templates/manage/billing_combo.html`
  - **Impact**: Delete confirmations now appear properly positioned below the navigation bar

### Technical Implementation

- **CSS Enhancements** (`templates/manage/billing_combo.html`):
  ```css
  /* Position bootbox confirmation dialogs below the fixed navbar */
  .bootbox.modal {
      margin-top: 70px !important;
      z-index: 9998 !important;
  }
  
  /* Ensure the backdrop doesn't interfere with navbar */
  .modal-backdrop {
      z-index: 9999 !important;
  }
  ```

### Benefits

- **Improved Documentation**: Complete system pattern documentation for fee preservation enhancement
- **Better User Experience**: Delete confirmations now appear in proper position relative to fixed navbar
- **Enhanced Maintainability**: Comprehensive documentation for future development and maintenance
- **Professional UI**: Consistent modal positioning across the application

## [2025-06-08T14:56:05.883601] - Enhanced Export/Import with Fee Preservation

### Added

- **Fee-Inclusive Export Format (v1.1)**: Complete fee preservation in export files
  - **Enhanced Export Structure**: Exports now include complete fee information from combo_codes
  - **Version 1.1 Format**: Updated export format to include all fee and description data
    ```json
    {
      "export_info": {
        "version": "1.1",
        "exported_at": "2025-06-08T14:56:05Z",
        "exported_by": "user@email.com"
      },
      "combo_data": {
        "combo_name": "Standard Consultation",
        "combo_description": "Description...",
        "specialty": "ophthalmology",
        "combo_codes": [
          {
            "nomen_code": 105755,
            "nomen_desc_fr": "Description in French",
            "feecode": 123,
            "fee": "45.50",
            "secondary_nomen_code": 102030,
            "secondary_nomen_desc_fr": "Secondary description",
            "secondary_feecode": 456,
            "secondary_fee": "12.30"
          }
        ]
      }
    }
    ```
  - **Legacy Code Support**: Automatic conversion of legacy integer codes to complete format during export
  - **Complete Data Preservation**: Includes all nomenclature descriptions, fees, and feecodes

- **Backward Compatible Import System**: Smart version detection and processing
  - **Auto-Version Detection**: Automatically detects v1.0 (code-only) vs v1.1 (fee-inclusive) formats
  - **Dual Processing Logic**: 
    - **v1.0 imports**: Fetch current fees from NomenclatureClient API (existing behavior)
    - **v1.1 imports**: Use provided fee data directly (new behavior)
  - **Enhanced Validation**: Fee validation for v1.1 format with range checking and type validation
  - **Seamless Migration**: Existing v1.0 export files continue to work unchanged

### Enhanced

- **Export Functions**: Updated both single and multi-export endpoints
  - **Single Export** (`GET /api/billing_combo/<id>/export`): Now exports complete fee data
  - **Multi Export** (`POST /api/billing_combo/export_multiple`): Bulk export with complete fee information
  - **Legacy Compatibility**: Automatic enrichment of legacy integer codes with current fee data
  - **Robust Parsing**: Enhanced combo_codes parsing with fallback mechanisms

- **Import Validation**: Enhanced validation system with version-aware rules
  - **Fee Validation**: Numeric validation, range checking (0-9999.99), and type safety
  - **Feecode Validation**: Integer validation for fee codes
  - **Conditional Validation**: Nomenclature validation only for v1.0 (code-only) imports
  - **Comprehensive Error Reporting**: Detailed validation messages per code entry

- **Import Processing**: Version-aware processing with fee handling
  - **v1.0 Processing**: Enriches codes with current NomenclatureClient data
  - **v1.1 Processing**: Uses provided fee data directly for historical accuracy
  - **Error Resilience**: Graceful handling of missing nomenclature data
  - **Audit Trail**: Enhanced logging with version information

### Technical Implementation

- **Backend Changes** (`api/endpoints/billing.py`):
  - **Export Functions**: Complete rewrite to include full combo_codes data
  - **Version Detection**: New `detect_import_format()` returns format and version
  - **Validation Enhancement**: Updated validation functions with version parameter
  - **Processing Logic**: Dual-path processing based on detected version
  - **Fee Validation**: Comprehensive fee field validation for v1.1 format

- **Data Format Evolution**:
  - **v1.0 Format**: Code-only exports (backward compatibility)
  - **v1.1 Format**: Complete fee-inclusive exports (new default)
  - **Auto-Migration**: Legacy codes automatically enriched during export

### Benefits

- **Fee Preservation**: Exported combos maintain exact fee structure for auditing and billing consistency
- **Historical Accuracy**: Important for maintaining billing records across time periods
- **Reduced API Dependency**: v1.1 imports don't require live nomenclature API access
- **Backward Compatibility**: Existing v1.0 exports continue to work seamlessly
- **Future-Proof**: Versioned format allows for future enhancements without breaking changes

### Migration Notes

- **Automatic Upgrade**: All new exports use v1.1 format with complete fee data
- **No Breaking Changes**: Existing v1.0 export files import unchanged
- **Performance Impact**: Slightly larger export files due to fee data inclusion
- **API Usage**: Reduced NomenclatureClient API calls for v1.1 imports

## [2025-06-08T14:39:40.412036] - Complete Import/Export System for Billing Combos

### Added

- **Frontend Import UI Implementation**: Complete import modal with modern UX patterns
  - **Import Modal**: Full-featured modal (`importComboModal`) with multi-step workflow
  - **Drag & Drop Support**: Visual drag-and-drop area with hover feedback and file validation
  - **File Upload**: Standard file input with JSON validation and 10MB size limit
  - **Format Auto-Detection**: Automatic detection and preview of single vs multi-combo formats
  - **Import Preview**: Detailed preview showing combo names, specialties, code counts, and potential conflicts
  - **Progress Tracking**: Animated progress bar with real-time status updates during import process
  - **Results Display**: Comprehensive results showing successful imports, failures, and naming conflicts
  - **Conflict Resolution**: Visual indication of automatic '(copy)' naming resolution
  - **Table Refresh**: Automatic table refresh after successful imports to show new combos

- **[2025-06-08T14:44:50.211771] Backend Import Compatibility Fix**:
  - Fixed py4web async compatibility issue by making import endpoint synchronous
  - Changed import API to accept JSON data in request body instead of file uploads
  - Removed async/await patterns for py4web compatibility
  - Enhanced error handling for HTTP response validation
  - Updated frontend to send parsed JSON data directly to API
  - Fixed import results display to match backend response format
  - Improved modal positioning to appear below navigation bar (margin-top: 60px)

- **Enhanced BillingComboManager**: Extended class with complete import functionality
  - **Modal Management**: `showImportModal()`, `resetImportModal()` for state management
  - **File Processing**: `processFile()`, `readFileAsText()` with validation and error handling
  - **Format Detection**: `detectImportFormat()` matching backend detection logic
  - **UI Controllers**: `showImportPreview()`, `startImport()`, `updateProgress()` for workflow management
  - **Results Handling**: `showImportResults()`, `showDetailedResults()` with success/error states
  - **Drag & Drop**: Full drag-and-drop implementation with visual feedback and event handling

### Enhanced

- **Import System Integration**: Complete frontend-backend integration
  - **API Integration**: Seamless connection to `POST /api/billing_combo/import` endpoint
  - **Error Handling**: Comprehensive error handling with user-friendly messages
  - **Validation Feedback**: Display of backend validation results with detailed error information
  - **Progress Communication**: Real-time progress updates during import processing
  - **Automatic Refresh**: Table refresh after successful imports to reflect new data

## [2025-06-08T14:05:14.137363] - Multi-Selection Export for Billing Combos

### Added

- **Multi-Selection Export Functionality**: Complete implementation of bulk combo export
  - **Bootstrap Table Multi-Selection**: Added checkbox column with comprehensive selection support
    - Checkbox header for select-all/unselect-all functionality
    - Individual row checkboxes with click-to-select behavior
    - Support for Ctrl+click (individual selection) and Shift+click (range selection)
    - Maintain selection state across pagination and table operations
  - **Dynamic Export Button**: Added "Export Selected" button with intelligent state management
    - Disabled state when no combos selected
    - Dynamic text showing selection count: "Export Selected (3 combos)"
    - Real-time selection info display: "3 combos selected"
    - Clear visual feedback for user actions

- **Multi-Export Backend API**: New `POST /api/billing_combo/export_multiple` endpoint
  - **Batch Processing**: Accepts array of combo IDs for bulk export
  - **Multi-Combo JSON Format**: Enhanced export structure for multiple combos
    ```json
    {
      "export_info": {
        "version": "1.0",
        "export_type": "multi_combo", 
        "exported_at": "2025-06-08T14:05:14Z",
        "exported_by": "user@email.com",
        "combo_count": 3
      },
      "combos": [
        {
          "combo_name": "Standard Consultation",
          "combo_description": "Description...",
          "specialty": "ophthalmology",
          "combo_codes": [
            {"nomen_code": 105755, "secondary_nomen_code": 102030}
          ]
        }
      ]
    }
    ```
  - **Robust Error Handling**: Graceful handling of partial failures and missing combos
  - **Performance Optimized**: Single database query for batch operations
  - **Smart Filename Generation**: `billing_combos_multi_[count]_[date].json`

### Enhanced

- **User Experience Improvements**:
  - **Selection Feedback**: Real-time updates of selection count and button states
  - **Clear Selection**: Automatic selection clearing after successful export
  - **Enhanced Toast Messages**: Detailed feedback including combo count and total codes
  - **Partial Failure Handling**: Warnings when some requested combos are not found
  - **Progress Indication**: Export start notifications with combo names preview

- **Frontend Multi-Selection Logic**: Enhanced `BillingComboManager` class
  - **Selection Management**: `getSelectedCombos()` and `updateExportButtonState()` methods
  - **Event Integration**: Bootstrap Table selection events with proper initialization timing
  - **Bulk Export Processing**: `exportSelectedCombos()` method with comprehensive error handling
  - **UI State Management**: Dynamic button text and selection info updates

### Technical Implementation

- **Backend Enhancements** (`api/endpoints/billing.py`):
  - Input validation for combo ID arrays with type checking
  - Batch database queries using `.belongs()` for efficiency
  - Code parsing logic shared with single export (DRY principle)
  - Missing combo detection and reporting
  - Comprehensive logging and error tracking

- **Frontend Enhancements** (`static/js/billing-combo-manager.js`):
  - Table event initialization with proper timing handling
  - Selection state management across table operations
  - Async/await pattern for API communication
  - Blob creation and download handling for large files

- **Template Enhancements** (`templates/manage/billing_combo.html`):
  - Bootstrap Table configuration with multi-selection attributes
  - Multi-selection control toolbar with semantic button layout
  - Responsive design maintaining existing layout integrity

### Benefits

- **Bulk Operations**: Export multiple combos in single operation, improving efficiency for users managing large combo sets
- **Consistent UI/UX**: Maintains existing single-export functionality while adding bulk capabilities
- **Scalable Performance**: Optimized database queries and batch processing for large selections
- **User-Friendly**: Intuitive multi-selection interface with clear visual feedback
- **Backward Compatible**: All existing single-export functionality preserved unchanged

### Status Update

- ✅ **Phase 1: Single Export Functionality** - Complete
- ✅ **Phase 2A: Multi-Selection Frontend** - Complete
- ✅ **Phase 2B: Multi-Export Backend** - Complete  
- 🔄 **Phase 3: Import Functionality** - Next Priority

**Files Modified**:

- `api/endpoints/billing.py` - Added multi-export endpoint with batch processing
- `static/js/billing-combo-manager.js` - Enhanced with multi-selection and bulk export methods
- `templates/manage/billing_combo.html` - Added multi-selection controls and checkbox column
- `memory-bank/activeContext.md` - Updated implementation progress and next steps

## [2025-06-08T13:46:55.683783] - Phase 1 Complete: Billing Combo Export Functionality

### Added

- **Billing Combo Export API Endpoint**: New `GET /api/billing_combo/<id>/export` endpoint
  - Generates simplified JSON export containing only nomenclature codes (main and secondary)
  - Strips out descriptions, fees, and other API-retrievable data for lightweight, portable exports
  - Includes export metadata (version, timestamp, exported_by user)
  - Supports both legacy (integer) and enhanced (object with secondary codes) combo formats
  - Comprehensive error handling and logging with structured JSON responses
  - Authentication required via `@action.uses(db, auth.user)` decorator

- **Frontend Export Button**: Added export functionality to billing combo table
  - Green download button in Actions column for each combo row
  - Automatic JSON file download with smart filename generation: `billing_combo_[name]_[date].json`
  - Real-time success/error toast notifications
  - Progress indication during export process

- **Export Data Format**: Simplified, portable JSON structure
  ```json
  {
    "export_info": {
      "version": "1.0", 
      "exported_at": "2025-06-08T13:46:55Z",
      "exported_by": "user@email.com"
    },
    "combo_data": {
      "combo_name": "Standard Consultation",
      "combo_description": "Description...",
      "specialty": "ophthalmology", 
      "combo_codes": [
        {
          "nomen_code": 105755,
          "secondary_nomen_code": 102030
        }
      ]
    }
  }
  ```

### Technical Implementation

- **Backend**: Enhanced `api/endpoints/billing.py` with export endpoint
  - Proper user authentication via `auth.get_user()`
  - Safe filename generation with character sanitization
  - JSON parsing error handling for malformed combo_codes
  - Support for both legacy integer codes and enhanced object format

- **Frontend**: Enhanced `static/js/billing-combo-manager.js` with export methods
  - Added `exportCombo(id, name)` method to BillingComboManager class
  - Updated `operateFormatter` to include export button
  - Added export event handler to `operateEvents`
  - Client-side blob creation and download handling

### Benefits

- **Future-Proof**: Exported files will remain valid as nomenclature data is fetched fresh during import
- **Lightweight**: Export files are 80%+ smaller by excluding API-retrievable data
- **Portable**: Combos can be shared between systems and environments
- **User-Friendly**: One-click export with automatic file naming and download

### Fixed

- **Export ID Issue**: Fixed "undefined" combo ID error in export functionality
  - Changed event handlers to use `row.id` and `row.combo_name` directly from Bootstrap Table row data
  - Eliminated dependency on data attributes which were causing undefined values
  - Export now correctly identifies combo ID from table row context
- **Toast Notification System**: Replaced custom toast implementation with app's standard `displayToast` function
  - Consistent with app-wide notification system in `static/js/baseof.js`
  - Proper status types (success, error, info, warning) with standard colors and positioning
  - Auto-dismiss timers matching app patterns (3-6 seconds based on message type)
  - Enhanced user experience with standardized notification behavior
- **Python Format Parsing**: Enhanced combo_codes parsing to handle Python-formatted data
  - Added fallback parsing for combos stored with Python syntax (single quotes, None values)
  - Converts `'` to `"` and `None` to `null` for JSON compatibility
  - Fixes "Combo has no codes to export" error for existing combos with valid data
  - Backward compatible with both JSON and Python-formatted combo storage

### Status

- ✅ **Phase 1: Export Functionality** - Complete
- 🔄 **Phase 2: Import Functionality** - Next
- ⏳ **Phase 3: Comprehensive Validation** - Pending

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2025-06-08T04:05:00.583732] - Files Module Practitioner Selector Implementation

### Added

- **Practitioner and Provider Selectors**: Extended Files module with filtering capabilities similar to Worklist
  - **Practitioner Dropdown**: Select and filter by senior doctor with automatic default selection for logged doctors
  - **Provider Dropdown**: Filter by medical staff/providers with comprehensive provider options
  - **Smart Defaults**: Automatically selects logged user if they are a doctor and exist in practitioner list, otherwise defaults to "No filter" (all)
  - **Real-time Filtering**: Immediate table updates when practitioner or provider selection changes
  - **Consistent UX**: Same design pattern and behavior as Worklist module for familiar user experience

### Enhanced

- **Files Controller**: Extended `files()` function in `manage.py` with practitioner and provider data
  - **Practitioner Dictionary**: Added generation of `practitionerDict` with all users having "Doctor" membership
  - **Provider Dictionary**: Added generation of `providerDict` with medical staff and providers
  - **User Context**: Added current user membership information for smart default selection
  - **Data Consistency**: Uses same data structure and filtering logic as Worklist module

- **Files Template**: Enhanced `templates/manage/files.html` with selector interface
  - **Floating Label Selectors**: Added Bootstrap floating label select elements for practitioner and provider
  - **Responsive Layout**: Integrated selectors into existing toolbar layout without disrupting current functionality
  - **JavaScript Integration**: Added `fillSelect()` function and filter event handlers for dynamic population and filtering

### Technical Implementation

- **JavaScript Enhancement**: Added comprehensive selector logic to Files module
  - **Auto-population**: `fillSelect()` function populates dropdowns with practitioner and provider data
  - **Smart Selection**: Automatically selects current user if they are a doctor and exist in dropdown
  - **Filter Integration**: Enhanced existing filter functions to include practitioner/provider parameters
  - **Event Handling**: Added change event listeners for real-time table filtering
  - **API Integration**: Extended existing API calls with new filter parameters

- **Backend Enhancement**: Extended Files API filtering capabilities
  - **Filter Parameters**: Added support for senior.id and provider.id filtering in existing API endpoints
  - **Data Lookup**: Enhanced data retrieval to include practitioner and provider relationship data
  - **Consistent Pattern**: Uses same filtering logic and parameter structure as Worklist module

### User Experience Improvements

- **Intelligent Defaults**: Doctors automatically see their own cases by default, improving workflow efficiency
- **Universal Access**: Non-doctors see all cases by default, maintaining administrative oversight capabilities
- **Familiar Interface**: Identical design and behavior to Worklist module reduces learning curve
- **Real-time Updates**: Immediate visual feedback when changing filters improves user interaction

### Benefits

- **Enhanced Workflow**: Doctors can quickly focus on their own cases without manual filtering
- **Administrative Flexibility**: Administrators can still access all cases through "No filter" option
- **Consistent UX**: Same filtering pattern across Worklist and Files modules for coherent user experience
- **Scalability**: Filtering reduces data load and improves performance for large case volumes

**Files Modified**:

- `manage.py` - Enhanced files controller with practitioner/provider data generation
- `templates/manage/files.html` - Added practitioner and provider selector interface with JavaScript integration

**Impact**: Files module now provides the same intelligent filtering capabilities as Worklist, improving workflow efficiency for medical professionals while maintaining administrative oversight

## [2025-06-08T03:50:18.949162] - Automated Trend Analysis Comments

### Added

- **Automated Trend Analysis** for all dashboard charts with intelligent insights:
  - Trend direction analysis using linear regression (📈 Growing, 📉 Declining, ➡️ Stable)
  - Recent performance comparison (🚀 Acceleration, 🐌 Slowdown)
  - Volatility analysis with stability indicators (🎯 Stable, ⚡ High variability)
  - Peak activity identification with dates (📊 Peak activity)
  - Moving average trend analysis (📈/📉 Moving average trend)
- **Smart Contextual Comments** adapted for each chart type:
  - New Patients: Focus on growth patterns and acquisition trends
  - New Worklists: Emphasis on workload patterns and efficiency metrics  
  - MD Worklists: Highlight specialist demand and capacity analysis
- **Time Scale Adaptive Analysis** providing relevant insights for each period (3M to 10Y)
- **Professional UI Integration** with Bootstrap alert styling and Font Awesome icons

### Technical Implementation

- Added `analyze_chart_trends()` function with comprehensive statistical analysis
- Enhanced API response to include `insights` array with automated comments
- Updated frontend to display insights in attractive alert boxes below chart summaries
- Intelligent insight generation limited to 4 most relevant comments per chart

## [2025-06-08T03:38:20.743150] - Dashboard Charts Enhancement

### Added

- Added 7Y and 10Y time period options to all dashboard charts
- Dynamic moving average calculation based on time scale:
  - 3M: 7-day moving average
  - 6M: 15-day moving average  
  - 1Y: 30-day moving average
  - 2Y: 60-day moving average
  - 5Y: 150-day moving average
  - 7Y: 210-day moving average
  - 10Y: 300-day moving average

### Changed

- Enhanced moving average line visibility with:
  - Thicker lines (borderWidth: 3)
  - Removed dots (pointRadius: 0) for smoother appearance
  - Darker colors for better contrast
  - Smooth curves (tension: 0.4)
- Updated period text mapping to include 7Y and 10Y labels
- Moving average labels now dynamically show the actual period (e.g., "15-day Moving Average")

### Fixed

- Fixed MD worklist query error by using proper database join between worklist and modality tables
- Corrected field reference from `db.worklist.modality` to `db.worklist.modality_dest` with join to `db.modality.modality_name`
- Enhanced Chart.js dataset styling to maintain consistent appearance across updates

## [2025-06-08T03:27:28.946396] - Enhanced Dashboard Charts with Moving Averages and MD Worklists

### Added

- **Moving Average Curves**: Added 7-day moving average lines to all existing charts for trend analysis
  - **Automatic Calculation**: Server-side moving average calculation using sliding window approach
  - **Visual Enhancement**: Moving average displayed as separate line with distinct colors
  - **Legend Support**: Charts now show legend to distinguish between raw data and moving averages
  - **Smooth Curves**: Moving averages use higher tension (0.4) for smoother visualization

- **MD Worklists Chart**: New dedicated chart for Medical Doctor worklist analytics
  - **Filtered Data**: Shows only worklists where `modality == "MD"`
  - **Same Time Scales**: Uses identical period selectors (3M, 6M, 1Y, 2Y, 5Y) as other charts
  - **Consistent Design**: Follows same visual design patterns with warning color scheme
  - **Moving Average**: Includes 7-day moving average like other charts

- **Enhanced Color Schemes**: Extended color system to support multiple datasets
  - **Main Data Colors**: Primary colors for raw chart data
  - **Moving Average Colors**: Secondary colors for trend lines
  - **MD Chart Colors**: Warning-based color scheme (amber/orange) for Medical Doctor data

### Enhanced

- **Multi-Dataset Support**: Charts now support multiple datasets (raw data + moving averages)
  - **Flexible Data Format**: API returns both old format (data) and new format (datasets)
  - **Backward Compatibility**: Maintains compatibility with single-dataset format
  - **Dynamic Color Assignment**: Automatic color mapping based on dataset index

- **Chart Configuration**: Enhanced Chart.js configuration for better user experience
  - **Legend Display**: Enabled legend to show dataset labels
  - **Chart Labels**: Improved formatting for "MD Worklists" vs "Worklists"
  - **Professional Styling**: Consistent styling across all three charts

### Technical Implementation

- **Backend API Enhancement**: Extended `/api/chart_data/<table>/<period>` endpoint
  - **New Table Type**: Added support for `md_worklists` parameter
  - **Moving Average Function**: Implements sliding window calculation with configurable window size
  - **Multi-Dataset Response**: Returns structured datasets array for Chart.js consumption
  - **Database Query**: Efficient filtering using `db.worklist.modality == "MD"` condition

- **Frontend JavaScript Enhancement**: Updated `DashboardCharts` class
  - **Three-Chart Support**: Handles patients, worklists, and md_worklists charts
  - **Dataset Management**: Manages multiple datasets per chart with proper color assignment
  - **Flexible Data Handling**: Processes both old and new API response formats
  - **Dynamic Labeling**: Context-aware chart and dataset labeling

- **Template Enhancement**: Added MD worklists chart section to dashboard
  - **Warning Color Buttons**: Uses `btn-outline-warning` for MD chart period selectors
  - **Consistent Layout**: Maintains same card-based design as existing charts
  - **CSS Support**: Added warning button active state styling

### Data Processing Flow

1. **API Request**: `/api/chart_data/md_worklists/6`
2. **Database Query**: Filter worklists by `modality == "MD"` and date range
3. **Python Grouping**: Group by date using `collections.defaultdict`
4. **Moving Average**: Calculate 7-day sliding window average
5. **Response Format**: Return datasets array with raw data and moving average
6. **Chart Update**: Populate Chart.js with multiple datasets

**Chart Types Now Available**:

- **Patients Chart**: New patient registrations with moving average
- **Worklists Chart**: All new worklists with moving average  
- **MD Worklists Chart**: Medical Doctor worklists only with moving average

**Files Modified**:

- `controllers.py` - Enhanced chart_data() API with MD filtering and moving averages
- `static/js/dashboard-charts.js` - Multi-chart and multi-dataset support
- `templates/index.html` - Added MD worklists chart section and CSS

**Impact**: Dashboard now provides comprehensive analytics with trend analysis for all major data types in the ophthalmology system

## [2025-06-08T03:21:45.548685] - Dashboard Charts PyDAL Date Function Fix

### Fixed

- **PyDAL Date Function Error**: Resolved `AttributeError: 'Field' object has no attribute 'date'` in chart data API
  - **Root Cause**: Used `.date()` method on pyDAL Field objects which is not supported in pyDAL syntax
  - **Original Code**: `db.auth_user.created_on.date().with_alias("date")` (invalid pyDAL syntax)
  - **Solution**: Replaced database-level date grouping with Python-level date grouping for better compatibility
  - **Performance**: Moved from SQL GROUP BY to Python collections.defaultdict for date aggregation

### Changed

- **Chart Data Processing**: Enhanced `chart_data()` function in `controllers.py` with database-agnostic approach
  - **Before**: Database-level grouping using unsupported `.date()` method with SQL GROUP BY
  - **After**: Python-level grouping using `collections.defaultdict` and Python's `datetime.date()` method
  - **Query Simplification**: Removed complex GROUP BY queries, now uses simple SELECT with ORDER BY
  - **Date Extraction**: Uses Python `row.created_on.date()` instead of SQL date functions

### Technical Details

- **Database Compatibility**: Solution now works across all database backends (SQLite, MySQL, PostgreSQL)
- **Python Date Grouping**: Uses `defaultdict(int)` to count occurrences by date
- **Sorting**: Maintains chronological order using `sorted(date_counts.keys())`
- **Error Handling**: Added null checking for `created_on` fields
- **Performance**: Efficient Python grouping with minimal database queries

**Chart Data Flow**:

1. Query all records within date range (no GROUP BY)
2. Group by date in Python using `collections.defaultdict`
3. Sort dates chronologically
4. Format for Chart.js consumption

**Files Modified**:

- `controllers.py` - Fixed chart_data() function with Python-based date grouping

**Impact**: Chart data API now works reliably across all database backends without SQL date function dependencies

## [2025-06-08T03:19:16.609200] - Dashboard Charts Template Variable Fix

### Fixed

- **Template Variable Error**: Resolved `NameError: name 'HOSTURL' is not defined` in dashboard template
  - **Root Cause**: `index()` controller was not passing `hosturl` variable to template context
  - **Secondary Issue**: Template was using uppercase `HOSTURL` instead of lowercase `hosturl` variable name
  - **Solution**: Added `hosturl = LOCAL_URL` to index controller and corrected template variable name
  - **Pattern Consistency**: Now follows same pattern as payment_view and daily_transactions controllers

### Changed

- **Index Controller**: Added missing `hosturl` variable to `index()` function in `controllers.py`
  - Added `hosturl = LOCAL_URL` following pattern from other working controllers
  - Maintains consistency with payment system and other modules

- **Template Variable Names**: Fixed variable names in `templates/index.html` global variables
  - **Before**: `window.HOSTURL = "[[= HOSTURL ]]";` (undefined variable)
  - **After**: `window.HOSTURL = "[[= hosturl ]]";` (correct lowercase variable)
  - Consistent with other working templates (payment_view.html, daily_transactions.html)

## [2025-06-08T03:17:58.808555] - Dashboard Charts URL Construction Fix

### Fixed

- **API URL Construction Issue**: Resolved chart data API calls failing due to missing app name in URL
  - **Root Cause**: JavaScript was constructing URLs as `/api/chart_data/...` without including the py4web app name
  - **Solution**: Added global variables `window.HOSTURL` and `window.APP_NAME` to dashboard template
  - **URL Pattern**: Fixed to use proper py4web URL format: `${HOSTURL}/${APP_NAME}/api/chart_data/${chartType}/${period}`
  - **Consistency**: Now follows same pattern as payment system and other modules per CHANGELOG.md reference

### Changed

- **Dashboard Template**: Added global variables setup in `templates/index.html`
  - Added `window.HOSTURL = "[[= HOSTURL ]]";` for base URL
  - Added `window.APP_NAME = "[[= app_name ]]";` for app name from settings.py
  - Consistent with established pattern from payment system and files management

- **JavaScript URL Construction**: Enhanced `loadChartData()` method in `static/js/dashboard-charts.js`
  - **Before**: `fetch('/api/chart_data/${chartType}/${period}')`
  - **After**: `fetch('${baseUrl}/${appName}/api/chart_data/${chartType}/${period}')`
  - Added fallback values for missing global variables
  - Proper error handling for URL construction

### Technical Details

- **Global Variables**: Following established pattern from payment system and other modules
- **URL Safety**: Added fallback values (`location.origin` for HOSTURL, `"oph4py"` for APP_NAME)
- **Consistency**: Chart API calls now use same URL construction pattern as worklist, payment, and files modules
- **Error Prevention**: Prevents 404 errors when app is deployed with different name in settings.py

**Files Modified**:

- `templates/index.html` - Added global variables for API access
- `static/js/dashboard-charts.js` - Fixed URL construction with app name

**Impact**: Dashboard charts now load correctly regardless of app name configuration in settings.py

## [2025-06-08T03:14:53.964666] - Dashboard Analytics Enhancement

### Added

- **Interactive Dashboard Charts**: Implemented Chart.js charts for analytics visualization
  - **New Patients Chart**: Time-series line chart showing new patient registrations over configurable periods (3M, 6M, 1Y, 2Y, 5Y)
  - **New Worklists Chart**: Time-series line chart showing new worklist creation trends over configurable periods
  - **Period Selector Buttons**: Interactive period selection for both charts with visual active state indicators
  - **Chart Summary**: Displays total count with period context for quick insights
  - **Loading States**: Professional loading indicators during chart data fetching
  - **Error Handling**: Comprehensive error display with user-friendly messages

- **Chart API Endpoints**: RESTful API for chart data delivery
  - **Endpoint**: `/api/chart_data/<table>/<period>` supporting 'patients' and 'worklists' tables
  - **Data Aggregation**: Daily grouped database queries with date-based filtering
  - **JSON Response**: Chart.js compatible data format with labels, data points, and metadata
  - **Input Validation**: Strict validation for table names and time periods
  - **Performance Optimized**: Efficient SQL queries using pyDAL groupby and date functions

- **Chart.js Integration**: Professional charting library implementation
  - **Chart.js v4.4.9**: Downloaded and integrated UMD version for standalone usage
  - **Moment.js Adapter**: Time scale support for accurate date/time axis handling
  - **Responsive Design**: Charts adapt to container size with maintained aspect ratios
  - **Custom Styling**: Medical application-appropriate color scheme and professional appearance

- **Enhanced UI/UX**: Modern dashboard design with improved visual hierarchy
  - **Card-based Layout**: Professional card containers for charts and statistics
  - **Bootstrap Styling**: Consistent with application theme using Bootstrap 5 components
  - **Badge Indicators**: Color-coded badges for database statistics with improved readability
  - **Responsive Grid**: Mobile-friendly layout that adapts to different screen sizes

### Changed

- **Dashboard Template**: Complete redesign from simple list to analytics-focused layout
  - **Analytics Section**: Prominent placement of chart visualizations above static statistics
  - **Visual Hierarchy**: Improved organization with clear sections and card-based design
  - **Statistics Display**: Enhanced database statistics with badges and better formatting
  - **User Experience**: More engaging and informative dashboard experience

- **Database Dependencies**: Added python-dateutil for robust date calculations
  - **Date Range Queries**: Using `relativedelta` for accurate month-based period calculations
  - **Query Optimization**: Efficient date filtering with proper timezone handling

### Technical Implementation

- **Frontend Architecture**: Modular JavaScript class-based design (`DashboardCharts`)
  - **Chart Management**: Centralized chart initialization, data loading, and state management
  - **Event Handling**: Period selector buttons with active state management
  - **Error Recovery**: Graceful error handling with user feedback and console logging
  - **Performance**: Async/await pattern for non-blocking API calls

- **Backend Architecture**: Clean separation of concerns with dedicated API endpoints
  - **Data Layer**: pyDAL queries with proper grouping and date filtering
  - **Validation Layer**: Input sanitization and error response handling
  - **Response Format**: Structured JSON suitable for Chart.js consumption

- **Dependencies Added**:
  - `Chart.js v4.4.9` (static/js/chartjs/chart.umd.min.js)
  - `python-dateutil` (requirements.txt)
  - `moment.js` and `chartjs-adapter-moment` (CDN)

### Files Modified

- `controllers.py` - Added `/api/chart_data/<table>/<period>` endpoint with data aggregation
- `templates/index.html` - Complete dashboard redesign with charts and enhanced UI
- `static/js/dashboard-charts.js` - New Chart.js integration and chart management
- `requirements.txt` - Added python-dateutil dependency

### User Experience Impact

- **Visual Analytics**: Dashboard now provides immediate visual insights into patient and worklist trends
- **Interactive Exploration**: Users can explore different time periods to understand usage patterns
- **Professional Appearance**: Enhanced visual design that reflects medical application standards
- **Performance**: Charts load efficiently with proper loading states and error handling

## [Unreleased]

### Added

- **Billing Combo Import/Export System** - 2025-06-08T14:33:44.496464
  - **Complete Import Functionality**: New `POST /api/billing_combo/import` endpoint with automatic format detection
  - **Smart Format Detection**: Auto-detects single vs multi-combo JSON formats from file structure
  - **Automatic Conflict Resolution**: Resolves naming conflicts by appending '(copy)' pattern without user intervention
  - **Three-Layer Validation**: JSON structure validation, nomenclature code validation via API, and business rule validation
  - **Batch Processing**: Efficient handling of multiple combo imports with detailed per-combo results
  - **Multi-Selection Export**: Enhanced frontend with checkbox selection for bulk export operations
  - **Robust JSON Parsing**: Fixed critical parsing issues using `ast.literal_eval` for Python literal expressions
  - **Async Processing**: Async endpoint design for handling large batch operations without timeouts
  - **Comprehensive Error Handling**: Detailed error reporting with specific error types and validation feedback
  - **Transaction Safety**: Proper py4web patterns with automatic commit/rollback on success/failure
  - **Backward Compatibility**: Existing single-combo exports continue to work unchanged

### Technical Implementation

- **New API Functions**:
  - `detect_import_format()` - Auto-detect single vs multi-combo format
  - `generate_unique_combo_name()` - Handle naming conflicts with incremental copy numbering
  - `validate_nomenclature_codes_batch()` - Batch validation via NomenclatureClient API
  - `validate_single_combo()` / `validate_multi_combo()` - Comprehensive validation functions
  - `process_single_combo_import()` / `process_multi_combo_import()` - Database import processing
  - `billing_combo_import()` - Main async import endpoint with format routing

- **Enhanced Export System**:
  - Multi-selection support with checkbox column in Bootstrap table
  - Ctrl+click and Shift+click selection capabilities
  - "Export Selected" button with dynamic count display
  - Bulk export endpoint `POST /api/billing_combo/export_multiple`
  - Simplified JSON format with only nomenclature codes for portability

- **Validation Features**:
  - Required field validation (combo_name, specialty, combo_codes)
  - Nomenclature code existence verification via external API
  - Secondary code validation (must differ from main code)
  - Business rule validation (name length, specialty enum, reasonable limits)
  - Duplicate detection within import batches

### Fixed

- **JSON Parsing Issues**: Resolved critical parsing failures for combos with special characters in descriptions
- **Type Safety**: Fixed Optional parameter annotations and API response parameter naming
- **Async Compatibility**: Made import endpoint async to support await operations for API validation

### Security

- **Input Validation**: Comprehensive validation of uploaded JSON files
- **Safe Parsing**: Use of `ast.literal_eval` instead of unsafe string manipulation
- **User Authentication**: All endpoints require proper user authentication via `@action.uses(auth.user)`
