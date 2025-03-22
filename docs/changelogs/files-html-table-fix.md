# Files HTML Bootstrap Table Initialization Fix

**Date:** 2025-03-21

## Issue

Bootstrap table in `templates/manage/files.html` was being initialized twice:

- Once via the `data-toggle="table"` attribute in the HTML
- Once via the JavaScript `$('#table-wl').bootstrapTable()` method in the script section

This could potentially cause the error: `You cannot initialize the table more than once!`

## Changes Made

1. Removed the `data-toggle="table"` attribute from the table element in `templates/manage/files.html`
2. Left the explicit initialization in the JavaScript as it needs to set the URL and other options

## Files Changed

- `/home/mamisoa/code/py4web2024/apps/oph4py/templates/manage/files.html`
