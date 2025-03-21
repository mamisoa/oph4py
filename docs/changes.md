# Changelog

## 2025-03-20

### Refactored Worklist JavaScript Code

- Converted jQuery-based code to modern vanilla JavaScript
- Implemented a service-based architecture:
  - `ApiService`: Handles all API calls
  - `ModalityService`: Handles modality-specific operations
  - `WorklistService`: Handles worklist operations
  - `UiService`: Handles UI-specific operations
- Replaced callback-based code with async/await for better readability
- Added proper error handling
- Added comprehensive JSDoc comments for better documentation
- Updated HTML files to use ES modules
- Improved separation of concerns between UI and business logic
- Eliminated global function usage

### Changes to Files

- Created new services:
  - `static/js/services/ApiService.js`
  - `static/js/services/ModalityService.js`
  - `static/js/services/WorklistService.js`
  - `static/js/services/UiService.js`
- Updated existing files:
  - `static/js/wl.js`
  - `static/js/users_bt.js`
  - `static/js/wl_bt.js`
  - `static/js/files_bt.js`
  - `templates/worklist.html`
  - `templates/manage/files.html`
  - `templates/manage/users.html`

### Benefits

- More maintainable code structure
- Better testability
- Improved error handling
- More consistent coding style
- Better type safety through JSDoc
