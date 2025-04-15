# Ophthalmology EMR Workflow Documentation

## Overview

This document describes the complete workflow of the ophthalmology electronic medical records (EMR) system, from patient registration to final billing. The workflow involves multiple roles including administrative assistants, medical assistants (providers), and doctors (seniors).

## Workflow Steps

### 1. Patient Selection and Worklist Creation

**Role: Administrative Assistant**

#### Patient Selection

- Administrative assistant selects a patient from the patient database (`auth_user` table)
- Patient information includes:
  - Personal details (name, DOB, gender)
  - Contact information
  - Insurance details
  - Medical history

#### Worklist Creation

- Using the `newWlItemModal` form to create new worklist entries
- Two types of procedures can be created:
  1. **Combo Procedures** (e.g., 'Routine')
     - Predefined set of procedures (`combo` table)
     - Multiple modalities combined
     - All items are created as a single unit for consistency
     - System ensures all related items are created together
  2. **Specific Procedures**
     - Individual procedures for targeted examinations

#### Enhanced Combo Reliability

- Improved combo creation ensures all related procedures are processed as a single unit
- System provides clear feedback on combo creation status
- In rare cases of partial completion, the system offers recovery options
- Transaction history allows tracking of all combo operations
- Users can view detailed transaction status information if needed

#### Required Information

- Sending facility
- Receiving facility
- Procedure type
- Provider assignment
- Senior doctor assignment
- Date and time slot
- Modality selection
- Laterality (left/right/both eyes)
- Status flag (initially set as "requested")
- Counter
- Warning messages (if any)

### 2. Medical Assistant Procedures

**Role: Medical Assistant (Provider)**

#### Procedure Execution

- Medical assistants handle all non-MD procedures
- Each procedure is linked to specific modalities:
  - Tonometry
  - Keratometry
  - Biometry
  - Vision tests
  - Other technical measurements

#### Workflow Status Management

- Updates procedure status in `worklist` table:
  - "processing" when started
  - "done" when completed
  - "cancelled" if unable to complete
- Records completion time and any relevant notes

### 3. Doctor Examination

**Role: Doctor (Senior)**

#### MD Procedure Components

The MD procedure includes comprehensive examination modules:

1. **Past History** (`phistory` table)
   - Previous conditions
   - Surgeries
   - Family history

2. **Medications** (`mx` table)
   - Current medications
   - Allergies
   - Contraindications

3. **Current History** (`current_hx` table)
   - Present complaints
   - Symptoms
   - Duration

4. **Clinical Examination**
   - Anterior segment (`ant_biom`)
   - Posterior segment (`post_biom`)
   - Other relevant examinations

5. **Clinical Conclusion** (`ccx` table)
   - Diagnosis
   - Assessment
   - Treatment plan

6. **Follow-up** (`followup` table)
   - Next appointment recommendations
   - Treatment schedule
   - Monitoring requirements

7. **Billing** (`billing` table)
   - Procedure codes
   - Insurance information
   - Payment details

#### Status Updates

- Doctor updates status to "done" after completing examination
- All findings and recommendations are recorded in respective tables

### 4. Summary and Checkout

**Role: Administrative Assistant**

#### Summary Review (`summary.html`)

- Access comprehensive visit summary
- Review all procedures performed
- Check completion status of all components

#### Financial Processing

- Process payments based on billing information
- Handle insurance claims
- Collect patient payments

#### Documentation

- Generate and provide required documents:
  - Prescriptions
  - Medical certificates
  - Test results
  - Treatment instructions

#### Follow-up Scheduling

- Schedule next appointment based on doctor's recommendations
- Record in system for future reference
- Provide appointment details to patient

## Status Tracking

### Status Flags

- **requested**: Initial state when procedure is created
- **processing**: Procedure is currently being performed
- **done**: Procedure has been completed
- **cancelled**: Procedure could not be completed
- **doctor_done**: Specific for completed MD procedures

### Workflow Monitoring

- Real-time status updates
- Waiting time tracking
- Processing time monitoring
- Automatic alerts for delays
- Regular table refresh (every 40 seconds)

## Transaction Management

### Combo Operations

- All combo operations are tracked as unified transactions
- Users receive clear feedback on transaction status:
  - Complete: All procedures created successfully
  - Partial: Some procedures created, with recovery options
  - Failed: No procedures created, with error details

### Recovery Options

- If a combo transaction partially completes, the system offers recovery options:
  - View transaction details
  - Attempt automatic recovery
  - Delete partial entries and retry
- Administrative users can view transaction history for audit purposes

## Security and Access Control

### Role-based Access

- Administrative Assistant: Patient management, scheduling, billing
- Medical Assistant: Technical procedures, measurements
- Doctor: Medical examinations, diagnoses, prescriptions

### Data Protection

- Audit trails for all actions
- User authentication and authorization
- Secure data storage and transmission
- Patient privacy protection

## Integration Points

### System Components

- Patient Database
- Procedure Management
- Modality Controllers
- Billing System
- Document Generation
- Appointment Scheduling

### Data Flow

- Seamless data transfer between modules
- Real-time updates across the system
- Automated status tracking
- Integrated billing and documentation

## Maintenance and Support

### Regular Updates

- Procedure definitions
- Modality configurations
- Facility information
- User access control
- System optimization

### Quality Assurance

- Regular workflow audits
- Performance monitoring
- User feedback integration
- Continuous improvement implementation
