# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

NEW CHANGLOG ENTRIES SHOULD BE **NEWEST AT THE TOP OF THE FILE, OLDEST  AT BOTTOM**.

## [2025-06-01T19:50:52.691695] - Phase 3 Post-Implementation Fix

### Fixed
- **Database Schema**: Removed duplicate `is_active` field from `billing_combo` table definition
  - PyDAL automatically adds `is_active` field to all tables by default
  - Manual definition was causing SyntaxError during application loading
  - Application now loads correctly without billing table conflicts

### Technical Details
- Modified `models.py` line 904: removed `Field("is_active", "boolean", default=True)` from billing_combo table
- PyDAL's automatic field addition makes manual definition redundant and causes conflicts
- All billing functionality remains intact with automatic `is_active` field

## [2025-06-01T19:38:08.717614] - Completed Phase 2 of billing module - API Development

### Added

- **Comprehensive billing API endpoints** with full CRUD operations:
  - `api/billing_codes`: Complete CRUD for individual billing codes with automatic nomenclature enrichment
  - `api/billing_combo`: CRUD for reusable code combinations with JSON validation
  - `api/billing_combo_usage`: Tracking of combo applications to worklist items
  - `api/billing_codes/by_worklist/<id>`: Dedicated endpoint for worklist-specific billing codes
  - `api/billing_combo/<id>/apply`: Transaction-safe combo application with rollback support
- **External nomenclature API integration** via NomenclatureClient:
  - `api/nomenclature/search`: Real-time search with code prefix and description filtering
  - `api/nomenclature/code/<code>`: Detailed code information retrieval
  - Automatic retry mechanism with exponential backoff for network resilience
  - In-memory caching system with 1-hour TTL for performance optimization
  - Comprehensive error handling and fallback mechanisms
- **Enhanced data validation and enrichment**:
  - Automatic nomenclature code validation and description fetching
  - JSON schema validation for combo codes arrays
  - Laterality and status field validation
  - Required field validation with detailed error messages
- **Transaction safety and audit trail**:
  - Database transaction management with automatic rollback on errors
  - Comprehensive logging for all API operations
  - Proper error handling with structured JSON responses
- **Dependencies**: Added `requests` library to requirements.txt for API integration

### Changed

- Updated API endpoints initialization to register billing module
- Enhanced error handling patterns following established project standards

### Technical Details

- **Database Integration**: Seamless integration with Phase 1 billing tables
- **API Patterns**: Consistent with existing endpoint patterns (auth, worklist, etc.)
- **External API**: Integration with Belgian healthcare nomenclature at `https://nomen.c66.ovh`
- **Performance**: Caching and retry mechanisms for reliable external API access
- **Security**: Input validation and transaction safety throughout all operations

## [2025-06-01T19:26:07.545306] - Implemented Phase 1 of billing module - Database schema

### Added

- Added three new billing tables to support comprehensive nomenclature-based billing:
  - `billing_codes`: Stores individual nomenclature codes for worklist items with validation
  - `billing_combo`: Defines reusable combinations of nomenclature codes by specialty
  - `billing_combo_usage`: Tracks when code combinations are applied to worklist items
- Enhanced database with proper field validations:
  - Laterality validation for bilateral/unilateral procedures
  - Status tracking (draft, validated, billed, paid)
  - Specialty categorization for code combinations
- Preserved existing `billing` table for backward compatibility
- Added comprehensive foreign key relationships with auth_user and worklist tables
- Prepared foundation for nomenclature API integration and frontend implementation
