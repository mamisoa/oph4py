# INAMI/RIZIV Nomenclature FastAPI Server

This FastAPI application provides a REST API to search the Belgian healthcare tariff nomenclature database (`tarif_doctors.db`).

## Features

- 🔍 Search by nomenclature code prefix (minimum 3 digits, no maximum length)
- 📝 Search by description substring (French or Dutch)
- 💰 Filter by fee code
- 📄 Pagination support
- 🏥 Complete database field access
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

Run the test suite to validate functionality:

```bash
cd fastapi_nomenclature
python test_api.py
```

The test script validates:
- Database connectivity
- Configuration settings
- Sample search scenarios
- Data retrieval functionality

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

### Version 1.0.1 - Recent Improvements

- **Enhanced Nomenclature Code Search**: Removed 3-digit limitation, now accepts any length prefix (minimum 3 digits)
- **Bug Fixes**: 
  - Fixed root endpoint validation error
  - Resolved count query issues in search endpoint
  - Improved error handling and response formatting
- **Performance**: Optimized query building and pagination logic
- **Documentation**: Updated examples and parameter descriptions
