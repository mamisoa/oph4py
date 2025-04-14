# Technical Context

## Development Environment

### System Requirements

- OS: Linux (tested on 6.8.0-57-generic)
- Shell: zsh
- Python: 3.x
- MySQL: 10.11.11.24.4.2
- Web Server: Built-in py4web server

### Development Tools

- Poetry for dependency management
- Git for version control
- VS Code/Cursor for development
- MySQL Workbench for database management

## Technologies Used

### Backend Framework

- **Py4web Framework**
  - MVC architecture
  - Built-in authentication
  - DAL (Database Abstraction Layer)
  - Template engine
  - Form handling

- **Modular API Architecture**
  - Organized directory structure
  - Core functionality separation
  - Standardized response handling
  - Consistent error management
  - Backward compatibility layer

### Database

- **MySQL**
  - Database: py4web2025
  - User: py4web
  - Normalized schema design
  - Foreign key constraints
  - Transaction support

### Frontend Technologies

- **Bootstrap**
  - Responsive design
  - Modal components
  - Form styling
  - Table management

- **JavaScript Libraries**
  - PDFMake for document generation
  - TinyMCE for rich text editing
  - Custom modules for UI interaction
  - AJAX for async operations

### External Integrations

- Email service for prescription delivery
- eID card reader integration
- Medical device interfaces (L80, VX100, CV5000)
- PDF generation and handling

## Technical Constraints

### Security Requirements

- Role-based access control
- Secure session management
- Data encryption at rest
- Audit logging
- HIPAA compliance considerations

### Performance Requirements

- Response time < 2 seconds
- Support for concurrent users
- Efficient database queries
- Optimized file handling

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari)
- Responsive design for different screen sizes
- Progressive enhancement approach
- Graceful degradation support

## Dependencies

### Python Packages

```
py4web
pymysql
pdfmake
pillow
requests
```

### JavaScript Libraries

```
bootstrap
jquery
pdfmake
tinymce
custom modules
```

### Development Dependencies

```
pytest
black
flake8
mypy
```

## Configuration Management

### Environment Variables

- Database credentials
- Email service settings
- API keys
- Debug settings

### Settings Files

- settings.py for application configuration
- logging configuration
- database migration settings
- device integration parameters

## API Architecture

### Modular Structure

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

### Response Format

Standard success response:
```json
{
  "status": "success",
  "message": "Operation successful",
  "code": 200,
  "data": { ... }
}
```

Standard error response:
```json
{
  "status": "error",
  "message": "Specific error message",
  "code": 400,
  "error_type": "validation_error"
}
```

### Error Handling Strategy

- Consistent error types across all endpoints
- Detailed error messages for debugging
- Appropriate HTTP status codes
- Proper exception handling and logging

### Migration Strategy

- API modularization completely finished
- Legacy rest.py file has been removed
- All endpoints now use modular API structure
- Application updated to reference new API structure
- Full documentation of new API architecture maintained

## Deployment Architecture

### Development

- Local development server
- Local MySQL instance
- Debug mode enabled
- Hot reload active

### Production

- Production web server
- Replicated MySQL
- SSL/TLS encryption
- Regular backups

## Monitoring and Maintenance

### Logging

- Application logs
- Error tracking
- User activity monitoring
- Performance metrics

### Backup Strategy

- Daily database backups
- Document storage backups
- Configuration backups
- Recovery procedures

### Updates and Patches

- Dependency updates
- Security patches
- Feature updates
- Database migrations

## Development Guidelines

### Code Style

- PEP 8 compliance
- Consistent naming conventions
- Documentation requirements
- Type hints usage
- Comprehensive docstrings

### API Development Standards

- Follow modular architecture pattern
- Use standardized response formats with APIResponse class
- Implement proper error handling with appropriate status codes
- Include thorough documentation with comprehensive docstrings
- All endpoints implemented in dedicated modules under api/endpoints/

### Testing Requirements

- Unit test coverage
- Integration testing
- UI/UX testing
- Performance testing
- API endpoint testing

### Version Control

- Git workflow
- Branch naming conventions
- Commit message format
- Code review process

## Current Technical Stack

### Frontend

- Bootstrap Table for data display
- jQuery for DOM manipulation and AJAX
- Custom JavaScript modules for business logic

### Backend

- Py4web framework for overall application
- Modular API architecture for REST endpoints
- MySQL database for persistence
- Custom Python modules for business logic

## Technical Challenges

### Worklist Combo Implementation

#### Current Implementation

The worklist combo feature currently uses:

- Global state arrays (`wlItemsJson`, `wlItemsHtml`)
- Asynchronous AJAX calls without proper transaction handling
- Direct DOM manipulation for UI updates
- Simple error handling

#### Technical Debt

1. Race Conditions
   - Multiple async operations without proper synchronization
   - No locking mechanism for patient-specific operations
   - Potential data corruption during concurrent operations

2. State Management
   - Global state variables leading to side effects
   - No proper state containment
   - Missing state validation

3. Error Handling
   - Basic try-catch blocks
   - No comprehensive error recovery
   - Missing transaction rollback

#### Required Technical Changes

1. Transaction Support

```javascript
// Required new transaction handling system
const transactionManager = {
    async beginTransaction() {},
    async commit() {},
    async rollback() {},
    async execute(operation) {}
};
```

2. State Management

```javascript
// Required state management system
const stateManager = {
    pendingOperations: new Map(),
    locks: new Set(),
    async acquireLock(patientId) {},
    async releaseLock(patientId) {}
};
```

3. Validation System

```javascript
// Required validation system
const validator = {
    validatePatient(patientId) {},
    validateModality(modalityId) {},
    validateRelationships(item) {}
};
```

#### Implementation Priority

1. Transaction handling system
2. State management improvements
3. Validation layer
4. UI synchronization
5. Error handling
6. Locking mechanism
