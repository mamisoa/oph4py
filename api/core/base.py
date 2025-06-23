"""
REST API Base Module

This module provides the base configuration and shared functions for the REST API.
It includes common imports, error handling, and configuration that all API endpoints
will depend on.
"""

import json
import traceback
from typing import Any, Dict, Optional, Union

from py4web import HTTP, URL, action, request, response
from pydal.restapi import RestAPI

# Import app-specific components
from ...common import T, db, logger, session
from ...models import str_uuid
from ...settings import APP_NAME
from ..core.policy import default_policy
from ..core.utils import format_response_datetime


class APIResponse:
    """
    Standard API response formatter

    Handles creating consistent API responses, including error handling
    and proper HTTP status codes.
    """

    @staticmethod
    def success(
        data: Any = None,
        message: str = "Operation successful",
        status_code: int = 200,
        meta: Optional[Dict] = None,
    ) -> str:
        """
        Format a successful API response.

        Args:
            data: The data to include in the response
            message: Success message
            status_code: HTTP status code (default: 200)
            meta: Optional metadata dictionary

        Returns:
            JSON formatted response string
        """
        response.status = status_code

        result = {
            "status": "success",
            "message": message,
            "code": status_code,
        }

        if data is not None:
            result["data"] = format_response_datetime(data)

        if meta is not None:
            result["meta"] = format_response_datetime(meta)

        return json.dumps(result)

    @staticmethod
    def error(
        message: str = "An error occurred",
        status_code: int = 400,
        error_type: str = "validation_error",
        details: Any = None,
    ) -> str:
        """
        Format an error API response.

        Args:
            message: Error message
            status_code: HTTP status code (default: 400)
            error_type: Type of error
            details: Additional error details

        Returns:
            JSON formatted response string
        """
        response.status = status_code

        result = {
            "status": "error",
            "message": message,
            "code": status_code,
            "error_type": error_type,
        }

        if details is not None:
            result["details"] = format_response_datetime(details)

        return json.dumps(result)


def handle_rest_api_request(
    tablename: str, rec_id: Optional[str] = None, custom_query: Optional[Dict] = None
) -> str:
    """
    Handle a standard REST API request.

    Common wrapper around the RestAPI class to provide consistent error handling
    and logging across all API endpoints.

    Args:
        tablename: The name of the database table
        rec_id: Optional record ID for operations on a specific record
        custom_query: Optional custom query parameters

    Returns:
        str: JSON response from the API

    Raises:
        HTTP: In case of errors
    """
    method = request.method
    query = custom_query if custom_query is not None else request.GET

    try:
        logger.info(f"API Request - Method: {method}, Table: {tablename}, ID: {rec_id}")

        # Check if record exists for PUT/DELETE requests
        if method in ["PUT", "DELETE"] and rec_id:
            record = db(db[tablename].id == rec_id).select().first()
            if not record:
                logger.error(f"Record not found for id {rec_id}")
                return APIResponse.error(
                    message=f"Record not found with ID: {rec_id}",
                    status_code=404,
                    error_type="not_found",
                )

        # Process the request using RestAPI
        json_resp = RestAPI(db, default_policy)(
            method, tablename, rec_id, query, request.json
        )

        # Log the response
        logger.info(f"RestAPI Response: {json_resp}")

        # Return the response (transaction commit is handled by @action.uses(db) decorator)
        return str(json_resp) if json_resp is not None else ""
        

    except ValueError as e:
        # Handle validation errors
        logger.error(f"Validation Error: {str(e)}")
        return APIResponse.error(
            message=str(e), status_code=400, error_type="validation_error"
        )

    except Exception as e:
        # Enhanced error logging
        logger.error(f"Unexpected Error: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        logger.error(f"Exception args: {getattr(e, 'args', None)}")
        logger.error(
            f"Request context: method={method}, tablename={tablename}, rec_id={rec_id}, query={query}, request.json={request.json}"
        )
        logger.error(traceback.format_exc())
        return APIResponse.error(
            message=str(e),
            status_code=500,
            error_type="server_error",
            details=(
                {
                    "traceback": traceback.format_exc(),
                    "exception_type": type(e).__name__,
                    "exception_args": getattr(e, "args", None),
                }
                if APP_NAME.startswith("dev_")
                else None
            ),
        )
