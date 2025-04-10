# Worklist Combo Fix Strategy

## Problem Statement

When creating a worklist combo (multiple items for different modalities), data corruption occurs where items can be incorrectly associated with the wrong patient's worklist. This issue stems from:

- Race conditions in async operations
- Lack of transaction handling
- No proper state management
- Missing data validation

## Affected Files

### Backend

1. `models.py`
   - Tables: procedure_family, combo, worklist
   - Add validation constraints
   - Define relationships

2. `manage.py`
   - Worklist controller
   - Combo management
   - API endpoints
   - Transaction handling

3. `modalityctr.py`
   - Modality-specific controllers
   - Status management

### Frontend

1. Core JavaScript:
   - `static/js/wl.js`: Main worklist functionality
   - `static/js/wl_bt.js`: Bootstrap table configurations
   - `static/js/md_bt.js` & `static/js/gp_bt.js`: Modality specific code

2. Templates:
   - `templates/worklist.html`: Main interface
   - Modality templates (md.html, gp.html)

## Implementation Strategy

### Phase 1: Data Integrity

#### 1.1 Backend Validation in Models

```python
# In models.py
db.define_table('worklist',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('procedure', 'reference procedure', required=True),
    Field('modality_dest', 'reference modality', required=True),
    Field('status_flag', requires=IS_IN_SET(['requested', 'processing', 'done', 'cancelled'])),
    # ... other fields ...
    auth.signature)

# Add validation for patient consistency
db.worklist.id_auth_user.requires = [
    IS_NOT_EMPTY(),
    IS_IN_DB(db, 'auth_user.id', '%(first_name)s %(last_name)s')
]
```

#### 1.2 Transaction Handling in Controller

```python
# In manage.py
@action('api/worklist/combo', method=['POST'])
@action.uses(db, auth.user)
def add_combo():
    try:
        data = request.json
        patient_id = data['items'][0]['id_auth_user']
        
        # Start transaction
        db.commit()  # Commit any pending transactions
        db._adapter.connection.begin()
        
        try:
            # Validate all items belong to same patient
            if not all(item['id_auth_user'] == patient_id for item in data['items']):
                raise ValueError("All items must belong to the same patient")
            
            # Insert all items
            inserted_ids = []
            for item in data['items']:
                inserted_ids.append(db.worklist.insert(**item))
            
            # If we get here, commit the transaction
            db._adapter.connection.commit()
            
            return dict(
                status='success',
                message='Combo items added successfully',
                ids=inserted_ids
            )
            
        except Exception as e:
            # If anything goes wrong, rollback
            db._adapter.connection.rollback()
            raise e
            
    except Exception as e:
        return dict(
            status='error',
            message=str(e)
        )
```

### Phase 2: State Management

#### 2.1 Frontend State Container and API Client

```javascript
// In wl.js
class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async fetchJson(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    }

    async getModalityOptions(procedureId) {
        return this.fetchJson(`${this.baseUrl}/api/modality?id_modality.procedure_family.id_procedure.eq=${procedureId}`);
    }

    async addComboItems(items) {
        return this.fetchJson(`${this.baseUrl}/api/worklist/combo`, {
            method: 'POST',
            body: JSON.stringify({ items })
        });
    }
}
```

#### 2.2 State Manager Implementation

```javascript
class WlItemManager {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.pendingItems = new Map();
        this.processingItems = new Set();
        this.locks = new Set();
        this.eventListeners = new Map();
    }

    async acquireLock(patientId) {
        if (this.locks.has(patientId)) {
            throw new Error('Patient items already processing');
        }
        this.locks.add(patientId);
    }

    async releaseLock(patientId) {
        this.locks.delete(patientId);
    }

    async addComboItems(patientId, items) {
        try {
            await this.acquireLock(patientId);
            const result = await this.apiClient.addComboItems(items);
            this.dispatchEvent('itemsAdded', { patientId, items });
            return result;
        } finally {
            await this.releaseLock(patientId);
        }
    }
}
```

### Phase 3: UI Protection

#### 3.1 Form Protection and UI Updates

```javascript
const UI = {
    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('loading');
            const spinner = document.createElement('div');
            spinner.className = 'spinner';
            element.appendChild(spinner);
        }
    },

    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('loading');
            const spinner = element.querySelector('.spinner');
            if (spinner) spinner.remove();
        }
    },

    protectForm(form, action) {
        const inputs = form.querySelectorAll('input, select, button');
        inputs.forEach(input => {
            input.disabled = action === 'disable';
        });
        form.classList.toggle('processing', action === 'disable');
    }
}
```

## Implementation Steps

1. **Backend Changes**
   - Add model validations
   - Implement transaction handling in controllers
   - Create new API endpoints
   - Add error handling

2. **Frontend Changes**
   - Implement API client
   - Create state manager
   - Add form protection
   - Implement error handling

3. **Testing Requirements**
   - Unit tests for validation
   - Integration tests for transactions
   - UI tests for form protection
   - Concurrent operation tests

## Expected Outcomes

1. **Data Integrity**
   - No more incorrect patient associations
   - Atomic combo operations
   - Proper validation

2. **User Experience**
   - Clear feedback during operations
   - Protected forms during submission
   - Proper error messages

3. **Maintenance**
   - Cleaner code structure
   - Better error tracking
   - Improved maintainability

## Notes for Implementation

1. **Database Considerations**
   - Monitor transaction performance
   - Add proper indexes
   - Consider connection pooling

2. **Security Considerations**
   - Validate all user input
   - Check permissions
   - Log sensitive operations

3. **Performance Considerations**
   - Optimize transaction duration
   - Implement timeout handling
   - Consider batch operations

## Rollout Strategy

1. **Development Phase**
   - Implement changes in development
   - Run comprehensive tests
   - Document all changes

2. **Testing Phase**
   - Deploy to staging
   - Test concurrent operations
   - Verify error handling

3. **Production Phase**
   - Deploy during low-usage period
   - Monitor system closely
   - Have rollback plan ready
