# GP Controller Documentation

## Overview

The GP (General Practitioner) controller is a core component of the ophthalmology electronic medical records system. It manages general medical examinations, patient history, clinical findings, and various medical prescriptions from a primary care perspective.

## File Structure

- `modalityCtr/gp.html`: Main view template
- `static/js/gp.js`: Core JavaScript functionality
- `static/js/md/gp_bt.js`: Bootstrap table configurations and handlers

## Features

### 1. Patient History Management

#### General History

- Medications tracking
- Allergies management
- Medical history records
- Surgical history records

### 2. Present History

- Current complaints (Current Hx)
- SOAP documentation
- Duration of symptoms
- Previous treatments

### 3. Clinical Examination

#### Physical Examination Components

- **Inspection**
  - Skin examination
  - Head examination
  - Hands examination
  - Chest examination
  - Abdominal examination
  - Legs examination
  - Veins examination
  - Genitals examination
  - Other findings

- **Auscultation**
  - Lungs examination
  - Heart examination
  - Abdominal examination
  - Neck examination
  - Vascular examination
  - Other findings

- **Palpation**
  - Chest examination
  - Abdominal examination
  - Ganglions examination
  - Articulations examination
  - Other findings

- **Percussion**
  - Chest examination
  - Abdominal examination
  - Other findings

- **Neurological Examination**
  - Head examination
  - Motor examination
  - Sensorial examination
  - Reflexes examination
  - Other findings

#### Miscellaneous Examinations

- Motility assessment
- Phoria measurement
- Pupils examination

### 4. Conclusions

#### General Conclusions

- Overall clinical assessment
- Main diagnostic findings
- Treatment recommendations

#### Diagnostic Coding

- ICD-10 coding
- Diagnostic categories
- Coding table with CRUD operations

### 5. Actions

#### Medical Prescriptions

- Medication management
- Prescription generation
- Prescription history

#### Certificates

- Medical certificates
- Sick leave certificates
- Presence certificates
- Free certificates
- Various medical documentation

### 6. Follow-up Management

- Follow-up planning
- Next appointment recommendations
- Treatment monitoring
- Progress tracking

### 7. Billing Management

- General procedures
- Insurance coding
- Payment tracking
- Billing recap

## Technical Implementation

### Database Tables

The controller interacts with multiple database tables:

1. **Patient History**
   - `medications`: Patient medications
   - `allergies`: Patient allergies
   - `medical_history`: Medical history records
   - `surgical_history`: Surgical history records
   - `worklist`: Patient appointments and examinations

2. **Present History**
   - `current_hx`: Current complaints and symptoms
   - `soap`: SOAP documentation

3. **Clinical Examination**
   - `inspection`: Physical inspection findings
   - `auscultation`: Auscultation findings
   - `palpation`: Palpation examination
   - `percussion`: Percussion examination
   - `neuro`: Neurological findings
   - `motility`: Movement assessment
   - `phoria`: Alignment measurements
   - `pupils`: Pupillary examination

4. **Conclusions**
   - `ccx`: Clinical conclusions
   - `coding`: Diagnostic coding

5. **Actions**
   - `medical_rx_list`: Medical prescriptions
   - `certificates`: Medical certificates

6. **Follow-up**
   - `followup`: Follow-up plans and recommendations

7. **Billing**
   - `billing`: Financial records and procedures

### Key Components

#### 1. Bootstrap Tables

Multiple Bootstrap tables are implemented for data display:

1. **History Tables**
   - **Medications Table (`mx_tbl`)**
     - Displays patient medications
     - Fields: medication name, dosage, frequency, start/end dates
     - Supports CRUD operations

   - **Allergies Table (`ax_tbl`)**
     - Manages patient allergies
     - Fields: agent, type, onset, end date
     - Color-coded rows based on allergy type

   - **Medical History Table (`mHx_tbl`)**
     - Records patient medical history
     - Fields: condition, onset, end date, notes
     - Supports detailed view and editing

   - **Surgical History Table (`sHx_tbl`)**
     - Tracks surgical procedures
     - Fields: procedure, date, site, notes
     - Includes CRUD operations

   - **Worklist Table (`table-wl`)**
     - Manages patient appointments
     - Fields: procedure, provider, status, timestamps
     - Supports workflow management

2. **Prescription Tables**
   - **Medical Prescription Table (`mxrx_tbl`)**
     - Lists prescribed medications
     - Fields: medications, dosage, duration
     - Supports prescription printing

3. **Certificate Table (`cert_tbl`)**
   - Manages medical certificates
   - Fields: type, content, validity dates
   - Supports document generation

### JavaScript Functions

#### Core Functions

1. **Data Formatting**

```javascript
function responseHandler_mx(res)
function responseHandler_ax(res)
function responseHandler_msHx(res)
function responseHandler_mxrx(res)
function responseHandler_cert(res)
```

2. **Table Operations**

```javascript
function operateFormatter_mx(value, row, index)
function operateFormatter_ax(value, row, index)
function operateFormatter_msHx(value, row, index)
function operateFormatter_mxrx(value, row, index)
function operateFormatter_cert(value, row, index)
```

3. **Form Submission Handlers**

```javascript
function setSubmit(domId, table, fieldsArr, lat)
function setOneSubmit(domId, table, lat)
function updateHandlersFields(table, domId, fieldsArr, lat)
function monitorValueChange(domId, fieldsArr)
```

4. **Modal Handlers**

```javascript
function mHxModalHandler()
function mxModalHandler()
function certificateModalHandler()
```

## API Endpoints

The controller interacts with several API endpoints:

1. **Medication Management**

```javascript
const API_MEDICATIONS = HOSTURL + "/"+APP_NAME+"/api/medic_ref"
const API_MXUSER = HOSTURL + "/"+APP_NAME+"/api/mx"
```

2. **Patient History**

```javascript
const API_MHXUSER = HOSTURL + "/"+APP_NAME+"/api/phistory"
const API_SHXUSER = HOSTURL + "/"+APP_NAME+"/api/phistory"
```

3. **Clinical Documentation**

```javascript
const API_SOAP = HOSTURL + "/"+APP_NAME+"/api/soap"
```

## Usage Guidelines

1. **Patient Examination Flow**
   - Review patient history
   - Document SOAP
   - Perform physical examination
   - Record findings
   - Document conclusions
   - Plan follow-up
   - Process billing
   - Generate prescriptions/certificates

2. **Data Entry Best Practices**
   - Complete all required fields
   - Document significant findings
   - Update patient history
   - Record billing codes accurately

3. **Prescription Generation**
   - Verify patient details
   - Check drug interactions
   - Include all necessary information
   - Generate appropriate documentation

4. **Certificate Generation**
   - Select appropriate certificate type
   - Include required information
   - Specify validity dates
   - Generate official documentation

## Error Handling

The controller implements various error handling mechanisms:

- Form validation
- Data type checking
- API error handling
- User feedback messages
- Certificate validation
- Follow-up validation

## Security Considerations

1. **Access Control**
   - Role-based access (Doctor level required)
   - Session management
   - Data validation
   - Document access restrictions

2. **Data Protection**
   - Input sanitization
   - Secure API calls
   - Audit logging
   - Patient data protection

## Dependencies

- Bootstrap Table 1.22
- jQuery
- Bootstrap Autocomplete
- TinyMCE
- PDFMake
- JsBarcode

## Maintenance

Regular maintenance tasks include:

1. Updating medical reference data
2. Validating form fields
3. Checking API endpoints
4. Updating documentation
5. Monitoring error logs
6. Verifying billing codes
7. Updating certificate templates

## Conclusion

The GP Controller is a comprehensive general medical examination management system that handles:

1. Complete patient examination workflow
2. Detailed clinical documentation
3. Prescription and certificate generation
4. Follow-up planning and tracking
5. Billing and financial management

Regular updates and maintenance ensure optimal functionality and compliance with medical standards.
