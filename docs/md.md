# MD Controller Documentation

## Overview

The MD (Medical Doctor) controller is a core component of the ophthalmology electronic medical records system. It manages medical examinations, patient history, clinical findings, and various medical prescriptions.

## File Structure

- `modalityCtr/md.html`: Main view template
- `static/js/md/md.js`: Core JavaScript functionality
- `static/js/md/md_bt.js`: Bootstrap table configurations and handlers

## Features

### 1. Patient History Management

#### General History

- Medications tracking
- Allergies management
- Medical history records
- Surgical history records

#### Ocular History

- Previous consultations
- Tonometry measurements
- Refraction history
- Keratometry measurements

### 2. Present History

- Current complaints
- Symptoms documentation
- Duration of symptoms
- Previous treatments

### 3. Clinical Examination

#### Anterior Segment Examination

- Anterior chamber
- Outer findings (eyelids, conjunctiva)
- Cornea examination
- Iris examination
- Lens examination
- Other findings

#### Posterior Segment Examination

- Posterior chamber
- Vitreous examination
- Retina examination
- Macula examination
- Papilla examination
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

#### Eye-Specific Conclusions

- Right eye conclusions
- Left eye conclusions

#### Diagnostic Coding

- ICD-10 coding
- Diagnostic categories
- Coding table with CRUD operations

### 5. Actions

#### Medical Prescriptions

- Medication management
- Prescription generation
- Prescription history

#### Optical Prescriptions

- Glasses prescriptions
- Contact lens prescriptions
- Prescription history

#### Certificates

- Medical certificates
- Sick leave certificates
- Various medical documentation

### 6. Follow-up Management

- Follow-up planning
- Next appointment recommendations
- Treatment monitoring
- Progress tracking

### 7. Billing and Financial Management

#### Billing Components

- Right eye procedures
- Left eye procedures
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

3. **Clinical Examination**
   - `anterior_biometry`: Anterior segment findings
   - `posterior_biometry`: Posterior segment findings
   - `motility`: Eye movement assessment
   - `phoria`: Eye alignment measurements
   - `pupils`: Pupillary examination
   - `tonometry`: Eye pressure measurements
   - `refraction`: Vision measurements
   - `keratometry`: Corneal measurements

4. **Conclusions**
   - `ccx`: Clinical conclusions
   - `coding`: Diagnostic coding

5. **Actions**
   - `medical_rx_list`: Medical prescriptions
   - `glasses_rx_list`: Glasses prescriptions
   - `contacts_rx_list`: Contact lens prescriptions
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

2. **Clinical Measurement Tables**
   - **Tonometry Tables (`tonoRight_tbl`, `tonoLeft_tbl`)**
     - Records eye pressure measurements
     - Fields: pressure, method, timestamp
     - Color-coded abnormal values

   - **Refraction Tables (`rxRight_tbl`, `rxLeft_tbl`)**
     - Manages vision measurements
     - Fields: sphere, cylinder, axis, visual acuity
     - Supports prescription generation

   - **Keratometry Tables (`kmRight_tbl`, `kmLeft_tbl`)**
     - Records corneal measurements
     - Fields: K1, K2, axis measurements
     - Highlights abnormal values

3. **Prescription Tables**
   - **Medical Prescription Table (`mxrx_tbl`)**
     - Lists prescribed medications
     - Fields: medications, dosage, duration
     - Supports prescription printing

   - **Glasses Prescription Table (`GxRx_tbl`)**
     - Records glasses prescriptions
     - Fields: sphere, cylinder, axis, add power
     - Supports prescription printing

   - **Contact Lens Table (`cxrx_tbl`)**
     - Manages contact lens prescriptions
     - Fields: lens parameters, specifications
     - Supports prescription printing

4. **Certificate Table (`cert_tbl`)**
   - Manages medical certificates
   - Fields: type, content, validity dates
   - Supports document generation

5. **Follow-up Table (`followup_tbl`)**
   - Tracks patient follow-up plans
   - Fields: next visit, recommendations, monitoring
   - Links to clinical findings

6. **Billing Table (`billing_tbl`)**
   - Manages billing records
   - Fields: procedure codes, charges, insurance info
   - Supports billing status tracking

### JavaScript Functions

#### Core Functions

1. **Data Formatting**

```javascript
function responseHandler_mx(res)
function responseHandler_ax(res)
function responseHandler_msHx(res)
```

- Handle API responses
- Format data for table display
- Process timestamps and calculations

2. **Table Operations**

```javascript
function operateFormatter_mx(value, row, index)
function operateFormatter_ax(value, row, index)
function operateFormatter_msHx(value, row, index)
```

- Generate action buttons
- Handle CRUD operations
- Manage row details

3. **Value Processing**

```javascript
function highlightValue(str, midthreshold, highthreshold, direction)
function checkIfNull(value, resultStrIfNull)
```

- Format and validate data
- Highlight abnormal values
- Handle null values

4. **Form Submission Handlers**

```javascript
function setSubmit(domId, table, fieldsArr, lat)
function setOneSubmit(domId, table, lat)
```

- Handle form submissions
- Validate form data
- Process form updates

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

3. **Clinical Measurements**

```javascript
const API_TONORIGHT = HOSTURL + "/"+APP_NAME+"/api/tono"
const API_RXRIGHT = HOSTURL + "/"+APP_NAME+"/api/rx"
const API_KMRIGHT = HOSTURL + "/"+APP_NAME+"/api/km"
```

4. **Billing and Follow-up**

```javascript
const API_BILLING = HOSTURL + "/"+APP_NAME+"/api/billing"
const API_FOLLOWUP = HOSTURL + "/"+APP_NAME+"/api/followup"
```

## Usage Guidelines

1. **Patient Examination Flow**
   - Review patient history
   - Perform clinical examination
   - Record findings
   - Document conclusions
   - Plan follow-up
   - Process billing
   - Generate prescriptions/certificates

2. **Data Entry Best Practices**
   - Complete all required fields
   - Validate abnormal values
   - Document significant findings
   - Update patient history
   - Record billing codes accurately

3. **Prescription Generation**
   - Verify patient details
   - Check drug interactions
   - Include all necessary information
   - Generate appropriate documentation

4. **Follow-up Management**
   - Set appropriate follow-up intervals
   - Document monitoring requirements
   - Schedule next appointments
   - Track patient progress

5. **Billing Procedures**
   - Enter correct procedure codes
   - Verify insurance information
   - Document special circumstances
   - Track payment status

## Error Handling

The controller implements various error handling mechanisms:

- Form validation
- Data type checking
- API error handling
- User feedback messages
- Billing verification
- Follow-up validation

## Security Considerations

1. **Access Control**
   - Role-based access (Doctor level required)
   - Session management
   - Data validation
   - Billing access restrictions

2. **Data Protection**
   - Input sanitization
   - Secure API calls
   - Audit logging
   - Financial data protection

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
7. Updating follow-up protocols

## Conclusion

The MD Controller is a comprehensive medical examination management system that handles:

1. Complete patient examination workflow
2. Detailed clinical documentation
3. Prescription and certificate generation
4. Follow-up planning and tracking
5. Billing and financial management

Regular updates and maintenance ensure optimal functionality and compliance with medical standards.
