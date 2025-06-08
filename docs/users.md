# Users Module Documentation

## Overview

The Users module is a core component of the ophthalmology electronic medical records system. It manages user accounts, roles, and permissions, with special features for healthcare provider registration and patient management.

## File Structure

- `manage/users.html`: Main view template for user listing and management
- `static/js/manage/users.js`: Core JavaScript functionality for user management
- `static/js/manage/users_bt.js`: Bootstrap table configurations and handlers
- `manage.py`: Controller functions for user management

## Features

### 1. User Management

#### User Listing

- Filtered views by membership role (Patient, Doctor, Nurse, etc.)
- Sortable and searchable user tables
- Quick access to user profiles
- Role-based access control

#### User Creation

- Comprehensive user registration form
- Role-specific field requirements
- Automatic username generation
- Password management
- eID card integration for automated data entry

### 2. Role Management

#### Membership Roles

- Admin
- Doctor
- Nurse
- Medical Assistant
- Administrative
- Patient

#### Role-specific Features

- Hierarchical access levels
- Custom icons per role
- Role-specific permissions
- Role-based UI customization

### 3. Profile Information

#### Personal Details

- First and last name
- Date of birth
- Gender
- Contact information
- Profile photo

#### Contact Information

- Phone numbers with international prefixes
- Multiple address support
- Email addresses
- Emergency contacts

### 4. Identity Management

#### eID Card Integration

- Automatic data population from eID cards
- Photo extraction and storage
- Address verification
- National number validation

#### Document Management

- Identity document tracking
- Medical registration numbers
- Professional certifications
- Insurance information

## Technical Implementation

### Database Tables

The module interacts with several database tables:

1. **User Management**
   - `auth_user`: Core user information
   - `membership`: Role definitions and hierarchy
   - `gender`: Gender options

2. **Contact Information**
   - `address`: User addresses
   - `phone`: Contact numbers
   - `email`: Email addresses

### Key Components

#### 1. Bootstrap Table Implementation

The main user listing uses Bootstrap Table with the following features:

```javascript
const API_USER_LIST = HOSTURL + '/api/auth_user?@lookup=gender:gender[id,sex],membership!:membership[membership,hierarchy]&@count=true'
```

Features include:

- Server-side pagination
- Multi-column sorting
- Advanced search functionality
- Custom formatters for age and actions
- Responsive design

#### 2. Form Handlers

The module implements several form handlers:

```javascript
$('#userForm').submit(function(e) {
    // User creation form handler
    // Processes personal information
    // Handles address and contact details
    // Manages eID card data
})
```

#### 3. eID Integration

```javascript
document.getElementById('btnGetUserId').addEventListener('click', async function(e) {
    // Fetches data from eID card reader
    // Populates form fields automatically
    // Handles photo extraction
    // Validates data format
})
```

### JavaScript Functions

#### 1. Data Formatting

```javascript
function queryParams(params) {
    // Formats search parameters
    // Handles sorting
    // Manages pagination
}

function operateFormatter(value, row, index) {
    // Generates action buttons
    // Handles user operations
    // Manages row details
}
```

#### 2. User Operations

```javascript
function delUser(id, name) {
    // Handles user deletion
    // Confirms action
    // Updates database
}

function crudp(table, id, req, data) {
    // Generic CRUD operations
    // Handles API requests
    // Manages responses
}
```

### API Endpoints

The module uses several API endpoints:

1. **User Management**

```javascript
/api/auth_user
/api/membership
/api/gender
```

2. **Contact Information**

```javascript
/api/address
/api/phone
```

## Usage Guidelines

### 1. User Creation Process

1. Click "New User" button
2. Fill in required information
3. Optional: Use eID card for automatic data entry
4. Submit form
5. Handle additional information (address, phone)

### 2. User Search

1. Use the search box for filtering
2. Combine multiple search terms with commas
3. Sort by clicking column headers
4. Use column visibility options

### 3. User Management

1. Edit user profiles
2. Update contact information
3. Manage roles and permissions
4. Handle user deletion

## Security Considerations

1. **Access Control**
   - Role-based access
   - Session management
   - Permission validation

2. **Data Protection**
   - Input sanitization
   - Secure API calls
   - Password encryption
   - Personal data protection

## Dependencies

- Bootstrap Table 1.22
- jQuery
- Bootbox
- Font Awesome
- Flatpickr

## Maintenance

Regular maintenance tasks include:

1. User role auditing
2. Permission verification
3. Data integrity checks
4. API endpoint validation
5. Security updates
6. Documentation updates

## Error Handling

The module implements comprehensive error handling:

1. **Form Validation**
   - Required field checking
   - Data format validation
   - Duplicate detection

2. **API Error Handling**
   - Response validation
   - Error message display
   - User feedback

3. **Security Errors**
   - Permission denials
   - Session timeouts
   - Invalid operations

## Conclusion

The Users module provides a robust and secure user management system with:

1. Comprehensive user management
2. Role-based access control
3. eID card integration
4. Secure data handling
5. Intuitive interface

Regular updates and maintenance ensure optimal functionality and security compliance.
