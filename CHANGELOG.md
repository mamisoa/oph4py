# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2025-07-13T00:35:59.171680]

### Fixed

- **🔧 Billing Combo Apply Error**: Fixed "invalid literal for int() with base 10: 'N/A'" error when applying billing combos
  - **Root Cause**: Combo data contained `"feecode": "N/A"` which was being passed to integer conversion without validation
  - **Solution**: Added proper validation to skip feecode values that are "N/A", "null", "None", or empty strings
  - **Impact**: Billing combos with "N/A" feecode values can now be applied successfully
  - **Files Modified**: `api/endpoints/billing.py` - Enhanced feecode handling in `apply_billing_combo` function
  - **Validation Added**: Both primary and secondary feecode fields now properly validate before assignment

