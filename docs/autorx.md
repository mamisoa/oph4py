# AutoRx Module Documentation

## Overview & Purpose

The AutoRx module is a comprehensive ophthalmology refraction management system built using the Py4web MVC framework. It provides functionality for managing and recording patient eye examinations, specifically focusing on:

- Automated refraction measurements
- Manual refraction input
- Keratometry measurements
- Integration with various ophthalmic devices (L80, VX100, CV5000)

## Table of Contents

1. [Overview & Purpose](#overview--purpose)
2. [Dependencies & Requirements](#dependencies--requirements)
3. [Module Components](#module-components)
4. [Features](#features)
5. [Architecture & Design](#architecture--design)
6. [API Reference](#api-reference)
7. [User Interface](#user-interface)
8. [Device Integration](#device-integration)
9. [Troubleshooting](#troubleshooting)

## Dependencies & Requirements

### Core Dependencies

- Py4web framework
- Bootstrap 4+
- jQuery
- Bootstrap Table 1.22+
- Bootbox
- Font Awesome

### JavaScript Libraries

- `jquery.serialize-object.min.js`
- `useful.js`
- `patient-bar.js`
- `autorx_bt.js`
- `autorx.js`

## Module Components

### 1. Controller (`modalityctr.py`)

The controller handles:

- Route definitions
- Data processing
- API endpoints
- Device integration
- Database operations

### 2. View (`autorx.html`)

The view template provides:

- Refraction data input forms
- Keratometry data input forms
- Device integration interface
- Data visualization tables
- Modal forms for editing

### 3. JavaScript Modules

- `autorx.js`: Core functionality and event handlers
- `autorx_bt.js`: Bootstrap table configurations and handlers

## Features

### 1. Refraction Management

- Input and management of:
  - Sphere (SPH)
  - Cylinder (CYL)
  - Axis
  - Visual Acuity (VA)
  - Addition powers
- Support for different types:
  - Monofocal
  - Progressive
  - Bifocal
  - Degressive

### 2. Keratometry

- K1/K2 measurements
- Axis measurements
- Automatic calculations
- Data validation

### 3. Device Integration

Supports importing data from:

- L80
- VX100
- CV5000 (Iris, Cornea, Crist)

## Architecture & Design

### Data Flow

1. User Input → Forms
2. Form Validation → JavaScript
3. API Calls → Controller
4. Database Operations → Model
5. Response → View Update

### Event Handling

- Form submissions
- Device data imports
- Table updates
- Modal operations

## API Reference

### Endpoints

#### 1. Refraction Data

```python
@action('autorx')
@action('modalityCtr/autorx/<wlId>')
```

- Parameters:
  - `wlId`: Worklist ID

#### 2. Device Integration

- L80/VX100: `/rest/machines/[device]`
- CV5000: `/rest/getCV5000`

### Data Structures

#### Refraction Object

```javascript
{
    // Required Fields
    id_auth_user: string,          // Reference to auth_user
    id_worklist: string,           // Reference to worklist
    timestamp: datetime,           // Timestamp of the measurement
    rx_origin: "autorx" | "glass" | "trial" | "cyclo" | "dil",
    laterality: "right" | "left",
    status: number,                // Reference to status_rx, default: 1

    // Glass Type
    glass_type: "monofocal" | "progressive" | "bifocal" | "degressive" | "na",

    // Far Vision Fields
    va_far: number,               // Visual acuity far (decimal 3,2)
    opto_far: number,             // Reference to optotype
    sph_far: number,              // Sphere far (decimal 4,2)
    cyl_far: number,              // Cylinder far (decimal 4,2)
    axis_far: number,             // Axis far (integer)

    // Intermediate Vision Fields
    va_int: number,               // Visual acuity intermediate (decimal 3,2)
    opto_int: number,             // Reference to optotype
    sph_int: number,              // Sphere intermediate (decimal 4,2)
    cyl_int: number,              // Cylinder intermediate (decimal 4,2)
    axis_int: number,             // Axis intermediate (integer)

    // Close Vision Fields
    va_close: number,             // Visual acuity close (decimal 3,2)
    opto_close: number,           // Reference to optotype
    sph_close: number,            // Sphere close (decimal 4,2)
    cyl_close: number,            // Cylinder close (decimal 4,2)
    axis_close: number,           // Axis close (integer)

    // Additional Parameters
    note: string,                 // Optional notes
    pd05: number,                 // Half pupils distance (decimal 4,2)
    Vprismd: number,              // Vertical prism in diopters (decimal 4,2)
    Vbase: string,                // Vertical base
    Hprismd: number,              // Horizontal prism in diopters (decimal 4,2)
    Hbase: string,                // Horizontal base
    pangle: number,               // Prism angle (integer)
    color: string,                // Color code
    id_pair: string,              // ID to link right/left measurements

    // Audit Fields (added by auth.signature)
    created_by: number,           // User ID who created the record
    created_on: datetime,         // Creation timestamp
    modified_by: number,          // User ID who last modified the record
    modified_on: datetime,        // Last modification timestamp
    is_active: boolean            // Record active status
}
```

#### Keratometry Object

```javascript
{
    // Required Fields
    id_auth_user: string,          // Reference to auth_user
    id_worklist: string,           // Reference to worklist
    timestamp: datetime,           // Timestamp of the measurement
    laterality: "right" | "left",  // Eye laterality

    // Keratometry Measurements
    k1: number,                    // K1 measurement (decimal 4,2)
    k2: number,                    // K2 measurement (decimal 4,2)
    axis1: number,                 // K1 axis (decimal 5,2)
    axis2: number,                 // K2 axis (decimal 5,2)
    note: string,                  // Optional notes

    // Audit Fields (added by auth.signature)
    created_by: number,           // User ID who created the record
    created_on: datetime,         // Creation timestamp
    modified_by: number,          // User ID who last modified the record
    modified_on: datetime,        // Last modification timestamp
    is_active: boolean           // Record active status
}
```

## User Interface

### Main Components

1. Patient Information Bar
2. Refraction Input Forms
   - Right Eye
   - Left Eye
3. Keratometry Input Forms
4. Device Integration Buttons
5. Data Tables

### Modal Forms

1. Edit Refraction
2. Edit Keratometry
3. Device Import

## Device Integration

### Supported Devices

1. **L80**
   - Autorefraction
   - Keratometry

2. **VX100**
   - Wavefront measurements
   - Topography

3. **CV5000**
   - Iris measurements
   - Corneal measurements
   - Crystalline measurements

### Data Import Process

1. Device selection
2. Patient data matching
3. Data preview
4. Import confirmation
5. Data validation
6. Database storage

## Troubleshooting

### Common Issues

1. **Device Connection**
   - Ensure device is online
   - Check network connectivity
   - Verify patient ID matching

2. **Data Validation**
   - Check input ranges
   - Verify required fields
   - Ensure proper formatting

3. **Form Submission**
   - Validate all required fields
   - Check for proper data types
   - Verify API endpoint availability

### Error Messages

- Invalid measurement ranges
- Missing required fields
- Device connection failures
- Database operation errors

## Security Considerations

1. **Data Validation**
   - Input sanitization
   - Range checking
   - Type validation

2. **Access Control**
   - User authentication
   - Role-based permissions
   - Session management

3. **Device Integration**
   - Secure connections
   - Data encryption
   - Error handling
