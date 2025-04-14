"""
Utility API Endpoints

This module contains utility endpoints for common operations such as UUID generation.
"""

import json
import uuid

from py4web import action, request, response

from ...common import db, session
from ..core.base import APIResponse


@action("api/uuid", method=["GET"])
def generate_unique_id():
    """
    Generate a unique ID (Universally Unique Identifier - UUID) and return it as a JSON response.

    This function is a route handler for HTTP GET requests targeting the 'api/uuid' endpoint.

    Returns:
        str: A JSON string representing the response containing the generated unique ID.

    Example:
        HTTP GET Request: /api/uuid
        Response:
        {
            "unique_id": "d81d4fae7d584d9f97d49ba66a3e77ad"
        }
    """
    response.headers["Content-Type"] = "application/json;charset=UTF-8"
    unique_id = str(uuid.uuid4().hex)
    return json.dumps({"unique_id": unique_id})
