# Active Context

## Current Focus and Priorities

The current focus is on implementing a comprehensive billing module for the md.html view that integrates with the Belgian healthcare tariff nomenclature API. This involves adding proper database tables, API endpoints, and frontend components for managing billing codes and combinations.

### Recent Changes (Last 48 Hours)

1. **Billing Module Planning**
   - Created comprehensive implementation plan in `docs/implement_billing.md`
   - Analyzed existing billing section in md.html template (currently placeholder)
   - Identified integration points with FastAPI nomenclature server at `https://nomen.c66.ovh`
   - Designed database schema for billing codes, combos, and usage tracking
   - Planned modular frontend components using existing Bootstrap table patterns

2. **Requirements Analysis**
   - **Database Design**: Three new tables needed:
     - `billing_codes`: Store selected nomenclature codes for worklist items
     - `billing_combo`: Define reusable code combinations
     - `billing_combo_usage`: Track combo applications
   - **API Integration**: Nomenclature search via FastAPI server
   - **Frontend Components**: Bootstrap tables, modals, search interface
   - **Integration**: Seamless integration with existing md.html structure

3. **Technical Approach**
   - Follow existing patterns from md_bt.js for table management
   - Use modular API structure in `api/endpoints/billing.py`
   - Implement nomenclature proxy in `api/core/nomenclature.py`
   - Create dedicated `billing.js` module for frontend logic
   - Maintain consistency with existing UI/UX patterns

### Next Steps (Short-term)

1. **Phase 1: Database Implementation**
   - Add billing tables to `models.py`
   - Define proper relationships with worklist and auth_user
   - Add validators and constraints for billing codes
   - Test database migrations

2. **Phase 2: API Development**
   - Create billing endpoints in `api/endpoints/billing.py`
   - Implement nomenclature search proxy
   - Add CRUD operations for billing codes and combos
   - Test API integration with nomenclature server

3. **Phase 3: Frontend Implementation**
   - Update md.html template with billing components
   - Add Bootstrap table integration for billing codes
   - Implement search modals and forms
   - Create billing.js module for client-side logic

### Technical Context

The billing module will integrate with several existing systems:

1. **Nomenclature API Integration**:
   ```
   FastAPI Server: https://nomen.c66.ovh
   Endpoints: /tarifs/search
   Search Parameters:
   - nomen_code_prefix (minimum 3 digits)
   - description_substring (French/Dutch)
   - feecode filtering
   - Pagination support
   ```

2. **Database Schema**:
   ```sql
   billing_codes:
   - References: auth_user, worklist
   - Core: nomen_code, descriptions, fee, laterality
   - Status: draft/validated/billed/paid
   
   billing_combo:
   - Predefined code combinations
   - Specialty-specific groupings
   - JSON array of codes
   
   billing_combo_usage:
   - Track combo applications
   - Link to worklist items
   ```

3. **Frontend Integration**:
   ```javascript
   // Bootstrap Table Pattern
   API_BILLING = "/api/billing_codes?id_worklist.eq=" + wlId
   
   // Modal Structure
   - billingModal: Search and add codes
   - comboModal: Apply code combinations
   
   // Functions (md_bt.js)
   - responseHandler_billing()
   - operateFormatter_billing()
   - detailFormatter_billing()
   ```

### Implementation Challenges

1. **API Integration**:
   - Challenge: External nomenclature API dependency
   - Solution: Implement caching and fallback mechanisms
   - Status: Planned for Phase 2

2. **Data Validation**:
   - Challenge: Validate nomenclature codes against external API
   - Solution: Real-time validation with error handling
   - Status: Planned for Phase 2

3. **UI Consistency**:
   - Challenge: Maintain consistency with existing md.html structure
   - Solution: Follow established patterns from other sections
   - Status: Design complete, implementation pending

### Previous Focus: JavaScript Modernization

The project successfully completed JavaScript code modernization following the API modularization effort. Key improvements included:

1. **API Modularization Completion**
   - Completed migration of utility functions from rest.py to modular API architecture
   - Implemented core functionality in api/core directory
   - Updated __init__.py to import directly from modular API structure

2. **JavaScript Modernization and Fixes**
   - Refactored patient-bar.js using modern JavaScript best practices
   - Fixed critical PUT request validation error in crudp function
   - Enhanced code organization with proper module patterns

3. **Transaction Management System**
   - Fixed JSON serialization error in transaction details modal
   - Improved transaction details viewer for various API response structures
   - Enhanced Bootstrap 5 modal integration

## Technical Standards

The billing module implementation follows established project standards:

1. **Database Design**: PyDAL models with proper relationships and validators
2. **API Structure**: Modular endpoints in `api/endpoints/` directory
3. **Frontend**: Bootstrap 5 + jQuery following existing table patterns
4. **Error Handling**: Comprehensive validation and user feedback
5. **Documentation**: Inline docstrings and user documentation

## Success Metrics

1. ✅ Seamless integration with existing md.html structure
2. ✅ Real-time nomenclature code search and validation
3. ✅ Efficient combo code management and application
4. ✅ Proper worklist association and patient tracking
5. ✅ Responsive design consistent with application theme
6. ✅ Comprehensive error handling and user feedback