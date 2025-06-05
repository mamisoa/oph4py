# Medical Examination Controller Refactoring Plan

## Overview

The current `templates/modalityCtr/md.html` file is 3,086 lines long and contains multiple functional sections that would benefit from being broken down into reusable components using py4web's `include` functionality.

## Current File Analysis

### File Statistics

- **Total Lines**: 3,086
- **HTML Content**: ~2,400 lines
- **JavaScript**: ~600 lines
- **CSS Styles**: ~80 lines
- **Modals**: 10 major modals
- **Bootstrap Tables**: 15+ table instances
- **Form Sections**: 12+ major form sections

### JavaScript Dependencies Analysis

#### Core JavaScript Libraries (in load order)

```html
<!-- Bootstrap Table Core -->
<script src="js/bootstrap-table_1.22/bootstrap-table.min.js"></script>

<!-- UI Enhancement Libraries -->
<script src="js/bootbox/bootbox.all.min.js"></script>
<script src="js/jquery.serialize-object.min.js"></script>
<script src="js/bootstrap-autocomplete.min.js"></script>
<script src="js/timer.jquery.min.js"></script>

<!-- Custom Utility Scripts -->
<script src="js/useful.js"></script>
<script src="js/patient-bar.js"></script>
<script src="js/md_bt.js"></script>

<!-- PDF Generation Libraries -->
<script src="js/pdfmake/pdfmake.min.js"></script>
<script src="js/pdfmake/vfs_fonts.js"></script>
<script src="js/jsbarcode/JsBarcode.itf.min.js"></script>
<script src="js/html-to-pdfmake.js"></script>

<!-- Rich Text Editor -->
<script src="js/tinymce/tinymce.min.js"></script>

<!-- Custom Medical Examination Scripts -->
<script src="js/md.js"></script>
<script src="js/prescription.js"></script>
<script src="js/glasses.js"></script>
<script src="js/contacts.js"></script>
<script src="js/certificates.js"></script>
```

#### Bootstrap Table Instances and Dependencies

**15 Bootstrap Table Instances:**

1. `#mx_tbl` - Medications (history)
2. `#ax_tbl` - Allergies
3. `#mHx_tbl` - Medical history
4. `#sHx_tbl` - Surgical history
5. `#oHx_tbl` - Ocular history
6. `#table-wl` - Worklist procedures
7. `#tonoRight_tbl` - Right eye tonometry
8. `#tonoLeft_tbl` - Left eye tonometry
9. `#rxRight_tbl` - Right eye refraction
10. `#rxLeft_tbl` - Left eye refraction
11. `#kmRight_tbl` - Right eye keratometry
12. `#kmLeft_tbl` - Left eye keratometry
13. `#coding_tbl` - ICD coding
14. `#mxWl_tbl` - Worklist medications
15. `#bill_tbl` - Billing codes
16. Additional tables: `#GxRx_tbl`, `#mxrx_tbl`, `#cxrx_tbl`, `#cert_tbl`

**Critical Bootstrap Table Dependencies:**

- Each table has specific API endpoints
- Custom formatters and event handlers
- Shared query parameters and response handlers
- Cross-table refresh mechanisms

## Proposed File Structure

```tree
templates/modalityCtr/
├── md.html (main orchestrator file)
├── sections/
│   ├── history/
│   │   ├── general-history.html                 (~200 lines)
│   │   ├── medical-surgical-history.html        (~150 lines)
│   │   └── ocular-history.html                  (~300 lines)
│   ├── examination/
│   │   ├── present-history.html                 (~50 lines)
│   │   ├── clinical-exam.html                   (~400 lines)
│   │   ├── miscellaneous.html                   (~100 lines)
│   │   └── conclusions.html                     (~150 lines)
│   ├── actions/
│   │   ├── medical-prescriptions.html           (~100 lines)
│   │   ├── optical-prescriptions.html           (~100 lines)
│   │   ├── certificates-papers.html             (~80 lines)
│   │   └── follow-up.html                       (~50 lines)
│   └── billing/
│       └── billing-section.html                 (~150 lines)
├── modals/
│   ├── history/
│   │   ├── medication-modal.html                (~200 lines)
│   │   ├── allergy-modal.html                   (~150 lines)
│   │   └── medical-history-modal.html           (~200 lines)
│   ├── prescriptions/
│   │   ├── medical-rx-modal.html                (~150 lines)
│   │   ├── glasses-rx-modal.html                (~400 lines)
│   │   └── contacts-rx-modal.html               (~500 lines)
│   ├── certificates/
│   │   ├── certificate-modal.html               (~100 lines)
│   │   ├── sick-leave-modal.html                (~80 lines)
│   │   └── email-info-modal.html                (~80 lines)
│   ├── billing/
│   │   ├── billing-code-modal.html              (~200 lines)
│   │   └── billing-combo-modal.html             (~150 lines)
│   └── utility/
│       └── cache-offcanvas.html                 (~100 lines)
├── js-sections/
│   ├── md-globals.html                          (~50 lines)
│   ├── md-apis.html                             (~150 lines)
│   ├── md-tables.html                           (~250 lines)
│   └── md-init.html                             (~150 lines)
└── styles/
    ├── md-responsive.html                       (~50 lines)
    └── md-billing.html                          (~30 lines)
```

## JavaScript Dependencies Breakdown

### 1. Global Variables Section (`js-sections/md-globals.html`)

```javascript
// Critical dependencies that must load first
const HOSTURL = "[[ = hosturl ]]";
var usermdObj = [[ =XML(mdParams)]];
var userObj = [[ =XML(userDict)]];
var modalityDict = [[ = XML(modalityDict)]];
let modalityController = '[[ = XML(modalityController) ]]';
var rxObj = [], tonoObj = [];
var prescRxObj = {};
```

### 2. API Endpoints Section (`js-sections/md-apis.html`)

**Dependencies**: Must have global variables loaded first

```javascript
// 20+ API endpoint definitions
const API_MD = HOSTURL + "/" + APP_NAME + "/api/md?...";
const API_MEDICATIONS = HOSTURL + "/" + APP_NAME + "/api/medic_ref?...";
// ... all other API endpoints
```

### 3. Bootstrap Tables Section (`js-sections/md-tables.html`)

**Dependencies**:

- jQuery (implicit)
- bootstrap-table.min.js
- API endpoints defined
- Global variables available

**Critical Table Groupings**:

```javascript
// History Tables Group
var $mx_tbl = $('#mx_tbl').bootstrapTable({url: API_MXUSER});
var $ax_tbl = $('#ax_tbl').bootstrapTable({url: API_AXUSER});
var $mHx_tbl = $('#mHx_tbl').bootstrapTable({url: API_MHXUSER});
var $sHx_tbl = $('#sHx_tbl').bootstrapTable({url: API_SHXUSER});
var $oHx_tbl = $('#oHx_tbl').bootstrapTable({url: API_OHXUSER});

// Examination Tables Group
var $tonoRight_tbl = $('#tonoRight_tbl').bootstrapTable({url: API_TONORIGHT});
var $tonoLeft_tbl = $('#tonoLeft_tbl').bootstrapTable({url: API_TONOLEFT});
var $rxRight = $('#rxRight_tbl').bootstrapTable({url: API_RXRIGHT});
var $rxLeft = $('#rxLeft_tbl').bootstrapTable({url: API_RXLEFT});

// Billing Tables Group
var $bill_tbl = $('#bill_tbl').bootstrapTable({url: API_BILLING});
```

### 4. Initialization Section (`js-sections/md-init.html`)

**Dependencies**:

- All previous sections loaded
- TinyMCE library
- All custom JS files loaded

```javascript
// TinyMCE initialization
tinymce.init({...});

// Document ready handlers
$(document).ready(function () {
    // Refresh logic for back navigation
    // Table refresh mechanisms
});
```

## Implementation Strategy

### Phase 1: JavaScript Dependency Mapping

**Priority: CRITICAL**

1. **Create dependency graph** for all JavaScript components
2. **Identify bootstrap-table shared dependencies**:
   - Shared query parameters (`queryParams`)
   - Shared response handlers (`responseHandler_*`)
   - Shared formatters (`*Formatter_*`)
   - Shared event handlers (`*Events_*`)
3. **Map table refresh dependencies**:

   ```javascript
   const tablesArr = ['#mx_tbl', '#ax_tbl', '#mHx_tbl', ...];
   refreshTables(tablesArr);
   ```

### Phase 2: CSS and Styles Extraction

**Priority: HIGH**

1. **Move CSS to separate includes**:
   - `styles/md-responsive.html` - Responsive table styles
   - `styles/md-billing.html` - Billing-specific styles
2. **Update page_head block** to include new style sections

### Phase 3: JavaScript Section Modularization

**Priority: CRITICAL**

**Load Order Requirements:**

1. `js-sections/md-globals.html` - MUST load first
2. `js-sections/md-apis.html` - Depends on globals
3. `js-sections/md-tables.html` - Depends on APIs and globals
4. `js-sections/md-init.html` - Depends on all previous sections

**Critical Bootstrap Table Considerations:**

- Table variables must be globally accessible
- Shared functions must be available to all tables
- Event handlers must be bound after DOM elements exist
- API endpoints must be defined before table initialization

### Phase 4: Modal Extraction

**Priority: MEDIUM**

**Modal Dependencies:**

- Form validation functions
- Autocomplete configurations
- TinyMCE instances
- Bootstrap modal events

**Modal Groupings by Functionality:**

1. **History Modals** - Share medication/disease autocomplete
2. **Prescription Modals** - Share prescription logic
3. **Certificate Modals** - Share TinyMCE configurations
4. **Billing Modals** - Share nomenclature search

### Phase 5: Section Extraction

**Priority: MEDIUM**

**Extraction Order (by complexity)**:

1. `sections/examination/present-history.html` - Simple form
2. `sections/actions/follow-up.html` - Simple form
3. `sections/examination/miscellaneous.html` - Multiple simple forms
4. `sections/history/general-history.html` - 2 tables + modals
5. `sections/history/medical-surgical-history.html` - 2 tables + modal
6. `sections/examination/conclusions.html` - Forms + 1 table
7. `sections/actions/certificates-papers.html` - Buttons + 1 table
8. `sections/actions/medical-prescriptions.html` - 2 tables + modals
9. `sections/actions/optical-prescriptions.html` - 2 tables + modals
10. `sections/billing/billing-section.html` - 1 table + 2 modals + summary
11. `sections/examination/clinical-exam.html` - Complex forms (4 forms)
12. `sections/history/ocular-history.html` - Most complex (7 tables)

## Critical Dependencies Matrix

### Bootstrap Table Shared Components

| Component           | Used By Tables  | Location  |
| ------------------- | --------------- | --------- |
| `queryParams`       | All tables      | md_bt.js  |
| `refreshTables()`   | All tables      | useful.js |
| `responseHandler_*` | Specific groups | md_bt.js  |
| `*Formatter_*`      | Specific tables | md_bt.js  |
| `*Events_*`         | Specific tables | md_bt.js  |

### JavaScript File Dependencies

| File              | Depends On                 | Provides                        |
| ----------------- | -------------------------- | ------------------------------- |
| `useful.js`       | jQuery                     | Global utilities, table refresh |
| `patient-bar.js`  | jQuery, useful.js          | Patient bar functionality       |
| `md_bt.js`        | bootstrap-table, useful.js | Table configurations            |
| `md.js`           | All above + APIs           | Medical examination logic       |
| `prescription.js` | md.js                      | Prescription handling           |
| `glasses.js`      | prescription.js            | Glasses prescription            |
| `contacts.js`     | prescription.js            | Contact lens prescription       |
| `certificates.js` | TinyMCE, md.js             | Certificate generation          |

## Testing Strategy

### Unit Testing Approach

1. **Test each section independently** after extraction
2. **Verify bootstrap table functionality** in isolation
3. **Test modal interactions** with their parent sections
4. **Validate JavaScript load order** and dependencies

### Integration Testing

1. **Cross-section communication** (e.g., table refreshes)
2. **Modal-section interactions**
3. **Form submission workflows**
4. **AJAX error handling**

### Performance Testing

1. **Page load time** before/after refactoring
2. **JavaScript initialization time**
3. **Table rendering performance**
4. **Memory usage** with multiple table instances

## Risk Assessment

### HIGH RISK

- **Bootstrap table initialization order** - Could break table functionality
- **JavaScript variable scope** - Global variables must remain accessible
- **Form ID conflicts** - Unique IDs must be maintained across includes

### MEDIUM RISK

- **CSS cascade issues** - Styles might conflict when separated
- **Modal event binding** - Event handlers might not find targets
- **API endpoint availability** - Timing issues with endpoint definitions

### LOW RISK

- **Template variable access** - py4web handles this automatically
- **Include file paths** - Easy to adjust and test
- **HTML structure** - Minimal risk of breaking layouts

## Success Metrics

### Code Quality

- **File size reduction**: Target <300 lines per file
- **Maintainability**: Cyclomatic complexity reduction
- **Reusability**: Components usable in other templates

### Performance

- **Page load time**: No degradation
- **JavaScript execution**: No initialization delays
- **Memory usage**: Stable or improved

### Development Experience

- **Code review efficiency**: Smaller, focused diffs
- **Team collaboration**: Multiple developers can work simultaneously
- **Bug isolation**: Issues contained to specific components

## Migration Timeline

### Week 1: Analysis and Planning

- Complete JavaScript dependency mapping
- Create detailed component specifications
- Set up testing framework

### Week 2: JavaScript Modularization

- Extract and test JavaScript sections
- Validate bootstrap table functionality
- Ensure all dependencies are maintained

### Week 3: CSS and Modal Extraction

- Move styles to separate includes
- Extract and test modals
- Validate modal-section interactions

### Week 4: Section Extraction (Simple)

- Extract simple sections (present-history, follow-up, etc.)
- Test each section independently
- Validate integration with main template

### Week 5: Section Extraction (Complex)

- Extract complex sections (clinical-exam, ocular-history)
- Test bootstrap table functionality
- Validate cross-section communication

### Week 6: Integration Testing and Optimization

- Full integration testing
- Performance optimization
- Documentation and code review

## Conclusion

This refactoring will transform a monolithic 3,086-line template into a maintainable, component-based architecture. The critical success factor is maintaining the complex bootstrap-table dependencies and JavaScript initialization order while achieving the modularity benefits.

The modular approach will enable:

- **Better maintainability** through smaller, focused files
- **Enhanced reusability** of medical examination components
- **Improved team collaboration** with parallel development
- **Easier testing** of individual components
- **Future extensibility** for additional medical modules
