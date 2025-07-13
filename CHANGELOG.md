# Changelog

All notable changes to this project will be documented in this file.

## [2025-07-13T04:21:08.937027]

### Changed

- **🎨 Billing Totals Row Styling Enhancement**: Updated totals row visual appearance for better readability
  - **Background Color**: Changed from dark theme to clean white background
  - **Text Color**: Updated "Totals:" label to black text for better contrast
  - **Font Weight**: Maintained bold font styling for emphasis
  - **Color Coding**: Preserved color-coded monetary values (blue for fee, green for reimbursement, amber for patient pays)
  - **CSS Improvements**: Added explicit styling with `!important` declarations to override Bootstrap defaults
  - **Visual Consistency**: Totals row now stands out clearly while maintaining professional appearance

## [2025-07-13T04:14:30.781653]

### Added

- **💰 Dynamic Billing Totals in Payment View**: Enhanced billing breakdown table with real-time totals calculation
  - **Totals Footer**: Added table footer displaying total fee, reimbursement, and patient payment amounts
  - **Dynamic Updates**: Totals automatically recalculate when reimbursement type (feecode) is changed
  - **Color Coding**: Used distinct colors for different total types (blue for fee, green for reimbursement, amber for patient pays)
  - **Secondary Code Support**: Totals include both primary and secondary billing codes when present
  - **Responsive Display**: Footer automatically hides when no billing codes are present
  - **Visual Enhancement**: Added prominent styling with bold fonts and clear borders for better visibility

## [2025-07-13T04:08:45.240979]

### Changed

- **🎨 Consultation History Summary Component Refactoring**: Extracted duplicate consultation history table into reusable component
  - **Component Creation**: Created `templates/partials/consultation-history-summary.html` as reusable component
  - **DRY Principle**: Eliminated code duplication between payment and billing summary views
  - **Maintainability**: Single source of truth for consultation history table structure and styling
  - **Consistency**: Ensures identical behavior and appearance across all views
  - **Configurability**: Component accepts `show_view_more_button` parameter for customization
  - **Self-Contained**: Component includes all necessary HTML, CSS, and JavaScript hooks
  - **Modal Integration**: Includes expandable modal for complete consultation history when needed
  - **Responsive Design**: Maintains all existing responsive behavior and column adjustments
  - **Updated Views**: Modified `payment_view.html` and `billing/summary.html` to use component
  - **CSS Cleanup**: Removed duplicate CSS styles from individual views

## [2025-07-13T04:01:15.389479]

### Changed

- **🎨 MD Summary Table Column Optimization**: Improved table layout and readability in both payment and summary views
  - **Column Width Adjustment**: Removed fixed percentage widths to allow columns to fit content automatically
  - **History Truncation**: Updated history column to truncate at 40 characters (was 25/80) with full text in tooltip
  - **Procedure Column**: Removed truncation from procedure column to show full procedure names
  - **CSS Styling**: Added specific column width constraints and ellipsis handling for better responsive design
  - **Cross-View Consistency**: Applied same truncation rules to payment view, summary view, and modal views
  - **JavaScript Updates**: Updated both payment-manager.js and summary-manager.js for consistent behavior

## [2025-07-13T03:52:15.177833]

### Enhanced

- **🎨 Custom Colored Laterality Badges**: Updated badges to use project's existing color scheme for consistent visual identity
  - **Custom Color Scheme**: Matches existing eye section colors used throughout the application
    - `right` - Light blue background (#D5E3EE) with dark blue text (#0056b3) and border
    - `left` - Light pink background (#EED9D5) with red text (#dc3545) and border  
    - `both` - White background with grey text (#6c757d) and border
  - **Consistent Design**: Aligns with existing `.title-right`, `.title-left`, `.bg-right`, `.bg-left` color scheme
  - **User-Friendly**: Replaced medical terminology ([OD], [OS], [OU]) with plain English terms
  - **Professional Styling**: Custom inline styles with borders for clear definition
  - **Tooltip Support**: Enhanced `stripHtml()` function to convert custom badges to readable text in tooltips

## [2025-07-13T03:47:40.173032]

### Enhanced

- **🏷️ Conclusion Display with Laterality Tags**: Enhanced consultation history summary to display conclusions line by line with laterality tags instead of semicolon-separated text
  - **Laterality Tags**: Added visual tags to identify conclusion laterality:
    - `[OD]` for right eye conclusions
    - `[OS]` for left eye conclusions  
    - `[OU]` for both eyes/general conclusions
  - **Line-by-Line Display**: Each conclusion now appears on its own line for better readability
  - **HTML Rendering**: Properly renders HTML line breaks (`<br>`) in conclusion column
  - **Tooltip Enhancement**: Added `stripHtml()` function to show clean text in column tooltips
  - **API Endpoints Updated**: 
    - `md_summary` (worklist-based, 5 records per page) - **Fixed for payment view**
    - `md_summary_modal` (worklist-based, up to 50 records)
    - `patient_md_summary` (patient-based, 10 records per page)
  - **Frontend Updates**: Modified PaymentManager and SummaryManager to properly handle HTML content
  - **Backward Compatibility**: Maintains existing API response format while enhancing display

### Fixed

- **🔧 Payment View Conclusion Display**: Fixed payment view not showing the new laterality-tagged conclusion format
  - **Root Cause**: The `md_summary` endpoint used by payment view was not updated with the new conclusion formatting logic
  - **Solution**: Updated `md_summary` function to use the same laterality formatting as other endpoints
  - **Impact**: Payment view now consistently displays conclusions with [OD]/[OS]/[OU] tags like the billing summary view

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
- **🔧 Global Variable Access**: Fixed undefined global variables issue by switching from `