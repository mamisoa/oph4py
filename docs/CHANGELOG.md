# Changelog

## [Unreleased]

### Fixed

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
  - Root cause: py4web's RestAPI validation was failing because:
    - ID was being sent both in URL and payload causing validation conflicts
    - Fixed by sending ID only in URL path and removing it from payload
    - Matches py4web's RESTful API expectations for PUT requests
  - Cross-system behavior explanation:
    - The issue worked on another computer likely due to different py4web versions
    - Older versions of py4web (pre-3.0) were more lenient with validation
    - Newer versions enforce stricter RESTful API conventions
    - The fix ensures compatibility with all py4web versions by following best practices

### Added

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

- 2025-03-29T19:14:32: Added comprehensive documentation for the Billing Module in docs/billing.md
  - Documents complete MVC architecture and components
  - Details financial transaction management
  - Describes billing record tracking system
  - Explains user-specific billing views
  - Documents role-based access control
  - Details reporting and analytics features
  - Provides technical implementation details
  - Lists API endpoints and data structures
  - Includes security considerations and maintenance guidelines
  - Added comprehensive docstring to summary() function in manage.py
