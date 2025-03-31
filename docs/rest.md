# REST API Documentation

## Overview & Purpose

This module provides RESTful API endpoints for the ophthalmology electronic medical records system. It handles various HTTP methods (GET, POST, PUT, DELETE) for database operations and includes specialized endpoints for Belgium eID card reading and email services.

## Table of Contents

1. [Overview & Purpose](#overview--purpose)
2. [Installation & Dependencies](#installation--dependencies)
3. [API Endpoints](#api-endpoints)
4. [Code Documentation](#code-documentation)
5. [Architecture & Design](#architecture--design)
6. [Testing & Troubleshooting](#testing--troubleshooting)
7. [Versioning & Changelog](#versioning--changelog)
8. [Browserless API Access](#browserless-api-access)

## Installation & Dependencies

### Required Python Version

- Python 3.8+

### Dependencies

The module requires the following dependencies:

- py4web
- pydal
- base64
- json
- smtplib
- email
- uuid
- beid (custom module for Belgium eID card reading)

### Configuration

The module requires the following environment variables:

- `SMTP_LOGIN`: SMTP server login credentials in format "username::password"
- `SMTP_SERVER`: SMTP server address in format "server:port"
- `COMPANY_LOGO`: URL or path to company logo
- `UPLOAD_FOLDER`: Path to upload directory

## API Endpoints

### General Database Operations

The main API endpoint `/api/<tablename>/` provides RESTful operations for database tables. This endpoint supports standard CRUD operations with special handling for certain tables like `auth_user`.

#### Base URL Format

- Single record operations: `/api/<tablename>/<rec_id>`
- Multiple records operations: `/api/<tablename>/`

#### Supported Methods

- `GET`: Retrieve records
- `POST`: Create new records
- `PUT`: Update records
- `DELETE`: Remove records (only with record ID)

#### Authentication and Security

All endpoints require authentication through py4web's session management. The endpoints are protected by:

- Session-based authentication
- CSRF token validation
- Role-based access control

#### Query Parameters

The API supports several query parameters for filtering and data relationships:

1. **Lookup Relations**

   ```
   ?@lookup=related_table:field_name
   ```

   Example: Get phone numbers for a user

   ```
   /api/phone?id_auth_user=2&@lookup=phone:id_auth_user
   ```

2. **Denormalized Data**

   ```
   ?@lookup=table!:field[field1,field2]
   ```

   Example: Get user with related identity fields

   ```
   /api/phone?id_auth_user=2&@lookup=identity!:id_auth_user[first_name,last_name]
   ```

### Special Case: auth_user Table

The `auth_user` table has special handling due to security considerations and password management.

#### Password Handling

When updating an `auth_user` record:

1. **Preserving Existing Password**

   ```http
   PUT /api/auth_user/1
   {
     "first_name": "John",
     "last_name": "Doe"
   }
   ```

   - If no password is provided, the existing password is preserved
   - Password validation is bypassed for this case

2. **Updating Password**

   ```http
   PUT /api/auth_user/1
   {
     "password": "newPassword123",
     "first_name": "John",
     "last_name": "Doe"
   }
   ```

   - Password validation is applied
   - Password is properly hashed before storage

#### Response Format

Successful response:

```json
{
    "api_version": "0.1",
    "code": 200,
    "errors": {},
    "status": "success",
    "id": 1,
    "updated": 1
}
```

Error response:

```json
{
    "status": "error",
    "message": "Error description",
    "code": 400
}
```

### Use Cases

#### 1. User Management

**Create a new user:**

```http
POST /api/auth_user/
{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123"
}
```

**Update user profile:**

```http
PUT /api/auth_user/1
{
    "first_name": "John",
    "last_name": "Smith",
    "email": "john.smith@example.com"
}
```

#### 2. Patient Records

**Get patient with related information:**

```http
GET /api/auth_user/1?@lookup=phone:id_auth_user,address:id_auth_user
```

**Add patient phone:**

```http
POST /api/phone/
{
    "id_auth_user": 1,
    "phone": "+32123456789",
    "phone_type": "mobile"
}
```

#### 3. Worklist Management

**Create new worklist item:**

```http
POST /api/worklist/
{
    "id_auth_user": 1,
    "id_modality": 2,
    "status": "scheduled",
    "scheduled_date": "2025-04-01"
}
```

**Update worklist status:**

```http
PUT /api/worklist/5
{
    "status": "completed"
}
```

#### 4. Medical Records

**Add medical record:**

```http
POST /api/medical_record/
{
    "id_auth_user": 1,
    "diagnosis": "Myopia",
    "treatment": "Prescription glasses",
    "notes": "Regular checkup"
}
```

#### 5. Patient Visit History

The system stores medical information across several specialized tables (ant_biom, post_biom, ccx, soap, etc.). To get a patient's last visit:

```http
# Get patient's auth_user ID
GET /api/auth_user?first_name=John&last_name=Doe

# Get most recent worklist entry
GET /api/worklist?id_auth_user=123&@orderby=~created_on&@limit=1
```

#### 6. Glasses Prescription

To get a patient's most recent glasses prescription from the `glasses_rx_list` table:

```http
# Get patient's auth_user ID
GET /api/auth_user?first_name=John&last_name=Doe

# Get most recent glasses prescription (assuming ID=123)
GET /api/glasses_rx_list?id_auth_user=123&@orderby=~datestamp&@limit=1
```

The prescription data is stored in the `pdf_report` field as a JSON string. You'll need to:

1. Extract the base64-encoded JSON string from `pdf_report`
2. Decode the base64 string
3. Parse the resulting JSON to access prescription details including:
   - Far/intermediate/near vision parameters for both eyes
   - Additional features (prisms, tint, photochromic)
   - Prescription metadata (date, doctor, etc.)

#### 7. Contact Lenses Prescription

To get a patient's most recent contact lenses prescription:

```http
# Get patient's auth_user ID
GET /api/auth_user?first_name=John&last_name=Doe

# Get most recent contact lenses prescription (assuming ID=123)
GET /api/contacts_rx_list?id_auth_user=123&@orderby=~datestamp&@limit=1
```

The contact lens prescription data is stored in the `pdf_report` field as a JSON string, similar to glasses prescriptions. The data includes:

- Lens specifications (name, material, design, base curve, diameter)
- Vision parameters for both eyes
- Cleaning solution recommendations
- Special features (spheric/toric, soft/rigid, iris/pupil)

#### 8. Medical Certificates

To get a patient's certificates:

```http
# Get patient's auth_user ID
GET /api/auth_user?first_name=John&last_name=Doe

# Get certificates within a date range
GET /api/certificates?id_auth_user=123&onset>=2024-01-01&ended<=2024-12-31

# Get most recent certificate
GET /api/certificates?id_auth_user=123&@orderby=~datestamp&@limit=1
```

The certificate data is stored in the `pdf_report` field as a JSON string. Each certificate includes:

- Certificate category
- Validity period (onset and ended dates)
- Certificate content and metadata
- Digital signature information

### Error Handling

The API implements comprehensive error handling:

1. **Validation Errors** (400 Bad Request)
   - Invalid data format
   - Missing required fields
   - Invalid field values

2. **Authentication Errors** (401 Unauthorized)
   - Missing or invalid session
   - Expired authentication

3. **Permission Errors** (403 Forbidden)
   - Insufficient privileges
   - Role-based access violations

4. **Not Found Errors** (404 Not Found)
   - Record not found
   - Invalid table name

### Best Practices

1. **Always validate input data** before sending to the API
2. **Use proper error handling** in client-side code
3. **Include CSRF token** in headers for POST, PUT, DELETE requests
4. **Implement proper security measures** when handling sensitive data
5. **Use appropriate content types** in requests (application/json)

### Special Endpoints

1. **UUID Generation**
   - `GET /api/uuid`
   - Generates a unique identifier
   - Returns JSON with UUID

2. **Belgium eID Card Reading**
   - `GET /api/beid`
   - Reads information from Belgium eID card
   - Returns JSON with card information and photo

3. **File Upload**
   - `POST /upload`
   - Accepts file uploads (.png, .jpg, .jpeg, .webp, .pdf)
   - Returns JSON with upload status

4. **Email Services**
   - `POST /api/email/send`
   - Sends regular HTML emails
   - Requires recipient, title, and content

   - `POST /api/email/send_with_attachment`
   - Sends emails with PDF attachments
   - Requires recipient, subject, content, and attachment data

## Code Documentation

### Core Functions

#### `rows2json(tablename, rows)`

```python
def rows2json(tablename, rows):
    """
    Converts a list of rows from a table into a JSON string.

    Args:
        tablename (str): The name of the table which the rows belong to
        rows (pandas.DataFrame): List-like object of rows to be converted

    Returns:
        str: JSON string containing the table data

    Raises:
        TypeError: If values are neither JSON serializable nor datetime objects
    """
```

#### `valid_date(datestring)`

```python
def valid_date(datestring):
    """
    Check if a given date string is valid.

    Args:
        datestring (str): Date string in 'YYYY-MM-DD' format

    Returns:
        bool: True if valid date, False otherwise
    """
```

### API Endpoints Documentation

#### Database API

```python
@action("api/<tablename>/", method=["GET", "POST", "PUT"])
@action("api/<tablename>/<rec_id>", method=["GET", "PUT", "DELETE"])
@action.uses(db, session)
def api(tablename, rec_id=None):
    """
    API endpoint for database operations.

    Args:
        tablename (str): Name of the table
        rec_id (int, optional): Record ID for specific operations

    Returns:
        str: JSON response from py4web

    Raises:
        ValueError: If values are not valid
        Exception: For other errors
    """
```

#### Email Service

```python
@action("api/email/send_with_attachment", method=["POST"])
def send_email_with_attachment():
    """
    Send email with PDF attachment.

    Required JSON payload:
        recipient (str): Email address
        attachmentData (str): Base64 encoded PDF
        attachmentName (str): Filename for attachment

    Optional JSON payload:
        subject (str): Email subject
        content (str): Email body
        sender_name (str): Name of sender

    Returns:
        JSON response with status and message
    """
```

## Architecture & Design

### Security Features

- Authentication required for database operations
- SMTP TLS encryption for emails
- File type validation for uploads
- Password handling for user updates

### Error Handling

- Comprehensive error logging
- HTTP status codes
- Detailed error messages in responses
- Exception handling for all operations

### Data Flow

1. Request validation
2. Authentication check
3. Operation execution
4. Response formatting
5. Error handling if needed

## Testing & Troubleshooting

### Common Issues

1. SMTP Connection Errors
   - Check server configuration
   - Verify credentials
   - Ensure proper port settings

2. File Upload Issues
   - Check file permissions
   - Verify allowed file types
   - Check file size limits

3. Database Operation Errors
   - Verify table existence
   - Check field validation
   - Ensure proper data types

### Logging

The module uses Python's logging system with the following levels:

- INFO: Normal operations
- ERROR: Operation failures
- WARNING: Non-critical issues

## Versioning & Changelog

### Version: 1.0.0

- Initial release with basic CRUD operations
- Belgium eID integration
- Email service with attachment support
- File upload functionality

### Future Improvements

1. Rate limiting implementation
2. Enhanced security features
3. Batch operation support
4. Extended file type support

## Browserless API Access

For automated tasks or backend integrations, you can access the REST API without a browser using Python requests. Here's a complete example script:

```python
import requests
import json

# Base configuration
BASE_URL = "http://localhost:8000/oph4py"  # Adjust to your server URL
SESSION = requests.Session()  # Use session to maintain cookies

def login(email, password):
    """Login to get session cookie"""
    login_url = f"{BASE_URL}/auth/api/login"
    login_data = {
        "email": email,
        "password": password
    }
    
    response = SESSION.post(
        login_url,
        json=login_data,
        headers={'Content-Type': 'application/json'}
    )
    
    if response.status_code == 200:
        print("Login successful")
        return True
    else:
        print(f"Login failed: {response.text}")
        return False

def api_request(endpoint, method='GET', data=None):
    """Make authenticated API request"""
    url = f"{BASE_URL}/api/{endpoint}"
    
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    
    # Get CSRF token if needed for POST/PUT/DELETE
    if method in ['POST', 'PUT', 'DELETE']:
        # Get CSRF token from session
        csrf_response = SESSION.get(f"{BASE_URL}/auth/api/status")
        if csrf_response.status_code == 200:
            csrf_token = csrf_response.json().get('csrf_token')
            headers['X-CSRF-Token'] = csrf_token

    response = SESSION.request(
        method=method,
        url=url,
        headers=headers,
        json=data
    )
    
    return response

def main():
    # 1. Login first
    if not login("your_email@example.com", "your_password"):
        return

    # 2. Example API calls
    try:
        # GET example - fetch users
        response = api_request('auth_user')
        if response.status_code == 200:
            print("Users:", json.dumps(response.json(), indent=2))
        
        # POST example - create new record
        new_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com"
        }
        response = api_request('auth_user', method='POST', data=new_data)
        if response.status_code == 200:
            print("Created:", response.json())
            
        # PUT example - update record
        update_data = {
            "first_name": "John Updated"
        }
        response = api_request('auth_user/1', method='PUT', data=update_data)
        if response.status_code == 200:
            print("Updated:", response.json())

    except requests.exceptions.RequestException as e:
        print(f"Error occurred: {e}")

if __name__ == "__main__":
    main()
```

### Additional Features

#### File Upload

```python
def upload_file(filepath):
    url = f"{BASE_URL}/upload"
    files = {'file': open(filepath, 'rb')}
    response = SESSION.post(url, files=files)
    return response
```

#### Email with Attachment

```python
def send_email_with_attachment(recipient, pdf_data):
    url = f"{BASE_URL}/api/email/send_with_attachment"
    data = {
        "recipient": recipient,
        "attachmentData": pdf_data,
        "attachmentName": "document.pdf"
    }
    response = api_request(url, method='POST', data=data)
    return response
```

### Best Practices for Browserless Access

1. **Security**
   - Store credentials securely (use environment variables)
   - Use SSL/TLS in production
   - Handle session expiration gracefully
   - Protect CSRF tokens

2. **Error Handling**

   ```python
   if response.status_code == 401:
       print("Authentication failed - try logging in again")
   elif response.status_code == 403:
       print("Permission denied")
   elif response.status_code >= 500:
       print("Server error:", response.text)
   ```

3. **Session Management**
   - Use `requests.Session()` for cookie persistence
   - Handle session timeouts
   - Implement retry logic for failed requests

4. **Rate Limiting**
   - Respect API rate limits
   - Implement backoff strategies
   - Monitor response headers for rate limit information

### Requirements

```bash
pip install requests
```

Remember to adjust the `BASE_URL` and credentials according to your environment.
