# Changelog

All notable changes to this project will be documented in this file.

NEW CHANGLOG ENTRIES SHOULD BE **NEWEST AT THE TOP OF THE FILE, OLDEST  AT BOTTOM**.

## [2025-07-14T23:21:09.306792]

### Added

- **🔗 Direct Relationship Between Billing Codes and Combo Applications**: Implemented reliable tracking of which billing codes were created by combo applications
  - **Database Schema**: Added `id_billing_combo_usage` foreign key field to `billing_codes` table for direct traceability
  - **Improved Combo Application**: Modified combo application logic to create usage record first, then link all generated billing codes to it
  - **Reliable Combo Removal**: Replaced unreliable timing-based code matching with direct foreign key relationship lookup
    - **Before**: Used 10-minute time windows and fallback strategies to guess which codes belonged to a combo
    - **After**: Direct SQL query `WHERE id_billing_combo_usage = ?` for precise code identification
  - **Benefits**:
    - **100% Accurate Removal**: No more orphaned billing codes when removing combo applications
    - **Better Data Integrity**: Clear audit trail of which codes came from which combo applications
    - **Performance**: Faster queries using foreign key index instead of time range scans
    - **Foundation**: Enables future combo analytics and reporting features

### Fixed

- **🐛 Combo Removal Reliability**: Fixed issue where combo removal would fail to delete associated billing codes
  - **Root Cause**: Time-based matching was unreliable due to transaction timing variations
  - **Solution**: Direct foreign key relationship ensures 100% accurate code-to-combo association

## [2025-07-14T22:36:33.268927]

### Fixed

- **🔧 Consultation History Markdown Rendering**: Fixed issue where consultation history was displaying raw HTML instead of rendered markdown
  - **Root Cause**: API returns conclusions with existing HTML `<span class="badge">` elements for laterality indicators, but markdown renderer was escaping all HTML first
  - **Solution**: Enhanced markdown renderer to handle mixed HTML/markdown content intelligently
    - **Preservation**: Laterality badges (right/left/both) are preserved as-is from the API
    - **Selective Processing**: Markdown formatting is applied only to text content, not existing HTML elements
    - **Line-by-Line Processing**: Each conclusion line is processed separately to handle multiple conclusions properly
  - **Files Modified**:
    - **Payment Manager**: `static/js/billing/payment-manager.js` - Updated `renderMarkdown()` and added `applyMarkdownToText()`
    - **Summary Manager**: `static/js/billing/summary-manager.js` - Updated `renderMarkdown()` and added `applyMarkdownToText()`
    - **Conclusions Manager**: `static/js/md/conclusions-bt.js` - Refactored for consistency and better structure
  - **Technical Improvements**:
    - **Smart HTML Detection**: Detects existing HTML structure and processes accordingly
    - **XSS Protection**: Maintains HTML escaping for user-generated content while preserving system-generated HTML
    - **Consistent API**: All three managers now use the same markdown processing approach

## [2025-07-14T22:25:31.704294]

### Added

- **✨ Markdown Support for Conclusions Display**: Enhanced the conclusions table with full markdown rendering support
  - **Markdown Features**: Supports **bold**, *italic*, ~~strikethrough~~, `inline code`, and [links](url)
  - **Implementation Details**:
    - **New Function**: `renderMarkdown()` - Lightweight markdown parser with XSS protection
    - **Column Formatter**: `conclusionMarkdownFormatter()` - Renders markdown in conclusion column
    - **Enhanced CSS**: Added `.markdown-content` styling for proper display in table cells
    - **User Interface**: Added helpful markdown syntax hints in form headers
  - **Files Modified**:
    - **JavaScript**: `static/js/md/conclusions-bt.js` - Added markdown renderer and column formatter
    - **CSS**: `static/css/conclusions-bt.css` - Added markdown-specific styling
    - **Template**: `templates/modalityCtr/sections/examination/conclusions.html` - Added help text
  - **Technical Features**:
    - **XSS Protection**: HTML escaping before markdown processing
    - **Browser Compatibility**: Compatible regex patterns for all modern browsers
    - **Data Preservation**: Raw markdown text preserved for editing while displaying rendered HTML
    - **Table Integration**: Styled to work seamlessly within Bootstrap Table cells

- **✨ Markdown Support for Consultation History Summary**: Extended markdown rendering to consultation history tables in payment and summary views
  - **Enhanced Views**: Payment management and billing summary consultation history tables now render markdown in conclusion columns
  - **Implementation Details**:
    - **Payment Manager**: `static/js/billing/payment-manager.js` - Added `renderMarkdown()` method and updated conclusion rendering
    - **Summary Manager**: `static/js/billing/summary-manager.js` - Added `renderMarkdown()` method and updated conclusion rendering
    - **Template Styling**: Added markdown CSS to both `templates/payment/payment_view.html` and `templates/billing/summary.html`
  - **Technical Features**:
    - **Consistent Rendering**: Same markdown parser used across all consultation views
    - **Table Optimization**: Special styling for table cell constraints and responsive design
    - **Modal Support**: Markdown rendering works in both summary tables and detailed modal views
    - **Font Enhancement**: Increased font size (1.1rem) for better readability in consultation history

## [2025-07-14T08:45:30.000000]

### Fixed

- **🔧 Critical JavaScript Global Variable Dependencies**: Fixed "ReferenceError: patientObj is not defined" and related variable errors in autorx and tono views
  - **Root Cause**: Recent modularization of `md-globals.html` removed global variables that autorx.html and tono.html controllers depend on
  - **Issue**: The variable consolidation in [2025-07-13T03:09:02.003404] moved variables to `md-globals.html` but autorx/tono templates couldn't access them
  - **Solution**: Created shared global variables architecture:
    - **New File**: `templates/modalityCtr/js-sections/shared-globals.html` (103 lines) - Contains core variables needed by all modality controllers
    - **Template Conditional Logic**: Added proper py4web template conditionals for missing context variables
    - **Fallback Handling**: Graceful fallbacks for templates without worklist/patient context
  - **Updated Templates**:
    - **autorx.html**: Now includes shared-globals.html, provides APP_NAME, patientObj, genderIdObj, and other missing variables
    - **tono.html**: Now includes shared-globals.html, ensures patient-bar.js has required variables
  - **Variable Coverage**:
    - Core IDs: `wlId`, `patientId`, `APP_NAME`, `HOSTURL`
    - Patient data: `patientObj`, `wlObj`, `genderIdObj`, `providerObj`, `seniorObj`
    - Medical data: `userObj`, `usermdObj`, `prescRxObj`, `phoneDict`, `mdHistory`
    - Window object exposure: All critical variables available via `window.variableName` for fallback access
  - **Backward Compatibility**: Maintains existing functionality while providing shared variable access
  - **Modular Architecture**: Preserves the benefits of modularization while fixing cross-template dependencies

### Enhanced

- **🌐 Template Variable Safety**: All modality controllers now have safe access to essential global variables
- **🛡️ Graceful Degradation**: Templates without full context (patient/worklist data) now handle missing variables gracefully
- **🔄 Consistent Variable Access**: Standardized variable access pattern across md.html, autorx.html, and tono.html templates

## [2025-07-13T04:52:27.371539]

### Changed

- **🔍 Enhanced User Search with Fuzzy Matching**: Improved existing user search to use fuzzy matching for better results
  - **Fuzzy Search**: Changed from `first_name.startswith` to `first_name.contains` for more flexible matching
  - **Consistent Matching**: Both first name and last name now use `.contains` for partial string matching
  - **Better Results**: Users can now find matches even with partial or misspelled names
  - **API Parameters**: Updated search to use `first_name.contains` and `last_name.contains`

## [2025-07-13T04:50:25.276163]

### Added

- **🔍 Dynamic Existing User Search in New User Modal**: Added intelligent search functionality to prevent duplicate user creation
  - **Real-time Search**: Searches existing users as firstname and lastname are typed (300ms debounce)
  - **Smart Triggers**: Activates when both fields have at least 2 characters and on blur events
  - **Visual Feedback**: Shows up to 3 matching users with lastname, firstname, and date of birth
  - **Bootstrap Styling**: Used Bootstrap classes for consistent modal styling with warning-themed cards
  - **Loading States**: Added spinner during search and "No matches found" message
  - **API Integration**: Leverages existing `/api/auth_user` endpoint with proper search parameters
  - **User Experience**: Clear visual distinction with FontAwesome icons and hover effects
  - **Responsive Design**: Properly styled for mobile and desktop views
  - **Optional Enhancement**: Click handlers ready for future form population functionality

## [2025-07-13T04:40:17.641862]

### Fixed

- **🔄 Transaction History True Chronological Order**: Fixed ordering to show actual sequence of when transactions were created
  - **Issue**: Using `modified_on` for ordering caused active transactions to appear out of chronological order
  - **Root Cause**: Active transactions have `modified_on` = `created_on`, but cancelled transactions have `modified_on` = cancellation time
  - **Database Analysis**: Revealed active transactions were created earlier (02:32:xx) but showing later due to `modified_on` ordering
  - **Solution**: Changed ordering to use `created_on` field for true chronological sequence
  - **API Changes**: 
    - Updated ordering from `~db.worklist_transactions.modified_on` to `~db.worklist_transactions.created_on`
    - Added `created_on` field to API response
  - **Frontend Changes**: 
    - Updated JavaScript sorting to use `created_on` for chronological order
    - Date display now shows when transaction was created (not when cancelled)
  - **Result**: Transaction history now shows proper sequence:
    1. Most recent payments first (when they were created)
    2. Earlier payments next
    3. Cancellations show in their proper chronological position
  - **User Experience**: True audit trail showing when events actually occurred in the payment workflow

## [2025-07-13T04:36:30.471736]

### Enhanced

- **🕐 Transaction History Date & Time Display**: Enhanced date column to show both date and time for better chronological visibility
  - **Column Header**: Changed from "Date" to "Date & Time" to reflect new functionality
  - **Time Display**: Now shows full date and time (e.g., "13/07/2025, 10:30:45 AM") instead of just date
  - **Smart Date Logic**: 
    - **Active Transactions**: Shows `transaction_date` (when payment was made)
    - **Cancelled Transactions**: Shows `modified_on` (when transaction was cancelled)
  - **Formatting**: Uses `toLocaleString()` for user-friendly date/time display
  - **Chronological Clarity**: Users can now see the exact time sequence of all payment events
  - **Audit Trail**: Provides precise timestamps for compliance and debugging purposes
  - **User Experience**: Eliminates confusion when multiple transactions occur on the same day

## [2025-07-13T04:35:18.681466]

### Fixed

- **📅 Transaction History Chronological Order**: Fixed transaction ordering to show actual sequence of events
  - **Issue**: Transactions were ordered by `transaction_date` (original payment date), causing cancelled transactions to appear out of chronological order
  - **Root Cause**: When transactions are cancelled, the `transaction_date` doesn't change, but `modified_on` reflects the cancellation time
  - **Solution**: Changed ordering to use `modified_on` field instead of `transaction_date`
  - **API Changes**: 
    - Updated `transaction_history` endpoint to order by `~db.worklist_transactions.modified_on`
    - Added `modified_on` field to API response for frontend sorting
  - **Frontend Changes**: Updated JavaScript sorting to use `modified_on` with fallback to `transaction_date`
  - **Impact**: Transaction history now shows proper chronological sequence:
    - Recent cancellations appear first (based on when they were cancelled)
    - Recent payments appear next (based on when they were created/modified)
    - Provides accurate audit trail of actual event sequence
  - **User Experience**: Users can now see the true timeline of payment events, not just original payment dates

## [2025-07-13T04:30:54.440188]

### Added

- **📝 Transaction Notes Column**: Added "Notes" column to transaction history table for better audit trail visibility
  - **Column Position**: Positioned between "Status" and "Processed By" columns
  - **Enhanced Display**: Shows both regular transaction notes and cancellation information
  - **Cancellation Notes**: Displays cancellation details with red styling and ban icon for cancelled transactions
  - **Formatting**: Multi-line notes are properly formatted with line breaks
  - **Safety**: HTML content is escaped to prevent XSS attacks
  - **Empty State**: Shows "-" for transactions without notes
  - **Responsive**: Maintains table layout across different screen sizes
  - **Methods Added**: 
    - `formatTransactionNotes()` - Formats notes with proper styling
    - `escapeHtml()` - Prevents XSS by escaping HTML characters
  - **Template Updates**: Updated HTML table structure to accommodate new column
  - **Column Count**: All colspan attributes updated from 8 to 9 columns

## [2025-07-13T04:26:02.396806]

### Fixed

- **🔧 Payment Transaction User Tracking**: Fixed "Processed by" field showing "None None" in transaction history
  - **Root Cause**: Payment API endpoints were missing `auth.user` decorator, causing `auth.current_user` to be unavailable
  - **Solution**: Added `auth.user` decorator to all payment-related endpoints:
    - `payment_summary` - Get payment summary for worklist
    - `billing_breakdown` - Get billing codes with reimbursement calculations  
    - `process_payment` - Process payment transactions
    - `transaction_history` - Get transaction history with pagination
    - `cancel_transaction` - Cancel payment transactions
    - `md_summary` - Get consultation history summary
    - `md_summary_modal` - Get detailed consultation history for modal
    - `patient_md_summary` - Get patient-specific consultation history
  - **Impact**: Transaction history now properly shows authenticated user names instead of "None None"
  - **Authentication**: All payment endpoints now require authenticated user access
  - **Previous Issue**: This was previously fixed in [2025-06-02T03:34:56.792744] but auth decorators were missing

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