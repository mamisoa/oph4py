# Medications Controller Documentation

## Overview

The Medications controller manages the medication reference system in the ophthalmology electronic medical records system. It handles medication catalog management, prescription tracking, and drug interaction monitoring.

## File Structure

- `modalityCtr/medications.html`: Main view template
- `static/js/medications.js`: Core JavaScript functionality
- `static/js/medications_bt.js`: Bootstrap table configurations and handlers

## Features

### 1. Medication Catalog Management

#### General Information

- Medication name management
- Generic and brand name tracking
- Drug classification
- Dosage forms

#### Pharmaceutical Details

- Active ingredients
- Concentrations
- Available forms
- Route of administration

### 2. Prescription Management

- Dosage tracking
- Frequency monitoring
- Duration management
- Prescription history

### 3. Drug Safety

#### Interaction Checking

- Drug-drug interactions
- Contraindications
- Side effects
- Allergic reactions

#### Safety Monitoring

- Maximum dosage tracking
- Age restrictions
- Pregnancy categories
- Special precautions

### 4. Clinical Usage

- Common indications
- Standard dosing
- Treatment protocols
- Usage guidelines

## Technical Implementation

### Database Tables

The controller interacts with these database tables:

1. **Medication Reference**
   - `medic_ref`: Core medication catalog
   - `medic_class`: Medication classifications
   - `medic_form`: Available forms
   - `medic_route`: Administration routes

2. **Prescription Management**
   - `medic_rx`: Prescription records
   - `medic_history`: Usage history
   - `medic_interaction`: Drug interactions

### Key Components

#### 1. Bootstrap Tables

1. **Medication Catalog Table**
   - Displays medication database
   - Fields: name, generic name, class, form
   - Supports CRUD operations

2. **Drug Interaction Table**
   - Shows interaction matrix
   - Fields: primary drug, interacting drug, severity
   - Color-coded severity levels

3. **Usage History Table**
   - Tracks prescription patterns
   - Fields: frequency, common dosages, prescriber
   - Statistical analysis support

### JavaScript Functions

#### Core Functions

1. **Data Formatting**

```javascript
function responseHandler_med(res)
function formatDosage(value, row, index)
function formatInteraction(value, row, index)
```

2. **Table Operations**

```javascript
function operateFormatter(value, row, index)
function detailFormatter(index, row)
```

## API Endpoints

```javascript
const API_MEDICATIONS = HOSTURL + "/"+APP_NAME+"/api/medic_ref"
const API_INTERACTIONS = HOSTURL + "/"+APP_NAME+"/api/medic_interaction"
```

## Usage Guidelines

1. **Medication Entry**
   - Complete all required fields
   - Verify drug information
   - Check classifications
   - Update interaction data

2. **Safety Monitoring**
   - Review interactions
   - Check contraindications
   - Verify dosage limits
   - Monitor usage patterns

## Error Handling

- Input validation
- Interaction checking
- Dosage verification
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
- PDFMake
- Drug interaction database

## Maintenance

Regular tasks include:

1. Updating drug database
2. Checking interaction data
3. Verifying dosage information
4. Updating classifications
5. Maintaining usage statistics

## Conclusion

The Medications Controller provides comprehensive medication management with:

1. Complete medication catalog
2. Interaction checking
3. Safety monitoring
4. Usage tracking
5. Prescription support
