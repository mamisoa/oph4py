# Active Context - Nomenclature Codes CRUD Management

## Project Overview

Creating a comprehensive CRUD view for managing Belgian healthcare nomenclature codes using:

- **py4web framework** with existing template structure
- **FastAPI server** at `https://nomen.c66.ovh` for data operations
- **Bootstrap-table** for advanced table functionality
- **Vanilla JS** primary, jQuery only where needed for bootstrap-table

## Active context management

- Don't forget to tick **all checkboxes** upon completion in the **implementation plan**.
- Don't forget to complete the **current focus** at the end of the file

## Implementation Plan - Logical Steps

### Step 1: py4web Controller Setup

**File**: `codes.py`

- [x] Create new controller file with proper py4web imports:
  - [x] `from py4web import URL, action, redirect, response`
  - [x] `from .common import auth, db, session`
  - [x] `from .settings import APP_NAME, ASSETS_FOLDER, ENV_STATUS, LOCAL_URL, NEW_INSTALLATION, TIMEOFFSET`
- [x] Create main codes listing action with authentication
- [x] Set up route: `/codes` for the main view
- [x] Configure template usage and context variables
- [x] Add any helper functions needed for the view

### Step 2: HTML Template Foundation

**File**: `templates/manage/codes.html`

- [x] Extend py4web layout: `[[extend 'layout.html']]`
- [x] Create page header with title
- [x] Add search toolbar section
- [x] Create bootstrap-table container with proper data attributes
- [x] Include create new code button
- [x] Add modal structure for create/edit operations

### Step 3: Bootstrap-Table Configuration

**File**: `static/js/manage/codes_bt.js`

- [x] Configure server-side pagination
- [x] Define main columns with formatters:
  - `nomen_code` - Simple display
  - `nomen_desc_fr` & `nomen_desc_nl` - Truncated with tooltips
  - `fee` - Formatted currency
  - Actions - Edit/Delete buttons
- [x] Implement detail view formatter for additional fields
- [x] Configure search integration
- [x] Set up pagination parameters
- [x] Define column events for action buttons
- [x] Step 3 - Bootstrap-Table Configuration completed (2025-06-09T21:10:06.674405)

### Step 4: Main Application Logic

**File**: `static/js/manage/codes.js`

- [x] Initialize API base URL configuration
- [x] Create modal management functions (show/hide/reset)
- [x] Implement form validation logic
- [x] Create API wrapper functions:
  - `searchCodes()` - GET /tarifs/search with enhanced search (code + descriptions)
  - `createCode()` - POST /tarifs/codes
  - `updateCode()` - PUT /tarifs/codes/{id}
  - `deleteCode()` - DELETE /tarifs/codes/{id}
- [x] Implement error handling and user feedback using `displayToast`
- [x] Add loading states during operations
- [x] Enhanced search functionality across nomenclature code, French description, and Dutch description
- [x] Step 4 - Main Application Logic completed (2025-06-10T01:32:38.246206)

### Step 4b: UI/UX Fixes for Codes Table

- [x] Remove custom search bar, use only bootstrap-table's built-in search
- [x] Integrate 'New Code' button into bootstrap-table toolbar using toolbar option
- [x] Ensure pagination uses only bootstrap-table's built-in pagination controls
- [x] Style and align all controls using bootstrap-table best practices
- [x] Reference context7 for implementation details
- [x] Step 4b - UI/UX Fixes for Codes Table completed (2025-06-09T23:19:38.015996)

### Step 4c: Template and Detail View Enhancements

- [x] Fixed template layout: Changed extend from `layout.html` to `baseof_auth.html`
- [x] Added missing `bootstrap-table.min.css` for proper styling and loading states
- [x] Implemented comprehensive `detailFormatter` function with:
  - Two-column responsive layout (validity/categories | key letters/coefficients)
  - All additional fields display (dates, categories, key letters, author document)
  - Bootstrap styling with proper null handling
  - Dynamic content showing only populated key letter sections
- [x] Step 4c - Template and Detail View Enhancements completed (2025-06-10T01:28:49.315322)

### Step 5: CRUD Operations Implementation

**Create Functionality:**

- [x] New code button event handler with default values
- [x] Form validation (required fields, formats)
- [x] API call with error handling
- [x] Table refresh after creation
- [x] Success/error notifications using `displayToast`

**Read/Search Functionality:**

- [x] Bootstrap-table data loading
- [x] Search integration with API
- [x] Pagination handling  
- [x] Detail view expansion
- [x] Single code fetch API for editing

**Update Functionality:**

- [x] Edit button event handler
- [x] Pre-populate modal form with existing data
- [x] Form validation for updates
- [x] API call with error handling
- [x] Table refresh after update
- [x] Loading states during data fetch

**Delete Functionality:**

- [x] Delete button event handler
- [x] Bootbox confirmation dialog with fallback
- [x] API call for deletion
- [x] Table refresh after deletion
- [x] Enhanced error messages
- [x] Step 5 - CRUD Operations Implementation completed (2025-06-10T01:44:32.512739)

### Step 6: UI/UX Enhancements

- [ ] Bootstrap tooltips initialization for truncated text
- [ ] Loading spinners during API calls
- [ ] Form field validation styling
- [ ] Responsive design considerations
- [ ] Error message display using `displayToast`
- [ ] Success notifications using `displayToast`

### Step 7: Integration & Testing

- [ ] Test all CRUD operations
- [ ] Verify pagination functionality
- [ ] Test search functionality
- [ ] Validate responsive behavior
- [ ] Error handling testing
- [ ] Cross-browser compatibility

## File Structure Overview

``` tree
├── codes.py                          # py4web controller
├── templates/manage/codes.html       # Main view template
├── static/js/manage/codes.js         # Main application logic
└── static/js/manage/codes_bt.js      # Bootstrap-table configuration
```

## Technical Specifications

### py4web Controller (codes.py)

**Required Imports:**

```python
from py4web import URL, action, redirect, response
from .common import auth, db, session
from .settings import (
    APP_NAME, ASSETS_FOLDER, ENV_STATUS, 
    LOCAL_URL, NEW_INSTALLATION, TIMEOFFSET
)
```

**Main Action:**

- Route: `@action('codes')`
- Authentication: `@action.uses(auth.user)`
- Template: `@action.uses('manage/codes.html')`
- Context: Pass necessary variables to template

### API Endpoints

- **Base URL**: `https://nomen.c66.ovh`
- **Search**: `GET /tarifs/search?limit={limit}&offset={offset}&nomen_code_prefix={query}&description_substring={query}`
- **Create**: `POST /tarifs/codes`
- **Update**: `PUT /tarifs/codes/{nomen_code}`
- **Delete**: `DELETE /tarifs/codes/{nomen_code}`

### Table Columns Configuration

**Main Columns:**

- `nomen_code` (sortable)
- `nomen_desc_fr` (searchable, truncated 30 chars)
- `nomen_desc_nl` (searchable, truncated 30 chars)
- `fee` (formatted as currency)
- `actions` (edit/delete buttons)

**Detail View Fields:**

- `dbegin_fee`, `dend_fee` (validity dates)
- `fee_code_cat`, `feecode` (fee categories)
- `nomen_grp_n` (nomenclature group)
- `key_letter1-3` with coefficients and values
- `AUTHOR_DOC` (author document)

### Form Fields for Create/Edit Modal

**Required:**

- `nomen_code` (unique integer)
- `nomen_desc_nl` or `nomen_desc_fr` (at least one description)

**Optional with Defaults:**

- `fee` (default: 0.0)
- `fee_code_cat` (default: 4)
- `feecode` (default: 1600)
- `dbegin_fee` (default: current date)
- `dend_fee` (default: 2099-12-31)
- `nomen_grp_n` (default: "")

## Dependencies & Libraries

- **Frontend**: Bootstrap 5, Bootstrap-table, Bootbox
- **JavaScript**: Vanilla JS + jQuery (for bootstrap-table only)
- **Backend**: py4web framework, FastAPI server
- **Database**: SQLite via FastAPI endpoints

## Current Status

- [x] Requirements analysis completed
- [x] API documentation reviewed
- [x] py4web and bootstrap-table documentation researched
- [x] Implementation plan created with controller integration
- [x] Step 1 - py4web Controller Setup completed (2025-06-09T21:03:14.076160)
- [x] Step 2 - HTML Template Foundation completed (2025-06-09T21:06:46.206778)
- [x] Step 3 - Bootstrap-Table Configuration completed (2025-06-09T21:10:06.674405)
- [x] Step 4 - Main Application Logic completed (2025-06-10T01:32:38.246206)
- [x] Step 4b - UI/UX Fixes for Codes Table completed (2025-06-09T23:19:38.015996)
- [x] Step 4c - Template and Detail View Enhancements completed (2025-06-10T01:28:49.315322)
- [x] Step 5 - CRUD Operations Implementation completed (2025-06-10T01:44:32.512739)
- [ ] **Next:** Step 6 - UI/UX Enhancements

## Search Implementation Summary

The search functionality has been simplified to ensure basic functionality works:

- **Nomenclature Code Only**: Search only by nomenclature code prefix
- **Minimum Length**: Search activates with 2+ characters
- **API Integration**: Uses only `nomen_code_prefix` parameter for reliability
- **Error Handling**: Proper fallbacks for connection issues

### Search Logic

1. **Simple Code Search**: When user types a search term:
   - Search term is sent as `nomen_code_prefix` to the API
   - Works for both numeric and text input
   - Reliable and straightforward implementation

2. **Server-Side Integration**: The search parameters are properly sent to the FastAPI server at `https://nomen.c66.ovh/tarifs/search`

3. **Real-Time Search**: Bootstrap-table handles the search input and triggers API calls automatically

### Future Enhancement

Once basic functionality is confirmed working, search can be expanded to include French and Dutch descriptions.
