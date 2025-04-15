# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- 2025-04-15T22:19:31.955234: Enhanced worklist Next.js conversion plan with Prisma integration
  - Updated docs/worklist_to_js.md with specific oph4js/ project location details
  - Added Prisma ORM configuration for direct database connection
  - Created detailed Prisma schema example for existing database models
  - Outlined API routes structure mirroring existing py4web endpoints
  - Added transaction handling implementation with Prisma
  - Expanded implementation phases with database integration as first phase
  - Enhanced completion criteria with Prisma-specific requirements

- 2025-04-15T22:11:20.672486: Created worklist Next.js 15 conversion plan
  - Added detailed migration roadmap in docs/worklist_to_js.md
  - Outlined conversion from Py4web MVC to Next.js 15 with Shadcn UI
  - Created comprehensive task list with implementation phases
  - Documented current and target architecture
  - Detailed project structure and component organization
  - Added technical considerations for state management and atomic operations
  - Included migration strategy and completion criteria

- 2025-04-15T00:37:08.712402: Completed API modularization of utility functions
  - Completed migration of utility functions from rest.py to modular API architecture:
    - Commented out rows2json and valid_date functions in rest.py
    - Added clear compatibility notices to direct users to api/core/utils.py
    - Updated api/endpoints/utils.py to import from api/core/utils.py
    - Maintained backward compatibility during transition
  - Improved code organization for better maintainability
  - Completed the refactoring of rest.py to modular architecture
  - Ensured consistent implementation of utility functions across the application

- 2025-04-14T23:56:01.558560: Refactored patient-bar.js with modern JavaScript best practices
  - Implemented proper module pattern with IIFE for encapsulated scope
  - Fixed "btnArr is not defined" reference error in tonometry module
  - Enhanced code organization with clear section comments
  - Improved the disableButtons function with proper type checking
  - Created on-demand variable declarations instead of global variables
  - Added backward compatibility layer for existing code
  - Improved code reliability with proper error handling
  - Enhanced maintainability with JSDoc documentation
  - Replaced ternary operators with more readable if/else statements

- 2025-04-14T23:32:28.841205: Completed full API modularization
  - Migrated all remaining REST API endpoints to modular structure:
    - Moved main database CRUD operations to `api/endpoints/auth.py`
    - Moved worklist batch operations to `api/endpoints/worklist.py`
    - Moved transaction management to `api/endpoints/worklist.py`
    - Moved file upload functionality to `api/endpoints/upload.py`
  - Updated original `rest.py` file with compatibility notices:
    - Added clear documentation on where endpoints were migrated
    - Commented out migrated code to avoid route conflicts
    - Maintained backward compatibility during transition
    - Ensured proper error handling and consistent API responses
  - Enhanced modular API implementation:
    - Implemented standardized error handling with APIResponse class
    - Used consistent datetime serialization for all endpoints
    - Improved documentation with comprehensive docstrings
    - Maintained API signature compatibility for all functions
  - Updated API package initialization to include all new modules

- 2025-04-14T23:17:45.251451: Fixed API endpoint conflicts during modularization
  - Resolved route conflicts between original rest.py endpoints and modular API endpoints
  - Fixed duplicate endpoint registrations for UUID generation, BeID card reading, and email functionality
  - Properly commented out conflicting endpoints in rest.py while maintaining documentation
  - Added compatibility notices to clearly indicate where endpoints have been moved
  - Ensured smooth transition to modular API architecture without breaking functionality
  - Installed missing pyscard package required by the BeID module
  - Resolved challenges with application startup and endpoint registration
  - Implemented proper backward compatibility strategy for API transition

- 2025-04-14T21:18:22.686743: Implemented modular API architecture
  - Created structured API directory with organized modules
  - Separated core functionality from endpoint implementations
  - Migrated UUID generation endpoint to api/endpoints/utils.py
  - Migrated BeID card reading endpoint to api/endpoints/devices/beid.py
  - Migrated email sending endpoints to api/endpoints/email.py
  - Added consistent error handling with standardized responses
  - Improved API documentation with comprehensive docstrings
  - Maintained backward compatibility through transition layer
  - Enhanced code organization for better maintainability
  - Provided framework for continuing API modularization

- 2025-04-13T20:05:59.006082: Modernized addToWorklist function with vanilla JavaScript
  - Converted jQuery selectors and methods to native JavaScript
  - Added comprehensive JSDoc documentation
  - Improved error handling with null checks
  - Enhanced code readability and maintainability
  - Maintained Bootstrap modal functionality
  - Improved state management integration
  - Added proper type hints in documentation
  - update to bootbox v6.0.3

- 2025-04-13T19:56:22.991906: Modernized worklist JavaScript with vanilla JS conversion
  - Refactored `appendWlItem` function in static/js/wl.js to remove jQuery dependencies
  - Converted DOM manipulation to use native JavaScript methods
  - Added proper JSDoc documentation to improve code maintainability
  - Fixed JSON parsing error in PACS integration
  - Updated `delWlItemModal` function to use native JavaScript
  - Fixed undefined variable reference in pentacam integration
  - Enhanced error handling for data attribute access
  - Improved code consistency throughout worklist module

- 2025-04-18T10:45:00.000000: Eliminated duplicate notifications in worklist operations
  - Created `crudpWithoutToast` function that performs API operations silently
  - Created `setWlItemStatusWithoutToast` as a silent version of the status update function
  - Modified all event handlers in `static/js/wl_bt.js` to use silent API operations
  - Enhanced feedback messages to include worklist ID in notifications
  - Consolidated all UI feedback through WorklistState.UI interface
  - Improved user experience by preventing duplicate notifications
  - Fixed notification handling for delete, status update, and counter operations

- 2025-04-13T19:41:43.494400: Enhanced tonometry module with improved API handling and table initialization
  - Fixed duplicated `@limit` parameter issue causing API errors
  - Improved bootstrap-table configuration with proper pagination parameters
  - Corrected table references in tono.js to prevent JavaScript reference errors
  - Enhanced table filtering by laterality and technology type
  - Fixed context issue in queryParams function by correctly passing configuration
  - Implemented better bootstrap-table initialization structure
  - Created centralized table configuration management
  - Updated refreshTables function to use consistent table selectors
  - Eliminated race conditions in table updates
  - Improved error handling for failed API requests

- 2025-04-13T13:01:16.998036: Implemented Phase 1 of worklist combo fix
  - Created new state manager module in static/js/wl-state-manager.js:
    - Added WorklistStateManager class for tracking item states
    - Implemented RequestQueue class to prevent race conditions
    - Created UIManager class for UI protection and feedback
  - Modified static/js/wl.js to use the state manager:
    - Replaced global variables with structured state management
    - Added data cleaning to prevent validation errors
    - Implemented patient consistency validation
    - Enhanced error handling and recovery
  - Updated docs/combo_fix_strategy.md with:
    - Detailed progress report on Phase 1 implementation
    - Documentation of challenges encountered
    - Refined plans for Phase 2 backend implementation
  - Improvements prevent race conditions and data corruption in worklist combos
  - Enhanced user experience with better feedback during processing
  - Fixed "Invalid fields" errors by proper client-side data handling

- 2025-04-03T00:33:50: Enhanced FastAPI documentation structure in docs/fastapi.md
  - Added comprehensive Table of Contents
  - Improved navigation with proper markdown anchor links
  - Organized content into logical sections:
    - Basic CRUD Endpoints
    - Complex Query Endpoints
    - Authentication and Authorization
    - Error Handling
    - Rate Limiting
    - Versioning
  - Enhanced readability and accessibility
  - Maintained consistent documentation style

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

- 2025-04-03T00:16:43: Enhanced FastAPI documentation in docs/fastapi.md
  - Updated request/response schemas to match actual database structure
  - Added proper audit fields (created_by, modified_by) to all endpoints
  - Enhanced membership endpoints with proper validation rules
  - Added detailed contact records endpoints (phone and address)
  - Improved documentation clarity and organization
  - Added validation rules and business logic constraints
  - Ensured consistency with database schema

- 2025-04-03T00:25:25: Enhanced FastAPI Insurance & Financial documentation in docs/fastapi.md
  - Added detailed request/response schemas for insurance history endpoint
  - Added comprehensive billing summary endpoint documentation
  - Enhanced insurance CRUD endpoints with proper audit fields
  - Added pagination and filtering parameters
  - Improved documentation clarity and organization
  - Added validation rules and business logic constraints
  - Ensured consistency with database schema

- 2025-04-03T00:39:15.204980: Fixed Bootstrap tables double initialization

- [[=mcp_server_name_get_current_datetime]]: Enhanced email functionality in prescription and certificate modals
  - Added editable email input field to glasses prescription modal (GxRxModal)
  - Added editable email input field to contacts prescription modal (CxRxModal)
  - Added editable email input field to certificate modal (certificateModal)
  - Pre-populated fields with patient's email address
  - Added client-side email validation
  - Updated email sending logic to use the input field value
  - Improved user feedback messages with actual email address used
  - Maintained existing functionality while adding email customization feature

- 2025-04-17T10:15:00.000000: Fixed L80 integration error message
  - Corrected error message path in `addpatient_l80` function in `modules/visionix/vx_rest.py`
  - Fixed issue where error message incorrectly included patient folder in path
  - The error reported `folder/patientname/Index.txt` instead of the correct `folder/Index.txt`
  - Ensures proper error reporting when Index.txt cannot be read
  - Resolves error handling for patient names containing special characters like '#'

- 2025-04-15T18:25:16.998036: Completed Phase 1 of worklist combo fix with additional improvements
  - Enhanced state management system with proper tracking and validation:
    - Added tracking of processing items by database ID
    - Improved request queueing with better error handling
    - Added robust UI feedback during operations
  - Fixed critical concurrency and validation issues:
    - Corrected RESTful API endpoint format for updates (PUT requests)
    - Modified status update requests to use ID in URL path instead of request body
    - Fixed scope issues with Bootstrap Table event handlers
    - Implemented proper script loading order and initialization sequence
    - Ensured global access to table references for event handlers
  - Enhanced template to properly load dependencies in correct order:
    - Added state manager initialization before dependent components
    - Implemented deferred table initialization
    - Added feedback container for status messages
  - Implementation challenges overcome:
    - Resolved REST API validation errors for update operations
    - Fixed event handler binding timing issues
    - Addressed variable scope conflicts between modules
    - Corrected initialization order dependencies
    - Ensured proper Bootstrap Table event registration

- 2025-04-13T20:39:15.064967: Enhanced worklist JavaScript functions with vanilla JS conversion
  - Converted `hideDiv` function to use native DOM manipulation
  - Modernized `putWlModal` function with async/await and proper error handling
  - Added comprehensive JSDoc documentation to all converted functions
  - Improved code organization and readability
  - Enhanced error handling with proper null checks
  - Removed jQuery dependencies where possible
  - Maintained Bootstrap modal functionality
  - Added proper type hints in documentation
  - Improved function parameter naming for clarity

- 2025-04-18T11:30:00.000000: Fixed worklist item validation error in PUT requests
  - Modified `static/js/wl.js` to properly handle ID field in worklist updates
  - Removed ID from request payload to prevent validation conflicts
  - Ensured ID is only sent in URL path for PUT requests
  - Follows RESTful API best practices and py4web validation requirements
  - Matches implementation pattern from previous fixes in other modules
  - Resolves "Validation Errors: invalid id" error in worklist updates
  - Improves consistency with other CRUD operations

- Batch API endpoint for atomic operations in rest.py
- Transaction handling for worklist combo operations
- Server-side validation for batch consistency
- Database transaction support for combo operations

- [[=mcp_server_name_get_current_datetime]]: Completed Phase 2 Step 1 of worklist combo fix - API Enhancements
  - Implemented batch operation API endpoint in `rest.py`
  - Added transaction handling with commit/rollback mechanism
  - Implemented comprehensive error management with transaction rollback
  - Added validation for batch operations to ensure data consistency
  - Created proper response structure with batch transaction status
  - Enhanced API to support atomic operations for worklist items

- 2025-04-14T00:30:00.000000: Completed Phase 2 Step 2 of worklist combo fix - Database and Frontend Integration
  - Added transaction_id field to worklist table for batch operation tracking
  - Created transaction_audit table for comprehensive transaction monitoring
  - Implemented transaction status tracking with complete/failed/partial states
  - Added recovery mechanisms for partial transaction failures
  - Created transaction history interface in worklist modal
  - Added detailed transaction inspection capabilities
  - Implemented client-side transaction tracking in localStorage
  - Fixed duplicate field issues in transaction_audit table definition
  - Enhanced error reporting for transactions with status tracking
  - Built user-friendly transaction recovery UI

- 2025-04-19T14:20:00.000000: Fixed JSON serialization error in transaction details modal
  - Added datetime object serialization in transaction_audit records
  - Resolved "Object of type datetime is not JSON serializable" error
  - Enhanced transaction details display with better error handling
  - Improved transaction UI with comprehensive debugging information
  - Added more resilient data handling in transaction viewer
  - Enhanced patient name formatting in transaction details
  - Implemented field validation for different JSON response structures
  - Fixed Bootstrap 5 modal closing issue by updating data-dismiss to data-bs-dismiss

- 2025-04-15T00:32:44.367575: Fixed crudp function in useful.js to properly handle PUT requests
  - Modified `static/js/useful.js` to correctly handle RESTful API validation:
    - Fixed issue where ID was being sent in both URL and request payload
    - Added ability to extract ID from data when id parameter is "0"
    - Properly sets API URL with ID in the path for PUT requests
    - Removes ID from request payload to prevent validation conflicts
  - Resolves "Validation Errors: invalid id" error in PUT requests
  - Addresses common pattern of code calling crudp with id="0" but ID in the data payload
  - Follows RESTful API best practices for PUT requests
  - Matches previous fixes for similar validation issues in other modules
  - Maintains backward compatibility with existing code

- 2025-04-15T20:49:59.849290: Fixed worklist modality selection API error
  - Resolved "Invalid fields: ['first_name', 'last_name', 'id']" error in modality API query:
    - Fixed `getModalityOptions()` function in static/js/wl.js to use correct query structure
    - Updated `setModalityOptions()` to handle the new response format correctly
  - Challenges overcome:
    - Initial fix attempt still produced errors due to invalid field references
    - Needed to understand the many-to-many relationship between procedure and modality tables
    - Required proper navigation of the procedure_family join table
  - Technical solution:
    - Changed API query from direct modality lookup to procedure_family table lookup
    - Used the @lookup parameter to get related modality information
    - Updated data access pattern to use correct lookup field references
  - Benefits:
    - Fixed procedure-to-modality selection dropdown in worklist form
    - Prevented database errors during modality selection
    - Ensured proper REST API query format following database schema design
    - Maintained existing functionality without requiring database schema changes

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

- 2025-04-02T22:35:55: Created comprehensive FastAPI endpoints documentation in docs/fastapi.md
  - Structured documentation for basic CRUD operations
  - Detailed schemas for Patient, Insurance, Membership, and Contact endpoints
  - Comprehensive request/response schemas with examples
  - Validation rules and business logic constraints
  - Authentication and authorization requirements
  - Rate limiting and versioning information
  - Complex query endpoints for aggregated data
  - Clinical examination endpoints with detailed response structures

## [2025-03-30] - UI and Email Improvements

- Updated email subject line format to: "{type of document} de {LASTNAME Firstname} | Centre Médical Bruxelles-Schuman"
- Updated PDF attachment filename format to: "{yymmdd}_{type of document}_{LASTNAME Firstname}_Centre_Médical_Bruxelles-Schuman.pdf"
- Updated certificate modal by replacing radio buttons with a dedicated "Send by email" button for a more streamlined user experience
- Changed form submit button label from "Submit" to "Print" for clarity

## [2025-03-31]

### Removed

- Removed unused `methodCxRxModalSubmit` input field from contact lenses prescription modal form

## [2025-04-02]

### Added

- Created comprehensive workflow documentation in `docs/workflow.md`
  - Detailed explanation of patient journey through the EMR system
  - Role-based workflow descriptions for administrative assistants, medical assistants, and doctors
  - Status tracking and monitoring information
  - Security and access control documentation
  - Integration points and system maintenance guidelines
- Created comprehensive README.md with:
  - Project overview and features
  - Installation instructions
  - Documentation overview
  - Security features
  - Contributing guidelines
  - License information

### Changed

- Updated LICENSE file with proper project description

### Changed
- Updated __init__.py to import from the new modular API structure instead of rest.py (2025-04-15)

### Removed
- 2025-04-15T01:23:42.437218: Deleted rest.py after completing API modularization
  - Completed the migration of all endpoints to the modular API structure
  - Verified application functionality with the modular API architecture
  - The legacy compatibility layer is no longer needed
  - All REST API functionality is now managed through the api/ module structure
  - This completes the API modularization project
