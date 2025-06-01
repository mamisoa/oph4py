# Billing Module Implementation Plan

## Overview

Add a comprehensive billing module to the md.html view that integrates with the Belgian healthcare tariff nomenclature API to manage billing codes and combinations for medical procedures.

## Requirements

1. **Billing Codes Management**
   - List all billing codes related to the current worklist
   - Add individual billing codes from nomenclature API
   - Add combo codes (multiple codes at once)
   - Bootstrap table integration with md_bt.js
   - Consistent styling with existing UI

2. **Database Design**
   - Billing codes table to store selected codes
   - Combo definitions table for predefined code combinations
   - Proper relationships with worklist and patient

3. **API Integration**
   - FastAPI nomenclature server integration
   - Search and autocomplete for billing codes
   - Real-time code validation and fee calculation

## Phase 1: Database Schema

### 1.1 Billing Codes Table

```python
db.define_table('billing_codes',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_worklist', 'reference worklist', required=True),
    Field('nomen_code', 'integer', required=True),
    Field('nomen_desc_fr', 'string'),
    Field('nomen_desc_nl', 'string'),
    Field('fee', 'decimal(6,2)'),
    Field('feecode', 'integer'),
    Field('laterality', 'string', default='both'),
    Field('quantity', 'integer', default=1),
    Field('date_performed', 'date'),
    Field('note', 'string'),
    Field('status', 'string', default='draft'),
    auth.signature)

db.billing_codes.laterality.requires = IS_IN_SET(['both', 'right', 'left', 'none'])
db.billing_codes.status.requires = IS_IN_SET(['draft', 'validated', 'billed', 'paid'])
```

### 1.2 Combo Definitions Table

```python
db.define_table('billing_combo',
    Field('combo_name', 'string', required=True),
    Field('combo_description', 'string'),
    Field('combo_codes', 'text'),  # JSON array of nomen_codes
    Field('specialty', 'string'),
    Field('is_active', 'boolean', default=True),
    auth.signature,
    format='%(combo_name)s')

db.billing_combo.specialty.requires = IS_IN_SET(['ophthalmology', 'general', 'consultation'])
```

### 1.3 Combo Usage Table

```python
db.define_table('billing_combo_usage',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_worklist', 'reference worklist', required=True),
    Field('id_billing_combo', 'reference billing_combo', required=True),
    Field('applied_date', 'datetime', default=request.now),
    Field('note', 'string'),
    auth.signature)
```

## Phase 2: API Endpoints

### 2.1 Core Billing API Endpoints

```python
# In api/endpoints/billing.py

@action('api/billing_codes', method=['GET', 'POST', 'PUT', 'DELETE'])
@action.uses(db, auth.user)
def billing_codes():
    """Manage billing codes for worklist items"""
    # Standard CRUD operations
    
@action('api/billing_combo', method=['GET', 'POST', 'PUT', 'DELETE'])
@action.uses(db, auth.user)
def billing_combo():
    """Manage billing code combinations"""
    # CRUD operations for combo management

@action('api/nomenclature/search', method=['GET'])
@action.uses(auth.user)
def nomenclature_search():
    """Search nomenclature codes via FastAPI"""
    # Proxy to nomenclature FastAPI server
```

### 2.2 Nomenclature Integration

```python
# In api/core/nomenclature.py

import requests
from .base import APIResponse

NOMENCLATURE_API_URL = "https://nomen.c66.ovh"

def search_nomenclature(code_prefix=None, description=None, limit=50):
    """Search nomenclature codes via FastAPI"""
    params = {}
    if code_prefix:
        params['nomen_code_prefix'] = code_prefix
    if description:
        params['description_substring'] = description
    params['limit'] = limit
    
    try:
        response = requests.get(f"{NOMENCLATURE_API_URL}/tarifs/search", params=params)
        return response.json()
    except Exception as e:
        return {"error": str(e)}
```

## Phase 3: Frontend Components

### 3.1 HTML Template Updates (md.html)

Replace the current billing section placeholder:

```html
<div id="bill-container" class="container-fluid mb-3">
    <div class="row mb-3 big-title bg-success">
        <div class="col">
            <h2><a role="button" data-bs-toggle="collapse" href=".bill">Billing</a></h2>
        </div>
    </div>
    
    <div class="row mb-3 bill">
        <!-- Billing Codes Table -->
        <div class="col-12">
            <div class="row">
                <div class="col">
                    <h3 class="title-right">Billing Codes</h3>
                    <button type="button" id="btnAddBilling" class="btn btn-primary btn-sm">
                        Add Code<i class="mx-2 fas fa-plus"></i>
                    </button>
                    <button type="button" id="btnAddCombo" class="btn btn-secondary btn-sm">
                        Add Combo<i class="mx-2 fas fa-layer-group"></i>
                    </button>
                </div>
            </div>
            <div class="row bg-right">
                <div class="col">
                    <table id="billing_tbl" data-side-pagination="server" 
                           data-pagination="true" data-page-size="10" 
                           data-search="false" data-query-params="queryParams"
                           data-response-handler="responseHandler_billing"
                           data-detail-formatter="detailFormatter_billing" 
                           data-detail-view="true" data-detail-view-icon="true">
                        <thead>
                            <tr>
                                <th data-field="nomen_code" data-sortable="true">Code</th>
                                <th data-field="nomen_desc_fr" data-sortable="false">Description</th>
                                <th data-field="fee" data-sortable="true">Fee (€)</th>
                                <th data-field="laterality" data-sortable="false">Side</th>
                                <th data-field="quantity" data-sortable="false">Qty</th>
                                <th data-field="status" data-sortable="true">Status</th>
                                <th data-field="operate" data-formatter="operateFormatter_billing"
                                    data-events="operateEvents_billing">Action</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
```

### 3.2 Bootstrap Table Functions (md_bt.js)

```javascript
// Add to md_bt.js

function responseHandler_billing(res) {
    return {
        total: res['@count'] || res.total || 0,
        rows: res.items || res.data || []
    };
}

function operateFormatter_billing(value, row, index) {
    return [
        '<div class="btn-group" role="group">',
        '<button type="button" class="btn btn-outline-primary btn-sm edit" title="Edit">',
        '<i class="fas fa-edit"></i>',
        '</button>',
        '<button type="button" class="btn btn-outline-danger btn-sm remove" title="Remove">',
        '<i class="fas fa-trash"></i>',
        '</button>',
        '</div>'
    ].join('');
}

function detailFormatter_billing(index, row) {
    var html = [];
    html.push('<div class="container">');
    html.push('<div class="row">');
    html.push('<div class="col-md-6">');
    html.push('<h6>Code Details</h6>');
    html.push('<p><strong>Nomenclature:</strong> ' + row.nomen_code + '</p>');
    html.push('<p><strong>Fee Code:</strong> ' + (row.feecode || 'N/A') + '</p>');
    html.push('<p><strong>Date Performed:</strong> ' + (row.date_performed || 'N/A') + '</p>');
    html.push('</div>');
    html.push('<div class="col-md-6">');
    html.push('<h6>Notes</h6>');
    html.push('<p>' + (row.note || 'No notes') + '</p>');
    html.push('</div>');
    html.push('</div>');
    html.push('</div>');
    return html.join('');
}

window.operateEvents_billing = {
    'click .edit': function (e, value, row, index) {
        openBillingModal(row, 'edit');
    },
    'click .remove': function (e, value, row, index) {
        if (confirm('Remove this billing code?')) {
            deleteBillingCode(row.id);
        }
    }
};
```

### 3.3 Billing Modals

```html
<!-- Add billing code modal -->
<div class="modal fade" id="billingModal" tabindex="-1">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Add Billing Code</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <!-- Nomenclature search section -->
                <div class="row mb-3">
                    <div class="col">
                        <label for="codeSearch" class="form-label">Search Code:</label>
                        <input type="text" id="codeSearch" class="form-control" 
                               placeholder="Enter code or description...">
                    </div>
                    <div class="col-auto">
                        <button type="button" id="btnSearchCode" class="btn btn-primary">Search</button>
                    </div>
                </div>
                
                <!-- Search results table -->
                <div id="searchResults" class="mb-3" style="display:none;">
                    <table id="nomenclature_search_tbl" class="table table-sm">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Description</th>
                                <th>Fee</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
                
                <!-- Selected code form -->
                <form id="billingForm">
                    <div class="row">
                        <div class="col-md-4">
                            <label for="selectedCode" class="form-label">Selected Code:</label>
                            <input type="text" id="selectedCode" class="form-control" readonly>
                        </div>
                        <div class="col-md-8">
                            <label for="selectedDesc" class="form-label">Description:</label>
                            <input type="text" id="selectedDesc" class="form-control" readonly>
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-md-3">
                            <label for="billingLaterality" class="form-label">Side:</label>
                            <select id="billingLaterality" class="form-select">
                                <option value="both">Both</option>
                                <option value="right">Right</option>
                                <option value="left">Left</option>
                                <option value="none">None</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label for="billingQuantity" class="form-label">Quantity:</label>
                            <input type="number" id="billingQuantity" class="form-control" value="1" min="1">
                        </div>
                        <div class="col-md-6">
                            <label for="billingNote" class="form-label">Note:</label>
                            <input type="text" id="billingNote" class="form-control">
                        </div>
                    </div>
                    <input type="hidden" id="selectedFee">
                    <input type="hidden" id="selectedFeeCode">
                    <input type="hidden" id="billingId">
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" id="saveBillingCode" class="btn btn-primary">Save</button>
            </div>
        </div>
    </div>
</div>

<!-- Combo codes modal -->
<div class="modal fade" id="comboModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Add Combo Codes</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col">
                        <label for="comboSelect" class="form-label">Select Combo:</label>
                        <select id="comboSelect" class="form-select">
                            <option value="">Choose a combo...</option>
                        </select>
                    </div>
                </div>
                <div id="comboPreview" class="mt-3" style="display:none;">
                    <h6>Combo Preview:</h6>
                    <div id="comboCodesList"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" id="saveCombo" class="btn btn-primary">Apply Combo</button>
            </div>
        </div>
    </div>
</div>
```

## Phase 4: JavaScript Implementation

### 4.1 Billing Management (billing.js)

```javascript
// Create static/js/billing.js

class BillingManager {
    constructor() {
        this.apiBase = `${HOSTURL}/${APP_NAME}/api`;
        this.nomenclatureCache = new Map();
        this.initializeEventHandlers();
    }

    initializeEventHandlers() {
        $('#btnAddBilling').on('click', () => this.openBillingModal());
        $('#btnAddCombo').on('click', () => this.openComboModal());
        $('#btnSearchCode').on('click', () => this.searchNomenclature());
        $('#saveBillingCode').on('click', () => this.saveBillingCode());
        $('#saveCombo').on('click', () => this.applyCombo());
        
        // Auto-search on code input
        $('#codeSearch').on('input', debounce(() => this.searchNomenclature(), 300));
    }

    openBillingModal(rowData = null, mode = 'add') {
        if (mode === 'edit' && rowData) {
            this.populateEditForm(rowData);
        } else {
            this.clearForm();
        }
        new bootstrap.Modal(document.getElementById('billingModal')).show();
    }

    async searchNomenclature() {
        const query = $('#codeSearch').val().trim();
        if (query.length < 3) return;

        try {
            const params = new URLSearchParams();
            if (/^\d+$/.test(query)) {
                params.append('nomen_code_prefix', query);
            } else {
                params.append('description_substring', query);
            }
            params.append('limit', '20');

            const response = await fetch(`${this.apiBase}/nomenclature/search?${params}`);
            const data = await response.json();
            
            this.displaySearchResults(data.data || []);
        } catch (error) {
            console.error('Search failed:', error);
            this.showError('Search failed. Please try again.');
        }
    }

    displaySearchResults(results) {
        const tbody = $('#nomenclature_search_tbl tbody');
        tbody.empty();
        
        if (results.length === 0) {
            tbody.append('<tr><td colspan="4">No results found</td></tr>');
            $('#searchResults').show();
            return;
        }

        results.forEach(item => {
            const row = $(`
                <tr>
                    <td>${item.nomen_code}</td>
                    <td>${item.nomen_desc_fr || item.nomen_desc_nl}</td>
                    <td>€${item.fee || 'N/A'}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-primary select-code" 
                                data-code="${item.nomen_code}"
                                data-desc="${item.nomen_desc_fr || item.nomen_desc_nl}"
                                data-fee="${item.fee || 0}"
                                data-feecode="${item.feecode || 0}">
                            Select
                        </button>
                    </td>
                </tr>
            `);
            tbody.append(row);
        });

        // Handle code selection
        $('.select-code').on('click', (e) => {
            const btn = $(e.target);
            $('#selectedCode').val(btn.data('code'));
            $('#selectedDesc').val(btn.data('desc'));
            $('#selectedFee').val(btn.data('fee'));
            $('#selectedFeeCode').val(btn.data('feecode'));
            $('#searchResults').hide();
        });

        $('#searchResults').show();
    }

    async saveBillingCode() {
        const formData = {
            id_auth_user: patientId,
            id_worklist: wlId,
            nomen_code: $('#selectedCode').val(),
            nomen_desc_fr: $('#selectedDesc').val(),
            fee: $('#selectedFee').val(),
            feecode: $('#selectedFeeCode').val(),
            laterality: $('#billingLaterality').val(),
            quantity: $('#billingQuantity').val(),
            note: $('#billingNote').val(),
            date_performed: new Date().toISOString().split('T')[0],
            status: 'draft'
        };

        try {
            const method = $('#billingId').val() ? 'PUT' : 'POST';
            const url = $('#billingId').val() 
                ? `${this.apiBase}/billing_codes/${$('#billingId').val()}`
                : `${this.apiBase}/billing_codes`;

            const response = await fetch(url, {
                method: method,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                bootstrap.Modal.getInstance(document.getElementById('billingModal')).hide();
                $('#billing_tbl').bootstrapTable('refresh');
                this.showSuccess('Billing code saved successfully');
            } else {
                throw new Error('Failed to save billing code');
            }
        } catch (error) {
            console.error('Save failed:', error);
            this.showError('Failed to save billing code');
        }
    }

    showSuccess(message) {
        // Implement toast notification
        console.log('Success:', message);
    }

    showError(message) {
        // Implement error notification
        console.error('Error:', message);
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize on document ready
$(document).ready(() => {
    window.billingManager = new BillingManager();
});
```

## Phase 5: Integration Steps

### 5.1 Update models.py
- Add billing tables after the existing billing table
- Update imports and validators

### 5.2 Update md.html template
- Replace billing section with new structure
- Add modal definitions
- Update JavaScript includes

### 5.3 Update md_bt.js
- Add billing table response handlers
- Add operation formatters
- Add event handlers

### 5.4 Create billing.js module
- Implement nomenclature search
- Handle billing code management
- Manage combo applications

### 5.5 Update API structure
- Create billing endpoints
- Add nomenclature proxy
- Implement error handling

## Phase 6: Testing Strategy

### 6.1 Unit Testing
- Test nomenclature API integration
- Validate billing code CRUD operations
- Test combo functionality

### 6.2 Integration Testing
- Test with live nomenclature API
- Validate worklist integration
- Test user permissions

### 6.3 UI Testing
- Test responsive design
- Validate form interactions
- Test error handling

## Success Criteria

1. ✅ Users can search and add billing codes from nomenclature API
2. ✅ Billing codes are properly associated with worklist items
3. ✅ Combo codes can be applied in bulk
4. ✅ Bootstrap table displays billing codes correctly
5. ✅ Integration with existing md.html styling is seamless
6. ✅ API responses are properly handled
7. ✅ Error handling provides clear feedback

## Timeline

- **Week 1**: Database schema and API endpoints
- **Week 2**: Frontend components and modal interfaces
- **Week 3**: JavaScript implementation and integration
- **Week 4**: Testing, documentation, and refinement 