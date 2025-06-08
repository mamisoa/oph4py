# Lenses Controller Documentation

## Overview

The Lenses controller manages the lens catalog and prescription system in the ophthalmology electronic medical records system. It handles lens specifications, inventory management, and prescription tracking.

## File Structure

- `modalityCtr/lenses.html`: Main view template
- `static/js/md/lenses.js`: Core JavaScript functionality
- `static/js/lenses_bt.js`: Bootstrap table configurations and handlers

## Features

### 1. Lens Catalog Management

#### General Information

- Lens type management
- Manufacturer details
- Material specifications
- Design features

#### Technical Details

- Power ranges
- Base curves
- Diameter options
- Treatment options

### 2. Prescription Management

- Prescription tracking
- Order management
- Fitting details
- Patient history

### 3. Inventory System

#### Stock Management

- Stock levels
- Order thresholds
- Supplier management
- Delivery tracking

#### Quality Control

- Inspection protocols
- Defect tracking
- Return management
- Warranty handling

### 4. Clinical Applications

- Fitting guidelines
- Care instructions
- Adaptation protocols
- Follow-up schedules

## Technical Implementation

### Database Tables

The controller interacts with these database tables:

1. **Lens Reference**
   - `lens_ref`: Core lens catalog
   - `lens_type`: Lens classifications
   - `lens_material`: Material specifications
   - `lens_design`: Design features

2. **Inventory Management**
   - `lens_stock`: Stock levels
   - `lens_order`: Order history
   - `lens_supplier`: Supplier information

### Key Components

#### 1. Bootstrap Tables

1. **Lens Catalog Table**
   - Displays lens database
   - Fields: type, material, design
   - Supports CRUD operations

2. **Stock Level Table**
   - Shows inventory status
   - Fields: lens, quantity, location
   - Automatic reorder alerts

3. **Order History Table**
   - Tracks lens orders
   - Fields: lens, quantity, date
   - Order status tracking

### JavaScript Functions

#### Core Functions

1. **Data Formatting**

```javascript
function responseHandler_lens(res)
function formatPower(value, row, index)
function formatStock(value, row, index)
```

2. **Table Operations**

```javascript
function operateFormatter(value, row, index)
function detailFormatter(index, row)
```

## API Endpoints

```javascript
const API_LENSES = HOSTURL + "/"+APP_NAME+"/api/lens_ref"
const API_STOCK = HOSTURL + "/"+APP_NAME+"/api/lens_stock"
```

## Usage Guidelines

1. **Lens Entry**
   - Complete specifications
   - Set stock levels
   - Define suppliers
   - Update pricing

2. **Inventory Management**
   - Monitor stock
   - Process orders
   - Track deliveries
   - Handle returns

## Error Handling

- Input validation
- Stock verification
- Order checking
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
- Inventory system
- Order management system

## Maintenance

Regular tasks include:

1. Updating lens catalog
2. Checking stock levels
3. Processing orders
4. Updating suppliers
5. Quality control

## Conclusion

The Lenses Controller provides comprehensive lens management with:

1. Complete lens catalog
2. Inventory tracking
3. Order management
4. Quality control
5. Clinical support
