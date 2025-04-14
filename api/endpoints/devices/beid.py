"""
Belgium eID Card API

This module provides an API endpoint for reading information from Belgium eID cards.
"""

import json
from base64 import b64encode

from py4web import action, request, response

from ....beid import read_infos, scan_readers
from ....common import db, logger, session


@action("api/beid", method=["GET"])
def beid():
    """
    Get information contained in a Belgium eID card and return it as a JSON response.

    This function is a route handler for HTTP GET requests targeting the 'api/beid' endpoint.

    Returns:
        str: A JSON string containing the eID card information, including:
            - Personal details (name, nationality, etc.)
            - Address information
            - Card details (number, validity period)
            - Photo (base64 encoded)

    Notes:
        - Requires a connected card reader with a valid eID card
        - Returns error information if the card cannot be read
        - Sets CORS headers to allow access from other domains
    """
    # Set up headers for the response
    response.headers["Content-Type"] = "application/json;charset=UTF-8"
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = (
        "Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token"
    )

    try:
        # Scan for connected readers
        readers = scan_readers()
        if not readers:
            logger.error("No card readers found")
            return json.dumps({"results": "error", "error": "No card readers found"})

        # Use the first reader found
        reader = readers[0]
        logger.info(f"Using card reader: {reader}")

        # Read information from the card
        infos = read_infos(reader, read_photo=True)

        # Convert the photo to base64 for transmission
        if infos.get("photo"):
            infos["photo"] = b64encode(infos["photo"]).decode("utf8")

        # Return the information as JSON
        return json.dumps(infos)

    except Exception as e:
        logger.error(f"Error reading eID card: {str(e)}")
        infos = {"results": "cannot read card", "error": str(e.args)}
        return json.dumps(infos)
