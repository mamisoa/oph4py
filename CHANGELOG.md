# Changelog

All notable changes to this project will be documented in this file.

## [2025-07-13T03:42:57.331607]

### Changed

- **🎨 Conclusions Actions Buttons Style Standardization**: Updated conclusions table action buttons to match tonometry table styling
  - **Icon Consistency**: Changed delete icon from `fas fa-trash` to `fas fa-trash-alt` to match tonometry tables
  - **Layout Standardization**: Changed button layout from `justify-content-center` to `justify-content-between` for consistent spacing
  - **Element Type**: Switched from `<button>` elements to `<a>` elements with `href="javascript:void(0)"` following project patterns
  - **Spacing**: Added `ms-1` class for proper margin spacing between action buttons
  - **Code Style**: Updated formatter to use array join pattern consistent with other table formatters in the project
  - **User Experience**: Maintains all existing functionality while providing visual consistency across all bootstrap tables

## [2025-07-13T03:39:07.625850]

### Fixed

- **🔧 Bootstrap Table Column Width Configuration**: Fixed column width settings not being applied properly
  - **Root Cause**: Conflicting table initialization between HTML data attributes and JavaScript configuration
  - **Solution**: Removed HTML `data-toggle="table"` and `<thead>` definitions, moved to full JavaScript initialization
  - **Column Configuration**: Properly configured columns with `width` and `widthUnit` properties
    - **Conclusion**: 60% width with percentage unit
    - **Laterality**: 20% width with percentage unit  
    - **Actions**: 20% width with percentage unit
  - **Formatter References**: Fixed formatter references to use function objects instead of strings
  - **Bootstrap Table Options**: Consolidated all table options in JavaScript for consistent configuration

## [2025-07-13T03:35:37.742379]

### Fixed

- **🎨 Conclusions Table Row Colors & Column Proportions**: Corrected styling implementation to match user specifications
  - **Row Background Colors**: Implemented proper laterality-based row background colors
    - **Right Eye**: Blue background (#D5E3EE) for right eye conclusions
    - **Left Eye**: Pink background (#EED9D5) for left eye conclusions  
    - **Both**: White background for bilateral conclusions
  - **Column Proportions**: Adjusted to proper 3/5 and 1/5 ratios as requested
    - **Conclusion**: 60% width (3/5 of table)
    - **Laterality**: 20% width (1/5 of table)
    - **Actions**: 20% width (1/5 of table)
  - **Badge Styling**: Maintained white background badges with colored borders for clear visibility against row backgrounds

## [2025-07-13T03:31:32.196263]

### Changed

- **🎨 Conclusions Table Styling Refinements**: Further improved table layout and badge styling based on user feedback
  - **Badge Background**: Changed all laterality badges to use white background for consistency and better readability
  - **Column Width Optimization**: Made laterality and action columns much narrower for better space utilization
    - **Conclusion**: 80% width (increased from 70%)
    - **Laterality**: 12% width (reduced from 15%)
    - **Actions**: 8% width (reduced from 15%)
  - **Row Background**: Removed yellow/colored row backgrounds, using consistent light background for all rows
  - **Badge Colors**: Maintained color-coded borders and text while using white background
    - **Right Eye**: Blue border/text (#0056b3) with white background
    - **Left Eye**: Red border/text (#dc3545) with white background
    - **Both**: Grey border/text (#6c757d) with white background

## [2025-07-13T03:27:03.960240]

### Changed

- **🎨 Conclusions Table UI Enhancement**: Updated conclusions bootstrap-table styling to match overall application design
  - **Removed Clutter**: Removed search bar and refresh button from table toolbar for cleaner interface
  - **Optimized Layout**: Adjusted column widths - conclusion (70%), laterality (15%), actions (15%) for better content distribution
  - **Color-Coded Laterality Badges**: 
    - **Right Eye**: Blue badge with application's standard blue color scheme (#D5E3EE background, #0056b3 text/border)
    - **Left Eye**: Pink badge with application's standard pink color scheme (#EED9D5 background, #dc3545 text/border)  
    - **Both**: Grey badge for bilateral conclusions
  - **Consistent Action Buttons**: Updated button styling to match application patterns with centered alignment and proper spacing

## [2025-07-13T03:22:40.608199]

### Fixed

- **🔧 API Validation Error Detection**: Fixed conclusions API error handling where validation errors were showing success toasts instead of error messages
  - **Root Cause**: JavaScript was checking `response.errors` which was truthy for empty objects `{}`, causing false positive error detection
  - **Solution**: Updated error detection to check if errors object has actual content: `(response.errors && Object.keys(response.errors).length > 0)`
  - **Enhanced Success Detection**: Changed from `response.success !== false` to explicit `response.status === "success"` check
  - **User Feedback**: API validation errors now properly display error toasts with specific validation messages

- **🔧 Laterality Value Validation**: Fixed "Value not allowed" validation error when adding conclusions
  - **Root Cause**: Database constraint expects `("right", "left", "na")` but HTML forms were sending "general" value
  - **Database Constraint**: `db.ccx.laterality.requires = IS_IN_SET(("right", "left", "na"))`
  - **Solution**: Changed "general" laterality value to "na" in both add and edit conclusion forms
  - **JavaScript Mapping**: Updated laterality mapping to use "na" for "Both" option in bootstrap-table interface
  - **Template Updates**: Fixed both `templates/modalityCtr/sections/examination/conclusions.html` form values
  - **Backward Compatibility**: Maintained existing display labels while fixing underlying data values

### Enhanced

- **🛡️ Robust Error Handling**: Improved API response validation with proper object content checking
- **📝 Form Validation**: Enhanced form validation to match database constraints exactly
- **🎯 User Experience**: Clear error messages now display for validation failures instead of misleading success messages

## [2025-07-13T03:09:02.003404]

### Fixed

- **🔧 JavaScript Global Variable Conflicts**: Fixed multiple JavaScript errors caused by duplicate variable declarations and timing issues
  - **Root Cause**: `APP_NAME` and `HOSTURL` were declared in both `baseof.html` and `md-globals.html`, causing "Identifier already declared" errors
  - **Solution**: Removed duplicate declarations from `md-globals.html` since variables are already available from `baseof.html`
  - **Enhanced Error Handling**: Updated `conclusions-bt.js` to use fallback pattern for global variables with proper error checking
  - **Improved Robustness**: Added checks for both direct variable access and window object fallbacks
  - **Timing Issues**: Fixed immediate variable access in multiple JavaScript files that tried to use variables before they were loaded
  - **Affected Files**: Fixed undefined variable errors in multiple scripts including:
    - `patient-bar.js`: Wrapped patient object initialization in deferred function
    - `prescription.js`: Added initialization function for `prescObj` using `userObj` and `usermdObj`
    - `glasses.js`: Added initialization function for `prescRxObj` 
    - `contacts.js`: Added initialization function for `prescCxObj`
    - `certificates.js`: Added initialization function for `certificateObj`
    - `conclusions-bt.js`: Enhanced with fallback patterns for API variables
  - **Fallback Strategy**: All scripts now use progressive fallback: immediate → DOM ready → setTimeout delay

### Changed

- **📋 Conclusions Management**: Enhanced bootstrap-table conclusions interface with better error handling
  - **Variable Safety**: All API calls now use safe variable access patterns
  - **Debugging Support**: Added comprehensive logging for troubleshooting global variable availability
  - **Fallback Mechanisms**: Implemented robust fallback patterns for missing global variables
  - **Initialization Pattern**: Standardized deferred initialization pattern across all medical prescription modules

## [2025-01-05T23:26:19.628972]

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2025-07-13T03:04:28.193587]

### Fixed

- **🔧 Critical Variable Declaration Conflicts**: Fixed "Identifier 'APP_NAME' has already been declared" and multiple undefined variable errors
  - **Root Cause**: Duplicate variable declarations between `patient-bar.html` and `md-globals.html`, plus incorrect loading order
  - **Solution**: Moved all variable declarations to `md-globals.html` and removed duplicates from `patient-bar.html`
  - **Loading Order Fix**: Ensured global variables are defined before scripts that depend on them
- **🔧 Bootstrap-Table Auto-Initialization**: Fixed double initialization by detecting existing table instances
  - **Root Cause**: Template has `data-toggle="table"` which auto-initializes, then JavaScript tried to initialize again
  - **Solution**: Added detection for existing bootstrap-table instances using `$("#conclusionsTable").data('bootstrap.table')`
  - **Fallback**: Gracefully handles both auto-initialized and manually initialized tables
- **🌐 Global Variable Availability**: Made `HOSTURL` and `APP_NAME` available on window object for all scripts
  - **Issue**: Scripts loaded after globals couldn't access these critical configuration variables
  - **Solution**: Added `window.HOSTURL` and `window.APP_NAME` assignments for global access

### Enhanced

- **📋 Consolidated Variable Management**: All template variables now centralized in `md-globals.html`
- **🛡️ Robust Table Initialization**: Bootstrap-table initialization now handles all scenarios safely

## [2025-07-13T03:01:15.584825]

### Fixed

- **🔧 Bootstrap-Table Double Initialization**: Fixed "You cannot initialize the table more than once!" error in conclusions-bt.js
  - **Root Cause**: Bootstrap-table was being initialized multiple times without protection
  - **Solution**: Added `conclusionsInitialized` flag to prevent double initialization
  - **Protection**: Added table existence check before initialization
- **🔧 Global Variable Access**: Fixed undefined global variables issue by switching from `window` object to direct variable access
  - **Root Cause**: Variables were defined as numbers but not properly assigned to window object
  - **Solution**: Changed from `window.wlId` to direct `wlId` access pattern
  - **Validation**: Enhanced variable validation with proper `typeof` checks
- **🚀 Proper Initialization Order**: Added conclusions initialization to md-init.html for proper loading sequence
  - **Integration**: Added `initConclusionsBootstrapTable()` call to document ready handler
  - **Safety**: Added function existence check before calling initialization

### Enhanced

- **🐛 Better Debugging**: Improved console logging to show actual variable values and types
- **🛡️ Robust Validation**: Enhanced variable validation to handle various undefined states

## [2025-07-13T02:57:46.224234]

### Fixed

- **🔧 Critical Template Syntax Fix**: Fixed "Worklist ID not available" error in conclusions-bt.js by correcting template variable syntax
  - **Root Cause**: Template variables `wlId` and `patientId` were using quoted syntax `"[[= wlId ]]"` instead of unquoted `[[= wlId ]]`
  - **Solution**: Updated both `templates/modalityCtr/js-sections/md-globals.html` and `templates/modalityCtr/gp.html` to use correct template syntax matching `patient-bar.html` pattern
  - **Enhanced Debugging**: Added comprehensive console logging in `conclusions-bt.js` to help diagnose variable availability issues
  - **Validation Improvements**: Enhanced validation to check for undefined strings and empty values
  - **Files Modified**: 
    - `templates/modalityCtr/js-sections/md-globals.html` - Fixed template syntax
    - `templates/modalityCtr/gp.html` - Fixed template syntax  
    - `static/js/md/conclusions-bt.js` - Enhanced debugging and validation

## [2025-07-13T02:54:15.024671]

### Fixed

- **🔧 CRITICAL: Missing Worklist ID in Conclusions**: Fixed "Worklist ID not available" error when adding conclusions
  - **Root Cause**: Missing global variables `wlId` and `patientId` in MD and GP templates
  - **Global Variables Fix**: Added missing `wlId`, `patientId`, and `APP_NAME` declarations to both templates
  - **API Endpoint Fix**: Updated conclusions API calls to use proper PyDAL RestAPI pattern
  - **Template Consistency**: Both MD and GP templates now have consistent global variable declarations
  - **Error Handling**: Enhanced error checking and user feedback for missing configuration

### Technical Details

- **Files Modified**:
  - `templates/modalityCtr/js-sections/md-globals.html` - Added missing global variables for MD template
  - `templates/modalityCtr/gp.html` - Added missing global variables for GP template
  - `static/js/md/conclusions-bt.js` - Fixed API endpoint construction and variable access
- **API Pattern Fix**: Changed from `/api/ccx?id_worklist=${wlId}` to proper PyDAL format:
  `${HOSTURL}/${APP_NAME}/api/ccx?id_worklist.eq=${wlId}&@lookup=...&@count=true&@order=~id`
- **Backward Compatibility**: Maintained `window.wlId` and `window.patientId` for existing code compatibility
- **Enhanced Logging**: Added comprehensive console logging for debugging API calls and responses

## [2025-07-13T02:37:08.250706]

### Changed

- **🎨 Form Layout Improvements**: Enhanced conclusions form styling for better visual alignment and consistency
  - **Aligned Elements**: All form elements (textarea, select, button) now have consistent 58px height
  - **Professional Button Text**: Changed to "Add conclusion +" to match overall application style
  - **Clean Layout**: Improved spacing and alignment using Bootstrap's `align-items-end` and `g-2` classes
  - **Responsive Design**: Better mobile layout with proper stacking and gap management

### Removed

- **🗑️ Bootstrap Table Toolbar**: Removed toolbar from conclusions table for cleaner interface
  - **Simplified Interface**: Table now shows only essential search and data without extra toolbar buttons
  - **Streamlined Experience**: Focus on core functionality without unnecessary UI elements

## [2025-07-13T02:31:39.806853]

### Changed

- **🎨 Bootstrap-Table Conclusions UI Enhancement**: Completely redesigned conclusions interface using bootstrap-table for better user experience and consistency
  - **Modern Interface Design**: 
    - **Input Section**: Clean card-based form with laterality selector and manual save button
    - **Table Display**: Professional bootstrap-table with search, refresh, and column management
    - **Edit Modal**: Dedicated modal for editing conclusions with form validation
  - **Enhanced Functionality**:
    - **Search**: Full-text search across all conclusions
    - **Sorting**: Sort by laterality and other columns
    - **Actions**: Edit and delete buttons with proper confirmation dialogs
    - **Visual Feedback**: Color-coded rows by laterality (general, right eye, left eye)
    - **Responsive Design**: Mobile-friendly interface with adaptive button layouts
  - **Bootstrap-Table Integration**:
    - **Consistent Patterns**: Follows project's established bootstrap-table patterns
    - **Server-Side Integration**: Uses existing `/api/ccx` endpoint with proper filtering
    - **Toolbar Features**: Refresh, column visibility, and search functionality
    - **Professional Styling**: Matches other bootstrap-table implementations in the project

### Added

- **📝 New Conclusion Management Files**:
  - `static/js/md/conclusions-bt.js` - Bootstrap-table implementation with comprehensive CRUD operations
  - `static/css/conclusions-bt.css` - Professional styling for bootstrap-table conclusions interface
  - **Features**: Form validation, loading states, error handling, tooltips, and accessibility improvements

### Removed

- **🗑️ Legacy Conclusion Files**: Removed old form-based implementation
  - `static/js/md/conclusions.js` - Replaced with bootstrap-table approach
  - `static/css/conclusions.css` - Replaced with bootstrap-table specific styling

### Technical Details

- **Template Updates**: 
  - `templates/modalityCtr/sections/examination/conclusions.html` - Complete restructure with bootstrap-table markup
  - `templates/modalityCtr/md.html` - Updated CSS and JS includes
  - `templates/modalityCtr/gp.html` - Updated to use shared conclusions section and new JS/CSS files
- **Backward Compatibility**: 100% compatible with existing data and API endpoints
- **User Experience**: Manual save buttons (no auto-save), edit modal, confirmation dialogs, and visual feedback
- **Code Quality**: Follows project patterns, comprehensive error handling, and proper documentation

## [2025-07-13T02:06:58.292543]

### Fixed

- **🔧 Eye Header Text Visibility**: Fixed RIGHT EYE and LEFT EYE headers visibility issue
  - **Problem**: White text (`text-white`) was invisible on light background colors (`bg-right` #F0F8FF and `bg-left` #FFF5EE)
  - **Solution**: Changed text color from `text-white` to `text-dark` for proper contrast
  - **Result**: Eye section headers are now clearly visible with dark text on light backgrounds

## [2025-07-13T02:04:42.760845]

### Changed

- **🎨 Conclusions UI Style Improvements**: Updated conclusions interface to better match the previous version styling
  - **Removed Redundant Header**: Eliminated "General Conclusions" header as it was redundant under the main "CONCLUSIONS" section
  - **Centered Eye Headers**: "RIGHT EYE" and "LEFT EYE" headers are now centered with full-width background colors
  - **Consistent Background Colors**: Eye section headers now use `bg-right` and `bg-left` classes with white text for better visibility
  - **Improved Layout**: Add Conclusion buttons are now right-aligned for cleaner appearance
  - **Enhanced Typography**: Eye headers use uppercase text and proper spacing for better visual hierarchy

## [2025-07-13T01:55:44.827050]

### Fixed

- **🔧 Consultation History Summary Aggregation**: Fixed consultation history summary to show one row per consultation instead of multiple rows per conclusion
  - **Root Cause**: Multiple conclusions functionality was causing LEFT JOIN on `ccx` table to create duplicate rows for each conclusion
  - **Solution**: Removed `ccx` LEFT JOIN from main query and implemented separate conclusion aggregation for each consultation
  - **Impact**: Consultation history now properly displays one row per consultation with all conclusions combined in a single field
  - **API Endpoints Fixed**: 
    - `md_summary` (worklist-based, 5 records per page)
    - `md_summary_modal` (worklist-based, up to 50 records)
    - `patient_md_summary` (patient-based, 10 records per page)
  - **Conclusion Display**: Multiple conclusions are now combined using semicolon separator (e.g., "Conclusion 1; Conclusion 2; Conclusion 3")
  - **Backward Compatibility**: Maintains existing API response format and frontend compatibility

## [2025-07-13T01:45:40.177521]

### Added

- **🔄 Auto-Save Functionality for Conclusions**: Enhanced the multiple conclusions interface with automatic saving when textarea loses focus
  - **Auto-Save on Blur**: Conclusions automatically save when user clicks outside the textarea or moves to another field
  - **Visual Feedback**: Submit buttons turn red when content changes, indicating unsaved changes
  - **Smart Triggering**: Auto-save only triggers when there's actual content and the form isn't already saving
  - **Consistent Pattern**: Follows the same auto-save pattern used throughout the application

### Fixed

- **🎨 Button Styling Consistency**: Standardized button styling across all conclusion forms to match application-wide patterns
  - **Consistent Classes**: All buttons now use `btn btn-{color} btn-sm` pattern
  - **State Management**: Improved button state transitions (secondary → danger → warning → success → secondary)
  - **Event Delegation**: Fixed event handling for all laterality forms (general, right eye, left eye)
  - **Color Coordination**: Submit buttons use secondary (default), danger (changed), warning (saving), success (saved) states

## [2025-07-13T01:23:05.861088]

### Fixed

- **🚨 CRITICAL: Certificate Modal Data Population**: Fixed certificate modal not automatically filling refraction and tonometry data
  - **Root Cause**: Certificate modal was calling certificate generation functions immediately when opened, but examination data was fetched asynchronously on page load and might not be available yet
  - **Error Pattern**: Certificate templates showed empty values for refraction and tonometry measurements because data objects were not populated
  - **Affected Functions**: All certificate types that include examination data:
    - `docCert()` - Medical report with trial refraction and tonometry data
    - `preopCert()` - Pre-operative report with cycloplegic refraction and trial visual acuity
    - `postopCert()` - Post-operative report with examination results
    - `orthoCert()` - Orthoptic prescription certificate
  - **Solution**: Modified certificate modal to fetch fresh examination data when opened using Promise.all() for parallel API calls
  - **Impact**: Certificate generation now reliably includes current examination data with proper refraction and tonometry values

### Technical Details

- **File Modified**: `static/js/md/certificates.js` - Complete refactor of certificate modal event handler
- **Data Fetching**: Changed from page-load async calls to on-demand fresh data fetching when modal opens
- **API Calls**: Implemented parallel fetching of 8 examination data endpoints:
  - AutoRx (right/left) - Automated refraction measurements
  - CycloRx (right/left) - Cycloplegic refraction measurements  
  - TrialRx (right/left) - Trial lens refraction with visual acuity
  - Tonometry (right/left) - Intraocular pressure and pachymetry
- **User Experience**: Added loading indicator while fetching data and error handling for failed requests
- **Data Objects**: Fresh population of `autorxObjFill`, `cyclorxObjFill`, `trialrxObjFill`, `tonoObjFill` objects

### User Experience Impact

- **✅ Reliable Data**: Certificate generation now always includes the most recent examination data
- **✅ Medical Accuracy**: Refraction and tonometry values are correctly populated in all certificate types
- **✅ Real-time Updates**: Fresh data is fetched each time a certificate is generated
- **✅ Error Handling**: Graceful handling of API failures with user-friendly error messages
- **✅ Loading Feedback**: Users see loading indicator while examination data is being fetched

## [2025-07-13T00:35:59.171680]

### Fixed

- **🔧 Billing Combo Apply Error**: Fixed "invalid literal for int() with base 10: 'N/A'" error when applying billing combos
  - **Root Cause**: Combo data contained `"feecode": "N/A"` which was being passed to integer conversion without validation
  - **Solution**: Added proper validation to skip feecode values that are "N/A", "null", "None", or empty strings
  - **Impact**: Billing combos with "N/A" feecode values can now be applied successfully
  - **Files Modified**: `api/endpoints/billing.py` - Enhanced feecode handling in `apply_billing_combo` function
  - **Validation Added**: Both primary and secondary feecode fields now properly validate before assignment

