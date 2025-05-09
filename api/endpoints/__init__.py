"""
API Endpoints Package

This package contains all the API endpoints for the application.
The modules in this package define route handlers for different API functionalities.
"""

# Import all endpoint modules to ensure they're loaded
from . import auth, email, upload, utils, worklist
from .devices import beid

# List of all endpoint modules for easy importing
all_endpoints = ["auth", "email", "upload", "utils", "worklist", "beid"]
