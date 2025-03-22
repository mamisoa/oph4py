# Bootstrap Table Initialization Fix

**Date:** 2025-03-21

## Issue

Bootstrap table was being initialized twice:

- Once via the `data-toggle="table"` attribute in the HTML
- Once via the JavaScript `$table.bootstrapTable()` method in the `test_files_bt.js` file

This was causing the error: `You cannot initialize the table more than once!`

## Changes Made

1. Removed the `data-toggle="table"` attribute from the table element in `templates/test/files_bt.html`
2. Modified the `initTable()` function in `static/js/test_files_bt.js` to check if the table is already initialized before calling bootstrapTable() again:

   ```javascript
   if ($table.data('bootstrap.table')) {
       console.log("Table already initialized, updating data only");
       $table.bootstrapTable('load', sampleData);
   } else {
       // Initialize the bootstrap-table
       try {
           $table.bootstrapTable({
               data: sampleData,
           });
           console.log("Table initialized successfully");
       } catch (error) {
           console.error("Error initializing table:", error);
       }
   }
   ```

## Files Changed

- `/home/mamisoa/code/py4web2024/apps/oph4py/templates/test/files_bt.html`
- `/home/mamisoa/code/py4web2024/apps/oph4py/static/js/test_files_bt.js`
