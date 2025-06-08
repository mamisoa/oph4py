# Active Context: Billing Combo Import/Export Implementation

## Current Status

**Project**: Ophthalmology Electronic Medical Records (oph4py)  
**Framework**: Py4web with MVC architecture  
**Active Task**: Implement import/export functionality for billing combos  
**Date**: 2025-01-09  

## Context Overview

Working on enhancing the existing billing combo management system with import/export capabilities. The system currently allows creating reusable combinations of nomenclature codes for medical procedures, with support for secondary codes.

## Current System Architecture

### Database Schema

- **billing_combo** table: Stores combo definitions
  - `combo_name`: String (required)
  - `combo_description`: String (optional)
  - `specialty`: String (ophthalmology/general/consultation)
  - `combo_codes`: TEXT field storing JSON array

### Current JSON Structure (combo_codes field)

```json
[
  {
    "nomen_code": 105755,
    "nomen_desc_fr": "Description in French",
    "feecode": 123,
    "fee": "45.50",
    "secondary_nomen_code": 102030,
    "secondary_nomen_desc_fr": "Secondary description",
    "secondary_feecode": 456,
    "secondary_fee": "12.30"
  }
]
```

### Key Components

- **API Endpoints**: `/api/billing_combo` (CRUD operations)
- **NomenclatureClient**: Handles external API integration (`api/core/nomenclature.py`)
- **Frontend**: `templates/manage/billing_combo.html` + `static/js/billing-combo-manager.js`

## Refined Implementation Plan

### Key Insight: Simplified Code-Only Approach

**Decision**: Export only nomenclature codes, fetch all other data (descriptions, fees) from NomenclatureClient during import.

**Benefits**:

- Always current nomenclature data
- Smaller export files
- Simpler validation
- Future-proof imports

### Export Format (Simplified)

```json
{
  "export_info": {
    "version": "1.0",
    "exported_at": "2025-01-09T10:30:00Z",
    "exported_by": "user_email@domain.com"
  },
  "combo_data": {
    "combo_name": "Standard Consultation",
    "combo_description": "Standard ophthalmology consultation",
    "specialty": "ophthalmology",
    "combo_codes": [
      {
        "nomen_code": 105755,
        "secondary_nomen_code": 102030
      },
      {
        "nomen_code": 108820
      }
    ]
  }
}
```

## Implementation Phases

### Phase 1: Export Functionality

**Backend**: New API endpoint `GET /api/billing_combo/<id>/export`

- Extract only codes from existing combo_codes JSON
- Add export metadata (timestamp, user, version)
- Generate downloadable JSON file

**Frontend**: Add export button to combo table

- Download with filename: `billing_combo_[name]_[date].json`
- Success toast confirmation

### Phase 2: Import Functionality

**Backend**: New API endpoint `POST /api/billing_combo/import`

- Multi-layer validation (schema, nomenclature, business rules)
- Real-time code verification via NomenclatureClient
- Fresh data population from current nomenclature API

**Frontend**: Import modal with file upload

- Drag-and-drop support
- Real-time validation feedback
- Import preview before confirmation

### Phase 3: Comprehensive Validation

#### 1. JSON Schema Validation

- Required fields verification
- Data type validation
- Specialty enum validation
- Array structure validation

#### 2. Nomenclature Code Validation

```python
# Key validation logic:
- Verify each nomen_code exists via NomenclatureClient.get_code_details()
- Verify secondary codes exist (if provided)
- Ensure main ≠ secondary codes
- Handle missing codes with clear error messages
```

#### 3. Business Logic Validation

- Combo name uniqueness (warning)
- Reasonable code count limits
- Duplicate code detection
- Specialty consistency

## Technical Implementation Details

### Files to Modify/Create

**Backend** (`api/endpoints/billing.py`):

- `billing_combo_export(combo_id)` - Export endpoint
- `billing_combo_import()` - Import endpoint with validation

**Frontend**:

- `templates/manage/billing_combo.html` - Add import button
- `static/js/billing-combo-manager.js` - Import/export methods
- New import modal template

**Validation**:

- JSON schema definition
- Validation helper functions
- Error handling and reporting

### Key Functions to Implement

```python
# Export
def export_billing_combo(combo_id: int) -> Dict

# Import & Validation
async def validate_nomenclature_codes(combo_codes: List[Dict]) -> Dict
def validate_business_rules(combo_data: Dict) -> List[str]
def import_billing_combo() -> APIResponse

# Frontend
class BillingComboManager:
    async exportCombo(comboId: int)
    async importCombo(file: File)
    validateImportFile(jsonData: Object)
```

## User Experience Flow

### Export Flow

1. User clicks "Export" button on combo row
2. System generates JSON with codes only
3. File downloads: `billing_combo_[name]_[date].json`
4. Success confirmation

### Import Flow

1. User clicks "Import Combo" button
2. File upload modal with drag-and-drop
3. Real-time JSON validation
4. Nomenclature code verification via API
5. Import preview with fresh nomenclature data
6. User confirms import
7. Combo created with current API data

## Success Criteria

- ✅ Export generates lightweight, portable JSON files
- ✅ Import validates codes against live nomenclature API
- ✅ Imported combos have current fee/description data
- ✅ Clear error messages for validation failures
- ✅ No data loss or corruption during import/export
- ✅ Consistent UI/UX with existing combo management

## Implementation Progress

### ✅ Phase 1: Export Functionality - COMPLETE
- **Backend Export Endpoint**: `GET /api/billing_combo/<id>/export` implemented
- **Frontend Export Button**: Added to combo table with download functionality  
- **Export Format**: Simplified JSON with only nomenclature codes
- **User Experience**: One-click export with automatic file naming

### 🔄 Phase 2: Import Functionality - IN PROGRESS  
- **Next**: Create import endpoint with validation layers
- **Next**: Build import modal interface
- **Next**: Test with various combo formats

## Next Steps

1. ✅ ~~Implement export endpoint and frontend button~~ - **COMPLETE**
2. Create import endpoint with validation layers - **NEXT**
3. Build import modal interface  
4. Test with various combo formats
5. Update CHANGELOG.md with full implementation details

## Dependencies

- **NomenclatureClient**: Core dependency for code validation
- **Bootstrap Table**: For UI integration
- **py4web REST API**: For endpoint consistency
- **JSON Schema**: For validation rules

## Notes

- Remember to follow py4web patterns (auth.user, db decorators)
- Use existing APIResponse patterns for consistency
- Add comprehensive docstrings per project rules
- Test with various combo configurations including secondary codes
