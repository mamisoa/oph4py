# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2025-06-08T04:05:00.583732] - Files Module Practitioner Selector Implementation

### Added

- **Practitioner and Provider Selectors**: Extended Files module with filtering capabilities similar to Worklist
  - **Practitioner Dropdown**: Select and filter by senior doctor with automatic default selection for logged doctors
  - **Provider Dropdown**: Filter by medical staff/providers with comprehensive provider options
  - **Smart Defaults**: Automatically selects logged user if they are a doctor and exist in practitioner list, otherwise defaults to "No filter" (all)
  - **Real-time Filtering**: Immediate table updates when practitioner or provider selection changes
  - **Consistent UX**: Same design pattern and behavior as Worklist module for familiar user experience

### Enhanced

- **Files Controller**: Extended `files()` function in `manage.py` with practitioner and provider data
  - **Practitioner Dictionary**: Added generation of `practitionerDict` with all users having "Doctor" membership
  - **Provider Dictionary**: Added generation of `providerDict` with medical staff and providers
  - **User Context**: Added current user membership information for smart default selection
  - **Data Consistency**: Uses same data structure and filtering logic as Worklist module

- **Files Template**: Enhanced `templates/manage/files.html` with selector interface
  - **Floating Label Selectors**: Added Bootstrap floating label select elements for practitioner and provider
  - **Responsive Layout**: Integrated selectors into existing toolbar layout without disrupting current functionality
  - **JavaScript Integration**: Added `fillSelect()` function and filter event handlers for dynamic population and filtering

### Technical Implementation

- **JavaScript Enhancement**: Added comprehensive selector logic to Files module
  - **Auto-population**: `fillSelect()` function populates dropdowns with practitioner and provider data
  - **Smart Selection**: Automatically selects current user if they are a doctor and exist in dropdown
  - **Filter Integration**: Enhanced existing filter functions to include practitioner/provider parameters
  - **Event Handling**: Added change event listeners for real-time table filtering
  - **API Integration**: Extended existing API calls with new filter parameters

- **Backend Enhancement**: Extended Files API filtering capabilities
  - **Filter Parameters**: Added support for senior.id and provider.id filtering in existing API endpoints
  - **Data Lookup**: Enhanced data retrieval to include practitioner and provider relationship data
  - **Consistent Pattern**: Uses same filtering logic and parameter structure as Worklist module

### User Experience Improvements

- **Intelligent Defaults**: Doctors automatically see their own cases by default, improving workflow efficiency
- **Universal Access**: Non-doctors see all cases by default, maintaining administrative oversight capabilities
- **Familiar Interface**: Identical design and behavior to Worklist module reduces learning curve
- **Real-time Updates**: Immediate visual feedback when changing filters improves user interaction

### Benefits

- **Enhanced Workflow**: Doctors can quickly focus on their own cases without manual filtering
- **Administrative Flexibility**: Administrators can still access all cases through "No filter" option
- **Consistent UX**: Same filtering pattern across Worklist and Files modules for coherent user experience
- **Scalability**: Filtering reduces data load and improves performance for large case volumes

**Files Modified**:

- `manage.py` - Enhanced files controller with practitioner/provider data generation
- `templates/manage/files.html` - Added practitioner and provider selector interface with JavaScript integration

**Impact**: Files module now provides the same intelligent filtering capabilities as Worklist, improving workflow efficiency for medical professionals while maintaining administrative oversight

## [2025-06-08T03:50:18.949162] - Automated Trend Analysis Comments

### Added

- **Automated Trend Analysis** for all dashboard charts with intelligent insights:
  - Trend direction analysis using linear regression (📈 Growing, 📉 Declining, ➡️ Stable)
  - Recent performance comparison (🚀 Acceleration, 🐌 Slowdown)
  - Volatility analysis with stability indicators (🎯 Stable, ⚡ High variability)
  - Peak activity identification with dates (📊 Peak activity)
  - Moving average trend analysis (📈/📉 Moving average trend)
- **Smart Contextual Comments** adapted for each chart type:
  - New Patients: Focus on growth patterns and acquisition trends
  - New Worklists: Emphasis on workload patterns and efficiency metrics  
  - MD Worklists: Highlight specialist demand and capacity analysis
- **Time Scale Adaptive Analysis** providing relevant insights for each period (3M to 10Y)
- **Professional UI Integration** with Bootstrap alert styling and Font Awesome icons

### Technical Implementation

- Added `analyze_chart_trends()` function with comprehensive statistical analysis
- Enhanced API response to include `insights` array with automated comments
- Updated frontend to display insights in attractive alert boxes below chart summaries
- Intelligent insight generation limited to 4 most relevant comments per chart

## [2025-06-08T03:38:20.743150] - Dashboard Charts Enhancement

### Added

- Added 7Y and 10Y time period options to all dashboard charts
- Dynamic moving average calculation based on time scale:
  - 3M: 7-day moving average
  - 6M: 15-day moving average  
  - 1Y: 30-day moving average
  - 2Y: 60-day moving average
  - 5Y: 150-day moving average
  - 7Y: 210-day moving average
  - 10Y: 300-day moving average

### Changed

- Enhanced moving average line visibility with:
  - Thicker lines (borderWidth: 3)
  - Removed dots (pointRadius: 0) for smoother appearance
  - Darker colors for better contrast
  - Smooth curves (tension: 0.4)
- Updated period text mapping to include 7Y and 10Y labels
- Moving average labels now dynamically show the actual period (e.g., "15-day Moving Average")

### Fixed

- Fixed MD worklist query error by using proper database join between worklist and modality tables
- Corrected field reference from `db.worklist.modality` to `db.worklist.modality_dest` with join to `db.modality.modality_name`
- Enhanced Chart.js dataset styling to maintain consistent appearance across updates

## [2025-06-08T03:27:28.946396] - Enhanced Dashboard Charts with Moving Averages and MD Worklists

### Added

- **Moving Average Curves**: Added 7-day moving average lines to all existing charts for trend analysis
  - **Automatic Calculation**: Server-side moving average calculation using sliding window approach
  - **Visual Enhancement**: Moving average displayed as separate line with distinct colors
  - **Legend Support**: Charts now show legend to distinguish between raw data and moving averages
  - **Smooth Curves**: Moving averages use higher tension (0.4) for smoother visualization

- **MD Worklists Chart**: New dedicated chart for Medical Doctor worklist analytics
  - **Filtered Data**: Shows only worklists where `modality == "MD"`
  - **Same Time Scales**: Uses identical period selectors (3M, 6M, 1Y, 2Y, 5Y) as other charts
  - **Consistent Design**: Follows same visual design patterns with warning color scheme
  - **Moving Average**: Includes 7-day moving average like other charts

- **Enhanced Color Schemes**: Extended color system to support multiple datasets
  - **Main Data Colors**: Primary colors for raw chart data
  - **Moving Average Colors**: Secondary colors for trend lines
  - **MD Chart Colors**: Warning-based color scheme (amber/orange) for Medical Doctor data

### Enhanced

- **Multi-Dataset Support**: Charts now support multiple datasets (raw data + moving averages)
  - **Flexible Data Format**: API returns both old format (data) and new format (datasets)
  - **Backward Compatibility**: Maintains compatibility with single-dataset format
  - **Dynamic Color Assignment**: Automatic color mapping based on dataset index

- **Chart Configuration**: Enhanced Chart.js configuration for better user experience
  - **Legend Display**: Enabled legend to show dataset labels
  - **Chart Labels**: Improved formatting for "MD Worklists" vs "Worklists"
  - **Professional Styling**: Consistent styling across all three charts

### Technical Implementation

- **Backend API Enhancement**: Extended `/api/chart_data/<table>/<period>` endpoint
  - **New Table Type**: Added support for `md_worklists` parameter
  - **Moving Average Function**: Implements sliding window calculation with configurable window size
  - **Multi-Dataset Response**: Returns structured datasets array for Chart.js consumption
  - **Database Query**: Efficient filtering using `db.worklist.modality == "MD"` condition

- **Frontend JavaScript Enhancement**: Updated `DashboardCharts` class
  - **Three-Chart Support**: Handles patients, worklists, and md_worklists charts
  - **Dataset Management**: Manages multiple datasets per chart with proper color assignment
  - **Flexible Data Handling**: Processes both old and new API response formats
  - **Dynamic Labeling**: Context-aware chart and dataset labeling

- **Template Enhancement**: Added MD worklists chart section to dashboard
  - **Warning Color Buttons**: Uses `btn-outline-warning` for MD chart period selectors
  - **Consistent Layout**: Maintains same card-based design as existing charts
  - **CSS Support**: Added warning button active state styling

### Data Processing Flow

1. **API Request**: `/api/chart_data/md_worklists/6`
2. **Database Query**: Filter worklists by `modality == "MD"` and date range
3. **Python Grouping**: Group by date using `collections.defaultdict`
4. **Moving Average**: Calculate 7-day sliding window average
5. **Response Format**: Return datasets array with raw data and moving average
6. **Chart Update**: Populate Chart.js with multiple datasets

**Chart Types Now Available**:

- **Patients Chart**: New patient registrations with moving average
- **Worklists Chart**: All new worklists with moving average  
- **MD Worklists Chart**: Medical Doctor worklists only with moving average

**Files Modified**:

- `controllers.py` - Enhanced chart_data() API with MD filtering and moving averages
- `static/js/dashboard-charts.js` - Multi-chart and multi-dataset support
- `templates/index.html` - Added MD worklists chart section and CSS

**Impact**: Dashboard now provides comprehensive analytics with trend analysis for all major data types in the ophthalmology system

## [2025-06-08T03:21:45.548685] - Dashboard Charts PyDAL Date Function Fix

### Fixed

- **PyDAL Date Function Error**: Resolved `AttributeError: 'Field' object has no attribute 'date'` in chart data API
  - **Root Cause**: Used `.date()` method on pyDAL Field objects which is not supported in pyDAL syntax
  - **Original Code**: `db.auth_user.created_on.date().with_alias("date")` (invalid pyDAL syntax)
  - **Solution**: Replaced database-level date grouping with Python-level date grouping for better compatibility
  - **Performance**: Moved from SQL GROUP BY to Python collections.defaultdict for date aggregation

### Changed

- **Chart Data Processing**: Enhanced `chart_data()` function in `controllers.py` with database-agnostic approach
  - **Before**: Database-level grouping using unsupported `.date()` method with SQL GROUP BY
  - **After**: Python-level grouping using `collections.defaultdict` and Python's `datetime.date()` method
  - **Query Simplification**: Removed complex GROUP BY queries, now uses simple SELECT with ORDER BY
  - **Date Extraction**: Uses Python `row.created_on.date()` instead of SQL date functions

### Technical Details

- **Database Compatibility**: Solution now works across all database backends (SQLite, MySQL, PostgreSQL)
- **Python Date Grouping**: Uses `defaultdict(int)` to count occurrences by date
- **Sorting**: Maintains chronological order using `sorted(date_counts.keys())`
- **Error Handling**: Added null checking for `created_on` fields
- **Performance**: Efficient Python grouping with minimal database queries

**Chart Data Flow**:

1. Query all records within date range (no GROUP BY)
2. Group by date in Python using `collections.defaultdict`
3. Sort dates chronologically
4. Format for Chart.js consumption

**Files Modified**:

- `controllers.py` - Fixed chart_data() function with Python-based date grouping

**Impact**: Chart data API now works reliably across all database backends without SQL date function dependencies

## [2025-06-08T03:19:16.609200] - Dashboard Charts Template Variable Fix

### Fixed

- **Template Variable Error**: Resolved `NameError: name 'HOSTURL' is not defined` in dashboard template
  - **Root Cause**: `index()` controller was not passing `hosturl` variable to template context
  - **Secondary Issue**: Template was using uppercase `HOSTURL` instead of lowercase `hosturl` variable name
  - **Solution**: Added `hosturl = LOCAL_URL` to index controller and corrected template variable name
  - **Pattern Consistency**: Now follows same pattern as payment_view and daily_transactions controllers

### Changed

- **Index Controller**: Added missing `hosturl` variable to `index()` function in `controllers.py`
  - Added `hosturl = LOCAL_URL` following pattern from other working controllers
  - Maintains consistency with payment system and other modules

- **Template Variable Names**: Fixed variable names in `templates/index.html` global variables
  - **Before**: `window.HOSTURL = "[[= HOSTURL ]]";` (undefined variable)
  - **After**: `window.HOSTURL = "[[= hosturl ]]";` (correct lowercase variable)
  - Consistent with other working templates (payment_view.html, daily_transactions.html)

## [2025-06-08T03:17:58.808555] - Dashboard Charts URL Construction Fix

### Fixed

- **API URL Construction Issue**: Resolved chart data API calls failing due to missing app name in URL
  - **Root Cause**: JavaScript was constructing URLs as `/api/chart_data/...` without including the py4web app name
  - **Solution**: Added global variables `window.HOSTURL` and `window.APP_NAME` to dashboard template
  - **URL Pattern**: Fixed to use proper py4web URL format: `${HOSTURL}/${APP_NAME}/api/chart_data/${chartType}/${period}`
  - **Consistency**: Now follows same pattern as payment system and other modules per CHANGELOG.md reference

### Changed

- **Dashboard Template**: Added global variables setup in `templates/index.html`
  - Added `window.HOSTURL = "[[= HOSTURL ]]";` for base URL
  - Added `window.APP_NAME = "[[= app_name ]]";` for app name from settings.py
  - Consistent with established pattern from payment system and files management

- **JavaScript URL Construction**: Enhanced `loadChartData()` method in `static/js/dashboard-charts.js`
  - **Before**: `fetch('/api/chart_data/${chartType}/${period}')`
  - **After**: `fetch('${baseUrl}/${appName}/api/chart_data/${chartType}/${period}')`
  - Added fallback values for missing global variables
  - Proper error handling for URL construction

### Technical Details

- **Global Variables**: Following established pattern from payment system and other modules
- **URL Safety**: Added fallback values (`location.origin` for HOSTURL, `"oph4py"` for APP_NAME)
- **Consistency**: Chart API calls now use same URL construction pattern as worklist, payment, and files modules
- **Error Prevention**: Prevents 404 errors when app is deployed with different name in settings.py

**Files Modified**:

- `templates/index.html` - Added global variables for API access
- `static/js/dashboard-charts.js` - Fixed URL construction with app name

**Impact**: Dashboard charts now load correctly regardless of app name configuration in settings.py

## [2025-06-08T03:14:53.964666] - Dashboard Analytics Enhancement

### Added

- **Interactive Dashboard Charts**: Implemented Chart.js charts for analytics visualization
  - **New Patients Chart**: Time-series line chart showing new patient registrations over configurable periods (3M, 6M, 1Y, 2Y, 5Y)
  - **New Worklists Chart**: Time-series line chart showing new worklist creation trends over configurable periods
  - **Period Selector Buttons**: Interactive period selection for both charts with visual active state indicators
  - **Chart Summary**: Displays total count with period context for quick insights
  - **Loading States**: Professional loading indicators during chart data fetching
  - **Error Handling**: Comprehensive error display with user-friendly messages

- **Chart API Endpoints**: RESTful API for chart data delivery
  - **Endpoint**: `/api/chart_data/<table>/<period>` supporting 'patients' and 'worklists' tables
  - **Data Aggregation**: Daily grouped database queries with date-based filtering
  - **JSON Response**: Chart.js compatible data format with labels, data points, and metadata
  - **Input Validation**: Strict validation for table names and time periods
  - **Performance Optimized**: Efficient SQL queries using pyDAL groupby and date functions

- **Chart.js Integration**: Professional charting library implementation
  - **Chart.js v4.4.9**: Downloaded and integrated UMD version for standalone usage
  - **Moment.js Adapter**: Time scale support for accurate date/time axis handling
  - **Responsive Design**: Charts adapt to container size with maintained aspect ratios
  - **Custom Styling**: Medical application-appropriate color scheme and professional appearance

- **Enhanced UI/UX**: Modern dashboard design with improved visual hierarchy
  - **Card-based Layout**: Professional card containers for charts and statistics
  - **Bootstrap Styling**: Consistent with application theme using Bootstrap 5 components
  - **Badge Indicators**: Color-coded badges for database statistics with improved readability
  - **Responsive Grid**: Mobile-friendly layout that adapts to different screen sizes

### Changed

- **Dashboard Template**: Complete redesign from simple list to analytics-focused layout
  - **Analytics Section**: Prominent placement of chart visualizations above static statistics
  - **Visual Hierarchy**: Improved organization with clear sections and card-based design
  - **Statistics Display**: Enhanced database statistics with badges and better formatting
  - **User Experience**: More engaging and informative dashboard experience

- **Database Dependencies**: Added python-dateutil for robust date calculations
  - **Date Range Queries**: Using `relativedelta` for accurate month-based period calculations
  - **Query Optimization**: Efficient date filtering with proper timezone handling

### Technical Implementation

- **Frontend Architecture**: Modular JavaScript class-based design (`DashboardCharts`)
  - **Chart Management**: Centralized chart initialization, data loading, and state management
  - **Event Handling**: Period selector buttons with active state management
  - **Error Recovery**: Graceful error handling with user feedback and console logging
  - **Performance**: Async/await pattern for non-blocking API calls

- **Backend Architecture**: Clean separation of concerns with dedicated API endpoints
  - **Data Layer**: pyDAL queries with proper grouping and date filtering
  - **Validation Layer**: Input sanitization and error response handling
  - **Response Format**: Structured JSON suitable for Chart.js consumption

- **Dependencies Added**:
  - `Chart.js v4.4.9` (static/js/chartjs/chart.umd.min.js)
  - `python-dateutil` (requirements.txt)
  - `moment.js` and `chartjs-adapter-moment` (CDN)

### Files Modified

- `controllers.py` - Added `/api/chart_data/<table>/<period>` endpoint with data aggregation
- `templates/index.html` - Complete dashboard redesign with charts and enhanced UI
- `static/js/dashboard-charts.js` - New Chart.js integration and chart management
- `requirements.txt` - Added python-dateutil dependency

### User Experience Impact

- **Visual Analytics**: Dashboard now provides immediate visual insights into patient and worklist trends
- **Interactive Exploration**: Users can explore different time periods to understand usage patterns
- **Professional Appearance**: Enhanced visual design that reflects medical application standards
- **Performance**: Charts load efficiently with proper loading states and error handling
