# Active Context - Nomenclature Codes CRUD Management

## Project Overview

Creating a comprehensive CRUD view for managing Belgian healthcare nomenclature codes using:

- **py4web framework** with existing template structure
- **FastAPI server** at `https://nomen.c66.ovh` for data operations
- **Bootstrap-table** for advanced table functionality
- **Vanilla JS** primary, jQuery only where needed for bootstrap-table

## Implementation Plan - Logical Steps

### Step 1: py4web Controller Setup

**File**: `codes.py`

- [ ] Create new controller file with proper py4web imports:
  - `from py4web import URL, action, redirect, response`
  - `from .common import auth, db, session`
  - `from .settings import APP_NAME, ASSETS_FOLDER, ENV_STATUS, LOCAL_URL, NEW_INSTALLATION, TIMEOFFSET`
- [ ] Create main codes listing action with authentication
- [ ] Set up route: `/codes` for the main view
- [ ] Configure template usage and context variables
- [ ] Add any helper functions needed for the view

### Step 2: HTML Template Foundation

**File**: `templates/manage/codes.html`

- [ ] Extend py4web layout: `[[extend 'layout.html']]`
- [ ] Create page header with title
- [ ] Add search toolbar section
- [ ] Create bootstrap-table container with proper data attributes
- [ ] Include create new code button
- [ ] Add modal structure for create/edit operations

### Step 3: Bootstrap-Table Configuration

**File**: `static/js/manage/codes_bt.js`

- [ ] Configure server-side pagination
- [ ] Define main columns with formatters:
  - `nomen_code` - Simple display
  - `nomen_desc_fr` & `nomen_desc_nl` - Truncated with tooltips
  - `fee` - Formatted currency
  - Actions - Edit/Delete buttons
- [ ] Implement detail view formatter for additional fields
- [ ] Configure search integration
- [ ] Set up pagination parameters
- [ ] Define column events for action buttons

### Step 4: Main Application Logic

**File**: `static/js/manage/codes.js`

- [ ] Initialize API base URL configuration
- [ ] Create modal management functions (show/hide/reset)
- [ ] Implement form validation logic
- [ ] Create API wrapper functions:
  - `searchCodes()` - GET /tarifs/search
  - `createCode()` - POST /tarifs/codes
  - `updateCode()` - PUT /tarifs/codes/{id}
  - `deleteCode()` - DELETE /tarifs/codes/{id}
- [ ] Implement error handling and user feedback using `displayToast`
- [ ] Add loading states during operations

### Step 5: CRUD Operations Implementation

**Create Functionality:**

- [ ] New code button event handler
- [ ] Form validation (required fields, formats)
- [ ] API call with error handling
- [ ] Table refresh after creation
- [ ] Success/error notifications using `displayToast`

**Read/Search Functionality:**

- [ ] Bootstrap-table data loading
- [ ] Search integration with API
- [ ] Pagination handling
- [ ] Detail view expansion

**Update Functionality:**

- [ ] Edit button event handler
- [ ] Pre-populate modal form with existing data
- [ ] Form validation for updates
- [ ] API call with error handling
- [ ] Table refresh after update

**Delete Functionality:**

- [ ] Delete button event handler
- [ ] Bootbox confirmation dialog
- [ ] API call for deletion
- [ ] Table refresh after deletion

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
- [ ] **Next**: Begin Step 1 - py4web Controller Setup
