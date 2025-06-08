# Allergy Controller Documentation

## Overview

The Allergy controller manages allergic agent references and patient allergy records in the ophthalmology electronic medical records system. It handles allergy catalog management, reaction tracking, and cross-sensitivity monitoring.

## File Structure

- `modalityCtr/allergy.html`: Main view template
- `static/js/controller/allergy.js`: Core JavaScript functionality
- `static/js/controller/allergy_bt.js`: Bootstrap table configurations and handlers

## Features

### 1. Allergic Agent Catalog

#### General Information

- Agent name management
- Agent classification
- Common reactions
- Cross-reactivity groups

#### Clinical Details

- Typical manifestations
- Severity levels
- Testing methods
- Prevention strategies

### 2. Patient Allergy Management

- Allergy history tracking
- Reaction documentation
- Severity assessment
- Alert system integration

### 3. Safety Features

#### Risk Assessment

- Cross-sensitivity checking
- Drug class alerts
- Severity prediction
- Emergency protocols

#### Alert Management

- Visual warning system
- Prescription blocking
- Emergency instructions
- Staff notifications

### 4. Clinical Applications

- Standard protocols
- Emergency procedures
- Documentation guidelines
- Patient education materials

## Technical Implementation

### Database Tables

The controller interacts with these database tables:

1. **Allergy Reference**
   - `allergic_agent`: Core allergen catalog
   - `agent_class`: Agent classifications
   - `reaction_type`: Reaction categories
   - `severity_level`: Severity classifications

2. **Patient Records**
   - `patient_allergy`: Individual allergy records
   - `allergy_history`: Historical reactions
   - `cross_sensitivity`: Cross-reactivity data

### Key Components

#### 1. Bootstrap Tables

1. **Allergen Catalog Table**
   - Displays allergen database
   - Fields: agent, class, common reactions
   - Supports CRUD operations

2. **Cross-Sensitivity Table**
   - Shows cross-reactivity relationships
   - Fields: primary agent, related agents, risk level
   - Color-coded risk levels

3. **Patient History Table**
   - Tracks allergy incidents
   - Fields: agent, reaction, severity, date
   - Timeline visualization

### JavaScript Functions

#### Core Functions

1. **Data Formatting**

```javascript
function responseHandler_allergy(res)
function formatSeverity(value, row, index)
function formatReaction(value, row, index)
```

2. **Table Operations**

```javascript
function operateFormatter(value, row, index)
function detailFormatter(index, row)
```

## API Endpoints

```javascript
const API_ALLERGY = HOSTURL + "/"+APP_NAME+"/api/allergic_agent"
const API_SENSITIVITY = HOSTURL + "/"+APP_NAME+"/api/cross_sensitivity"
```

## Usage Guidelines

1. **Allergen Entry**
   - Complete agent information
   - Classify reactions
   - Document cross-sensitivities
   - Set alert levels

2. **Patient Management**
   - Record reactions
   - Update severity levels
   - Monitor patterns
   - Maintain alerts

## Error Handling

- Input validation
- Cross-sensitivity checking
- Alert verification
- Data consistency checks

## Security Considerations

1. **Access Control**
   - Role-based access
   - Audit logging
   - Change tracking
   - Alert management

2. **Data Protection**
   - Input sanitization
   - Secure API calls
   - Alert encryption
   - Backup procedures

## Dependencies

- Bootstrap Table
- jQuery
- Alert system
- Cross-sensitivity database

## Maintenance

Regular tasks include:

1. Updating allergen database
2. Checking cross-sensitivities
3. Verifying alert systems
4. Updating classifications
5. Maintaining reaction records

## Conclusion

The Allergy Controller provides comprehensive allergy management with:

1. Complete allergen catalog
2. Cross-sensitivity monitoring
3. Alert system integration
4. Patient safety features
5. Clinical documentation support
