"""
API Package

This package provides a modular REST API for the ophthalmology electronic medical records system.
"""

from .core.base import APIResponse, handle_rest_api_request

# Import core components for easy access
from .core.policy import default_policy
from .core.utils import format_response_datetime, rows2json, valid_date

# Import endpoints to ensure they're registered with py4web
from .endpoints import email
from .endpoints import utils as endpoint_utils
from .endpoints.devices import beid

__all__ = [
    # Core components
    "default_policy",
    "rows2json",
    "valid_date",
    "format_response_datetime",
    "APIResponse",
    "handle_rest_api_request",
    # Endpoints
    "email",
    "endpoint_utils",
    "beid",
]
