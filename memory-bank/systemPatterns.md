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
   ├── rest.py           # REST API implementation
   ├── common.py         # Shared utilities and functions
   ├── useful.py         # Additional utility functions
   ├── settings.py       # Application configuration
   ├── static/           # Static assets (JS, CSS, images)
   ├── templates/        # HTML templates
   ├── modules/          # Custom Python modules
   ├── databases/        # Database files
   ├── uploads/          # File uploads
   ├── docs/            # Documentation
   └── translations/     # Internationalization files
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
