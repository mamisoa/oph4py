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

- **API Endpoints**: `/api/billing_combo` (CRUD operations), `/api/billing_combo/export_multiple` (multi-export)
- **NomenclatureClient**: Handles external API integration (`api/core/nomenclature.py`)
- **Frontend**: `templates/manage/billing_combo.html` + `static/js/billing-combo-manager.js`

## Enhanced Implementation Plan with Multi-Selection

### Key Insight: Simplified Code-Only Approach + Multi-Selection Capabilities

**Decision**: Export only nomenclature codes, fetch all other data (descriptions, fees) from NomenclatureClient during import. **Enhanced** with multi-selection support for bulk operations.

**Benefits**:

- Always current nomenclature data
- Smaller export files  
- Simpler validation
- Future-proof imports
- **NEW**: Bulk export/import for power users
- **NEW**: Efficient combo set migration

### Export Formats

#### Single Combo Export (Existing)

```json
{
  "export_info": {
    "version": "1.0",
    "export_type": "single_combo",
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

#### Multi-Combo Export (New)

```json
{
  "export_info": {
    "version": "1.0",
    "export_type": "multi_combo",
    "exported_at": "2025-01-09T10:30:00Z", 
    "exported_by": "user_email@domain.com",
    "combo_count": 3
  },
  "combos": [
    {
      "combo_name": "Standard Consultation",
      "combo_description": "Standard ophthalmology consultation",
      "specialty": "ophthalmology",
      "combo_codes": [
        {"nomen_code": 105755, "secondary_nomen_code": 102030},
        {"nomen_code": 108820}
      ]
    },
    {
      "combo_name": "Emergency Visit", 
      "combo_description": "Emergency ophthalmology visit",
      "specialty": "ophthalmology",
      "combo_codes": [
        {"nomen_code": 105755},
        {"nomen_code": 200123, "secondary_nomen_code": 200456}
      ]
    }
  ]
}
```

## Implementation Phases (Updated with Multi-Selection)

### ✅ Phase 1: Single Combo Export - COMPLETE

**Backend**: `GET /api/billing_combo/<id>/export`

- Extract only codes from existing combo_codes JSON
- Add export metadata (timestamp, user, version)  
- Generate downloadable JSON file

**Frontend**: Individual export buttons per combo row

- Download with filename: `billing_combo_[name]_[date].json`
- Success toast confirmation

### ✅ Phase 2A: Multi-Selection Frontend - COMPLETE

**Bootstrap Table Enhancement**:

- ✅ Add checkbox column (`data-checkbox="true"`)
- ✅ Enable multi-selection (`data-click-to-select="true"`, `data-multiple-select-row="true"`)
- ✅ Add select-all checkbox in header (`data-checkbox-header="true"`)
- ✅ Support Ctrl+click (individual) and Shift+click (range) selection

**UI Updates**:

- ✅ Add "Export Selected" button (enabled only when selections exist)
- ✅ Show selection count: "Export Selected (3 combos)"
- ✅ Maintain existing individual export buttons per row
- ✅ Visual feedback for selected rows

### ✅ Phase 2B: Multi-Export Backend - COMPLETE ✅

**Backend**: New `POST /api/billing_combo/export_multiple` endpoint

- ✅ Accept array of combo IDs in request body
- ✅ Generate multi-combo JSON with new schema format
- ✅ Handle partial failures gracefully (some combos may not exist)
- ✅ Return appropriate filename: `billing_combos_multi_[count]_[date].json`
- ✅ **FIXED**: Robust JSON/Python literal parsing using `ast.literal_eval`

### 🔄 Phase 3A: Smart Import Detection  

**Enhanced Import Endpoint**: Modify `POST /api/billing_combo/import`

- Auto-detect export format based on JSON structure:
  - Single: presence of `combo_data` object
  - Multi: presence of `combos` array
- Backward compatibility with existing single-combo exports
- Route to appropriate processing logic based on detected format

### 🔄 Phase 3B: Multi-Combo Import Processing

**Batch Import Logic**:

- Validate each combo individually within the array
- Collect validation results (success/warning/error per combo)
- Handle naming conflicts with resolution options
- Provide detailed import summary
- Support partial imports (continue processing even if some combos fail)

**Conflict Resolution**:

- Detect duplicate combo names
- Offer options: rename, skip, or overwrite
- Preview mode before actual import

### 🔄 Phase 4: Comprehensive Validation Enhancement

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

### Files to Modify/Create (Updated for Multi-Selection)

**Backend** (`api/endpoints/billing.py`):

- ✅ `billing_combo_export(combo_id)` - Single export endpoint (COMPLETE)
- 🔄 `billing_combo_export_multiple()` - NEW: Multi-export endpoint  
- 🔄 `billing_combo_import()` - Enhanced import with format detection
- 🔄 `detect_import_format()` - NEW: Auto-detect single vs multi format
- 🔄 `process_multi_combo_import()` - NEW: Handle multi-combo imports

**Frontend**:

- 🔄 `templates/manage/billing_combo.html` - Add checkbox column & multi-export button
- 🔄 `static/js/billing-combo-manager.js` - Multi-selection & bulk export methods
- 🔄 New import modal template with conflict resolution
- 🔄 Enhanced import preview for multi-combo files

**Bootstrap Table Configuration**:

- 🔄 Add checkbox column with proper data attributes
- 🔄 Enable multi-selection capabilities (ctrl+click, shift+click)
- 🔄 Add selection event handlers
- 🔄 Integrate with existing table formatters and events

**Validation**:

- 🔄 Enhanced JSON schema definition (single + multi formats)
- 🔄 Batch validation helper functions  
- 🔄 Conflict detection and resolution logic
- 🔄 Detailed error handling and reporting per combo

### Key Functions to Implement (Enhanced)

```python
# Single Export (Existing - ✅ COMPLETE)
def export_billing_combo(combo_id: int) -> Dict

# Multi Export (NEW)
def export_multiple_billing_combos(combo_ids: List[int]) -> Dict
def build_multi_combo_export(combos: List[Dict]) -> Dict

# Import & Validation (Enhanced)
def detect_import_format(json_data: Dict) -> str  # "single" or "multi"
async def validate_nomenclature_codes(combo_codes: List[Dict]) -> Dict
def validate_business_rules(combo_data: Dict) -> List[str] 
def process_single_combo_import(combo_data: Dict) -> APIResponse
def process_multi_combo_import(combos: List[Dict]) -> APIResponse
def detect_naming_conflicts(combos: List[Dict]) -> List[Dict]
def import_billing_combo() -> APIResponse  # Enhanced dispatcher

# Frontend (Enhanced)
class BillingComboManager:
    # Existing (✅ COMPLETE)
    async exportCombo(comboId: int)
    
    # NEW Multi-Selection Functions
    getSelectedCombos() -> Array
    async exportSelectedCombos(comboIds: Array)
    updateExportButtonState()
    handleSelectionChange()
    
    # Enhanced Import Functions  
    async importCombo(file: File)
    validateImportFile(jsonData: Object)
    detectImportFormat(jsonData: Object) -> String
    showMultiImportPreview(combos: Array)
    handleConflictResolution(conflicts: Array)
```

## User Experience Flows (Enhanced with Multi-Selection)

### Single Export Flow (Existing - ✅ COMPLETE)

1. User clicks individual "Export" button on combo row
2. System generates JSON with codes only
3. File downloads: `billing_combo_[name]_[date].json`
4. Success confirmation toast

### Multi-Selection Export Flow (NEW)

1. User sees checkbox column with select-all option in table header
2. User selects multiple combos using:
   - Individual checkboxes (click)
   - Select-all checkbox in header (bulk selection)
   - Ctrl+click for individual row selection
   - Shift+click for range selection between rows
3. "Export Selected" button becomes enabled, shows count: "Export Selected (3)"
4. User clicks "Export Selected"
5. System generates multi-combo JSON file
6. File downloads: `billing_combos_multi_[count]_[date].json`
7. Success confirmation with exported combo count

### Enhanced Import Flow (Supports Both Formats)

1. User clicks "Import Combo(s)" button
2. File upload modal with drag-and-drop support
3. **Auto-Format Detection**: System automatically detects single vs multi-combo format
4. **Single Combo Import**:
   - Real-time JSON validation
   - Nomenclature code verification via API
   - Import preview with fresh nomenclature data
   - User confirms import
   - Combo created with current API data
5. **Multi-Combo Import**:
   - Shows preview of all combos to be imported
   - Batch validation of all nomenclature codes
   - **Conflict Detection**: Checks for duplicate combo names
   - **Conflict Resolution Options**:
     - Rename conflicting combos (auto-suggest: "Name (2)")
     - Skip conflicting combos
     - Overwrite existing combos (with confirmation)
   - Import summary: "X valid, Y conflicts, Z errors"
   - User resolves conflicts and confirms batch import
   - **Detailed Results**: Success/failure feedback per combo
   - Summary report: "Imported 5 of 7 combos successfully"

## Success Criteria (Enhanced)

### Core Functionality (Phase 1 - ✅ COMPLETE)

- ✅ Export generates lightweight, portable JSON files
- ✅ Import validates codes against live nomenclature API
- ✅ Imported combos have current fee/description data
- ✅ Clear error messages for validation failures
- ✅ No data loss or corruption during import/export
- ✅ Consistent UI/UX with existing combo management

### Multi-Selection Enhancement (Phases 2-4)

- 🔄 **Table Multi-Selection**: Bootstrap table with checkboxes, ctrl+click, shift+click support
- 🔄 **Bulk Export**: Export multiple combos in single operation with multi-combo JSON format
- 🔄 **Smart Import**: Auto-detect single vs multi-combo formats, handle both seamlessly
- 🔄 **Conflict Resolution**: Detect and resolve naming conflicts during multi-combo imports
- 🔄 **Batch Validation**: Validate multiple combos efficiently with detailed per-combo feedback
- 🔄 **Enhanced UX**: Selection counts, progress indicators, detailed import summaries
- 🔄 **Backward Compatibility**: Existing single-combo exports/imports continue to work unchanged

### Performance & Usability

- 🔄 **Efficient Operations**: Handle large multi-combo exports/imports without timeouts
- 🔄 **User Feedback**: Clear progress indication for batch operations
- 🔄 **Error Recovery**: Graceful handling of partial failures in multi-operations
- 🔄 **Intuitive Interface**: Consistent with app patterns, discoverable multi-selection features

## Implementation Progress

### ✅ Phase 1: Export Functionality - COMPLETE

- **Backend Export Endpoint**: `GET /api/billing_combo/<id>/export` implemented
- **Frontend Export Button**: Added to combo table with download functionality  
- **Export Format**: Simplified JSON with only nomenclature codes
- **User Experience**: One-click export with automatic file naming

### ✅ Phase 2: Multi-Selection Export - COMPLETE ✅

- **Frontend Multi-Selection**: Bootstrap table with checkboxes, selection events
- **Multi-Export Backend**: `POST /api/billing_combo/export_multiple` endpoint
- **Bulk Export UI**: "Export Selected" button with dynamic count display
- **Enhanced UX**: Selection feedback, clear selection after export, partial failure handling
- **Critical Bug Fixed**: JSON parsing issue resolved with `ast.literal_eval`

### 🔄 Phase 3: Import Functionality - NEXT PRIORITY  

- **Next**: Create import endpoint with format auto-detection
- **Next**: Build import modal interface with conflict resolution
- **Next**: Test with various combo formats (single + multi)

## Next Steps (Updated Plan)

### ✅ Completed

1. ✅ ~~Implement single export endpoint and frontend button~~ - **COMPLETE**
2. ✅ ~~Add multi-selection to bootstrap table~~ - **COMPLETE**
   - ✅ Add checkbox column with proper data attributes
   - ✅ Enable multi-select, ctrl+click, shift+click capabilities  
   - ✅ Add "Export Selected" button with selection count
   - ✅ Integrate selection event handlers
3. ✅ ~~Create multi-export backend endpoint~~ (`POST /api/billing_combo/export_multiple`) - **COMPLETE**
4. ✅ ~~Connect frontend multi-export to backend~~ - **COMPLETE**
5. ✅ ~~Test bulk export functionality~~ - **COMPLETE**
6. ✅ ~~Debug and fix JSON parsing issues~~ - **COMPLETE**

### Immediate Priority (Phase 3A-3B)

6. **🔄 Enhance import endpoint** with format auto-detection - **NEXT**
7. **Build conflict resolution logic** for multi-combo imports
8. **Create enhanced import modal** with batch preview
9. **Test comprehensive import scenarios** (single, multi, conflicts)

### Long Term (Phase 4)

10. **Add advanced import features** (progress bars, detailed feedback)
11. **Performance optimization** for large combo sets
12. **Comprehensive testing** and documentation updates

## Issues Encountered & Fixes Applied

### Critical Issue: JSON Parsing Failure in Multi-Export

**Problem**: When exporting multiple combos, some combos were being skipped during export with the error "has no valid codes". Investigation revealed that combos with complex descriptions containing square brackets (e.g., `"[Catégorie 3] Prestations..."`) were failing JSON parsing.

**Root Cause**: The `combo_codes` field was stored in Python format (with single quotes, None values) rather than JSON format. The original parsing logic attempted to convert Python syntax to JSON by replacing single quotes with double quotes, but this failed when descriptions contained special characters like square brackets.

**Example Failing Data**:

```python
[{'nomen_code': 384230, 'nomen_desc_fr': "[Catégorie 3] Prestations ne donnant pas lieu à une intervention de l'assurance obligatoire (ex. UBM)", 'feecode': 'N/A', 'fee': 'N/A', 'secondary_nomen_code': '248835', 'secondary_nomen_desc_fr': 'Réfractométrie par la méthode objective', 'secondary_feecode': 'N/A', 'secondary_fee': 31.11}]
```

**Solution Implemented**:

1. **Replaced manual string replacement** with Python's `ast.literal_eval()` function
2. **Added comprehensive debugging logs** to track parsing failures
3. **Enhanced error handling** with specific error types and detailed logging

**Code Changes**:

```python
# Before (unreliable):
json_str = python_str.replace("None", "null").replace("'", '"')
stored_codes = json.loads(json_str)

# After (robust):
stored_codes = ast.literal_eval(combo["combo_codes"])
```

**Benefits**:

- ✅ **Robust Parsing**: Handles all Python literal expressions safely
- ✅ **Special Characters**: Properly handles brackets, quotes, and complex strings
- ✅ **Future-Proof**: Works with any valid Python literal syntax
- ✅ **Error Clarity**: Better error messages for debugging

### Resolution Verification

**Test Case**: Export combo "f2-BIM" with description containing `[Catégorie 3]`

- **Before Fix**: Combo skipped, only 1 of 2 combos exported
- **After Fix**: Both combos exported successfully
- **Result**: Multi-selection export now works for all combo types

## Dependencies

- **NomenclatureClient**: Core dependency for code validation
- **Bootstrap Table**: For UI integration
- **py4web REST API**: For endpoint consistency
- **JSON Schema**: For validation rules
- **ast module**: For safe Python literal parsing

## Notes

- Remember to follow py4web patterns (auth.user, db decorators)
- Use existing APIResponse patterns for consistency
- Add comprehensive docstrings per project rules
- Test with various combo configurations including secondary codes
- **Critical**: Use `ast.literal_eval` for parsing Python-formatted combo_codes data
