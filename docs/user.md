# User Controller Documentation

## Overview

The User controller is a core component of the ophthalmology electronic medical records system. It manages user profiles, personal information, addresses, phone numbers, and medical registration details for healthcare providers.

## File Structure

- `manage/user.html`: Main view template
- `static/js/user.js`: Core JavaScript functionality
- `manage.py`: Server-side controller logic

## Features

### 1. User Profile Management

#### Basic Information

- Personal details (name, DOB, gender)
- Contact information (email)
- Role/membership management
- Profile photo handling
- Social security number
- Nationality and birth information

#### Extended Information

- Marital status
- Noble condition
- Special status
- User notes
- ID card information

### 2. Address Management

#### Multiple Address Support

- Home addresses
- Office addresses
- Multiple address types
- Address ranking system

#### Address Components

- Street information
- House/Box numbers
- Postal codes
- Cities/Towns
- Countries
- Origin tracking

### 3. Phone Number Management

#### Phone Features

- Multiple phone numbers
- International prefix support
- Phone type categorization
- Origin tracking

### 4. Medical Registration Details

#### Provider Information

- INAMI/Registration numbers
- Professional contact details
- Office information
- Company details

#### Office Details

- Office name
- Office address
- Office contact information
- Website URL

#### Company Information

- Company registration
- Banking details
- Official addresses
- Company identification numbers

### 5. Identity Card Integration

#### eID Card Reader Support

- Belgian eID card reading
- Automatic form filling
- Photo extraction
- Address parsing

## Technical Implementation

### Database Tables

The controller interacts with multiple database tables:

1. **User Profile**
   - `auth_user`: Core user information
   - `membership`: User roles and hierarchies
   - `gender`: Gender definitions
   - `marital`: Marital status options
   - `ethny`: Ethnicity information

2. **Contact Information**
   - `address`: User addresses
   - `phone`: Phone numbers
   - `data_origin`: Origin tracking for contact info

3. **Medical Registration**
   - `md_params`: Medical provider parameters

### Key Components

#### 1. User Interface Elements

1. **Profile Card**
   - Personal information display
   - Photo display
   - Quick action buttons
   - Edit capabilities

2. **Address Card**
   - Address list display
   - Add/Edit/Delete functionality
   - Address type indication
   - Ranking display

3. **Phone Card**
   - Phone number list
   - Add/Edit/Delete functionality
   - Type indication
   - International format support

4. **Medical Registration Card**
   - Professional details
   - Office information
   - Company details
   - Registration numbers

### JavaScript Functions

#### Core Functions

1. **Data Retrieval**

```javascript
function getUser(id)
function getUserPhones(id)
function getUserAddresses(id)
function getmdParam(id)
```

2. **Form Handling**

```javascript
function userFormSubmit(table)
function confirmEdit(recid, table)
function confirmDel(id, table)
```

3. **UI Updates**

```javascript
function refreshList(listName)
function refreshAll()
```

### API Endpoints

The controller uses several API endpoints:

1. **User Management**

```javascript
const API_USER = HOSTURL + '/api/auth_user'
```

2. **Contact Information**

```javascript
const API_USER_PHONE = HOSTURL + '/api/phone'
const API_USER_ADDRESS = HOSTURL + '/api/address'
```

3. **Medical Registration**

```javascript
const API_MDPARAM = HOSTURL + '/api/md_params'
```

## Usage Guidelines

1. **User Profile Management**
   - Complete all required fields
   - Validate personal information
   - Update contact details
   - Manage role assignments

2. **Address Management**
   - Add multiple addresses
   - Specify address types
   - Maintain ranking order
   - Validate postal information

3. **Phone Management**
   - Add multiple numbers
   - Specify number types
   - Include country codes
   - Validate number format

4. **Medical Registration**
   - Verify registration numbers
   - Update office information
   - Maintain company details
   - Keep banking information current

## Error Handling

The system implements various error handling mechanisms:

- Form validation
- Data type checking
- API error handling
- User feedback messages
- Duplicate checking
- Required field validation

## Security Considerations

1. **Access Control**
   - Role-based access
   - Session management
   - Data validation
   - Profile access restrictions

2. **Data Protection**
   - Input sanitization
   - Secure API calls
   - Audit logging
   - Personal data protection

## Dependencies

- Bootstrap 5
- jQuery
- Bootbox
- Font Awesome
- jQuery Serialize Object

## Maintenance

Regular maintenance tasks include:

1. Updating user roles
2. Validating form fields
3. Checking API endpoints
4. Updating documentation
5. Monitoring error logs
6. Verifying data integrity
7. Updating validation rules

## Conclusion

The User Controller provides comprehensive user management capabilities:

1. Complete user profile management
2. Detailed contact information handling
3. Medical registration management
4. Role-based access control
5. eID integration support

Regular updates and maintenance ensure optimal functionality and data integrity.
