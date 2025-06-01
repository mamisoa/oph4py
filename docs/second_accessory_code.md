# Secondary Nomenclature Code Enhancement

**Document Version**: 1.0  
**Created**: 2025-06-01T23:35:54.967979  
**Author**: Development Team  
**Status**: Planning Phase

## 📋 **Overview**

This document outlines the implementation plan for enhancing the billing system to support secondary nomenclature codes. This feature allows users to associate an optional secondary nomenclature code with each main code, enabling more comprehensive billing scenarios such as:

- Main procedure + additional procedure
- Consultation + specific examination
- Primary diagnosis + secondary diagnosis
- Complex procedures requiring multiple coding

## 🎯 **Business Requirements**

### **Primary Use Cases**

1. **Complex Procedures**: Some medical procedures require both a primary and secondary nomenclature code
2. **Comprehensive Billing**: Enable more accurate and complete billing representation
3. **Regulatory Compliance**: Meet requirements for detailed medical coding
4. **Fee Optimization**: Capture all billable components of a procedure

### **User Stories**

- As a medical practitioner, I want to add a secondary code to complement the main procedure code
- As a billing administrator, I want to see both main and secondary codes in billing summaries
- As a patient, I want transparent billing that accurately reflects all services provided

## 🏗️ **Technical Implementation Plan**

### **Phase 1: Database Schema Enhancement** ⏱️ 2-3 days

#### **Option A: Field Duplication (Recommended)**

Add secondary fields to existing `billing_codes` table:

```sql
-- Migration script
ALTER TABLE billing_codes ADD COLUMN secondary_nomen_code INTEGER NULL;
ALTER TABLE billing_codes ADD COLUMN secondary_nomen_desc_fr STRING NULL;
ALTER TABLE billing_codes ADD COLUMN secondary_nomen_desc_nl STRING NULL;
ALTER TABLE billing_codes ADD COLUMN secondary_fee DECIMAL(6,2) NULL;
ALTER TABLE billing_codes ADD COLUMN secondary_feecode INTEGER NULL;
```

#### **Benefits of This Approach**

- ✅ Simple schema design
- ✅ Maintains single record per billing entry
- ✅ Easy to query and maintain relationships
- ✅ Preserves existing API compatibility
- ✅ Straightforward data migration

#### **Database Constraints**

- Secondary codes are optional (NULL allowed)
- Main code remains required
- Fee validation ensures non-negative values
- Foreign key relationships maintained

### **Phase 2: Model Definition Update** ⏱️ 1 day

#### **PyDAL Model Enhancement**

Update `models.py` to include secondary fields:

```python
db.define_table(
    "billing_codes",
    Field("id_auth_user", "reference auth_user", required=True),
    Field("id_worklist", "reference worklist", required=True),
    
    # Main nomenclature code (existing)
    Field("nomen_code", "integer", required=True),
    Field("nomen_desc_fr", "string"),
    Field("nomen_desc_nl", "string"),
    Field("fee", "decimal(6,2)"),
    Field("feecode", "integer"),
    
    # Secondary nomenclature code (new)
    Field("secondary_nomen_code", "integer"),
    Field("secondary_nomen_desc_fr", "string"),
    Field("secondary_nomen_desc_nl", "string"),
    Field("secondary_fee", "decimal(6,2)"),
    Field("secondary_feecode", "integer"),
    
    # Common fields (existing)
    Field("laterality", "string", default="both"),
    Field("quantity", "integer", default=1),
    Field("date_performed", "date"),
    Field("note", "string"),
    Field("status", "string", default="draft"),
    auth.signature,
)

# Add validation rules
db.billing_codes.secondary_fee.requires = IS_EMPTY_OR(IS_DECIMAL_IN_RANGE(0, 999999.99))
```

### **Phase 3: Frontend Interface Enhancement** ⏱️ 3-4 days

#### **Template Updates** (`templates/modalityCtr/md.html`)

##### **Current Structure Modification**

Replace single nomenclature code section with structured main/secondary layout:

```html
<!-- Main Nomenclature Code Section -->
<div class="row mb-3">
    <div class="col-12">
        <h6 class="text-primary">
            <i class="fas fa-star"></i> Main Nomenclature Code *
        </h6>
    </div>
    <div class="col-md-3">
        <label for="billNomenCode" class="form-label">Code</label>
        <input type="number" class="form-control" id="billNomenCode" 
               name="nomen_code" required readonly>
        <div class="form-text">Primary procedure code</div>
    </div>
    <div class="col-md-6">
        <label for="billNomenDesc" class="form-label">Description</label>
        <input type="text" class="form-control" id="billNomenDesc" 
               name="nomen_desc_fr" readonly>
    </div>
    <div class="col-md-3">
        <label for="billFee" class="form-label">Fee (€)</label>
        <input type="number" class="form-control" id="billFee" 
               name="fee" step="0.01">
    </div>
</div>

<!-- Secondary Nomenclature Code Section -->
<div class="row mb-3">
    <div class="col-12">
        <h6 class="text-secondary">
            <i class="fas fa-plus-circle"></i> Secondary Nomenclature Code (Optional)
            <button type="button" class="btn btn-sm btn-outline-danger ms-2" 
                    id="clearSecondaryBtn" style="display: none;">
                <i class="fas fa-times"></i> Clear
            </button>
        </h6>
    </div>
    <div class="col-md-3">
        <label for="billSecondaryNomenCode" class="form-label">Code</label>
        <input type="number" class="form-control" id="billSecondaryNomenCode" 
               name="secondary_nomen_code" readonly>
        <div class="form-text">Additional procedure code</div>
    </div>
    <div class="col-md-6">
        <label for="billSecondaryNomenDesc" class="form-label">Description</label>
        <input type="text" class="form-control" id="billSecondaryNomenDesc" 
               name="secondary_nomen_desc_fr" readonly>
    </div>
    <div class="col-md-3">
        <label for="billSecondaryFee" class="form-label">Fee (€)</label>
        <input type="number" class="form-control" id="billSecondaryFee" 
               name="secondary_fee" step="0.01">
    </div>
</div>

<!-- Total Fee Display -->
<div class="row mb-3">
    <div class="col-md-6 offset-md-6">
        <div class="card border-success">
            <div class="card-body py-2">
                <div class="d-flex justify-content-between">
                    <span>Main Fee:</span>
                    <span id="mainFeeDisplay">€0.00</span>
                </div>
                <div class="d-flex justify-content-between">
                    <span>Secondary Fee:</span>
                    <span id="secondaryFeeDisplay">€0.00</span>
                </div>
                <hr class="my-1">
                <div class="d-flex justify-content-between fw-bold">
                    <span>Total Fee:</span>
                    <span id="totalFeeDisplay">€0.00</span>
                </div>
            </div>
        </div>
    </div>
</div>
```

##### **Search Results Enhancement**

Update nomenclature search results table:

```html
<thead>
    <tr>
        <th>Code</th>
        <th>Description</th>
        <th>Fee (€)</th>
        <th>Fee Code</th>
        <th>Action</th>
    </tr>
</thead>
<tbody id="nomenSearchTableBody">
    <!-- Template for each search result -->
    <tr>
        <td>{code}</td>
        <td>{description}</td>
        <td>{fee}</td>
        <td>{feecode}</td>
        <td>
            <div class="btn-group" role="group">
                <button class="btn btn-sm btn-primary" 
                        onclick="selectMainCode({data})">
                    <i class="fas fa-star"></i> Main
                </button>
                <button class="btn btn-sm btn-outline-secondary" 
                        onclick="selectSecondaryCode({data})">
                    <i class="fas fa-plus"></i> Secondary
                </button>
            </div>
        </td>
    </tr>
</tbody>
```

### **Phase 4: JavaScript Enhancement** ⏱️ 2-3 days

#### **Core Functions Implementation**

Create new JavaScript functions in the existing billing script:

```javascript
/**
 * Select nomenclature code as main procedure
 * @param {Object} codeData - Nomenclature code data from search
 */
function selectMainCode(codeData) {
    document.getElementById('billNomenCode').value = codeData.nomen_code;
    document.getElementById('billNomenDesc').value = codeData.nomen_desc_fr;
    document.getElementById('billFee').value = codeData.fee || '';
    
    updateTotalFee();
    showNotification('Main code selected', 'success');
}

/**
 * Select nomenclature code as secondary procedure
 * @param {Object} codeData - Nomenclature code data from search
 */
function selectSecondaryCode(codeData) {
    document.getElementById('billSecondaryNomenCode').value = codeData.nomen_code;
    document.getElementById('billSecondaryNomenDesc').value = codeData.nomen_desc_fr;
    document.getElementById('billSecondaryFee').value = codeData.fee || '';
    
    document.getElementById('clearSecondaryBtn').style.display = 'inline-block';
    updateTotalFee();
    showNotification('Secondary code selected', 'success');
}

/**
 * Clear secondary nomenclature code
 */
function clearSecondaryCode() {
    document.getElementById('billSecondaryNomenCode').value = '';
    document.getElementById('billSecondaryNomenDesc').value = '';
    document.getElementById('billSecondaryFee').value = '';
    document.getElementById('clearSecondaryBtn').style.display = 'none';
    
    updateTotalFee();
    showNotification('Secondary code cleared', 'info');
}

/**
 * Update total fee calculation
 */
function updateTotalFee() {
    const mainFee = parseFloat(document.getElementById('billFee').value) || 0;
    const secondaryFee = parseFloat(document.getElementById('billSecondaryFee').value) || 0;
    const totalFee = mainFee + secondaryFee;
    
    document.getElementById('mainFeeDisplay').textContent = `€${mainFee.toFixed(2)}`;
    document.getElementById('secondaryFeeDisplay').textContent = `€${secondaryFee.toFixed(2)}`;
    document.getElementById('totalFeeDisplay').textContent = `€${totalFee.toFixed(2)}`;
}

/**
 * Enhanced form validation
 */
function validateBillingForm() {
    const mainCode = document.getElementById('billNomenCode').value;
    const secondaryCode = document.getElementById('billSecondaryNomenCode').value;
    
    // Main code is required
    if (!mainCode) {
        showNotification('Main nomenclature code is required', 'error');
        return false;
    }
    
    // If secondary code is provided, it must be different from main
    if (secondaryCode && secondaryCode === mainCode) {
        showNotification('Secondary code must be different from main code', 'error');
        return false;
    }
    
    return true;
}
```

#### **Event Listeners**

```javascript
// Add event listeners for fee updates
document.getElementById('billFee').addEventListener('input', updateTotalFee);
document.getElementById('billSecondaryFee').addEventListener('input', updateTotalFee);
document.getElementById('clearSecondaryBtn').addEventListener('click', clearSecondaryCode);
```

### **Phase 5: Backend API Enhancement** ⏱️ 2-3 days

#### **API Endpoint Updates** (`api/endpoints/billing.py`)

##### **Request Handling Enhancement**

Update the billing codes API to handle secondary fields:

```python
@action("api/billing_codes", method=["GET", "POST"])
@action("api/billing_codes/<rec_id:int>", method=["GET", "PUT", "DELETE"])
def billing_codes(rec_id: Optional[int] = None):
    """
    Enhanced CRUD operations for billing codes with secondary nomenclature support.
    """
    try:
        if request.method in ["POST", "PUT"]:
            # Enhanced data validation
            data = request.json
            
            # Validate main code (required)
            if not data.get("nomen_code"):
                return dict(error="Main nomenclature code is required", status=400)
            
            # Validate secondary code (optional, but if provided must be different)
            secondary_code = data.get("secondary_nomen_code")
            if secondary_code and secondary_code == data.get("nomen_code"):
                return dict(error="Secondary code must be different from main code", status=400)
            
            # Calculate total fee for logging
            main_fee = float(data.get("fee", 0))
            secondary_fee = float(data.get("secondary_fee", 0))
            total_fee = main_fee + secondary_fee
            
            logger.info(f"Billing code - Main: {data.get('nomen_code')}, "
                       f"Secondary: {secondary_code}, Total Fee: €{total_fee}")
        
        # Use existing REST API handler with enhanced validation
        return handle_rest_api_request("billing_codes", str(rec_id) if rec_id else None)
        
    except Exception as e:
        logger.error(f"Error in enhanced billing_codes endpoint: {str(e)}")
        return dict(error=f"Server error: {str(e)}", status=500)
```

##### **Response Enhancement**

Ensure API responses include secondary fields:

```python
def enhance_billing_response(record):
    """
    Enhance billing code response with calculated totals
    """
    if record:
        main_fee = float(record.get("fee", 0))
        secondary_fee = float(record.get("secondary_fee", 0))
        record["total_fee"] = main_fee + secondary_fee
        record["has_secondary"] = bool(record.get("secondary_nomen_code"))
    
    return record
```

### **Phase 6: Display Enhancement** ⏱️ 2-3 days

#### **Billing Codes Table Update**

Update the billing codes display table in `templates/modalityCtr/md.html`:

```html
<!-- Enhanced table structure -->
<table class="table table-striped" id="billingCodesTable">
    <thead>
        <tr>
            <th>Main Code</th>
            <th>Main Description</th>
            <th>Main Fee</th>
            <th>Secondary Code</th>
            <th>Secondary Description</th>
            <th>Secondary Fee</th>
            <th>Total Fee</th>
            <th>Laterality</th>
            <th>Status</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        <!-- Rows populated via JavaScript -->
    </tbody>
</table>
```

#### **JavaScript Table Population**

```javascript
function populateBillingTable(data) {
    const tableBody = document.querySelector('#billingCodesTable tbody');
    tableBody.innerHTML = '';
    
    data.forEach(row => {
        const hasSecondary = row.secondary_nomen_code;
        const totalFee = (parseFloat(row.fee) || 0) + (parseFloat(row.secondary_fee) || 0);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.nomen_code}</td>
            <td>${row.nomen_desc_fr || ''}</td>
            <td>€${parseFloat(row.fee || 0).toFixed(2)}</td>
            <td>${hasSecondary ? row.secondary_nomen_code : '<span class="text-muted">—</span>'}</td>
            <td>${hasSecondary ? row.secondary_nomen_desc_fr : '<span class="text-muted">—</span>'}</td>
            <td>${hasSecondary ? '€' + parseFloat(row.secondary_fee || 0).toFixed(2) : '<span class="text-muted">—</span>'}</td>
            <td class="fw-bold">€${totalFee.toFixed(2)}</td>
            <td>${row.laterality}</td>
            <td><span class="badge bg-${getStatusColor(row.status)}">${row.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editBillingCode(${row.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteBillingCode(${row.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}
```

### **Phase 7: Combo System Integration** ⏱️ 3-4 days

#### **Combo Definition Enhancement**

Update billing combo structure to support secondary codes:

```json
{
  "combo_name": "Complete Eye Examination",
  "combo_description": "Comprehensive ophthalmological examination with secondary procedures",
  "combo_codes": [
    {
      "nomen_code": 102015,
      "fee": 75.00,
      "secondary_nomen_code": 102030,
      "secondary_fee": 25.00
    },
    {
      "nomen_code": 102020,
      "fee": 50.00
    }
  ]
}
```

#### **Combo Application Logic**

Update combo application in `api/endpoints/billing.py`:

```python
def apply_billing_combo_enhanced(combo_id: int):
    """
    Enhanced combo application with secondary code support
    """
    combo = db(db.billing_combo.id == combo_id).select().first()
    if not combo:
        return dict(error="Combo not found", status=404)
    
    combo_codes = json.loads(combo.combo_codes)
    applied_codes = []
    
    for code_def in combo_codes:
        billing_data = {
            "id_auth_user": auth.user_id,
            "id_worklist": request.vars.id_worklist,
            "nomen_code": code_def["nomen_code"],
            "fee": code_def.get("fee"),
            "laterality": request.vars.get("laterality", "both"),
            "quantity": 1,
            "date_performed": request.vars.date_performed,
            "status": "draft"
        }
        
        # Add secondary code if present
        if code_def.get("secondary_nomen_code"):
            billing_data.update({
                "secondary_nomen_code": code_def["secondary_nomen_code"],
                "secondary_fee": code_def.get("secondary_fee")
            })
        
        billing_id = db.billing_codes.insert(**billing_data)
        applied_codes.append(billing_id)
    
    return dict(success=True, applied_codes=applied_codes)
```

### **Phase 8: Testing & Validation** ⏱️ 2-3 days

#### **Test Cases**

1. **Basic Functionality**
   - Add billing code with main code only
   - Add billing code with both main and secondary codes
   - Edit existing codes to add/remove secondary codes

2. **Validation Tests**
   - Attempt to use same code for main and secondary
   - Test with invalid fee values
   - Test form submission with missing main code

3. **Integration Tests**
   - Apply combos with secondary codes
   - Export billing data with secondary codes
   - Test backward compatibility with existing data

4. **User Interface Tests**
   - Test search and selection workflow
   - Test fee calculation updates
   - Test responsive design on different screen sizes

## 📊 **Data Migration Strategy**

### **Backward Compatibility**

- Existing `billing_codes` records remain unchanged
- Secondary fields default to NULL for existing records
- All existing functionality continues to work without modification

### **Migration Steps**

1. **Schema Update**: Add secondary columns with NULL constraints
2. **Application Deployment**: Deploy enhanced application
3. **User Training**: Document new functionality
4. **Gradual Adoption**: Users can adopt secondary codes as needed

## 🔍 **Quality Assurance**

### **Code Review Checklist**

- [ ] Database schema properly updated
- [ ] PyDAL model definitions correct
- [ ] Frontend form validation comprehensive
- [ ] JavaScript functions properly handle edge cases
- [ ] API endpoints maintain backward compatibility
- [ ] Fee calculations accurate
- [ ] Error handling robust
- [ ] User experience intuitive

### **Testing Checklist**

- [ ] Unit tests for all new functions
- [ ] Integration tests for API endpoints
- [ ] Frontend automation tests
- [ ] Performance testing with large datasets
- [ ] Cross-browser compatibility testing
- [ ] Mobile responsiveness testing

## 📈 **Success Metrics**

- **Adoption Rate**: % of billing codes using secondary codes within 3 months
- **User Satisfaction**: User feedback on enhanced interface
- **Error Rate**: Decrease in billing code entry errors
- **Billing Accuracy**: Improvement in comprehensive procedure coding

## 🚀 **Deployment Strategy**

### **Staging Environment**

1. Deploy schema changes
2. Deploy application updates
3. Run comprehensive test suite
4. User acceptance testing

### **Production Deployment**

1. **Off-peak Hours**: Deploy during low-usage periods
2. **Database Migration**: Execute schema changes with minimal downtime
3. **Application Update**: Deploy enhanced application
4. **Monitoring**: Monitor for errors and performance issues
5. **Rollback Plan**: Prepared rollback strategy if issues arise

## 📚 **Documentation Updates**

### **User Documentation**

- Update user manual with secondary code workflows
- Create training videos for new functionality
- Update help text and tooltips in application

### **Technical Documentation**

- Update API documentation
- Update database schema documentation
- Update deployment procedures

## 🎯 **Future Enhancements**

### **Potential Improvements**

1. **Tertiary Codes**: Support for additional procedure codes
2. **Code Templates**: Pre-defined secondary code suggestions
3. **Smart Recommendations**: AI-powered secondary code suggestions
4. **Bulk Operations**: Batch processing for multiple secondary codes
5. **Advanced Reporting**: Detailed analytics on code usage patterns

## 📋 **Implementation Timeline**

| Phase                     | Duration | Dependencies | Deliverables                      |
| ------------------------- | -------- | ------------ | --------------------------------- |
| 1. Database Schema        | 2-3 days | None         | Updated schema, migration scripts |
| 2. Model Definition       | 1 day    | Phase 1      | Updated PyDAL models              |
| 3. Frontend Interface     | 3-4 days | Phase 2      | Enhanced UI templates             |
| 4. JavaScript Enhancement | 2-3 days | Phase 3      | Frontend logic functions          |
| 5. Backend API            | 2-3 days | Phase 4      | Enhanced API endpoints            |
| 6. Display Enhancement    | 2-3 days | Phase 5      | Updated table displays            |
| 7. Combo Integration      | 3-4 days | Phase 6      | Enhanced combo system             |
| 8. Testing & Validation   | 2-3 days | Phase 7      | Test suite, validation            |

**Total Estimated Duration**: 17-25 days (3.5-5 weeks)

## ✅ **Acceptance Criteria**

### **Functional Requirements**

- [ ] Users can add secondary nomenclature codes to billing entries
- [ ] Main nomenclature code remains required
- [ ] Secondary nomenclature code is optional
- [ ] Secondary codes must be different from main codes
- [ ] Fee calculations include both main and secondary fees
- [ ] Search interface supports both main and secondary selection
- [ ] Billing tables display both codes clearly
- [ ] Combo system supports secondary codes
- [ ] Export functionality includes secondary data

### **Non-Functional Requirements**

- [ ] Performance impact < 5% on existing operations
- [ ] 100% backward compatibility with existing data
- [ ] Mobile-responsive interface
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Browser support: Chrome, Firefox, Safari, Edge (latest 2 versions)

### **Quality Requirements**

- [ ] Unit test coverage > 90%
- [ ] Integration test coverage > 85%
- [ ] Zero data loss during migration
- [ ] Error handling for all edge cases
- [ ] User-friendly error messages
- [ ] Comprehensive logging for troubleshooting

---

**Document Status**: ✅ Complete and Ready for Implementation  
**Next Steps**: Begin Phase 1 - Database Schema Enhancement  
**Contact**: Development Team for implementation questions 