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

### Testing Requirements

- Unit test coverage
- Integration testing
- UI/UX testing
- Performance testing

### Version Control

- Git workflow
- Branch naming conventions
- Commit message format
- Code review process
