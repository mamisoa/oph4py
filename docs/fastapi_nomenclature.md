# INAMI/RIZIV Nomenclature FastAPI Server

This FastAPI application provides a REST API to search the Belgian healthcare tariff nomenclature database (`tarif_doctors.db`).

## Features

- 🔍 Search by nomenclature code prefix (minimum 3 digits, no maximum length)
- 📝 Search by description substring (French or Dutch)
- 💰 Filter by fee code
- 📄 Pagination support
- 🏥 Complete database field access
- ➕ Create new nomenclature codes (POST endpoint)
- ✏️ Update existing nomenclature codes (PUT endpoint)
- 🗑️ Delete nomenclature codes (DELETE endpoint)
- 📊 Health check endpoint
- 📚 Interactive API documentation
- ⚙️ Environment-based configuration
- 🛡️ Comprehensive error handling

## Installation

Ensure you have the required dependencies installed:

```bash
# From the project root
pip install fastapi uvicorn
```

## Usage

### Running the Server

From the project root:

```bash
python fastapi_nomenclature/run_server.py
```

Or from within the `fastapi_nomenclature` directory:

```bash
cd fastapi_nomenclature
python run_server.py
```

The server will start on `https://nomen.c66.ovh` by default.

### API Documentation

Once the server is running, you can access:

- **Interactive API Documentation (Swagger UI)**: `https://nomen.c66.ovh/docs`
- **Alternative Documentation (ReDoc)**: `https://nomen.c66.ovh/redoc`
- **Health Check**: `https://nomen.c66.ovh/health`

## API Endpoints

### Root Endpoint

```api
GET /
```

Returns basic API information.

### Routes Introspection

```api
GET /routes
```

Returns ultra-detailed information about all registered API routes including complete schemas, validation rules, and examples.

#### Features

- **Complete Route Discovery**: All registered endpoints with methods, paths, and parameters
- **Ultra-Detailed Schemas**: Full JSON schemas for request/response models with validation rules
- **API Statistics**: Route counts, parameter types, validation summaries
- **Model Definitions**: Complete Pydantic model schemas for all endpoints
- **OpenAPI Integration**: Full OpenAPI 3.1 schema extraction and processing
- **Error Handling**: Graceful fallback for problematic routes or schemas

#### Response Structure

```json
{
  "total_routes": 8,
  "total_endpoints": 8,
  "routes": [
    {
      "path": "/tarifs/codes",
      "path_regex": "^/tarifs/codes$",
      "methods": [
        {
          "method": "POST",
          "summary": "Create Nomenclature Code",
          "description": "Create a new nomenclature code in the database...",
          "operation_id": "create_nomenclature_code_tarifs_codes_post",
          "request_schema": {
            "type": "object",
            "properties": {
              "nomen_code": {
                "type": "integer",
                "title": "Nomen Code",
                "description": "Unique nomenclature code identifier"
              }
            },
            "required": ["nomen_code"]
          },
          "response_schemas": {
            "201": {
              "schema": {...},
              "description": "Successful Response"
            },
            "400": {
              "schema": {...},
              "description": "Validation error"
            }
          },
          "parameters": [],
          "validation_rules": {
            "nomen_code": {
              "required": true,
              "type": "integer",
              "custom_validation": "Nomenclature code must be positive"
            }
          }
        }
      ],
      "tags": [],
      "name": "create_nomenclature_code",
      "include_in_schema": true
    }
  ],
  "api_info": {
    "title": "INAMI/RIZIV Nomenclature API",
    "version": "1.0.1",
    "openapi_version": "3.1.0",
    "docs_url": "/docs",
    "redoc_url": "/redoc"
  },
  "route_statistics": {
    "total_methods": 8,
    "methods_count": {"GET": 5, "POST": 1, "PUT": 1, "DELETE": 1},
    "total_parameters": 7,
    "parameter_types": {"string": 3, "integer": 4},
    "routes_with_request_body": 3,
    "routes_with_path_params": 3,
    "routes_with_query_params": 1
  },
  "model_definitions": {
    "CreateCodeRequest": {
      "type": "object",
      "properties": {
        "nomen_code": {"type": "integer", "title": "Nomen Code"},
        "nomen_desc_nl": {"type": "string", "default": "Add description here"}
      },
      "required": ["nomen_code"]
    }
  },
  "validation_summary": {
    "total_validation_rules": 15,
    "required_fields_count": 8,
    "optional_fields_count": 67,
    "validated_types": ["integer", "string", "number", "boolean"]
  },
  "generated_at": "2025-01-15T14:17:00.190751",
  "schema_version": "1.0"
}
```

#### Use Cases

- **API Discovery**: Programmatically explore available endpoints and capabilities
- **Client Generation**: Generate type-safe clients from complete schemas
- **Documentation**: Auto-generate comprehensive API documentation
- **Testing**: Create exhaustive test suites based on schemas and validation rules
- **Integration**: Understand API contracts for system integration
- **Development**: Debug and understand API structure during development

#### Example Request

```bash
curl "https://nomen.c66.ovh/routes"
```

### Search Tariffs

```api
GET /tarifs/search
```

Search tariffs based on various criteria.

#### Query Parameters

| Parameter               | Type    | Required | Description                                                    |
| ----------------------- | ------- | -------- | -------------------------------------------------------------- |
| `nomen_code_prefix`     | string  | No       | Nomenclature code prefix (minimum 3 digits, regex: `^[0-9]+$`) |
| `description_substring` | string  | No       | Substring to search in descriptions (min 3 chars)              |
| `feecode`               | integer | No       | Fee code for filtering results                                 |
| `limit`                 | integer | No       | Max results to return (1-1000, default: 100)                   |
| `offset`                | integer | No       | Number of results to skip (default: 0)                         |

**Note**: At least one search criterion must be provided.

#### Example Requests

Search by nomenclature code prefix (3 digits):

```bash
curl "https://nomen.c66.ovh/tarifs/search?nomen_code_prefix=105"
```

Search by longer nomenclature code prefix (4+ digits):

```bash
curl "https://nomen.c66.ovh/tarifs/search?nomen_code_prefix=1057"
curl "https://nomen.c66.ovh/tarifs/search?nomen_code_prefix=105755"
```

Search by description (case-insensitive):

```bash
curl "https://nomen.c66.ovh/tarifs/search?description_substring=consultation"
```

Search by fee code:

```bash
curl "https://nomen.c66.ovh/tarifs/search?feecode=0"
```

Combined search with pagination:

```bash
curl "https://nomen.c66.ovh/tarifs/search?nomen_code_prefix=105&description_substring=oph&limit=50&offset=0"
```

Advanced search with specific nomenclature code and fee code:

```bash
curl "https://nomen.c66.ovh/tarifs/search?nomen_code_prefix=1057&feecode=1600&limit=25"
```

#### Response Format

```json
{
  "data": [
    {
      "nomen_code": 105755,
      "nomen_desc_nl": "Raadpleging in de spreekkamer...",
      "nomen_desc_fr": "Consultation au cabinet...",
      "dbegin_fee": "2025-01-01 00:00:00",
      "dend_fee": "2999-12-31 00:00:00",
      "fee_code_cat": 1,
      "fee_code_cat_desc_nl": "Honoraria en prijzen",
      "fee_code_cat_desc_fr": "Honoraires et prix",
      "feecode": 0,
      "fee_code_desc_nl": "Honorarium",
      "fee_code_desc_fr": "Honoraire",
      "fee": 32.85,
      "nomen_grp_n": "N01",
      "AUTHOR_DOC": "OA2024_400",
      "nomen_grp_n_desc_nl": "Raadplegingen, bezoeken en adviezen van artsen",
      "nomen_grp_n_desc_fr": "Consultations, visites et avis de médecins",
      "dbegin_key_letter_value": "01/01/2025",
      "key_letter1": "N",
      "key_letter_index1": "N265",
      "key_coeff1": "8",
      "key_letter1_value": "3,372107",
      "key_letter2": "Q",
      "key_letter_index2": "Q124",
      "key_coeff2": "30",
      "key_letter2_value": "0,195645",
      "key_letter3": null,
      "key_letter_index3": null,
      "key_coeff3": null,
      "key_letter3_value": null
    }
  ],
  "pagination": {
    "total": 1234,
    "limit": 100,
    "offset": 0,
    "returned": 100,
    "has_more": true
  },
  "filters": {
    "nomen_code_prefix": "105",
    "description_substring": null,
    "feecode": null
  }
}
```

### Health Check

```api
GET /health
```

Returns server health status and database connectivity.

### Fee Codes

```api
GET /tarifs/feecodes
```

Returns a complete list of all unique fee codes available in the database.

### Create Nomenclature Code

```api
POST /tarifs/codes
```

Create a new nomenclature code in the database.

#### Response Format

```json
{
  "data": [
    {
      "feecode": 0,
      "description_nl": "Honorarium",
      "description_fr": "Honoraire"
    },
    {
      "feecode": 1,
      "description_nl": "Tegemoetkoming",
      "description_fr": "Intervention"
    }
  ],
  "total": 683,
  "message": "Found 683 unique fee codes"
}
```

#### Usage Examples

Get all fee codes:

```bash
curl "https://nomen.c66.ovh/tarifs/feecodes"
```

Use in web browser:

```bash
https://nomen.c66.ovh/tarifs/feecodes
```

#### Features

- **Complete List**: Returns all unique fee codes from the database
- **Bilingual Descriptions**: Includes both Dutch/Flemish and French descriptions
- **Ordered Results**: Fee codes are sorted numerically for consistent output
- **Metadata**: Includes total count and descriptive message
- **Fast Response**: Optimized query for quick retrieval

#### Common Fee Codes

Some frequently used fee codes include:

- **0**: Standard honorarium/fees
- **1300**: Preferential regime reimbursement
- **1600**: General regime reimbursement
- **3000-3999**: Specialized medical procedures
- **7000-7999**: Technical and laboratory services

This endpoint is useful for:

- Building dropdown lists in user interfaces
- Understanding available fee code options
- Validating fee codes before searches
- API discovery and integration

#### Request Body

The POST endpoint accepts JSON data with the following structure:

**Required Fields:**

- `nomen_code` (integer): Unique nomenclature code identifier

**Optional Fields with Defaults:**

- `nomen_desc_nl` (string): Dutch/Flemish description (default: "Add description here")
- `nomen_desc_fr` (string): French description (default: "Add description here")
- `dbegin_fee` (datetime): Validity start date (default: current date)
- `dend_fee` (datetime): Validity end date (default: 2099-12-31)
- `fee` (float): Fee amount in euros (default: 0.0)
- `fee_code_cat` (integer): Fee code category 1-14,99 (default: 4)
- `feecode` (integer): Fee code (default: 1600)
- `nomen_grp_n` (string): Nomenclature group (default: "")

**Validation Rules:**

- At least one description (Dutch or French) must be provided with actual content
- Nomenclature code must be unique and positive
- Fee cannot be negative
- Fee code category must be valid: [1,2,3,4,5,6,7,8,9,11,12,13,14,99]

#### Example Requests

**Minimal request (only nomenclature code):**

```bash
curl -X POST "https://nomen.c66.ovh/tarifs/codes" \
  -H "Content-Type: application/json" \
  -d '{"nomen_code": 999001}'
```

**Note:** This will fail validation as no actual description is provided.

**Minimal valid request:**

```bash
curl -X POST "https://nomen.c66.ovh/tarifs/codes" \
  -H "Content-Type: application/json" \
  -d '{
    "nomen_code": 999001,
    "nomen_desc_nl": "Nieuwe consultatie"
  }'
```

**Complete request:**

```bash
curl -X POST "https://nomen.c66.ovh/tarifs/codes" \
  -H "Content-Type: application/json" \
  -d '{
    "nomen_code": 999002,
    "nomen_desc_nl": "Nieuwe consultatie",
    "nomen_desc_fr": "Nouvelle consultation",
    "fee": 35.50,
    "fee_code_cat": 1,
    "feecode": 0,
    "nomen_grp_n": "N01"
  }'
```

**Request with custom dates:**

```bash
curl -X POST "https://nomen.c66.ovh/tarifs/codes" \
  -H "Content-Type: application/json" \
  -d '{
    "nomen_code": 999003,
    "nomen_desc_nl": "Consultatie met aangepaste periode",
    "dbegin_fee": "2025-01-01T00:00:00",
    "dend_fee": "2030-12-31T00:00:00",
    "fee": 40.00
  }'
```

#### Response Format

**Success Response (201):**

```json
{
  "success": true,
  "message": "Nomenclature code 999001 created successfully",
  "nomen_code": 999001,
  "created_at": "2025-01-15T10:30:45.123456"
}
```

**Error Responses:**

**Validation Error (400):**

```json
{
  "success": false,
  "error": "At least one description (Dutch or French) must be provided with actual content"
}
```

**Conflict Error (409):**

```json
{
  "success": false,
  "error": "Nomenclature code 999001 already exists"
}
```

**Database Error (500):**

```json
{
  "success": false,
  "error": "Database error: [specific error message]"
}
```

### Update Nomenclature Code

```api
PUT /tarifs/codes/{nomen_code}
```

Update an existing nomenclature code with partial field updates.

#### Path Parameters

| Parameter    | Type    | Required | Description                     |
| ------------ | ------- | -------- | ------------------------------- |
| `nomen_code` | integer | Yes      | The nomenclature code to update |

#### Request Body

The PUT endpoint accepts JSON data with optional fields for partial updates. All fields from the POST endpoint are supported, but **none are required**.

**Available Fields** (all optional):

- `nomen_desc_nl` (string): Dutch/Flemish description
- `nomen_desc_fr` (string): French description
- `dbegin_fee` (datetime): Validity start date
- `dend_fee` (datetime): Validity end date
- `fee` (float): Fee amount in euros (≥ 0)
- `fee_code_cat` (integer): Fee code category [1,2,3,4,5,6,7,8,9,11,12,13,14,99]
- `feecode` (integer): Fee code
- `nomen_grp_n` (string): Nomenclature group
- Key letter fields (`key_letter1-3`, `key_letter_index1-3`, etc.)
- Additional description fields (`fee_code_desc_nl`, `fee_code_desc_fr`, etc.)

**Validation Rules:**

- Target nomenclature code must exist (404 if not found)
- At least one field must be provided for update
- If updating descriptions, at least one valid description must remain
- Fee cannot be negative
- Fee code category must be valid

#### Example Requests

**Update single field:**

```bash
curl -X PUT "https://nomen.c66.ovh/tarifs/codes/999001" \
  -H "Content-Type: application/json" \
  -d '{"nomen_desc_nl": "Updated Dutch description"}'
```

**Update multiple fields:**

```bash
curl -X PUT "https://nomen.c66.ovh/tarifs/codes/999001" \
  -H "Content-Type: application/json" \
  -d '{
    "nomen_desc_nl": "Updated Dutch description",
    "nomen_desc_fr": "Updated French description",
    "fee": 45.75,
    "fee_code_cat": 2
  }'
```

**Update dates and key letters:**

```bash
curl -X PUT "https://nomen.c66.ovh/tarifs/codes/999001" \
  -H "Content-Type: application/json" \
  -d '{
    "dbegin_fee": "2025-01-01T00:00:00",
    "dend_fee": "2030-12-31T23:59:59",
    "key_letter1": "N",
    "key_letter_index1": "N265"
  }'
```

#### Response Format

**Success Response (200):**

```json
{
  "success": true,
  "message": "Nomenclature code 999001 updated successfully",
  "nomen_code": 999001,
  "updated_at": "2025-01-15T14:30:45.123456",
  "updated_fields": ["nomen_desc_nl", "fee", "fee_code_cat"]
}
```

**Error Responses:**

**Not Found (404):**

```json
{
  "success": false,
  "detail": "Nomenclature code 999001 not found"
}
```

**Validation Error (400):**

```json
{
  "success": false,
  "detail": "No fields provided for update"
}
```

**Validation Error (422):**

```json
{
  "detail": [
    {
      "loc": ["body", "fee"],
      "msg": "Fee cannot be negative",
      "type": "value_error"
    }
  ]
}
```

### Delete Nomenclature Code

```api
DELETE /tarifs/codes/{nomen_code}
```

Delete an existing nomenclature code from the database.

**⚠️ Warning**: This operation cannot be undone. The nomenclature code and all associated data will be permanently removed.

#### Path Parameters

| Parameter    | Type    | Required | Description                     |
| ------------ | ------- | -------- | ------------------------------- |
| `nomen_code` | integer | Yes      | The nomenclature code to delete |

#### Example Requests

**Delete nomenclature code:**

```bash
curl -X DELETE "https://nomen.c66.ovh/tarifs/codes/999001"
```

**Delete with verification:**

```bash
# First verify the code exists
curl "https://nomen.c66.ovh/tarifs/search?nomen_code_prefix=999001"

# Then delete it
curl -X DELETE "https://nomen.c66.ovh/tarifs/codes/999001"

# Verify deletion
curl "https://nomen.c66.ovh/tarifs/search?nomen_code_prefix=999001"
```

#### Response Format

**Success Response (200):**

```json
{
  "success": true,
  "message": "Nomenclature code 999001 deleted successfully",
  "deleted_nomen_code": 999001,
  "deleted_at": "2025-01-15T14:30:45.123456"
}
```

**Error Responses:**

**Not Found (404):**

```json
{
  "success": false,
  "detail": "Nomenclature code 999001 not found"
}
```

**Database Error (500):**

```json
{
  "success": false,
  "detail": "Database error: [specific error message]"
}
```

## Configuration

The server can be configured using environment variables:

| Variable        | Default               | Description                 |
| --------------- | --------------------- | --------------------------- |
| `DATABASE_PATH` | `../tarif_doctors.db` | Path to the SQLite database |
| `API_HOST`      | `0.0.0.0`             | Server host                 |
| `API_PORT`      | `8000`                | Server port                 |
| `DEBUG`         | `false`               | Enable debug mode           |

Example:

```bash
export DATABASE_PATH="/path/to/tarif_doctors.db"
export API_PORT=8080
export DEBUG=true
python run_server.py
```

## Database Fields

The API returns all fields from the `tarif_doctors` table:

- **Identification**: `nomen_code`, `feecode`, `nomen_grp_n`
- **Descriptions**: `nomen_desc_nl`, `nomen_desc_fr`, `fee_code_desc_nl`, `fee_code_desc_fr`
- **Categories**: `fee_code_cat`, `fee_code_cat_desc_nl`, `fee_code_cat_desc_fr`
- **Dates**: `dbegin_fee`, `dend_fee`, `dbegin_key_letter_value`
- **Fees**: `fee`
- **Key Letters**: `key_letter1-3`, `key_letter_index1-3`, `key_coeff1-3`, `key_letter1-3_value`
- **Groups**: `nomen_grp_n_desc_nl`, `nomen_grp_n_desc_fr`
- **Metadata**: `AUTHOR_DOC`

## Search Features

### Nomenclature Code Prefix Search

- **Flexible Length**: Accepts minimum 3 digits with no maximum length
- **Examples**: `105`, `1057`, `105755`, `1057551`
- **Use Cases**:
  - Broad search: `105` (all codes starting with 105)
  - Specific search: `105755` (exact code match or close matches)
  - Category search: `1057` (specific procedure category)

### Description Search

- **Bilingual**: Searches both Dutch (`nomen_desc_nl`) and French (`nomen_desc_fr`) descriptions
- **Case-insensitive**: Automatically handles case variations
- **Partial matching**: Uses substring matching with wildcards
- **Examples**: `consultation`, `oph`, `chirurgie`

### Fee Code Filtering

- **Exact match**: Filters by specific fee codes
- **Common fee codes**: `0` (standard), `1600` (general regime), `1300` (preferential regime)
- **Combine with other filters**: Can be used with nomenclature prefix and description searches

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (missing search criteria)
- `422`: Validation Error (invalid parameters)
- `500`: Internal Server Error
- `503`: Service Unavailable (database connection issues)

## Testing

### Comprehensive Test Suites

Run the comprehensive test suites for all CRUD endpoints:

```bash
# Clean up any existing test data first
python fastapi_nomenclature/cleanup_test_records.py

# Run all test suites
python fastapi_nomenclature/test_create_endpoint.py   # POST tests
python fastapi_nomenclature/test_update_endpoint.py   # PUT tests  
python fastapi_nomenclature/test_delete_endpoint.py   # DELETE tests
```

### Test Coverage

#### POST Endpoint Tests (`test_create_endpoint.py`)

- **Success Tests (5)**: Valid record creation scenarios
  - Complete request with all fields
  - Dutch description only
  - French description only
  - Custom date ranges
  - Key letter information
- **Validation Tests (5)**: Error handling scenarios
  - Missing descriptions (validation error)
  - Duplicate nomenclature codes (conflict error)
  - Invalid fee code categories (validation error)
  - Negative fees (validation error)

#### PUT Endpoint Tests (`test_update_endpoint.py`)

- **Success Tests (4)**: Valid update scenarios
  - Single field update (description)
  - Multiple fields update
  - Date fields update
  - Key letter fields update
- **Validation Tests (4)**: Error handling scenarios
  - Update non-existent code (404 error)
  - Invalid fee validation (negative values)
  - Invalid fee code category validation
  - No fields provided validation

#### DELETE Endpoint Tests (`test_delete_endpoint.py`)

- **Success Tests (2)**: Valid deletion scenarios
  - Delete existing user-created code
  - Delete with response verification
- **Validation Tests (2)**: Error handling scenarios
  - Delete non-existent code (404 error)
  - Delete same code twice (double deletion)

### Test Results

Expected output after cleanup for each test suite:

**POST Tests:**
```
📊 TEST SUMMARY:
   Total Tests: 10
   ✅ Passed: 10
   ❌ Failed: 0
   📈 Success Tests: 5 (expected to create records)
   🔒 Validation Tests: 5 (expected to fail)

🎉 ALL TESTS PASSED! The POST endpoint is working correctly.
```

**PUT Tests:**
```
📊 PUT ENDPOINT TEST SUMMARY:
   Total Tests: 8
   ✅ Passed: 8
   ❌ Failed: 0
   📈 Success Tests: 4 (expected to update records)
   🔒 Validation Tests: 4 (expected to fail)

🎉 ALL TESTS PASSED! The PUT endpoint is working correctly.
```

**DELETE Tests:**
```
📊 DELETE ENDPOINT TEST SUMMARY:
   Total Tests: 4
   ✅ Passed: 4
   ❌ Failed: 0
   📈 Success Tests: 2 (expected to delete records)
   🔒 Validation Tests: 2 (expected to fail)

🎉 ALL TESTS PASSED! The DELETE endpoint is working correctly.
```

### Cleanup Utility

The cleanup script (`cleanup_test_records.py`) removes test records (999xxx and 998xxx range) from the database:

```bash
python fastapi_nomenclature/cleanup_test_records.py
```

This ensures clean testing environment by removing any previously created test data.

## Development

To run in development mode with auto-reload:

```bash
export DEBUG=true
python run_server.py
```

This enables:

- Auto-reload on code changes
- Debug logging
- Detailed error messages

## Recent Updates

### Version 1.2.0 - Complete CRUD Operations ✨ NEW

- **PUT Endpoint**: Update existing nomenclature codes with partial field updates
  - All fields optional for flexible partial updates
  - Comprehensive validation (field-level, existence checks, business rules)
  - Detailed response with updated fields list
- **DELETE Endpoint**: Delete nomenclature codes with validation
  - Existence validation before deletion
  - Confirmation response with deletion details
  - Permanent removal with warning messages
- **Enhanced Models**: New Pydantic models for update and delete operations
- **Complete Test Coverage**: 22 total tests across all CRUD operations
  - 8 PUT endpoint tests (4 success + 4 validation)
  - 4 DELETE endpoint tests (2 success + 2 validation)
  - Comprehensive error handling validation
- **Updated Documentation**: Complete API reference with examples for all endpoints

### Version 1.0.1 - Recent Improvements

- **Enhanced Nomenclature Code Search**: Removed 3-digit limitation, now accepts any length prefix (minimum 3 digits)
- **Bug Fixes**:
  - Fixed root endpoint validation error
  - Resolved count query issues in search endpoint
  - Improved error handling and response formatting
- **Performance**: Optimized query building and pagination logic
- **Documentation**: Updated examples and parameter descriptions
