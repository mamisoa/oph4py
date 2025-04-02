# FastAPI Endpoints PRD for Ophthalmology EMR

## Overview

This document outlines the REST API endpoints for the Ophthalmology EMR system. These endpoints will be used by an LLM to assist administrative and medical staff in retrieving and managing patient information efficiently.

## Table of Contents

- [FastAPI Endpoints PRD for Ophthalmology EMR](#fastapi-endpoints-prd-for-ophthalmology-emr)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [1. Basic CRUD Endpoints](#1-basic-crud-endpoints)
    - [Patient Management](#patient-management)
      - [Patient Profile Operations](#patient-profile-operations)
        - [GET /api/v1/patients/{patient\_id}](#get-apiv1patientspatient_id)
        - [GET /api/v1/patients/search](#get-apiv1patientssearch)
        - [POST /api/v1/patients](#post-apiv1patients)
        - [PUT /api/v1/patients/{patient\_id}](#put-apiv1patientspatient_id)
        - [DELETE /api/v1/patients/{patient\_id}](#delete-apiv1patientspatient_id)
      - [Insurance Records](#insurance-records)
        - [GET /api/v1/insurance/{insurance\_id}](#get-apiv1insuranceinsurance_id)
        - [POST /api/v1/insurance](#post-apiv1insurance)
        - [PUT /api/v1/insurance/{insurance\_id}](#put-apiv1insuranceinsurance_id)
      - [Membership Records](#membership-records)
        - [GET /api/v1/membership/{membership\_id}](#get-apiv1membershipmembership_id)
        - [GET /api/v1/membership](#get-apiv1membership)
        - [POST /api/v1/membership](#post-apiv1membership)
        - [PUT /api/v1/membership/{membership\_id}](#put-apiv1membershipmembership_id)
        - [DELETE /api/v1/membership/{membership\_id}](#delete-apiv1membershipmembership_id)
        - [GET /api/v1/membership/{membership\_id}/users](#get-apiv1membershipmembership_idusers)
      - [Contact Records](#contact-records)
        - [GET /api/v1/contacts/address/{address\_id}](#get-apiv1contactsaddressaddress_id)
        - [POST /api/v1/contacts/address](#post-apiv1contactsaddress)
        - [GET /api/v1/contacts/phone/{phone\_id}](#get-apiv1contactsphonephone_id)
        - [POST /api/v1/contacts/phone](#post-apiv1contactsphone)
        - [PUT /api/v1/contacts/phone/{phone\_id}](#put-apiv1contactsphonephone_id)
        - [PUT /api/v1/contacts/address/{address\_id}](#put-apiv1contactsaddressaddress_id)
  - [2. Complex Query Endpoints](#2-complex-query-endpoints)
    - [Patient Comprehensive Views](#patient-comprehensive-views)
      - [GET /api/v1/patients/{patient\_id}/full-profile](#get-apiv1patientspatient_idfull-profile)
      - [GET /api/v1/patients/{patient\_id}/medical-history](#get-apiv1patientspatient_idmedical-history)
      - [GET /api/v1/patients/{patient\_id}/documents](#get-apiv1patientspatient_iddocuments)
    - [Insurance \& Financial](#insurance--financial)
      - [GET /api/v1/patients/{patient\_id}/insurance-history](#get-apiv1patientspatient_idinsurance-history)
      - [GET /api/v1/patients/{patient\_id}/billing-summary](#get-apiv1patientspatient_idbilling-summary)
    - [Clinical Examinations](#clinical-examinations)
      - [GET /api/v1/patients/{patient\_id}/eye-exams](#get-apiv1patientspatient_ideye-exams)
  - [Authentication and Authorization](#authentication-and-authorization)
  - [Error Handling](#error-handling)
  - [Rate Limiting](#rate-limiting)
  - [Versioning](#versioning)

## 1. Basic CRUD Endpoints

### Patient Management

#### Patient Profile Operations

##### GET /api/v1/patients/{patient_id}

- **Purpose**: Retrieve basic patient profile
- **Path Parameters**:
  - patient_id: integer (required)
    - Description: Unique identifier of the patient
    - Example: 12345

- **Response Schema**:

  ```json
  {
    "id": "integer",
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "maiden_name": "string",
    "dob": "date",
    "birth_town": "string",
    "birth_country": "string",
    "gender_id": "integer",
    "marital_id": "integer",
    "ethny_id": "integer",
    "nationality": "string",
    "membership_id": "integer",
    "is_active": "boolean",
    "created_on": "datetime",
    "created_by": "integer",
    "modified_on": "datetime",
    "modified_by": "integer",
    "addresses": [
      {
        "id": "integer",
        "address_type": "string",
        "address": "string",
        "is_primary": "boolean"
      }
    ],
    "phones": [
      {
        "id": "integer",
        "phone_type": "string",
        "number": "string",
        "is_primary": "boolean"
      }
    ]
  }
  ```

##### GET /api/v1/patients/search

- **Purpose**: Basic patient search
- **Query Parameters**:
  - name: string (optional)
    - Description: Full or partial name of the patient
    - Example: "John Do"
  - dob: date (optional)
    - Description: Date of birth in ISO format
    - Example: "1990-01-01"
  - page: integer (optional)
    - Description: Page number for pagination
    - Default: 1
  - per_page: integer (optional)
    - Description: Number of records per page
    - Default: 20
    - Max: 100

- **Response Schema**:

  ```json
  {
    "total": "integer",
    "page": "integer",
    "per_page": "integer",
    "patients": [
      {
        "id": "integer",
        "first_name": "string",
        "last_name": "string",
        "date_of_birth": "date",
        "gender_id": "integer"
      }
    ]
  }
  ```

##### POST /api/v1/patients

- **Purpose**: Create new patient record
- **Request Headers**:
  - Content-Type: application/json

- **Request Schema**:

  ```json
  {
    "username": "string (required)",
    "email": "string (required)",
    "first_name": "string (required)",
    "last_name": "string (required)",
    "maiden_name": "string (optional)",
    "dob": "date (required)",
    "birth_town": "string (optional)",
    "birth_country": "string (optional)",
    "gender_id": "integer (required)",
    "marital_id": "integer (optional)",
    "ethny_id": "integer (optional)",
    "nationality": "string (optional)",
    "membership_id": "integer (optional)",
    "addresses": [
      {
        "address_type": "string (required)",
        "address": "string (required)",
        "is_primary": "boolean (required)"
      }
    ],
    "phones": [
      {
        "phone_type": "string (required)",
        "number": "string (required)",
        "is_primary": "boolean (required)"
      }
    ]
  }
  ```

- **Response Schema**:

  ```json
  {
    "id": "integer",
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "dob": "date",
    "gender_id": "integer",
    "created_on": "datetime",
    "created_by": "integer"
  }
  ```

##### PUT /api/v1/patients/{patient_id}

- **Purpose**: Update basic patient information
- **Path Parameters**:
  - patient_id: integer (required)
    - Description: Unique identifier of the patient
    - Example: 12345

- **Request Headers**:
  - Content-Type: application/json

- **Request Schema**:

  ```json
  {
    "username": "string (optional)",
    "email": "string (optional)",
    "first_name": "string (optional)",
    "last_name": "string (optional)",
    "maiden_name": "string (optional)",
    "dob": "date (optional)",
    "birth_town": "string (optional)",
    "birth_country": "string (optional)",
    "gender_id": "integer (optional)",
    "marital_id": "integer (optional)",
    "ethny_id": "integer (optional)",
    "nationality": "string (optional)",
    "membership_id": "integer (optional)"
  }
  ```

- **Response Schema**:

  ```json
  {
    "id": "integer",
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "dob": "date",
    "gender_id": "integer",
    "modified_on": "datetime",
    "modified_by": "integer"
  }
  ```

##### DELETE /api/v1/patients/{patient_id}

- **Purpose**: Deactivate patient record (soft delete)
- **Path Parameters**:
  - patient_id: integer (required)
    - Description: Unique identifier of the patient
    - Example: 12345

- **Response Schema**:

  ```json
  {
    "id": "integer",
    "status": "string",
    "message": "string",
    "modified_on": "datetime",
    "modified_by": "integer"
  }
  ```

#### Insurance Records

##### GET /api/v1/insurance/{insurance_id}

- **Purpose**: Get single insurance record
- **Path Parameters**:
  - insurance_id: integer (required)
    - Description: Unique identifier of the insurance record
    - Example: 789

- **Response Schema**:

  ```json
  {
    "id": "integer",
    "id_auth_user": "integer",
    "insurance_name": "string",
    "insurance_plan": "string",
    "insurance_type": "string",
    "is_active": "boolean",
    "created_on": "datetime",
    "created_by": "integer",
    "modified_on": "datetime",
    "modified_by": "integer"
  }
  ```

##### POST /api/v1/insurance

- **Purpose**: Create new insurance record
- **Request Headers**:
  - Content-Type: application/json

- **Request Schema**:

  ```json
  {
    "id_auth_user": "integer (required)",
    "insurance_name": "string (required)",
    "insurance_plan": "string (required)",
    "insurance_type": "string (required)"
  }
  ```

- **Response Schema**:

  ```json
  {
    "id": "integer",
    "id_auth_user": "integer",
    "insurance_name": "string",
    "insurance_plan": "string",
    "insurance_type": "string",
    "is_active": "boolean",
    "audit": {
      "created_on": "datetime",
      "created_by": "integer"
    }
  }
  ```

##### PUT /api/v1/insurance/{insurance_id}

- **Purpose**: Update insurance record
- **Path Parameters**:
  - insurance_id: integer (required)
    - Description: Unique identifier of the insurance record
    - Example: 789

- **Request Headers**:
  - Content-Type: application/json

- **Request Schema**:

  ```json
  {
    "insurance_name": "string (optional)",
    "insurance_plan": "string (optional)",
    "insurance_type": "string (optional)",
    "is_active": "boolean (optional)"
  }
  ```

- **Response Schema**:

  ```json
  {
    "id": "integer",
    "insurance_name": "string",
    "insurance_plan": "string",
    "insurance_type": "string",
    "is_active": "boolean",
    "audit": {
      "modified_on": "datetime",
      "modified_by": "integer"
    }
  }
  ```

#### Membership Records

##### GET /api/v1/membership/{membership_id}

- **Purpose**: Get single membership record
- **Path Parameters**:
  - membership_id: integer (required)
    - Description: Unique identifier of the membership record
    - Example: 123

- **Response Schema**:

  ```json
  {
    "id": "integer",
    "membership": "string",
    "hierarchy": "integer",
    "created_on": "datetime",
    "created_by": "integer",
    "modified_on": "datetime",
    "modified_by": "integer",
    "is_active": "boolean"
  }
  ```

- **Enumerated Values**:
  - membership:
    - "Admin" (hierarchy: 0)
    - "Doctor" (hierarchy: 1)
    - "Nurse" (hierarchy: 2)
    - "Medical assistant" (hierarchy: 2)
    - "Administrative" (hierarchy: 3)
    - "Patient" (hierarchy: 99)

##### GET /api/v1/membership

- **Purpose**: List all membership types
- **Query Parameters**:
  - active_only: boolean (optional)
    - Description: Filter only active membership types
    - Default: true
  - hierarchy_level: integer (optional)
    - Description: Filter by hierarchy level
    - Example: 2 (for Nurse/Medical assistant level)

- **Response Schema**:

  ```json
  {
    "total": "integer",
    "memberships": [
      {
        "id": "integer",
        "membership": "string",
        "hierarchy": "integer",
        "is_active": "boolean",
        "total_users": "integer"
      }
    ]
  }
  ```

##### POST /api/v1/membership

- **Purpose**: Create membership record
- **Request Headers**:
  - Content-Type: application/json

- **Request Schema**:

  ```json
  {
    "membership": "string (required)",
    "hierarchy": "integer (required)"
  }
  ```

- **Validation Rules**:
  - membership: Must be unique
  - hierarchy: Must be between 0 and 99
  - Only users with Admin role (hierarchy 0) can create new membership types

- **Response Schema**:

  ```json
  {
    "id": "integer",
    "membership": "string",
    "hierarchy": "integer",
    "is_active": "boolean",
    "created_on": "datetime",
    "created_by": "integer"
  }
  ```

##### PUT /api/v1/membership/{membership_id}

- **Purpose**: Update membership record
- **Path Parameters**:
  - membership_id: integer (required)
    - Description: Unique identifier of the membership record
    - Example: 123

- **Request Headers**:
  - Content-Type: application/json

- **Request Schema**:

  ```json
  {
    "membership": "string (optional)",
    "hierarchy": "integer (optional)",
    "is_active": "boolean (optional)"
  }
  ```

- **Validation Rules**:
  - Cannot modify system-defined memberships (Admin, Patient)
  - Only users with Admin role can modify membership records
  - hierarchy cannot be changed to 0 (Admin level)

- **Response Schema**:

  ```json
  {
    "id": "integer",
    "membership": "string",
    "hierarchy": "integer",
    "is_active": "boolean",
    "modified_on": "datetime",
    "modified_by": "integer"
  }
  ```

##### DELETE /api/v1/membership/{membership_id}

- **Purpose**: Deactivate membership record (soft delete)
- **Path Parameters**:
  - membership_id: integer (required)
    - Description: Unique identifier of the membership record
    - Example: 123

- **Validation Rules**:
  - Cannot delete system-defined memberships (Admin, Patient)
  - Cannot delete memberships with active users
  - Only users with Admin role can delete membership records

- **Response Schema**:

  ```json
  {
    "id": "integer",
    "status": "string",
    "message": "string",
    "modified_on": "datetime",
    "modified_by": "integer"
  }
  ```

##### GET /api/v1/membership/{membership_id}/users

- **Purpose**: List all users with specific membership
- **Path Parameters**:
  - membership_id: integer (required)
    - Description: Unique identifier of the membership record
    - Example: 123

- **Query Parameters**:
  - page: integer (optional)
    - Description: Page number for pagination
    - Default: 1
  - per_page: integer (optional)
    - Description: Number of records per page
    - Default: 20
    - Max: 100
  - active_only: boolean (optional)
    - Description: Filter only active users
    - Default: true

- **Response Schema**:

  ```json
  {
    "total": "integer",
    "page": "integer",
    "per_page": "integer",
    "users": [
      {
        "id": "integer",
        "username": "string",
        "first_name": "string",
        "last_name": "string",
        "email": "string",
        "is_active": "boolean",
        "created_on": "datetime",
        "created_by": "integer"
      }
    ]
  }
  ```

#### Contact Records

##### GET /api/v1/contacts/address/{address_id}

- **Purpose**: Get single address record
- **Path Parameters**:
  - address_id: integer (required)
    - Description: Unique identifier of the address record
    - Example: 456

- **Response Schema**:

  ```json
  {
    "id": "integer",
    "id_auth_user": "integer",
    "home_num": "string",
    "box_num": "string",
    "address1": "string",
    "address2": "string",
    "zipcode": "string",
    "town": "string",
    "country": "string",
    "address_rank": "integer",
    "address_origin": "string",
    "is_active": "boolean",
    "created_on": "datetime",
    "created_by": "integer",
    "modified_on": "datetime",
    "modified_by": "integer"
  }
  ```

##### POST /api/v1/contacts/address

- **Purpose**: Create address record
- **Request Headers**:
  - Content-Type: application/json

- **Request Schema**:

  ```json
  {
    "id_auth_user": "integer (required)",
    "home_num": "string (optional)",
    "box_num": "string (optional)",
    "address1": "string (required)",
    "address2": "string (optional)",
    "zipcode": "string (required)",
    "town": "string (required)",
    "country": "string (required)",
    "address_rank": "integer (optional)",
    "address_origin": "string (required)"
  }
  ```

- **Response Schema**:

  ```json
  {
    "id": "integer",
    "id_auth_user": "integer",
    "home_num": "string",
    "box_num": "string",
    "address1": "string",
    "address2": "string",
    "zipcode": "string",
    "town": "string",
    "country": "string",
    "address_rank": "integer",
    "address_origin": "string",
    "is_active": "boolean",
    "created_on": "datetime",
    "created_by": "integer"
  }
  ```

##### GET /api/v1/contacts/phone/{phone_id}

- **Purpose**: Get single phone record
- **Path Parameters**:
  - phone_id: integer (required)
    - Description: Unique identifier of the phone record
    - Example: 789

- **Response Schema**:

  ```json
  {
    "id": "integer",
    "id_auth_user": "integer",
    "phone_prefix": "integer",
    "phone": "string",
    "phone_origin": "string",
    "is_active": "boolean",
    "created_on": "datetime",
    "created_by": "integer",
    "modified_on": "datetime",
    "modified_by": "integer"
  }
  ```

##### POST /api/v1/contacts/phone

- **Purpose**: Create phone record
- **Request Headers**:
  - Content-Type: application/json

- **Request Schema**:

  ```json
  {
    "id_auth_user": "integer (required)",
    "phone_prefix": "integer (required)",
    "phone": "string (required)",
    "phone_origin": "string (required)"
  }
  ```

- **Response Schema**:

  ```json
  {
    "id": "integer",
    "id_auth_user": "integer",
    "phone_prefix": "integer",
    "phone": "string",
    "phone_origin": "string",
    "is_active": "boolean",
    "created_on": "datetime",
    "created_by": "integer"
  }
  ```

##### PUT /api/v1/contacts/phone/{phone_id}

- **Purpose**: Update phone record
- **Path Parameters**:
  - phone_id: integer (required)
    - Description: Unique identifier of the phone record
    - Example: 789

- **Request Headers**:
  - Content-Type: application/json

- **Request Schema**:

  ```json
  {
    "phone_prefix": "integer (optional)",
    "phone": "string (optional)",
    "phone_origin": "string (optional)",
    "is_active": "boolean (optional)"
  }
  ```

- **Response Schema**:

  ```json
  {
    "id": "integer",
    "phone_prefix": "integer",
    "phone": "string",
    "phone_origin": "string",
    "is_active": "boolean",
    "modified_on": "datetime",
    "modified_by": "integer"
  }
  ```

##### PUT /api/v1/contacts/address/{address_id}

- **Purpose**: Update address record
- **Path Parameters**:
  - address_id: integer (required)
    - Description: Unique identifier of the address record
    - Example: 456

- **Request Headers**:
  - Content-Type: application/json

- **Request Schema**:

  ```json
  {
    "home_num": "string (optional)",
    "box_num": "string (optional)",
    "address1": "string (optional)",
    "address2": "string (optional)",
    "zipcode": "string (optional)",
    "town": "string (optional)",
    "country": "string (optional)",
    "address_rank": "integer (optional)",
    "address_origin": "string (optional)",
    "is_active": "boolean (optional)"
  }
  ```

- **Response Schema**:

  ```json
  {
    "id": "integer",
    "home_num": "string",
    "box_num": "string",
    "address1": "string",
    "address2": "string",
    "zipcode": "string",
    "town": "string",
    "country": "string",
    "address_rank": "integer",
    "address_origin": "string",
    "is_active": "boolean",
    "modified_on": "datetime",
    "modified_by": "integer"
  }
  ```

## 2. Complex Query Endpoints

### Patient Comprehensive Views

#### GET /api/v1/patients/{patient_id}/full-profile

- **Purpose**: Retrieve complete patient profile
- **Path Parameters**:
  - patient_id: integer (required)
    - Description: Unique identifier of the patient
    - Example: 12345

- **Response Schema**:

  ```json
  {
    "personal_details": {
      "id": "integer",
      "username": "string",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "maiden_name": "string",
      "dob": "date",
      "birth_town": "string",
      "birth_country": "string",
      "nationality": "string",
      "gender": {
        "id": "integer",
        "sex": "string"
      },
      "marital": {
        "id": "integer",
        "marital_status": "string"
      },
      "ethny": {
        "id": "integer",
        "ethny": "string"
      },
      "idc_num": "string",
      "ssn": "string",
      "chipnumber": "string",
      "validfrom": "date",
      "validtill": "date",
      "initials": "string",
      "is_active": "boolean"
    },
    "contact_information": {
      "addresses": [
        {
          "id": "integer",
          "home_num": "string",
          "box_num": "string",
          "address1": "string",
          "address2": "string",
          "zipcode": "string",
          "town": "string",
          "country": "string",
          "address_rank": "integer",
          "address_origin": "string",
          "is_active": "boolean"
        }
      ],
      "phones": [
        {
          "id": "integer",
          "phone_prefix": "integer",
          "phone": "string",
          "phone_origin": "string",
          "is_active": "boolean"
        }
      ]
    },
    "insurance": [
      {
        "id": "integer",
        "insurance_name": "string",
        "insurance_plan": "string",
        "insurance_type": "string",
        "is_active": "boolean"
      }
    ],
    "membership": {
      "id": "integer",
      "membership": "string",
      "hierarchy": "integer"
    },
    "photo_id": {
      "id": "integer",
      "imagefile": "string",
      "b64img": "string",
      "is_active": "boolean"
    },
    "audit": {
      "created_on": "datetime",
      "created_by": "integer",
      "modified_on": "datetime",
      "modified_by": "integer"
    }
  }
  ```

#### GET /api/v1/patients/{patient_id}/medical-history

- **Purpose**: Retrieve complete medical history
- **Path Parameters**:
  - patient_id: integer (required)
    - Description: Unique identifier of the patient
    - Example: 12345

- **Query Parameters**:
  - include_inactive: boolean (optional)
    - Description: Include inactive records
    - Default: false
  - from_date: date (optional)
    - Description: Filter records from this date
    - Format: YYYY-MM-DD
  - to_date: date (optional)
    - Description: Filter records until this date
    - Format: YYYY-MM-DD

- **Response Schema**:

  ```json
  {
    "past_medical_history": [
      {
        "id": "integer",
        "disease": {
          "id": "integer",
          "title": "string",
          "category": "string"
        },
        "site": "string",
        "note": "string",
        "onset": "date",
        "ended": "date",
        "is_active": "boolean",
        "audit": {
          "created_on": "datetime",
          "created_by": "integer",
          "modified_on": "datetime",
          "modified_by": "integer"
        }
      }
    ],
    "allergies": [
      {
        "id": "integer",
        "agent": {
          "id": "integer",
          "agent": "string"
        },
        "typ": "string",
        "onset": "date",
        "ended": "date",
        "is_active": "boolean",
        "audit": {
          "created_on": "datetime",
          "created_by": "integer",
          "modified_on": "datetime",
          "modified_by": "integer"
        }
      }
    ],
    "current_medications": [
      {
        "id": "integer",
        "medication": {
          "id": "integer",
          "name": "string"
        },
        "delivery": "string",
        "unit_per_intake": "number",
        "frequency": "string",
        "onset": "date",
        "ended": "date",
        "note": "string",
        "prescribed": "boolean",
        "is_active": "boolean",
        "audit": {
          "created_on": "datetime",
          "created_by": "integer",
          "modified_on": "datetime",
          "modified_by": "integer"
        }
      }
    ],
    "diagnoses": [
      {
        "id": "integer",
        "laterality": "string",
        "description": "string",
        "worklist_id": "integer",
        "is_active": "boolean",
        "audit": {
          "created_on": "datetime",
          "created_by": "integer",
          "modified_on": "datetime",
          "modified_by": "integer"
        }
      }
    ]
  }
  ```

#### GET /api/v1/patients/{patient_id}/documents

- **Purpose**: Retrieve all patient documents
- **Path Parameters**:
  - patient_id: integer (required)
    - Description: Unique identifier of the patient
    - Example: 12345

- **Query Parameters**:
  - document_type: string (optional)
    - Description: Filter by document type
    - Enum: ["certificate", "prescription", "report"]
  - date_range: string (optional)
    - Description: Filter by date range
    - Format: "YYYY-MM-DD/YYYY-MM-DD"
  - include_inactive: boolean (optional)
    - Description: Include inactive documents
    - Default: false
  - page: integer (optional)
    - Description: Page number for pagination
    - Default: 1
  - per_page: integer (optional)
    - Description: Number of records per page
    - Default: 20
    - Max: 100

- **Response Schema**:

  ```json
  {
    "total": "integer",
    "page": "integer",
    "per_page": "integer",
    "documents": [
      {
        "id": "integer",
        "uuid": "string",
        "category": "string",
        "datestamp": "date",
        "onset": "date",
        "ended": "date",
        "worklist_id": "integer",
        "has_pdf": "boolean",
        "is_active": "boolean",
        "audit": {
          "created_on": "datetime",
          "created_by": "integer",
          "modified_on": "datetime",
          "modified_by": "integer"
        }
      }
    ]
  }
  ```

### Insurance & Financial

#### GET /api/v1/patients/{patient_id}/insurance-history

- **Purpose**: Get complete insurance history
- **Path Parameters**:
  - patient_id: integer (required)
    - Description: Unique identifier of the patient
    - Example: 12345

- **Query Parameters**:
  - include_inactive: boolean (optional)
    - Description: Include inactive insurance records
    - Default: false
  - from_date: date (optional)
    - Description: Filter records from this date
    - Format: YYYY-MM-DD
  - to_date: date (optional)
    - Description: Filter records until this date
    - Format: YYYY-MM-DD
  - insurance_type: string (optional)
    - Description: Filter by insurance type
    - Example: "private"
  - page: integer (optional)
    - Description: Page number for pagination
    - Default: 1
  - per_page: integer (optional)
    - Description: Number of records per page
    - Default: 20
    - Max: 100

- **Response Schema**:

  ```json
  {
    "total": "integer",
    "page": "integer",
    "per_page": "integer",
    "insurance_records": [
      {
        "id": "integer",
        "insurance_name": "string",
        "insurance_plan": "string",
        "insurance_type": {
          "id": "integer",
          "sector": "string"
        },
        "is_active": "boolean",
        "audit": {
          "created_on": "datetime",
          "created_by": "integer",
          "modified_on": "datetime",
          "modified_by": "integer"
        }
      }
    ]
  }
  ```

#### GET /api/v1/patients/{patient_id}/billing-summary

- **Purpose**: Get billing summary
- **Path Parameters**:
  - patient_id: integer (required)
    - Description: Unique identifier of the patient
    - Example: 12345

- **Query Parameters**:
  - from_date: date (optional)
    - Description: Filter records from this date
    - Format: YYYY-MM-DD
  - to_date: date (optional)
    - Description: Filter records until this date
    - Format: YYYY-MM-DD
  - include_inactive: boolean (optional)
    - Description: Include inactive billing records
    - Default: false
  - group_by: string (optional)
    - Description: Group billing records by specified field
    - Enum: ["date", "worklist", "description"]
    - Default: "date"
  - page: integer (optional)
    - Description: Page number for pagination
    - Default: 1
  - per_page: integer (optional)
    - Description: Number of records per page
    - Default: 20
    - Max: 100

- **Response Schema**:

  ```json
  {
    "total": "integer",
    "page": "integer",
    "per_page": "integer",
    "summary": {
      "total_amount": "number",
      "total_records": "integer",
      "date_range": {
        "from": "date",
        "to": "date"
      }
    },
    "billing_records": [
      {
        "id": "integer",
        "worklist": {
          "id": "integer",
          "date": "datetime"
        },
        "description": "string",
        "amount": "number",
        "insurance_coverage": {
          "insurance_id": "integer",
          "insurance_name": "string",
          "coverage_amount": "number"
        },
        "patient_portion": "number",
        "payment_status": "string",
        "is_active": "boolean",
        "audit": {
          "created_on": "datetime",
          "created_by": "integer",
          "modified_on": "datetime",
          "modified_by": "integer"
        }
      }
    ],
    "grouping": {
      "group_by": "string",
      "groups": [
        {
          "key": "string",
          "total_amount": "number",
          "record_count": "integer"
        }
      ]
    }
  }
  ```

### Clinical Examinations

#### GET /api/v1/patients/{patient_id}/eye-exams

- **Purpose**: Retrieve comprehensive eye examination history
- **Path Parameters**:
  - patient_id: integer (required)
    - Description: Unique identifier of the patient
    - Example: 12345

- **Query Parameters**:
  - date_from: date (optional)
    - Description: Filter records from this date
    - Format: YYYY-MM-DD
  - date_to: date (optional)
    - Description: Filter records until this date
    - Format: YYYY-MM-DD
  - include_inactive: boolean (optional)
    - Description: Include inactive records
    - Default: false
  - page: integer (optional)
    - Description: Page number for pagination
    - Default: 1
  - per_page: integer (optional)
    - Description: Number of records per page
    - Default: 20
    - Max: 100

- **Response Schema**:

  ```json
  {
    "total": "integer",
    "page": "integer",
    "per_page": "integer",
    "examinations": [
      {
        "id": "integer",
        "worklist": {
          "id": "integer",
          "requested_time": "datetime",
          "provider": {
            "id": "integer",
            "first_name": "string",
            "last_name": "string"
          },
          "senior": {
            "id": "integer",
            "first_name": "string",
            "last_name": "string"
          },
          "facility": {
            "id": "integer",
            "facility_name": "string"
          },
          "laterality": "string",
          "status_flag": "string"
        },
        "refraction": {
          "objective": {
            "id": "integer",
            "timestamp": "datetime",
            "laterality": "string",
            "distance": {
              "va": "decimal(3,2)",
              "sphere": "decimal(4,2)",
              "cylinder": "decimal(4,2)",
              "axis": "integer",
              "optotype": "integer"
            },
            "intermediate": {
              "va": "decimal(3,2)",
              "sphere": "decimal(4,2)",
              "cylinder": "decimal(4,2)",
              "axis": "integer",
              "optotype": "integer"
            },
            "near": {
              "va": "decimal(3,2)",
              "sphere": "decimal(4,2)",
              "cylinder": "decimal(4,2)",
              "axis": "integer",
              "optotype": "integer"
            },
            "pd05": "decimal(4,2)",
            "prism": {
              "vertical": {
                "amount": "decimal(4,2)",
                "base": "string"
              },
              "horizontal": {
                "amount": "decimal(4,2)",
                "base": "string"
              },
              "angle": "integer"
            }
          },
          "glasses_prescription": {
            "id": "integer",
            "uuid": "string",
            "datestamp": "date",
            "right_eye": {
              "distance": {
                "sphere": "decimal(4,2)",
                "cylinder": "decimal(4,2)",
                "axis": "integer"
              },
              "intermediate": {
                "sphere": "decimal(4,2)",
                "cylinder": "decimal(4,2)",
                "axis": "integer"
              },
              "near": {
                "sphere": "decimal(4,2)",
                "cylinder": "decimal(4,2)",
                "axis": "integer"
              },
              "prism": {
                "amount": "decimal(4,2)",
                "base": "string"
              }
            },
            "left_eye": {
              "distance": {
                "sphere": "decimal(4,2)",
                "cylinder": "decimal(4,2)",
                "axis": "integer"
              },
              "intermediate": {
                "sphere": "decimal(4,2)",
                "cylinder": "decimal(4,2)",
                "axis": "integer"
              },
              "near": {
                "sphere": "decimal(4,2)",
                "cylinder": "decimal(4,2)",
                "axis": "integer"
              },
              "prism": {
                "amount": "decimal(4,2)",
                "base": "string"
              }
            },
            "features": {
              "art30": "boolean",
              "tint": "boolean",
              "photo": "boolean"
            },
            "remarks": "string"
          },
          "contacts_prescription": {
            "id": "integer",
            "uuid": "string",
            "datestamp": "date",
            "right_eye": {
              "sphere": "decimal(4,2)",
              "cylinder": "decimal(4,2)",
              "axis": "integer",
              "lens": {
                "name": "string",
                "diameter": "string",
                "edge": "string",
                "design": "string",
                "base_curve": "string",
                "material": "string",
                "optical_zone": "string",
                "cleaning": "string"
              },
              "add": "decimal(4,2)"
            },
            "left_eye": {
              "sphere": "decimal(4,2)",
              "cylinder": "decimal(4,2)",
              "axis": "integer",
              "lens": {
                "name": "string",
                "diameter": "string",
                "edge": "string",
                "design": "string",
                "base_curve": "string",
                "material": "string",
                "optical_zone": "string",
                "cleaning": "string"
              },
              "add": "decimal(4,2)"
            },
            "features": {
              "spheric": "boolean",
              "toric": "boolean",
              "rigid": "boolean",
              "soft": "boolean",
              "iris_tinted": "boolean",
              "pupil_tinted": "boolean"
            },
            "remarks": "string"
          }
        },
        "anterior_segment": {
          "id": "integer",
          "laterality": "string",
          "outer": "string",
          "cornea": "string",
          "anterior_chamber": "string",
          "iris": "string",
          "lens": "string",
          "other": "string"
        },
        "posterior_segment": {
          "id": "integer",
          "laterality": "string",
          "posterior_chamber": "string",
          "vitreous": "string",
          "retina": "string",
          "macula": "string",
          "papilla": "string",
          "other": "string"
        },
        "additional_tests": {
          "pupils": {
            "id": "integer",
            "description": "string"
          },
          "motility": {
            "id": "integer",
            "description": "string"
          },
          "tonometry": {
            "id": "integer",
            "timestamp": "datetime",
            "laterality": "string",
            "pressure": "decimal(4,2)",
            "pachymetry": "integer",
            "technology": "string"
          }
        },
        "audit": {
          "created_on": "datetime",
          "created_by": "integer",
          "modified_on": "datetime",
          "modified_by": "integer",
          "is_active": "boolean"
        }
      }
    ]
  }
  ```

- **Response Format**: JSON
- **Sorting**:
  - Default: Most recent first (by worklist.requested_time)
  - Configurable by date, exam type
- **Relationships**:
  - Links to related procedures through worklist
  - References to imaging studies through worklist
  - Connection to treatment plans through worklist

- **Error Responses**:
  - 400: Bad Request
    - Invalid date format
    - Invalid pagination parameters
  - 404: Not Found
    - Patient not found
  - 500: Internal Server Error
    - Database connection error
    - Server processing error

## Authentication and Authorization

All endpoints require:

- Valid API key in headers
- Role-based access control
- Audit logging of all operations

## Error Handling

Standard error responses:

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

- Default: 100 requests per minute per API key
- Bulk endpoints: 20 requests per minute

## Versioning

API version included in URL path (/api/v1/) for future compatibility

---
Note: This document will be updated with specific query endpoints in the next iteration.
