"""
File Upload API Endpoints

This module provides endpoints for file uploads and related operations.
"""

import json
import os

from py4web import action, request, response

from ...common import db, logger
from ...settings import UPLOAD_FOLDER
from ..core.base import APIResponse


@action("upload", method=["POST"])
def do_upload():
    """
    Upload a file to the server.

    This endpoint accepts file uploads via POST requests and handles the storage
    and validation of the uploaded files.

    Allowed file extensions: .png, .jpg, .jpeg, .webp, .pdf

    Returns:
        A JSON response with status information and the filename
    """
    response.headers["Content-Type"] = "application/json;charset=UTF-8"

    # Get the uploaded file
    file = request.files.get("file")
    if not file:
        return APIResponse.error(
            message="No file provided", error_type="validation_error"
        )

    # Create response dictionary with the filename
    re_dict = {"filename": file.filename}

    # Check file extension
    name, ext = os.path.splitext(file.filename)
    if ext not in (".png", ".jpg", ".jpeg", ".webp", ".pdf"):
        logger.error(f"Invalid file extension: {ext}")
        re_dict.update({"status": "error", "error": "File extension not allowed."})
        return json.dumps(re_dict)

    try:
        # Save the file
        file.save(UPLOAD_FOLDER)
        logger.info(f"File {file.filename} saved successfully to {UPLOAD_FOLDER}")
        re_dict.update({"status": "saved"})
    except Exception as e:
        logger.error(f"Error saving file {file.filename}: {str(e)}")
        re_dict.update({"status": "error", "error": str(e)})

    # Return JSON response
    return json.dumps(re_dict)
