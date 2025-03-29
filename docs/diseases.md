# Diseases Controller Documentation

## Overview

The Diseases controller manages the disease reference system in the ophthalmology electronic medical records system. It handles disease catalog management, ICD coding, and clinical pathway tracking.

## File Structure

- `modalityCtr/diseases.html`: Main view template
- `static/js/diseases.js`: Core JavaScript functionality
- `static/js/diseases_bt.js`: Bootstrap table configurations and handlers

## Features

### 1. Disease Catalog Management

#### General Information

- Disease name management
- ICD-10 coding
- Disease classification
- Anatomical location

#### Clinical Details

- Signs and symptoms
- Diagnostic criteria
- Staging information
- Progression patterns

### 2. Clinical Management

- Treatment protocols
- Follow-up schedules
- Complication tracking
- Outcome monitoring

### 3. Disease Registry

#### Classification System

- ICD-10 mapping
- Anatomical classification
- Severity grading
- Stage tracking

#### Registry Management

- Disease prevalence
- Treatment outcomes
- Complication rates
- Research data

### 4. Clinical Guidelines

- Treatment protocols
- Investigation pathways
- Referral criteria
- Emergency management

## Technical Implementation

### Database Tables

The controller interacts with these database tables:

1. **Disease Reference**
   - `disease_ref`: Core disease catalog
   - `disease_class`: Disease classifications
   - `icd_codes`: ICD-10 mapping
   - `anatomical_loc`: Anatomical locations

2. **Clinical Management**
   - `treatment_protocol`: Standard treatments
   - `followup_schedule`: Follow-up protocols
   - `complication_reg`: Complication registry

### Key Components

#### 1. Bootstrap Tables

1. **Disease Catalog Table**
   - Displays disease database
   - Fields: name, ICD code, classification
   - Supports CRUD operations

2. **Treatment Protocol Table**
   - Shows standard treatments
   - Fields: disease, protocol, timeline
   - Evidence-based guidelines

3. **Outcome Registry Table**
   - Tracks treatment outcomes
   - Fields: disease, treatment, outcome
   - Statistical analysis support

### JavaScript Functions

#### Core Functions

1. **Data Formatting**

```javascript
function responseHandler_disease(res)
function formatICD(value, row, index)
function formatProtocol(value, row, index)
```

2. **Table Operations**

```javascript
function operateFormatter(value, row, index)
function detailFormatter(index, row)
```

## API Endpoints

```javascript
const API_DISEASES = HOSTURL + "/"+APP_NAME+"/api/disease_ref"
const API_PROTOCOLS = HOSTURL + "/"+APP_NAME+"/api/treatment_protocol"
```

## Usage Guidelines

1. **Disease Entry**
   - Complete disease information
   - Assign ICD codes
   - Set classifications
   - Define protocols

2. **Clinical Management**
   - Follow protocols
   - Track outcomes
   - Monitor complications
   - Update registry

## Error Handling

- Input validation
- Code verification
- Protocol checking
- Data consistency checks

## Security Considerations

1. **Access Control**
   - Role-based access
   - Audit logging
   - Change tracking
   - Version control

2. **Data Protection**
   - Input sanitization
   - Secure API calls
   - Data encryption
   - Backup procedures

## Dependencies

- Bootstrap Table
- jQuery
- ICD-10 database
- Clinical guidelines database

## Maintenance

Regular tasks include:

1. Updating disease database
2. Checking ICD codes
3. Updating protocols
4. Maintaining registry
5. Statistical analysis

## Conclusion

The Diseases Controller provides comprehensive disease management with:

1. Complete disease catalog
2. ICD-10 integration
3. Protocol management
4. Outcome tracking
5. Registry support
