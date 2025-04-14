# System Patterns

## Architecture Overview

Oph4py follows the Model-View-Controller (MVC) pattern using the Py4web framework, with a modular design approach for maintainability and scalability.

### Core Architecture Components

1. **Models**
   - Database models for patient data
   - Clinical examination records
   - Prescription and certificate management
   - User and access control
   - Device integration interfaces

2. **Views**
   - Bootstrap-based responsive UI
   - Modal-driven interactions
   - Dynamic form handling
   - PDF generation for documents
   - Email delivery interface

3. **Controllers**
   - Modality-specific controllers (GP, MD, Tono, AutoRx)
   - REST API endpoints
   - Authentication and authorization
   - Device communication handlers

## Design Patterns

1. **Module Organization**

   ```tree
   /apps/oph4py/
   ├── models.py          # Database models and data structures
   ├── controllers.py     # Base controllers
   ├── modalityctr.py     # Modality-specific controllers
   ├── manage.py          # Management interface controllers
   ├── rest.py            # REST API implementation (legacy)
   ├── api/               # Modular API structure
   │   ├── core/          # Core API functionality
   │   ├── endpoints/     # Endpoint implementations
   │   └── models/        # API-specific models
   ├── common.py          # Shared utilities and functions
   ├── useful.py          # Additional utility functions
   ├── settings.py        # Application configuration
   ├── static/            # Static assets (JS, CSS, images)
   ├── templates/         # HTML templates
   ├── modules/           # Custom Python modules
   ├── databases/         # Database files
   ├── uploads/           # File uploads
   ├── docs/              # Documentation
   └── translations/      # Internationalization files
   ```

2. **Database Patterns**
   - Normalized tables for patient data
   - Reference tables for medical data
   - Audit trails for changes
   - Foreign key relationships

3. **API Design**
   - RESTful endpoints
   - Consistent error handling
   - Authentication middleware
   - Rate limiting
   - Modular architecture with separated concerns

## Key Technical Decisions

1. **Frontend Framework**
   - Bootstrap for responsive design
   - Custom JavaScript modules
   - PDFMake for document generation
   - TinyMCE for rich text editing

2. **Backend Services**
   - MySQL database
   - py4web framework
   - Custom REST API
   - Email service integration

3. **Security Implementation**
   - Role-based access control
   - Session management
   - Data encryption
   - Audit logging

## Component Relationships

1. **User Interface**

   ```mermaid
   graph TD
     A[Patient Bar] --> B[Modality Views]
     B --> C[Clinical Forms]
     C --> D[Document Generation]
     D --> E[Email Delivery]
   ```

2. **Data Flow**

   ```mermaid
   graph TD
     A[User Input] --> B[Controller]
     B --> C[Model]
     C --> D[Database]
     B --> E[View]
     E --> F[User Interface]
   ```

3. **Authentication Flow**

   ```mermaid
   graph TD
     A[Login] --> B[Auth Controller]
     B --> C[Role Check]
     C --> D[Session]
     D --> E[Access Control]
   ```

## Integration Points

1. **Device Integration**
   - L80 interface
   - VX100 interface
   - CV5000 interface
   - Data synchronization

2. **External Systems**
   - Email service
   - eID card reader
   - PDF generation
   - Image processing

## Maintenance Patterns

1. **Code Organization**
   - Modular structure
   - Clear separation of concerns
   - Consistent naming conventions
   - Comprehensive documentation

2. **Error Handling**
   - Centralized error management
   - Detailed logging
   - User-friendly error messages
   - Recovery procedures

3. **Testing Strategy**
   - Unit tests for core functionality
   - Integration tests for workflows
   - UI testing for critical paths
   - Performance benchmarking

## Architecture Patterns

### Modular API Architecture

The API follows a modular architecture pattern to enhance maintainability, testability, and organization:

```
api/
├── __init__.py             # Main package initialization
├── core/                   # Core functionality
│   ├── __init__.py
│   ├── policy.py           # API policies and permissions
│   ├── utils.py            # Utility functions
│   └── base.py             # Shared base functionality
├── endpoints/              # Individual API endpoints
│   ├── __init__.py
│   ├── auth.py             # User authentication endpoints
│   ├── email.py            # Email functionality
│   ├── upload.py           # File upload endpoints
│   ├── utils.py            # Utility endpoints (UUID, etc.)
│   ├── worklist.py         # Worklist operations
│   └── devices/            # Device-specific endpoints
│       ├── __init__.py
│       └── beid.py         # Belgium eID card endpoints
└── models/                 # API-specific models
    └── __init__.py
```

#### Key Design Principles

1. **Separation of Concerns**
   - Core functionality separate from endpoint implementations
   - Device-specific endpoints isolated in their own namespace
   - Shared utilities centralized in core modules

2. **Standardized Response Handling**
   ```python
   class APIResponse:
       @staticmethod
       def success(data=None, message="Operation successful", status_code=200):
           # Create standardized success response
           return json.dumps({
               "status": "success",
               "message": message,
               "code": status_code,
               "data": data
           })
       
       @staticmethod
       def error(message="An error occurred", status_code=400, error_type="validation_error"):
           # Create standardized error response
           return json.dumps({
               "status": "error", 
               "message": message,
               "code": status_code,
               "error_type": error_type
           })
   ```

3. **Consistent Error Handling**
   ```python
   def handle_rest_api_request(tablename, rec_id=None):
       try:
           # Process request
           return json_response
       except ValueError as e:
           # Handle validation errors
           return APIResponse.error(str(e), 400, "validation_error")
       except Exception as e:
           # Handle unexpected errors
           logger.error(traceback.format_exc())
           return APIResponse.error(str(e), 500, "server_error")
   ```

4. **Backward Compatibility Layer**
   - Legacy API endpoints maintained during transition
   - New endpoints implement enhanced functionality
   - Gradual migration path for client code

### API Migration Pattern

To safely migrate from a monolithic REST API to a modular structure while maintaining compatibility, the following pattern is used:

1. **Phased Implementation**
   - Endpoints are migrated one at a time to prevent widespread disruption
   - Each endpoint migration is tested thoroughly before committing
   - Documentation is updated to reflect the new location

2. **Compatibility Layer**
   ```python
   # Old file (rest.py)
   # COMPATIBILITY NOTICE:
   # This function has been moved to api/endpoints/utils.py
   # This function definition is commented out to avoid route conflicts
   """
   @action("api/uuid", method=["GET"])
   def generate_unique_id():
       # Implementation
   """
   ```

3. **Import Strategy**
   ```python
   # Import modular endpoints in main init file
   from .api import beid, email, endpoint_utils
   ```

4. **Conflict Resolution**
   - When route conflicts occur, implement these steps:
     1. Comment out the original implementation in rest.py
     2. Add a compatibility notice indicating where the endpoint was moved
     3. Ensure both implementations are identical in behavior
     4. Update all references to use the new implementation
     5. Test thoroughly to verify functionality

5. **Documentation Updates**
   - Add migration notes to CHANGELOG.md
   - Update technical documentation to reflect new module structure
   - Document any changes in behavior or parameters

6. **Dependency Management**
   - Ensure all required dependencies are properly installed
   - When moving device-specific endpoints, verify device libraries are available
   - Consider adding environment validation to prevent startup issues

This migration pattern ensures smooth transition with minimal disruption, maintains backward compatibility, and improves code organization and maintainability.

### Worklist Management System

#### Current Pattern

- Asynchronous worklist item creation
- Global state management through shared arrays
- Direct DOM manipulation for UI updates
- Simple AJAX-based data persistence

#### Identified Issues

- Race conditions in combo worklist creation
- Lack of transaction support
- Insufficient state management
- Missing data validation layer

#### Proposed Pattern

1. Transaction-based Worklist Management

```javascript
class WorklistTransaction {
    async execute(items) {
        try {
            await this.beginTransaction();
            await this.validateAll(items);
            await this.persistAll(items);
            await this.commit();
        } catch (error) {
            await this.rollback();
            throw error;
        }
    }
}
```

2. State Management Pattern

```javascript
class WlItemManager {
    constructor() {
        this.pendingItems = new Map();
        this.processingItems = new Set();
    }
    
    async processCombo(patientId, items) {
        if (this.isProcessing(patientId)) {
            throw new Error('Patient items already processing');
        }
        await this.acquireLock(patientId);
        try {
            return await this.processItems(items);
        } finally {
            await this.releaseLock(patientId);
        }
    }
}
```

3. Validation Layer Pattern

```javascript
class WlItemValidator {
    validate(item) {
        this.validatePatient(item.patientId);
        this.validateModality(item.modality);
        this.validateRelationships(item);
    }
}
```

#### Implemented Patterns

1. **Frontend State Management**

```javascript
// WorklistStateManager Implementation
class WorklistStateManager {
    constructor() {
        this.pendingItems = new Map();      // Tracks items waiting to be processed
        this.processedItems = new Map();    // Tracks processed items
        this.htmlElements = new Map();      // References to DOM elements
        this.patientContext = null;         // Current patient context
    }
    
    addItem(item) { /* Implementation */ }
    updateItemStatus(id, status) { /* Implementation */ }
    getItemsByPatient(patientId) { /* Implementation */ }
    clearItems() { /* Implementation */ }
}

// Request Queue Implementation
class RequestQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }
    
    enqueue(request) { /* Implementation */ }
    processNext() { /* Implementation */ }
    handleError(error) { /* Implementation */ }
}
```

2. **Backend Transaction API**

```python
# REST API Batch Endpoint
@action('batch', method=['POST'])
@action.uses(db, session, auth.user)
def batch():
    """Process a batch of operations as a single transaction"""
    try:
        data = request.json
        operations = data.get('operations', [])
        
        # Begin transaction
        db.commit()
        
        results = []
        for i, operation in enumerate(operations):
            try:
                # Process each operation
                method = operation.get('method')
                resource = operation.get('resource')
                data = operation.get('data')
                
                # Execute operation
                result = execute_operation(method, resource, data)
                results.append(result)
            except Exception as e:
                # Roll back on any failure
                db.rollback()
                return error_response(f"Operation {i} failed: {str(e)}")
        
        # Commit transaction
        db.commit()
        
        return success_response(results)
    except Exception as e:
        # Roll back on any failure
        db.rollback()
        return error_response(f"Batch operation failed: {str(e)}")
```
