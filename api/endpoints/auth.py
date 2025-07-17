"""
Authentication and Database API Endpoints

This module provides the main database CRUD operations for the application.
"""

import json
import traceback

from py4web import action, request, response

from ...common import auth, db, logger, session
from ..core.base import APIResponse, handle_rest_api_request


@action("api/<tablename>/", method=["GET", "POST", "PUT"])
@action("api/<tablename>/<rec_id>", method=["GET", "PUT", "DELETE"])
@action.uses(db, auth.user)
def api(tablename, rec_id=None):
    """
    API endpoint for GET, POST, PUT, DELETE operations on database tables.

    Args:
        tablename (str): Name of the table to operate on
        rec_id (int, optional): ID of the record for PUT, GET or DELETE operations

    Returns:
        str: A JSON response with the operation results

    Examples:
        http://localhost:8000/oph4py/api/phone?id_auth_user=2&@lookup=phone:id_auth_user -> get phone from auth_user_id
        http://localhost:8000/oph4py/api/phone?id_auth_user=2&@lookup=identity!:id_auth_user[first_name,last_name] -> denormalized (flat)
    """
    logger.info(
        f"API Request - Method: {request.method}, Table: {tablename}, ID: {rec_id}"
    )
    logger.info(f"Request JSON: {request.json}")
    logger.info(f"Request GET params: {request.GET}")
    logger.info(f"Request URL: {request.url}")
    logger.info(f"Request path: {request.path}")

    # Enable necessary fields
    db.phone.id_auth_user.writable = db.address.id_auth_user.writable = True
    db.phone.id_auth_user.readable = db.address.id_auth_user.readable = True
    db.auth_user.password.readable = db.auth_user.password.writable = True
    db.address.created_by.readable = db.address.modified_by.readable = (
        db.address.created_on.readable
    ) = db.address.modified_on.readable = db.address.id_auth_user.readable = True
    db.auth_user.created_by.readable = db.auth_user.modified_by.readable = (
        db.auth_user.created_on.readable
    ) = db.auth_user.modified_on.readable = True
    db.phone.created_by.readable = db.phone.modified_by.readable = (
        db.phone.created_on.readable
    ) = db.phone.modified_on.readable = db.phone.id_auth_user.readable = True
    db.worklist.created_by.readable = db.worklist.modified_by.readable = (
        db.worklist.created_on.readable
    ) = db.worklist.modified_on.readable = db.worklist.id_auth_user.readable = True
    db.photo_id.created_by.readable = db.photo_id.modified_by.readable = (
        db.photo_id.created_on.readable
    ) = db.photo_id.modified_on.readable = db.photo_id.id_auth_user.readable = True

    if tablename == "auth_user" and request.method == "PUT":
        try:
            logger.info(f"Processing PUT request for auth_user")
            logger.info(f"Request data: {request.json}")

            # Get the existing user record
            user_id = request.json.get("id") or rec_id
            if not user_id:
                return APIResponse.error(
                    message="No user ID provided",
                    status_code=400,
                    error_type="validation_error",
                )

            row = db(db.auth_user.id == user_id).select(db.auth_user.ALL).first()
            if not row:
                logger.error(f"User not found with ID: {user_id}")
                return APIResponse.error(
                    message="User not found", status_code=404, error_type="not_found"
                )

            # Parse the data field if it's a string
            data = request.json.get("data")
            if isinstance(data, str):
                try:
                    data = json.loads(data)
                except json.JSONDecodeError as e:
                    logger.error(f"JSON parsing error: {str(e)}")
                    return APIResponse.error(
                        message=f"Invalid JSON data: {str(e)}",
                        error_type="validation_error",
                    )
            else:
                data = request.json

            logger.info(f"Processed data for update: {data}")

            # Store original password validation state
            original_requires = db.auth_user.password.requires

            try:
                # Always preserve existing password in updates unless explicitly changed
                if "password" not in data or not data.get("password"):
                    logger.info(
                        "No password in update data, preserving existing password"
                    )
                    data["password"] = row.password
                    # Disable password validation since we're using the existing password
                    db.auth_user.password.requires = None
                    logger.info("Password validation disabled for this update")
                else:
                    logger.info(
                        "Password field present in update, will validate new password"
                    )

                # Update user
                logger.info(
                    f"Updating user with data: {json.dumps({k: v for k, v in data.items() if k != 'password'}, indent=2)}"
                )
                db(db.auth_user.id == user_id).update(
                    **{k: v for k, v in data.items() if k in db.auth_user.fields}
                )
                logger.info("User update successful")

                return APIResponse.success(
                    message="User updated successfully",
                    data={"id": user_id, "updated": 1},
                )

            finally:
                # Always restore the original password validation
                logger.info("Restoring original password validation")
                db.auth_user.password.requires = original_requires

        except Exception as e:
            logger.error(f"Error updating user: {str(e)}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return APIResponse.error(
                message=str(e), error_type="server_error", status_code=500
            )

    # Use the common REST API handler for other operations
    return handle_rest_api_request(tablename, rec_id)


@action("octopus/api/<tablename>/", method=["GET", "POST", "PUT"])
@action("octopus/api/<tablename>/<rec_id>", method=["GET", "PUT", "DELETE"])
@action.uses(db)
def octopus(tablename, rec_id=None):
    """
    Legacy compatibility endpoint for the Octopus API.

    This is maintained for backward compatibility with external systems.
    New code should use the standard api/<tablename>/ endpoint instead.
    """
    logger.info(f"Octopus API request for {tablename} (ID: {rec_id})")
    # Placeholder for Octopus-specific code
    # For now, this simply redirects to the main API handler
    return handle_rest_api_request(tablename, rec_id)
