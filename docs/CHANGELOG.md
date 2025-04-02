# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed

- 2025-04-02T22:35:55: Reorganized database documentation structure in models.md
  - Restructured Administrative Tables section with logical subsections:
    - User Management and Access Control
    - Reference Tables
    - Facility Management
    - Patient Information Management
    - Contact Classification
  - Integrated Patient Information section into Administrative Tables
  - Enhanced table descriptions with more detailed field information
  - Improved documentation clarity and organization
  - Better reflects relationships between administrative data components

### Fixed

- 2025-03-30T19:52:59: Fixed base64 encoding error in contacts prescription email
  - Fixed "InvalidCharacterError: Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range"
  - Replaced direct JSON string encoding with proper PDF base64 conversion
  - Now using pdfMake's getBase64() method to correctly handle non-Latin1 characters
  - Aligned implementation exactly with glasses prescription email functionality
  - Fixed modal closing behavior to match glasses.js implementation

- 2025-03-30T19:50:37: Fixed missing recipient field in contacts prescription email
  - Added missing recipient field to the email data object
  - Added email validation check before submission
  - Fixed error "No recipient in email request"
  - Aligned implementation with glasses prescription email functionality
  - Enhanced email content with proper formatting

- 2025-03-30T19:47:49: Fixed API endpoint in contacts prescription email functionality
  - Corrected API endpoint from incorrect 'api/email_report' to 'api/email/send_with_attachment'
  - Ensured compatibility with existing email API implementation
  - Fixed "Error accessing table: 'DAL' object has no attribute 'email_report'" error
  - Matched implementation with glasses prescription email functionality

- 2025-03-30T19:09:40: Fixed email attachment filename encoding issue
  - Fixed issue where email attachments were showing as 'noname' instead of the properly formatted filename
  - Updated Content-Disposition header implementation to properly encode filenames according to RFC2231
  - Added proper handling for non-ASCII characters and spaces in filenames
  - Enhanced error handling with fallback method if encoding fails

- 2025-03-30T18:48:15: Fixed PDF attachment filename format
  - Updated PDF attachment filename to match the requested format: "{yymmdd}_{type of document}_{LASTNAME Firstname}_Centre_Médical_Bruxelles-Schuman.pdf"

- 2025-03-30T18:38:10: Fixed PDF attachment filename and email subject formatting
  - Fixed PDF attachment filename issue that was showing as 'noname'
  - Reverted to simpler filename format: "{DOCUMENT_TYPE}_{LASTNAME}_{Firstname}.pdf"
  - Updated email subject formatting to properly capitalize each word in the document type
  - Changed content formatting for better readability

- 2025-03-30T18:33:43: Fixed notification system in certificates module
  - Implemented custom `notifyUser()` function to handle cases where $.notify is not available
  - Added fallback mechanisms using Bootstrap Toast or simple alerts
  - Replaced all $.notify calls with the new robust notification system
  - Fixed "TypeError: $.notify is not a function" error by gracefully degrading to available notification methods
  - Compatible with PDFMake v0.2.18 update

- 2025-03-30T18:10:39: Implemented simplified PDF generation method for certificates
  - Replaced complex PDF generation code with more reliable approach
  - Used consistent variable naming with `pdfDocGenerator` instead of `pdf`
  - Added proper error handling for printing function
  - Fixed the stuck modal issue during PDF generation
  - Streamlined base64 conversion process

- 2025-03-30T17:59:08: Fixed client-side PDF generation stalling issue
  - Added robust error handling around all $.notify function calls to prevent uncaught exceptions
  - Implemented alert() fallbacks when notification system fails
  - Ensured modal always closes even when notifications fail
  - Fixed "Uncaught TypeError: $.notify is not a function" error that was causing the PDF generation process to stall

- 2025-03-30T17:56:47: Fixed base64 import issue in certificate email functionality
  - Added explicit import for binascii module in rest.py
  - Fixed exception handling for base64 decoding errors
  - Modified email attachment processing to properly catch decoding errors
  - Ensures proper error reporting for invalid base64 data in attachments

- 2025-03-30T17:48:31: Enhanced certificate email reliability and error handling
  - Improved PDF generation process with robust error handling:
    - Added try/catch blocks around PDF creation and base64 conversion
    - Implemented safety timeout to prevent infinite modal waiting
    - Added file size validation to prevent oversized attachments
  - Enhanced API endpoint `/api/email/send_with_attachment` with:
    - Better input validation for email addresses and attachment data
    - Comprehensive error handling for base64 decoding
    - Specific SMTP error reporting
    - Detailed server-side logging with stack traces
    - Size limits to prevent excessive memory usage
  - Improved user feedback with specific error messages for different failure points

- 2025-03-30T17:42:43: Fixed email sending in certificates module
  - Identified and fixed the root cause of why certificate emails weren't being sent
  - Modified `static/js/certificates.js` to fix asynchronous execution flow problems:
    - Moved modal closing into appropriate callback locations to prevent premature closing
    - Made certificate database save and email sending sequential
    - Ensured modal only closes after operations are complete
  - Added patient email validation to prevent attempts to send to invalid addresses
  - Added more detailed client-side error handling for PDF generation and email sending
  - Improved user feedback with more specific error notifications
  - Fixed email data formatting and content structure

- 2025-03-30T17:35:48: Added comprehensive logging for email functionality
  - Enhanced `static/js/certificates.js` with detailed client-side logging for email operations
  - Added logging to certificate email submission process to track form data and API responses
  - Enhanced regular email information form with diagnostic logging
  - Added server-side logging in `rest.py` for both email endpoints:
    - `api/email/send` - Regular email sending
    - `api/email/send_with_attachment` - PDF attachment email sending
  - All logs capture key data points (recipients, content lengths, attachment details)
  - Improved error logging to help diagnose email delivery issues
  - These logs will help identify why certificate emails aren't sending while regular emails work

- 2025-03-30T11:20:34: Fixed timeoffset calculation in settings-example.py
  - Modified `get_timeoffset()` function to properly handle timezone conversions
  - Added explicit check for None values before calling total_seconds() on utc_offset
  - Implemented robust error handling with fallback to default values
  - Added type annotations and improved docstring
  - Fixed linter error: "total_seconds is not a known attribute of None"

- 2025-03-29T22:58:00: Fixed worklist status update functionality
  - Modified `static/js/useful.js`: Updated `setWlItemStatus` function to remove ID from request payload
    - ID is now correctly passed in the URL instead of the payload
    - Ensures proper validation in py4web's RestAPI
  - Modified `static/js/patient-bar.js`: Fixed status update in patient bar
    - Updated `btnUnlockTask` click handler to use correct API endpoint format
    - Updated `btnTaskDone` click handler to match the same pattern
    - Both buttons now correctly update task status without validation errors
  - Root cause: py4web's RESTful API validation was failing because:
    - ID was being sent both in URL and payload causing validation conflicts
    - Fixed by sending ID only in URL path and removing it from payload
    - Matches py4web's RESTful API expectations for PUT requests
  - Cross-system behavior explanation:
    - The issue worked on another computer likely due to different py4web versions
    - Older versions of py4web (pre-3.0) were more lenient with validation
    - Newer versions enforce stricter RESTful API conventions
    - The fix ensures compatibility with all py4web versions by following best practices

- 2025-03-30T17:15:09.650400: Fixed auth_user validation issue in user management forms
  - Modified `static/js/user.js`: Updated form submission functions to handle ID field correctly
    - Removed ID from payload for all PUT requests in userAuth_userForm submit handler
    - Updated userMd_paramForm submit handler to use ID only in URL
    - Updated userFormSubmit function to prevent sending ID in payload
  - Root cause: Same validation issue as previous fix where ID was being sent in both URL and payload
    - py4web REST API validation was rejecting requests with duplicate IDs
    - Fixed by ensuring ID is only sent in the URL for PUT requests, not in the payload

- 2025-03-30T20:21:46.219670: Fixed certificate email functionality
  - Fixed issue where email button was triggering print instead of email
  - Updated HTML template to use unique ID for actionType input (certificateActionType)
  - Updated JavaScript to properly handle actionType field
  - Ensured proper form data serialization for email vs print actions
  - Matches working implementation from glasses prescription module

- 2025-03-30T20:21:46.219670: Fixed URL for Edit Patient button in patient-bar.html
  - Corrected the URL path for the Edit Patient button to use the proper route format
  - Changed from incorrect `URL('manage', 'user', vars=dict(id=patientId))` to correct `URL('user', patientId)`
  - Fixed 404 error when clicking the Edit Patient button
  - The URL now properly matches the route defined in manage.py with `@action("user/<rec_id>")`
  - Ensures seamless navigation between patient view and user edit screens

- 2025-03-30T20:35:12.219670: Fixed actionType field IDs in prescription modals
  - Updated actionType input ID to `GxRxactionType` in glasses prescription modal (GxRxModal)
  - Updated actionType input ID to `CxRxactionType` in contacts prescription modal (CxRxModal)
  - Modified corresponding JavaScript handlers in glasses.js and contacts.js
  - Ensures consistent and unique IDs across all prescription modals
  - Prevents conflicts with other forms' actionType fields
  - Matches pattern used in certificate modal's `certificateActionType`

- 2025-04-01T00:25:28.564095: Improved auth_user password validation fix in REST API
  - Enhanced password field handling:
    - Added explicit check for password presence in update data
    - Preserved existing password when no new password provided
    - Dynamically managed password validation state
    - Ensured validation is only applied for actual password changes
  - Improved request data handling:
    - Added support for both string JSON and direct JSON object inputs
    - Enhanced JSON parsing with proper error handling
    - Filtered input data to match auth_user table fields
  - Enhanced logging and error handling:
    - Added comprehensive debug logging throughout the process
    - Implemented proper exception handling with detailed error messages
    - Used try/finally to guarantee password validation state restoration
  - Root cause resolution:
    - Fixed the issue where password validation was being triggered unnecessarily
    - Resolved data structure mismatches between environments
    - Implemented proper state management for password validation

- 2025-04-01T00:26:46.251635: Enhanced settings configuration and logging
  - Updated logger configuration in settings-example.py:
    - Added comprehensive logging levels (debug, info, warning, error)
    - Added file-based logging with debug.log
    - Improved logging documentation and comments
  - Improved database migration configuration:
    - Added FAKE_MIGRATE flag for better migration control
    - Structured conditional migration settings
    - Added clear comments for server migration scenarios
  - Added missing configuration options:
    - Added SUPPLEMENT_RATIO setting
    - Updated PACS configuration with proper URL structure
    - Added placeholder values for sensitive data
  - Enhanced example settings to better match production configuration
  - Maintained security by using placeholder values for sensitive data

- 2025-04-01T00:39:15.204980: Fixed Bootstrap tables double initialization
  - Removed redundant data-toggle="table" attribute from HTML tables
  - Prevents double initialization of Bootstrap Table plugin
  - Improves page load performance
  - Eliminates potential conflicts in table event handlers
  - Ensures consistent table behavior across all modules

### Added

- 2025-03-30T19:43:21: Added email functionality to contacts prescription module
  - Added "Send by email" button to contact lenses prescription modal (CxRxModal)
  - Added hidden actionType field to track whether user wants to print or email
  - Implemented the action handling in the form submission function
  - Added notifyUser function for consistent user notification
  - Email feature matches existing functionality in glasses prescription module

- 2025-03-30T13:30:42: Added email functionality to certificates module
  - Modified `static/js/certificates.js` to allow sending certificates as email attachments
  - Added radio button UI in the certificateModal for selecting between print and email actions
  - Created new API endpoint `api/email/send_with_attachment` in `rest.py` for handling PDF attachments
  - Updated both GP and MD modality templates to include the new UI options
  - Added proper error handling and success notifications for email operations
  - Implemented PDF to base64 conversion for email transport
  - Improved user experience by providing clear action choices for certificate delivery

- 2025-03-29: Added comprehensive documentation for the GP (General Practitioner) Module in docs/gp.md
  - Documents complete MVC architecture and components
  - Details general physical examination workflow
  - Describes SOAP documentation system
  - Explains clinical examination components (inspection, auscultation, palpation, percussion, neurological)
  - Documents prescription and certificate generation
  - Details billing management
  - Provides technical implementation details
  - Lists API endpoints and data structures
  - Includes security considerations and maintenance guidelines

- 2025-03-29: Added comprehensive documentation for the MD (Medical Doctor) Module in docs/md.md
  - Documents complete MVC architecture and components
  - Details patient history management
  - Describes clinical examination workflow
  - Explains conclusions and follow-up system
  - Documents prescription and certificate generation
  - Details billing management
  - Provides technical implementation details
  - Lists API endpoints and data structures
  - Includes security considerations and maintenance guidelines

- 2025-03-29: Added comprehensive documentation for the Tonometry Module in docs/tono.md
  - Includes detailed MVC architecture description
  - Documents API endpoints and data structures
  - Provides troubleshooting guidelines
  - Lists features and dependencies

- 2025-03-29: Added comprehensive documentation for the AutoRx Module in docs/autorx.md
  - Documents MVC architecture and components
  - Details device integration with L80, VX100, and CV5000
  - Provides API reference and data structures
  - Includes troubleshooting and security guidelines
  - Lists all dependencies and features

- 2025-03-29T18:11:09: Added comprehensive documentation for the User Module in docs/user.md
  - Documents complete MVC architecture and components
  - Details user profile management
  - Describes address and phone number management
  - Explains medical registration system
  - Documents eID card integration
  - Details form handling and validation
  - Provides technical implementation details
  - Lists API endpoints and data structures
  - Includes security considerations and maintenance guidelines
  - Added comprehensive docstring to user() function in manage.py

- 2025-03-29T18:16:08: Added comprehensive documentation for the Users Module in docs/users.md
  - Documents complete MVC architecture and components
  - Details user management and role-based access control
  - Describes eID card integration system
  - Explains user profile management
  - Documents form handling and validation
  - Details Bootstrap Table implementation
  - Provides technical implementation details
  - Lists API endpoints and data structures
  - Includes security considerations and maintenance guidelines
  - Added comprehensive docstring to users() function in manage.py

- 2025-03-29T18:36:47: Added comprehensive documentation for the Worklist Module in docs/worklist.md
  - Documents complete MVC architecture and components
  - Details appointment and procedure management
  - Describes workflow tracking system
  - Explains provider and facility management
  - Documents modality integration
  - Details Bootstrap Table implementation
  - Provides technical implementation details
  - Lists API endpoints and data structures
  - Includes security considerations and maintenance guidelines
  - Added comprehensive docstring to worklist() function in manage.py

- 2025-03-29T19:00:00: Added comprehensive documentation for the Medications Module in docs/medications.md
  - Documents complete MVC architecture and components
  - Details medication catalog management
  - Describes drug interaction monitoring
  - Explains prescription tracking system
  - Documents safety alerts integration
  - Details Bootstrap Table implementation
  - Provides technical implementation details
  - Lists API endpoints and data structures
  - Includes security considerations and maintenance guidelines
  - Added comprehensive docstring to medications() function in manage.py

- 2025-03-29T19:00:00: Added comprehensive documentation for the Allergy Module in docs/allergy.md
  - Documents complete MVC architecture and components
  - Details allergic agent catalog management
  - Describes cross-sensitivity monitoring
  - Explains alert system integration
  - Documents patient allergy records
  - Details Bootstrap Table implementation
  - Provides technical implementation details
  - Lists API endpoints and data structures
  - Includes security considerations and maintenance guidelines
  - Added comprehensive docstring to allergy() function in manage.py

- 2025-03-29T19:00:00: Added comprehensive documentation for the Diseases Module in docs/diseases.md
  - Documents complete MVC architecture and components
  - Details disease catalog management
  - Describes ICD-10 coding integration
  - Explains clinical pathway tracking
  - Documents treatment protocol management
  - Details Bootstrap Table implementation
  - Provides technical implementation details
  - Lists API endpoints and data structures
  - Includes security considerations and maintenance guidelines
  - Added comprehensive docstring to diseases() function in manage.py

- 2025-03-29T19:00:00: Added comprehensive documentation for the Lenses Module in docs/lenses.md
  - Documents complete MVC architecture and components
  - Details lens catalog management
  - Describes inventory system
  - Explains order tracking
  - Documents prescription management
  - Details Bootstrap Table implementation
  - Provides technical implementation details
  - Lists API endpoints and data structures
  - Includes security considerations and maintenance guidelines
  - Added comprehensive docstring to lenses() function in manage.py

- 2025-03-29T18:59:31: Added comprehensive documentation for the Combo Module in docs/combo.md
  - Documents complete MVC architecture and components
  - Details procedure-modality relationship management
  - Describes multiple modality selection system
  - Explains worklist integration
  - Documents API endpoints and CRUD operations
  - Details Bootstrap Table implementation
  - Provides technical implementation details
  - Lists dependencies and features
  - Includes security considerations and maintenance guidelines
  - Added comprehensive docstring to combo() function in manage.py

- 2025-03-30T19:24:55.558996: Added email functionality to glasses prescription module
  - Modified `static/js/glasses.js` to allow sending glasses prescriptions as email attachments
  - Added "Send by email" button to GxRxModal interface
  - Implemented check for valid patient email before submission
  - Added PDF to base64 conversion for email attachment
  - Implemented better error handling with user notifications
  - Uses the existing `/api/email/send_with_attachment` endpoint in `rest.py`
  - Enhanced user experience with clear success/error messages

- 2025-03-30T20:10:32: Added phone number display in patient-bar template
  - Modified modalityctr.py to fetch patient phone information in md and gp controllers
  - Updated patient-bar.html to display phone number in patient information section
  - Added phone data handling in patient-bar.js
  - Phone is displayed with country prefix and number

- 2025-03-30T20:13:55: Enhanced patient information display with phone number
  - Modified all modality controllers (md, gp, tono, autorx, lenstar, hello) to fetch patient phone information
  - Added phone field to patient-bar.html template
  - Updated patient-bar.js to display phone number with country code (+XX XXX XXX)
  - Ensured consistent implementation across all modality interfaces
  - Added graceful fallback when no phone is available
  - Maintains existing patient information layout with cohesive styling

- 2025-03-30T20:19:24.056405: Added Edit Patient button to patient-bar.html
  - Added a direct link to user.html from the patient details bar
  - Implemented as a button with user-edit icon for quick patient data editing
  - Passes patient ID automatically to the user edit page
  - Positioned in the action button row for convenient access
  - Improves workflow efficiency by allowing quick edits to patient information

- 2025-04-01: Added comprehensive REST API documentation in docs/rest.md

- 2025-04-01T01:00:31: Enhanced REST API documentation with detailed use cases
  - Added comprehensive documentation for `/api/<tablename>/` endpoint
  - Detailed special handling of `auth_user` table operations
  - Added query parameter examples and explanations
  - Included practical use cases for common operations
  - Added error handling and best practices sections
  - Improved response format documentation
  - Added authentication and security details

## [2025-03-30] - UI and Email Improvements

- Updated email subject line format to: "{type of document} de {LASTNAME Firstname} | Centre Médical Bruxelles-Schuman"
- Updated PDF attachment filename format to: "{yymmdd}_{type of document}_{LASTNAME Firstname}_Centre_Médical_Bruxelles-Schuman.pdf"
- Updated certificate modal by replacing radio buttons with a dedicated "Send by email" button for a more streamlined user experience
- Changed form submit button label from "Submit" to "Print" for clarity

## [2025-03-31]

### Removed

- Removed unused `methodCxRxModalSubmit` input field from contact lenses prescription modal form
