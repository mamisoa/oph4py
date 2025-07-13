# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

