# Combo Controller Documentation

## Overview

The Combo Controller manages the relationship between medical procedures and their associated modalities in the ophthalmology system. It provides a way to define which modalities are available for specific procedures, enabling flexible workflow configurations.

## Architecture

### Database Schema

```sql
CREATE TABLE combo (
    id INTEGER PRIMARY KEY,
    id_procedure INTEGER REFERENCES procedure(id),
    id_modality INTEGER REFERENCES modality(id),
    created_on DATETIME,
    created_by INTEGER REFERENCES auth_user(id),
    modified_on DATETIME,
    modified_by INTEGER REFERENCES auth_user(id),
    is_active BOOLEAN
)
```

### Components

1. **Controller (`manage/combo`):**
   - Handles the main combo management interface
   - Provides dropdown options for procedures and modalities
   - Manages session and database interactions

2. **View (`combo.html`):**
   - Presents a form interface for creating procedure-modality combinations
   - Displays existing combinations
   - Provides UI for managing these relationships

3. **Client-side Logic (`combo.js`):**
   - Handles form submissions
   - Manages CRUD operations through API calls
   - Provides real-time user feedback

## Workflow

1. **Initialization:**
   - Controller loads available procedures and modalities
   - Populates dropdown menus with formatted options
   - Sets up environment variables and session data

2. **Creation Process:**

   ```javascript
   $('#newComboForm').submit(function(e) {
       e.preventDefault();
       let procedure = $('#newComboForm select[name=id_procedure]').val();
       let modalities = $('#newComboForm select[name=id_modality]').val();
       // Creates a new combo entry for each selected modality
       for (modality of modalities) {
           let dataObj = {
               'id_procedure': procedure,
               'id_modality': modality
           };
           crudp('combo','0','POST',dataStr);
       }
   });
   ```

3. **API Integration:**
   - Uses RESTful endpoints for CRUD operations
   - Base URL: `HOSTURL + URL('api','combo')`
   - Supports multiple modality assignments per procedure

## Features

1. **Multiple Modality Selection:**
   - Users can select multiple modalities for a single procedure
   - Supports batch creation of combinations

2. **Dynamic Updates:**
   - Real-time feedback on successful operations
   - Error handling for failed operations

3. **Integration with Worklist:**
   - Combinations define available modalities in worklist creation
   - Affects procedure workflow options

## API Endpoints

1. **Create Combo:**
   - Method: POST
   - Endpoint: `/api/combo`
   - Payload:

     ```json
     {
         "id_procedure": "integer",
         "id_modality": "integer"
     }
     ```

2. **Delete Combo:**
   - Method: DELETE
   - Endpoint: `/api/combo/<id>`

## Security

- Requires active session
- Uses database authentication
- Implements signature tracking for audit purposes

## Dependencies

1. **Frontend:**
   - Bootstrap Table 1.22
   - jQuery
   - Bootbox
   - Custom utilities (useful.js)

2. **Backend:**
   - py4web framework
   - SQLite/PostgreSQL database
   - Authentication middleware

## Error Handling

1. **Client-side:**
   - Form validation
   - API response handling
   - User feedback through UI

2. **Server-side:**
   - Database constraint validation
   - Session verification
   - Data integrity checks

## Best Practices

1. **Creating Combinations:**
   - Select appropriate procedure first
   - Choose relevant modalities
   - Verify successful creation through UI feedback

2. **Maintenance:**
   - Regularly review unused combinations
   - Update combinations when adding new procedures/modalities
   - Maintain data consistency with worklist requirements

## Future Enhancements

1. **Suggested Improvements:**
   - Add batch deletion functionality
   - Implement combination priority ordering
   - Add filtering and search capabilities
   - Implement combo-bt.js for better table management

2. **Integration Opportunities:**
   - Link with procedure scheduling
   - Add modality availability checking
   - Implement workflow templates
