"""
Billing API Endpoints

This module contains endpoints for billing operations including:
- CRUD operations for billing codes
- CRUD operations for billing combos
- CRUD operations for billing combo usage
- Integration with external nomenclature API
"""

import ast
import datetime
import json
import traceback
from typing import Dict, List, Optional

from py4web import action, request

from ...common import auth, db, logger
from ..core.base import APIResponse, handle_rest_api_request
from ..core.nomenclature import NomenclatureClient

# =============================================================================
# Billing Codes Endpoints
# =============================================================================


def serialize_datetime_fields(data_dict):
    """
    Convert datetime objects in a dictionary to ISO format strings for JSON serialization.

    Args:
        data_dict (dict): Dictionary that may contain datetime objects

    Returns:
        dict: Dictionary with datetime objects converted to strings
    """
    result = data_dict.copy()
    for key, value in result.items():
        if hasattr(value, "isoformat"):  # datetime objects
            result[key] = value.isoformat()
    return result


def enhance_combo_response(record):
    """
    Add user information to combo records for detail view.

    Args:
        record (dict): The combo record dictionary

    Returns:
        dict: Enhanced record with user names
    """
    try:
        # Add created by user name
        if record.get("created_by"):
            user = db.auth_user[record["created_by"]]
            if user:
                record["created_by_name"] = (
                    f"{user.first_name} {user.last_name}".strip()
                )

        # Add modified by user name
        if record.get("modified_by"):
            user = db.auth_user[record["modified_by"]]
            if user:
                record["modified_by_name"] = (
                    f"{user.first_name} {user.last_name}".strip()
                )

    except Exception as e:
        # Log but don't fail - user names are optional enhancement
        logger.warning(f"Could not enhance combo response with user info: {str(e)}")

    return record


@action("api/billing_codes", method=["GET", "POST"])
@action("api/billing_codes/<rec_id:int>", method=["GET", "PUT", "DELETE"])
@action.uses(db, auth.user)  # Add authentication requirement
def billing_codes(rec_id: Optional[int] = None):
    """
    Enhanced CRUD operations for billing codes with secondary nomenclature support.

    GET /api/billing_codes - List all billing codes with optional filters
    GET /api/billing_codes/123 - Get specific billing code
    POST /api/billing_codes - Create new billing code
    PUT /api/billing_codes/123 - Update billing code
    DELETE /api/billing_codes/123 - Delete billing code

    Query parameters for GET:
    - id_worklist.eq=123: Filter by worklist ID
    - id_auth_user.eq=456: Filter by user ID
    - status.eq=draft: Filter by status
    - nomen_code.like=123: Search by nomenclature code prefix

    Enhanced Features:
    - Secondary nomenclature code support
    - Validation ensuring secondary codes differ from main codes
    - Total fee calculations (main + secondary)
    - Comprehensive error handling and logging

    Returns:
        JSON response with billing codes data
    """
    try:
        logger.info(
            f"Enhanced billing codes request - Method: {request.method}, ID: {rec_id}"
        )

        # For POST/PUT requests, validate and enrich data
        if request.method in ["POST", "PUT"] and request.json:
            data = request.json.copy()

            # Enhanced validation for required fields
            required_fields = ["id_auth_user", "id_worklist", "nomen_code"]
            missing_fields = [f for f in required_fields if f not in data]
            if missing_fields:
                logger.warning(f"Missing required fields: {', '.join(missing_fields)}")
                return APIResponse.error(
                    message=f"Missing required fields: {', '.join(missing_fields)}",
                    status_code=400,
                    error_type="validation_error",
                )

            # Enhanced validation for secondary codes
            main_code = data.get("nomen_code")
            secondary_code = data.get("secondary_nomen_code")

            if secondary_code is not None:
                # Secondary code must be different from main code
                if secondary_code == main_code:
                    logger.warning(
                        f"Secondary code {secondary_code} same as main code {main_code}"
                    )
                    return APIResponse.error(
                        message="Secondary nomenclature code must be different from main code",
                        status_code=400,
                        error_type="validation_error",
                    )

                # Secondary code must be a valid integer
                if not isinstance(secondary_code, int) or secondary_code <= 0:
                    logger.warning(f"Invalid secondary code: {secondary_code}")
                    return APIResponse.error(
                        message="Secondary nomenclature code must be a positive integer",
                        status_code=400,
                        error_type="validation_error",
                    )

            # Set defaults
            data.setdefault("quantity", 1)
            data.setdefault("laterality", "both")
            data.setdefault("status", "draft")
            data.setdefault("date_performed", datetime.date.today())

            # Enhanced nomenclature enrichment for both main and secondary codes
            nomenclature = NomenclatureClient()

            # Enrich main nomenclature code if description is not provided
            if not data.get("nomen_desc_fr") and not data.get("nomen_desc_nl"):
                try:
                    code_details = nomenclature.get_code_details(data["nomen_code"])
                    if code_details is not None:
                        data["nomen_desc_fr"] = code_details.get("description_fr")
                        data["nomen_desc_nl"] = code_details.get("description_nl")
                        data["fee"] = code_details.get("fee")
                        data["feecode"] = code_details.get("feecode")
                        logger.info(
                            f"Enriched main code {main_code} with fee €{data.get('fee', 0)}"
                        )
                except Exception as e:
                    logger.warning(
                        f"Could not fetch main nomenclature details for {main_code}: {str(e)}"
                    )

            # Enrich secondary nomenclature code if provided but description is missing
            if (
                secondary_code
                and not data.get("secondary_nomen_desc_fr")
                and not data.get("secondary_nomen_desc_nl")
            ):
                try:
                    secondary_details = nomenclature.get_code_details(secondary_code)
                    if secondary_details is not None:
                        data["secondary_nomen_desc_fr"] = secondary_details.get(
                            "description_fr"
                        )
                        data["secondary_nomen_desc_nl"] = secondary_details.get(
                            "description_nl"
                        )
                        data["secondary_fee"] = secondary_details.get("fee")
                        data["secondary_feecode"] = secondary_details.get("feecode")
                        logger.info(
                            f"Enriched secondary code {secondary_code} with fee €{data.get('secondary_fee', 0)}"
                        )
                except Exception as e:
                    logger.warning(
                        f"Could not fetch secondary nomenclature details for {secondary_code}: {str(e)}"
                    )

            # Calculate and log total fee for audit purposes
            main_fee = float(data.get("fee") or 0)
            secondary_fee = float(data.get("secondary_fee") or 0)
            total_fee = main_fee + secondary_fee

            logger.info(
                f"Billing code - Method: {request.method}, "
                f"Main: {main_code} (€{main_fee:.2f}), "
                f"Secondary: {secondary_code or 'None'} (€{secondary_fee:.2f}), "
                f"Total: €{total_fee:.2f}"
            )

            # Update request with enriched data
            request.json = data

        # Handle GET requests with enhanced response processing
        if request.method == "GET":
            result = handle_rest_api_request(
                "billing_codes", str(rec_id) if rec_id else None
            )

            # Enhance response with calculated totals for individual records or lists
            if isinstance(result, dict) and result.get("data") is not None:
                data = result.get("data")
                if isinstance(data, list):
                    # Multiple records - enhance each
                    for record in data:
                        enhance_billing_response(record)
                elif isinstance(data, dict):
                    # Single record - enhance it
                    enhance_billing_response(data)

            return result
        else:
            # For POST/PUT/DELETE, use standard handler
            return handle_rest_api_request(
                "billing_codes", str(rec_id) if rec_id else None
            )

    except Exception as e:
        logger.error(f"Error in enhanced billing_codes endpoint: {str(e)}")
        logger.error(traceback.format_exc())
        return APIResponse.error(
            message=f"Server error: {str(e)}",
            status_code=500,
            error_type="server_error",
        )


def enhance_billing_response(record):
    """
    Enhance billing code response with calculated totals and secondary code indicators.

    Args:
        record (dict): Billing code record to enhance

    Returns:
        dict: Enhanced record with additional computed fields
    """
    if record:
        main_fee = float(record.get("fee") or 0)
        secondary_fee = float(record.get("secondary_fee") or 0)
        total_fee = main_fee + secondary_fee

        # Add computed fields
        record["total_fee"] = round(total_fee, 2)
        record["has_secondary"] = bool(record.get("secondary_nomen_code"))
        record["main_fee_formatted"] = f"€{main_fee:.2f}"
        record["secondary_fee_formatted"] = (
            f"€{secondary_fee:.2f}" if record["has_secondary"] else None
        )
        record["total_fee_formatted"] = f"€{total_fee:.2f}"

    return record


@action("api/billing_codes/by_worklist/<worklist_id:int>", method=["GET"])
@action.uses(db, auth.user)  # Add authentication requirement
def billing_codes_by_worklist(worklist_id: int):
    """
    Get all billing codes for a specific worklist item with enhanced secondary code support.

    Args:
        worklist_id: The worklist ID to filter by

    Enhanced Features:
    - Secondary nomenclature code support
    - Total fee calculations including secondary fees
    - Enhanced response with computed fields
    - User information for created_by and modified_by fields via @lookup parameter

    Returns:
        JSON response with billing codes for the worklist including totals
    """
    try:
        logger.info(f"Getting enhanced billing codes for worklist {worklist_id}")

        # Check if worklist exists
        worklist = db(db.worklist.id == worklist_id).select().first()
        if not worklist:
            return APIResponse.error(
                message=f"Worklist not found with ID: {worklist_id}",
                status_code=404,
                error_type="not_found",
            )

        # Build query parameters for the standard REST API handler
        query_params = dict(request.GET)
        query_params["id_worklist.eq"] = str(worklist_id)

        # If @lookup parameter is not provided, add default user lookup
        if "@lookup" not in query_params:
            query_params["@lookup"] = (
                "mod!:modified_by[id,first_name,last_name],creator!:created_by[id,first_name,last_name]"
            )

        # Add count and ordering
        query_params["@count"] = "true"
        query_params["@order"] = "date_performed,id"

        # Use the standard REST API handler that properly handles @lookup
        result = handle_rest_api_request("billing_codes", None, query_params)

        # If the result is a string (JSON), parse it
        if isinstance(result, str):
            import json

            result = json.loads(result)

        # Enhance response with calculated totals for individual records or lists
        if isinstance(result, dict) and result.get("status") == "success":
            data = result.get("items") or result.get("data")
            if isinstance(data, list):
                # Enhanced calculations including secondary fees
                total_main_fee = 0
                total_secondary_fee = 0
                total_combined_fee = 0
                codes_with_secondary = 0

                # Multiple records - enhance each
                for record in data:
                    enhance_billing_response(record)

                    # Calculate running totals
                    main_fee = float(record.get("fee") or 0) * (
                        record.get("quantity") or 1
                    )
                    secondary_fee = float(record.get("secondary_fee") or 0) * (
                        record.get("quantity") or 1
                    )

                    total_main_fee += main_fee
                    total_secondary_fee += secondary_fee
                    total_combined_fee += main_fee + secondary_fee

                    if record.get("secondary_nomen_code"):
                        codes_with_secondary += 1

                # Add meta information to the result
                if "meta" not in result:
                    result["meta"] = {}

                result["meta"].update(
                    {
                        "total_codes": len(data),
                        "codes_with_secondary": codes_with_secondary,
                        "total_main_fee": round(total_main_fee, 2),
                        "total_secondary_fee": round(total_secondary_fee, 2),
                        "total_combined_fee": round(total_combined_fee, 2),
                        "main_fee_formatted": f"€{total_main_fee:.2f}",
                        "secondary_fee_formatted": f"€{total_secondary_fee:.2f}",
                        "total_fee_formatted": f"€{total_combined_fee:.2f}",
                        "worklist_id": worklist_id,
                    }
                )

                logger.info(
                    f"Worklist {worklist_id} summary: {len(data)} codes, "
                    f"{codes_with_secondary} with secondary, total: €{total_combined_fee:.2f}"
                )

        return result

    except Exception as e:
        logger.error(f"Error getting enhanced billing codes by worklist: {str(e)}")
        return APIResponse.error(
            message=str(e), status_code=500, error_type="server_error"
        )


# =============================================================================
# Billing Combos Endpoints
# =============================================================================


@action("api/billing_combo", method=["GET", "POST"])
@action("api/billing_combo/<rec_id:int>", method=["GET", "PUT", "DELETE"])
@action.uses(db, auth.user)
def billing_combo(rec_id: Optional[int] = None):
    """
    CRUD operations for billing combos with ownership-based access control.

    GET /api/billing_combo - List user's billing combos + legacy combos (without creators)
    GET /api/billing_combo/123 - Get specific billing combo (if owned by user or legacy)
    POST /api/billing_combo - Create new billing combo (automatically assigned to user)
    PUT /api/billing_combo/123 - Update billing combo (if owned by user or legacy)
    DELETE /api/billing_combo/123 - Delete billing combo (if owned by user or legacy)

    Access Control:
    - Users can only see/modify their own combos + combos without creators (legacy)
    - Combos created before access control implementation remain accessible to everyone
    - New combos are automatically assigned to their creator

    Query parameters for GET:
    - specialty.eq=ophthalmology: Filter by specialty
    - is_active.eq=true: Filter by active status
    - combo_name.like=consultation: Search by combo name

    Returns:
        JSON response with billing combo data
    """
    try:
        logger.info(
            f"Billing combo request - Method: {request.method}, ID: {rec_id}, User: {auth.user_id}"
        )

        # Build ownership filter: user's combos OR legacy combos (created_by IS NULL)
        ownership_filter = (db.billing_combo.created_by == auth.user_id) | (
            db.billing_combo.created_by == None
        )
        logger.info(
            f"Built ownership filter for user_id={auth.user_id}: {ownership_filter}"
        )

        # Handle GET requests with ownership filtering
        if request.method == "GET":
            # Get query parameters and filter out Bootstrap Table specific ones
            query_params = dict(request.GET)

            # Remove Bootstrap Table parameters that PyDAL RestAPI doesn't understand
            bootstrap_params = ["search", "sort", "order", "offset", "limit", "view"]
            filtered_query = {
                k: v for k, v in query_params.items() if k not in bootstrap_params
            }

            # Handle view mode parameter
            view_mode = query_params.get("view", "my")  # 'my' or 'all'
            logger.info(f"View mode: {view_mode}")

            # Build query conditions based on view mode
            if view_mode == "all":
                # Show all combos (no ownership filtering)
                query_conditions = (
                    db.billing_combo.id > 0
                )  # Base condition to get all records
                logger.info("Using 'all' view mode - showing all combos")
            else:
                # Default to 'my' view mode - show only user's combos + legacy combos
                query_conditions = ownership_filter
                logger.info(
                    "Using 'my' view mode - showing user's combos + legacy combos"
                )

            # Apply additional filters from query parameters
            for key, value in filtered_query.items():
                if "." in key:
                    # Handle operators like combo_name.contains
                    field_name, operator = key.split(".", 1)
                    if hasattr(db.billing_combo, field_name):
                        field = getattr(db.billing_combo, field_name)
                        if operator == "contains":
                            query_conditions &= field.contains(value)
                        elif operator == "eq":
                            query_conditions &= field == value
                        elif operator == "like":
                            query_conditions &= field.like(f"%{value}%")
                else:
                    # Handle direct field filters
                    if hasattr(db.billing_combo, key):
                        field = getattr(db.billing_combo, key)

                        # Special handling for is_active boolean field
                        if key == "is_active":
                            # Convert JavaScript boolean to database format
                            if isinstance(value, bool):
                                db_value = "T" if value else "F"
                            elif isinstance(value, str):
                                # Handle string representations
                                if value.lower() in ["true", "1", "t"]:
                                    db_value = "T"
                                elif value.lower() in ["false", "0", "f"]:
                                    db_value = "F"
                                else:
                                    db_value = value  # Keep original value
                            else:
                                db_value = value
                            query_conditions &= field == db_value
                        else:
                            query_conditions &= field == value

            # Handle search functionality manually if search parameter exists
            if "search" in query_params and query_params["search"]:
                search_term = query_params["search"]
                # Search in combo_name and combo_description
                search_condition = db.billing_combo.combo_name.contains(
                    search_term
                ) | db.billing_combo.combo_description.contains(search_term)
                query_conditions &= search_condition

            # Execute query based on whether we're getting a specific record or list
            if rec_id:
                # Get specific record with ownership check
                record = (
                    db(query_conditions & (db.billing_combo.id == rec_id))
                    .select()
                    .first()
                )
                if not record:
                    return APIResponse.error(
                        message=f"Billing combo not found or access denied for ID: {rec_id}",
                        status_code=404,
                        error_type="not_found",
                    )

                # Convert record to dict and return (handling datetime serialization)
                result_data = serialize_datetime_fields(record.as_dict())
                enhance_combo_response(result_data)
                return APIResponse.success(data=result_data)
            else:
                # Get list of accessible records with usage count for ordering
                # Use LEFT JOIN to include usage count, ordering by most used first
                usage_count = db.billing_combo_usage.id.count()
                records = db(query_conditions).select(
                    db.billing_combo.ALL,
                    usage_count.with_alias("usage_count"),
                    left=db.billing_combo_usage.on(
                        db.billing_combo_usage.id_billing_combo == db.billing_combo.id
                    ),
                    groupby=db.billing_combo.id,
                    orderby=[
                        ~usage_count,
                        ~db.billing_combo.id,
                    ],  # Order by usage count DESC, then id DESC
                )
                logger.info(
                    f"GET: Found {len(records)} accessible combos for user {auth.user_id}"
                )

                # Convert to list of dicts with manual datetime serialization and user info
                result_data = []
                for record in records:
                    # Extract billing_combo fields and usage_count
                    if hasattr(record, "billing_combo"):
                        # When using joins, record has attributes for each table
                        record_dict = serialize_datetime_fields(
                            record.billing_combo.as_dict()
                        )
                        record_dict["usage_count"] = record.usage_count or 0
                    else:
                        # Fallback for simple select
                        record_dict = serialize_datetime_fields(record.as_dict())
                        record_dict["usage_count"] = 0

                    enhance_combo_response(record_dict)
                    result_data.append(record_dict)

                # Debug logging for usage count ordering
                combo_info = []
                for r in result_data:
                    combo_info.append(
                        f"{r.get('combo_name')} (usage: {r.get('usage_count', 0)})"
                    )

                logger.info(
                    f"GET: Returning {len(result_data)} combos ordered by usage: {combo_info}"
                )

                # Return in format expected by frontend
                return json.dumps(
                    {
                        "status": "success",
                        "items": result_data,
                        "count": len(result_data),
                    }
                )

        # Handle PUT and DELETE requests with ownership check
        elif request.method in ["PUT", "DELETE"]:
            if not rec_id:
                return APIResponse.error(
                    message="Record ID required for PUT/DELETE operations",
                    status_code=400,
                    error_type="validation_error",
                )

            # Check if user can modify this record
            record = (
                db(ownership_filter & (db.billing_combo.id == rec_id)).select().first()
            )
            if not record:
                return APIResponse.error(
                    message=f"Billing combo not found or access denied for ID: {rec_id}",
                    status_code=403,
                    error_type="access_denied",
                )

            if request.method == "DELETE":
                # Delete the record
                db(db.billing_combo.id == rec_id).delete()
                return APIResponse.success(
                    message=f"Billing combo {rec_id} deleted successfully"
                )

            elif request.method == "PUT":
                # Validate and update the record
                if not request.json:
                    return APIResponse.error(
                        message="Request body required for PUT operation",
                        status_code=400,
                        error_type="validation_error",
                    )

                data = request.json.copy()

                # Validate combo_codes format if provided
                if "combo_codes" in data:
                    if isinstance(data["combo_codes"], str):
                        try:
                            combo_codes = json.loads(data["combo_codes"])
                            if not isinstance(combo_codes, list):
                                raise ValueError("combo_codes must be an array")
                        except json.JSONDecodeError:
                            return APIResponse.error(
                                message="combo_codes must be valid JSON array",
                                status_code=400,
                                error_type="validation_error",
                            )
                    elif isinstance(data["combo_codes"], list):
                        # Convert list to JSON string for storage
                        data["combo_codes"] = json.dumps(data["combo_codes"])
                    else:
                        return APIResponse.error(
                            message="combo_codes must be an array or JSON string",
                            status_code=400,
                            error_type="validation_error",
                        )

                # Remove fields that shouldn't be updated
                data.pop("id", None)
                data.pop("created_by", None)
                data.pop("created_on", None)

                # Update the record
                db(db.billing_combo.id == rec_id).update(**data)

                # Return updated record with datetime serialization
                updated_record = db(db.billing_combo.id == rec_id).select().first()
                return APIResponse.success(
                    data=serialize_datetime_fields(updated_record.as_dict()),
                    message=f"Billing combo {rec_id} updated successfully",
                )

        # Handle POST requests (create new combo)
        elif request.method == "POST":
            logger.info(f"POST: Creating new combo, auth.user_id={auth.user_id}")

            if not request.json:
                return APIResponse.error(
                    message="Request body required for POST operation",
                    status_code=400,
                    error_type="validation_error",
                )

            data = request.json.copy()
            logger.info(f"POST: Received data: {data}")

            # Validate combo_codes format
            if "combo_codes" in data:
                if isinstance(data["combo_codes"], str):
                    try:
                        combo_codes = json.loads(data["combo_codes"])
                        if not isinstance(combo_codes, list):
                            raise ValueError("combo_codes must be an array")
                    except json.JSONDecodeError:
                        return APIResponse.error(
                            message="combo_codes must be valid JSON array",
                            status_code=400,
                            error_type="validation_error",
                        )
                elif isinstance(data["combo_codes"], list):
                    # Convert list to JSON string for storage
                    data["combo_codes"] = json.dumps(data["combo_codes"])
                else:
                    return APIResponse.error(
                        message="combo_codes must be an array or JSON string",
                        status_code=400,
                        error_type="validation_error",
                    )

            # Set defaults
            data.setdefault("is_active", True)
            data.setdefault("specialty", "ophthalmology")

            # Remove any fields that might interfere with auth.signature
            data.pop("id", None)
            data.pop("created_by", None)
            data.pop("created_on", None)
            data.pop("modified_by", None)
            data.pop("modified_on", None)

            logger.info(f"POST: Final data for insert: {data}")
            logger.info(f"POST: Auth user available: {auth.user is not None}")
            logger.info(f"POST: Auth user_id: {auth.user_id}")

            # Create new record (auth.signature will automatically set created_by)
            new_id = db.billing_combo.insert(**data)
            logger.info(f"POST: Inserted new combo with ID: {new_id}")

            # Return created record with datetime serialization
            new_record = db(db.billing_combo.id == new_id).select().first()
            logger.info(f"POST: Retrieved record: {new_record}")

            if new_record:
                raw_dict = new_record.as_dict()
                logger.info(f"POST: Raw record dict: {raw_dict}")
                logger.info(f"POST: created_by = {raw_dict.get('created_by')}")
                logger.info(
                    f"POST: created_on = {raw_dict.get('created_on')} (type: {type(raw_dict.get('created_on'))})"
                )

                serialized_dict = serialize_datetime_fields(raw_dict)
                logger.info(f"POST: Serialized dict: {serialized_dict}")

                return APIResponse.success(
                    data=serialized_dict,
                    message=f"Billing combo created successfully with ID: {new_id}",
                )
            else:
                logger.error(
                    f"POST: Could not retrieve created record with ID: {new_id}"
                )
                return APIResponse.error(
                    message="Created combo but could not retrieve it",
                    status_code=500,
                    error_type="server_error",
                )

    except Exception as e:
        logger.error(f"Error in billing_combo endpoint: {str(e)}")
        return APIResponse.error(
            message=str(e), status_code=500, error_type="server_error"
        )


@action("api/billing_combo/<combo_id:int>/apply", method=["POST"])
@action.uses(db, auth.user)  # Add authentication requirement
def apply_billing_combo(combo_id: int):
    """
    Apply a billing combo to a worklist item with enhanced secondary code support.

    Expected JSON:
    {
        "id_worklist": 123,
        "id_auth_user": 456,
        "note": "Applied standard consultation combo"
    }

    Enhanced Features:
    - Support for secondary codes in combo definitions
    - Enhanced fee calculations and logging
    - Backward compatibility with existing combo format

    Args:
        combo_id: The billing combo ID to apply

    Returns:
        JSON response with created billing codes and usage record
    """
    try:
        logger.info(f"Applying enhanced billing combo {combo_id}")

        data = request.json
        if not data:
            return APIResponse.error(
                message="Request body required",
                status_code=400,
                error_type="validation_error",
            )

        # Validate required fields
        required_fields = ["id_worklist", "id_auth_user"]
        missing_fields = [f for f in required_fields if f not in data]
        if missing_fields:
            return APIResponse.error(
                message=f"Missing required fields: {', '.join(missing_fields)}",
                status_code=400,
                error_type="validation_error",
            )

        # Get the combo
        combo = db(db.billing_combo.id == combo_id).select().first()
        if not combo:
            return APIResponse.error(
                message=f"Billing combo not found with ID: {combo_id}",
                status_code=404,
                error_type="not_found",
            )

        if not combo.is_active:
            return APIResponse.error(
                message="Cannot apply inactive billing combo",
                status_code=400,
                error_type="validation_error",
            )

        # Parse combo codes with enhanced structure support
        try:
            # Enhanced debugging: Log the full combo_codes content
            logger.info(
                f"🔍 DEBUG: Combo {combo_id} - Raw combo_codes type: {type(combo.combo_codes)}"
            )
            logger.info(
                f"🔍 DEBUG: Combo {combo_id} - Raw combo_codes length: {len(str(combo.combo_codes)) if combo.combo_codes else 0}"
            )
            logger.info(
                f"🔍 DEBUG: Combo {combo_id} - Raw combo_codes content: {repr(combo.combo_codes)}"
            )

            if not combo.combo_codes:
                logger.info(
                    f"🔍 DEBUG: Combo {combo_id} - Empty combo_codes, returning empty list"
                )
                combo_codes = []
            elif isinstance(combo.combo_codes, str):
                logger.info(
                    f"🔍 DEBUG: Combo {combo_id} - combo_codes is string, attempting JSON parsing"
                )
                # First try direct JSON parsing
                try:
                    combo_codes = json.loads(combo.combo_codes)
                    logger.info(
                        f"🔍 DEBUG: Combo {combo_id} - Successfully parsed as JSON"
                    )
                except json.JSONDecodeError as json_error:
                    # If JSON parsing fails, try handling Python-style format
                    logger.error(
                        f"🔍 DEBUG: Combo {combo_id} - JSON parsing failed: {str(json_error)}"
                    )
                    logger.error(
                        f"🔍 DEBUG: Combo {combo_id} - JSON error position: line {getattr(json_error, 'lineno', 'unknown')} column {getattr(json_error, 'colno', 'unknown')} char {getattr(json_error, 'pos', 'unknown')}"
                    )
                    logger.info(
                        f"🔍 DEBUG: Combo {combo_id} - Attempting Python literal evaluation"
                    )

                    # Try using ast.literal_eval for safe Python literal parsing
                    import ast

                    try:
                        logger.info(
                            f"🔍 DEBUG: Combo {combo_id} - Attempting ast.literal_eval for Python literal parsing"
                        )
                        # Clean up common issues before ast.literal_eval
                        cleaned_codes = combo.combo_codes
                        # Fix escaped quotes in strings that can break parsing
                        cleaned_codes = cleaned_codes.replace('\\"', '"')
                        logger.info(
                            f"🔍 DEBUG: Combo {combo_id} - Cleaned combo_codes: {repr(cleaned_codes)}"
                        )

                        combo_codes = ast.literal_eval(cleaned_codes)
                        logger.info(
                            f"🔍 DEBUG: Combo {combo_id} - Successfully parsed with ast.literal_eval"
                        )
                    except (ValueError, SyntaxError) as ast_error:
                        logger.error(
                            f"🔍 DEBUG: Combo {combo_id} - ast.literal_eval failed: {str(ast_error)}"
                        )
                        logger.info(
                            f"🔍 DEBUG: Combo {combo_id} - Falling back to string replacement method"
                        )

                        # Fallback: Replace Python literals with JSON equivalents
                        # First fix escaped quotes that can break JSON parsing
                        json_compatible = combo.combo_codes.replace('\\"', '"')

                        # Then replace Python literals with JSON equivalents
                        json_compatible = (
                            json_compatible.replace("None", "null")
                            .replace("True", "true")
                            .replace("False", "false")
                            .replace(
                                "'", '"'
                            )  # Replace single quotes with double quotes
                        )
                        logger.info(
                            f"🔍 DEBUG: Combo {combo_id} - After Python->JSON conversion: {repr(json_compatible)}"
                        )

                        try:
                            combo_codes = json.loads(json_compatible)
                            logger.info(
                                f"🔍 DEBUG: Combo {combo_id} - Successfully parsed after Python->JSON conversion"
                            )
                        except json.JSONDecodeError as converted_error:
                            logger.error(
                                f"🔍 DEBUG: Combo {combo_id} - Failed to parse even after conversion: {str(converted_error)}"
                            )
                            logger.error(
                                f"🔍 DEBUG: Combo {combo_id} - Converted JSON error position: line {getattr(converted_error, 'lineno', 'unknown')} column {getattr(converted_error, 'colno', 'unknown')} char {getattr(converted_error, 'pos', 'unknown')}"
                            )

                            # Show content around the error position for debugging
                            if hasattr(converted_error, "pos") and converted_error.pos:
                                error_pos = converted_error.pos
                                start_pos = max(0, error_pos - 50)
                                end_pos = min(len(json_compatible), error_pos + 50)
                                context = json_compatible[start_pos:end_pos]
                                logger.error(
                                    f"🔍 DEBUG: Combo {combo_id} - Content around error position {error_pos}: {repr(context)}"
                                )

                            raise converted_error
            else:
                # Already parsed (list/dict)
                logger.info(
                    f"🔍 DEBUG: Combo {combo_id} - combo_codes already parsed as {type(combo.combo_codes)}"
                )
                combo_codes = combo.combo_codes

            logger.info(
                f"🔍 DEBUG: Combo {combo_id} - Final parsed combo_codes type: {type(combo_codes)}, length: {len(combo_codes) if combo_codes else 0}"
            )

        except Exception as e:
            logger.error(
                f"🚨 ERROR: Parsing combo_codes for combo {combo_id}: {str(e)}"
            )
            logger.error(
                f"🚨 ERROR: combo_codes full content: {repr(combo.combo_codes)}"
            )
            logger.error(
                f"🚨 ERROR: combo_codes length: {len(str(combo.combo_codes)) if combo.combo_codes else 0}"
            )

            # Additional error context
            import traceback

            logger.error(f"🚨 ERROR: Full traceback: {traceback.format_exc()}")

            return APIResponse.error(
                message=f"Invalid combo_codes format in billing combo: {str(e)}",
                status_code=500,
                error_type="server_error",
            )

        if not combo_codes:
            return APIResponse.error(
                message="Billing combo has no codes defined",
                status_code=400,
                error_type="validation_error",
            )

        created_codes = []
        nomenclature = NomenclatureClient()
        total_main_fees = 0
        total_secondary_fees = 0
        codes_with_secondary = 0

        # Enhanced combo code processing - supports both old and new formats
        for code_def in combo_codes:
            # Handle both old format (integer) and new format (object with secondary support)
            if isinstance(code_def, int):
                # Old format: simple integer code
                nomen_code = code_def
                secondary_code = None
                logger.info(f"Processing legacy combo code: {nomen_code}")
            elif isinstance(code_def, dict):
                # New format: object with potential secondary codes
                nomen_code = code_def.get("nomen_code")
                secondary_code = code_def.get("secondary_nomen_code")
                logger.info(
                    f"Processing enhanced combo code: {nomen_code} + secondary: {secondary_code}"
                )
            else:
                logger.warning(f"Skipping invalid combo code definition: {code_def}")
                continue

            if not nomen_code:
                logger.warning(
                    f"Skipping combo code with missing nomen_code: {code_def}"
                )
                continue

            # Build base code data
            code_data = {
                "id_auth_user": data["id_auth_user"],
                "id_worklist": data["id_worklist"],
                "nomen_code": nomen_code,
                "quantity": 1,
                "laterality": "both",
                "status": "draft",
                "date_performed": datetime.date.today(),
            }

            # Try to get main nomenclature details
            try:
                code_details = nomenclature.get_code_details(nomen_code)

                # Always prioritize combo-stored descriptions if available
                if isinstance(code_def, dict):
                    # Use descriptions from combo definition if available
                    if code_def.get("nomen_desc_fr"):
                        code_data["nomen_desc_fr"] = code_def.get("nomen_desc_fr")
                        logger.info(
                            f"Using combo-stored description for code {nomen_code}"
                        )
                    elif code_details and code_details.get("description_fr"):
                        code_data["nomen_desc_fr"] = code_details.get("description_fr")
                        logger.info(f"Using API description for code {nomen_code}")

                    if code_def.get("nomen_desc_nl"):
                        code_data["nomen_desc_nl"] = code_def.get("nomen_desc_nl")
                    elif code_details and code_details.get("description_nl"):
                        code_data["nomen_desc_nl"] = code_details.get("description_nl")

                    # Handle feecode - prefer combo definition
                    if code_def.get("feecode"):
                        feecode_value = code_def.get("feecode")
                        # Only use feecode if it's a valid value (not N/A)
                        if feecode_value and str(feecode_value).strip() not in (
                            "N/A",
                            "null",
                            "None",
                            "",
                        ):
                            code_data["feecode"] = feecode_value
                    elif code_details and code_details.get("feecode"):
                        code_data["feecode"] = code_details.get("feecode")

                    # Handle fee - prefer combo definition
                    if code_def.get("fee") is not None:
                        custom_fee = code_def.get("fee")
                        code_data["fee"] = custom_fee
                        total_main_fees += float(custom_fee or 0)
                        logger.info(
                            f"Using combo-defined fee €{custom_fee} for code {nomen_code}"
                        )
                    elif code_details and code_details.get("fee"):
                        standard_fee = code_details.get("fee")
                        code_data["fee"] = standard_fee
                        total_main_fees += float(standard_fee or 0)
                        logger.info(
                            f"Using API fee €{standard_fee} for code {nomen_code}"
                        )
                else:
                    # No combo definition - use API data if available
                    if code_details:
                        code_data["nomen_desc_fr"] = code_details.get("description_fr")
                        code_data["nomen_desc_nl"] = code_details.get("description_nl")
                        code_data["feecode"] = code_details.get("feecode")
                        code_data["fee"] = code_details.get("fee")
                        total_main_fees += float(code_details.get("fee") or 0)
                        logger.info(f"Using API data for code {nomen_code}")
                    else:
                        logger.warning(f"No data available for code {nomen_code}")
            except Exception as e:
                logger.warning(
                    f"Could not fetch details for main code {nomen_code}: {str(e)}"
                )
                # Use combo definition data as fallback
                if isinstance(code_def, dict):
                    logger.info(
                        f"Using combo definition data as fallback for code {nomen_code}"
                    )
                    if code_def.get("nomen_desc_fr"):
                        code_data["nomen_desc_fr"] = code_def.get("nomen_desc_fr")
                    if code_def.get("nomen_desc_nl"):
                        code_data["nomen_desc_nl"] = code_def.get("nomen_desc_nl")
                    if code_def.get("feecode"):
                        feecode_value = code_def.get("feecode")
                        # Only use feecode if it's a valid value (not N/A)
                        if feecode_value and str(feecode_value).strip() not in (
                            "N/A",
                            "null",
                            "None",
                            "",
                        ):
                            code_data["feecode"] = feecode_value
                    if code_def.get("fee") is not None:
                        fee_value = code_def.get("fee")
                        code_data["fee"] = fee_value
                        total_main_fees += float(fee_value or 0)

            # Handle secondary code if present
            if secondary_code:
                try:
                    secondary_details = nomenclature.get_code_details(secondary_code)
                    code_data["secondary_nomen_code"] = secondary_code

                    # Always prioritize combo-stored secondary descriptions if available
                    if isinstance(code_def, dict):
                        # Use descriptions from combo definition if available
                        if code_def.get("secondary_nomen_desc_fr"):
                            code_data["secondary_nomen_desc_fr"] = code_def.get(
                                "secondary_nomen_desc_fr"
                            )
                            logger.info(
                                f"Using combo-stored secondary description for code {secondary_code}"
                            )
                        elif secondary_details and secondary_details.get(
                            "description_fr"
                        ):
                            code_data["secondary_nomen_desc_fr"] = (
                                secondary_details.get("description_fr")
                            )
                            logger.info(
                                f"Using API secondary description for code {secondary_code}"
                            )

                        if code_def.get("secondary_nomen_desc_nl"):
                            code_data["secondary_nomen_desc_nl"] = code_def.get(
                                "secondary_nomen_desc_nl"
                            )
                        elif secondary_details and secondary_details.get(
                            "description_nl"
                        ):
                            code_data["secondary_nomen_desc_nl"] = (
                                secondary_details.get("description_nl")
                            )

                        # Handle secondary feecode - prefer combo definition
                        if code_def.get("secondary_feecode"):
                            secondary_feecode_value = code_def.get("secondary_feecode")
                            # Only use secondary feecode if it's a valid value (not N/A)
                            if secondary_feecode_value and str(
                                secondary_feecode_value
                            ).strip() not in ("N/A", "null", "None", ""):
                                code_data["secondary_feecode"] = secondary_feecode_value
                        elif secondary_details and secondary_details.get("feecode"):
                            code_data["secondary_feecode"] = secondary_details.get(
                                "feecode"
                            )

                        # Handle secondary fee - prefer combo definition
                        if code_def.get("secondary_fee") is not None:
                            secondary_fee_value = code_def.get("secondary_fee")
                            code_data["secondary_fee"] = secondary_fee_value
                            total_secondary_fees += float(secondary_fee_value or 0)
                            logger.info(
                                f"Using combo-defined secondary fee €{secondary_fee_value} for code {secondary_code}"
                            )
                        elif secondary_details and secondary_details.get("fee"):
                            standard_secondary_fee = secondary_details.get("fee")
                            code_data["secondary_fee"] = standard_secondary_fee
                            total_secondary_fees += float(standard_secondary_fee or 0)
                            logger.info(
                                f"Using API secondary fee €{standard_secondary_fee} for code {secondary_code}"
                            )
                    else:
                        # No combo definition - use API data if available
                        if secondary_details:
                            code_data["secondary_nomen_desc_fr"] = (
                                secondary_details.get("description_fr")
                            )
                            code_data["secondary_nomen_desc_nl"] = (
                                secondary_details.get("description_nl")
                            )
                            code_data["secondary_feecode"] = secondary_details.get(
                                "feecode"
                            )
                            code_data["secondary_fee"] = secondary_details.get("fee")
                            total_secondary_fees += float(
                                secondary_details.get("fee") or 0
                            )
                            logger.info(
                                f"Using API secondary data for code {secondary_code}"
                            )
                        else:
                            logger.warning(
                                f"No secondary data available for code {secondary_code}"
                            )

                    codes_with_secondary += 1
                except Exception as e:
                    logger.warning(
                        f"Could not fetch details for secondary code {secondary_code}: {str(e)}"
                    )
                    # Use combo definition data as fallback
                    if isinstance(code_def, dict):
                        logger.info(
                            f"Using combo definition data as fallback for secondary code {secondary_code}"
                        )
                        code_data["secondary_nomen_code"] = secondary_code
                        if code_def.get("secondary_nomen_desc_fr"):
                            code_data["secondary_nomen_desc_fr"] = code_def.get(
                                "secondary_nomen_desc_fr"
                            )
                        if code_def.get("secondary_nomen_desc_nl"):
                            code_data["secondary_nomen_desc_nl"] = code_def.get(
                                "secondary_nomen_desc_nl"
                            )
                        if code_def.get("secondary_feecode"):
                            secondary_feecode_value = code_def.get("secondary_feecode")
                            # Only use secondary feecode if it's a valid value (not N/A)
                            if secondary_feecode_value and str(
                                secondary_feecode_value
                            ).strip() not in ("N/A", "null", "None", ""):
                                code_data["secondary_feecode"] = secondary_feecode_value
                        if code_def.get("secondary_fee") is not None:
                            secondary_fee_value = code_def.get("secondary_fee")
                            code_data["secondary_fee"] = secondary_fee_value
                            total_secondary_fees += float(secondary_fee_value or 0)
                        codes_with_secondary += 1

            # Create billing code
            code_id = db.billing_codes.insert(**code_data)
            created_code = db(db.billing_codes.id == code_id).select().first()
            enhanced_code = created_code.as_dict()
            enhance_billing_response(enhanced_code)
            created_codes.append(enhanced_code)

        # Create combo usage record
        usage_id = db.billing_combo_usage.insert(
            id_auth_user=data["id_auth_user"],
            id_worklist=data["id_worklist"],
            id_billing_combo=combo_id,
            applied_date=datetime.datetime.now(),
            note=data.get("note", ""),
        )

        total_combined_fees = total_main_fees + total_secondary_fees

        logger.info(
            f"Applied enhanced combo {combo_id}: created {len(created_codes)} billing codes, "
            f"{codes_with_secondary} with secondary codes, "
            f"total fees: €{total_combined_fees:.2f} (main: €{total_main_fees:.2f}, secondary: €{total_secondary_fees:.2f})"
        )

        return APIResponse.success(
            data={
                "combo_usage_id": usage_id,
                "created_codes": created_codes,
                "combo_name": combo.combo_name,
                "codes_with_secondary": codes_with_secondary,
                "total_main_fees": round(total_main_fees, 2),
                "total_secondary_fees": round(total_secondary_fees, 2),
                "total_combined_fees": round(total_combined_fees, 2),
            },
            message=f"Successfully applied combo '{combo.combo_name}' with {len(created_codes)} codes (total: €{total_combined_fees:.2f})",
        )

    except Exception as e:
        logger.error(f"Error applying enhanced billing combo: {str(e)}")
        return APIResponse.error(
            message=str(e), status_code=500, error_type="server_error"
        )


@action("api/billing_combo/<combo_id:int>/export", method=["GET"])
@action.uses(db, auth.user)
def export_billing_combo(combo_id: int):
    """
    Export a billing combo in JSON format with complete fee information.

    This endpoint generates a portable export file containing the complete
    combo data including nomenclature codes, descriptions, and fees as they
    are stored in the combo.

    Args:
        combo_id (int): The billing combo ID to export

    Returns:
        JSON response with exported combo data including fees:
        {
            "export_info": {
                "version": "1.1",
                "exported_at": "2025-01-09T10:30:00Z",
                "exported_by": "user@email.com"
            },
            "combo_data": {
                "combo_name": "Standard Consultation",
                "combo_description": "Description...",
                "specialty": "ophthalmology",
                "combo_codes": [
                    {
                        "nomen_code": 105755,
                        "nomen_desc_fr": "Description in French",
                        "feecode": 123,
                        "fee": "45.50",
                        "secondary_nomen_code": 102030,
                        "secondary_nomen_desc_fr": "Secondary description",
                        "secondary_feecode": 456,
                        "secondary_fee": "12.30"
                    }
                ]
            }
        }

    Raises:
        404: If combo not found
        500: If export fails
        403: If user not authorized
    """
    try:
        user = auth.get_user()
        logger.info(
            f"Exporting billing combo {combo_id} for user {user.get('email', 'unknown')}"
        )

        # Get the combo record
        combo = (
            db((db.billing_combo.id == combo_id) & (db.billing_combo.is_active == True))
            .select()
            .first()
        )

        if not combo:
            return APIResponse.error(
                message=f"Billing combo not found with ID: {combo_id}",
                status_code=404,
                error_type="not_found",
            )

        # Parse existing combo codes with enhanced parsing logic
        stored_codes = []
        if combo.combo_codes:
            try:
                # Try JSON parsing first
                stored_codes = json.loads(combo.combo_codes)
                logger.debug(
                    f"Successfully parsed combo_codes as JSON for combo {combo_id}"
                )
            except json.JSONDecodeError:
                logger.info(
                    f"JSON parsing failed for combo {combo_id}, attempting Python format parsing"
                )
                try:
                    # Handle Python format: replace Python literals with JSON equivalents
                    python_str = combo.combo_codes
                    # Replace Python None with JSON null
                    json_str = python_str.replace("None", "null")
                    # Replace Python single quotes with double quotes for JSON
                    json_str = json_str.replace("'", '"')
                    # Parse as JSON
                    stored_codes = json.loads(json_str)
                    logger.info(
                        f"Successfully parsed combo_codes as Python format for combo {combo_id}"
                    )
                except (json.JSONDecodeError, Exception) as e:
                    logger.warning(
                        f"Failed to parse combo_codes for combo {combo_id}: {str(e)}"
                    )
                    stored_codes = []

        if not stored_codes:
            return APIResponse.error(
                message="Combo has no codes to export",
                status_code=400,
                error_type="validation_error",
            )

        # Extract complete combo codes including fee information (v1.1 format)
        complete_codes = []
        for code_entry in stored_codes:
            if isinstance(code_entry, dict):
                # New format with complete data including fees
                complete_code = {}

                # Required fields
                if code_entry.get("nomen_code"):
                    complete_code["nomen_code"] = code_entry.get("nomen_code")
                else:
                    logger.warning(
                        f"Skipping code entry without nomen_code in combo {combo_id}: {code_entry}"
                    )
                    continue

                # Optional descriptive and fee fields
                if code_entry.get("nomen_desc_fr"):
                    complete_code["nomen_desc_fr"] = code_entry.get("nomen_desc_fr")
                if code_entry.get("nomen_desc_nl"):
                    complete_code["nomen_desc_nl"] = code_entry.get("nomen_desc_nl")

                # Only include feecode if it's a valid value (not N/A)
                feecode = code_entry.get("feecode")
                if feecode and str(feecode).strip() not in ("N/A", "null", "None", ""):
                    complete_code["feecode"] = feecode

                # Only include fee if it's a valid value (not N/A)
                fee = code_entry.get("fee")
                if fee and str(fee).strip() not in ("N/A", "null", "None", ""):
                    complete_code["fee"] = str(fee)  # Ensure string format

                # Secondary code fields
                if code_entry.get("secondary_nomen_code"):
                    complete_code["secondary_nomen_code"] = code_entry.get(
                        "secondary_nomen_code"
                    )
                    if code_entry.get("secondary_nomen_desc_fr"):
                        complete_code["secondary_nomen_desc_fr"] = code_entry.get(
                            "secondary_nomen_desc_fr"
                        )
                    if code_entry.get("secondary_nomen_desc_nl"):
                        complete_code["secondary_nomen_desc_nl"] = code_entry.get(
                            "secondary_nomen_desc_nl"
                        )

                    # Only include secondary feecode if it's a valid value (not N/A)
                    secondary_feecode = code_entry.get("secondary_feecode")
                    if secondary_feecode and str(secondary_feecode).strip() not in (
                        "N/A",
                        "null",
                        "None",
                        "",
                    ):
                        complete_code["secondary_feecode"] = secondary_feecode

                    # Only include secondary fee if it's a valid value (not N/A)
                    secondary_fee = code_entry.get("secondary_fee")
                    if secondary_fee and str(secondary_fee).strip() not in (
                        "N/A",
                        "null",
                        "None",
                        "",
                    ):
                        complete_code["secondary_fee"] = str(
                            secondary_fee
                        )  # Ensure string format

                complete_codes.append(complete_code)

            elif isinstance(code_entry, int):
                # Legacy format - simple integer code (need to fetch fee data for backward compatibility)
                logger.info(
                    f"Converting legacy integer code {code_entry} to complete format"
                )
                try:
                    nomenclature = NomenclatureClient()
                    code_details = nomenclature.get_code_details(code_entry)
                    if code_details:
                        complete_code = {
                            "nomen_code": code_entry,
                            "nomen_desc_fr": code_details.get("description_fr", ""),
                            "feecode": code_details.get("feecode"),
                            "fee": str(code_details.get("fee", "0.00")),
                        }
                        if code_details.get("description_nl"):
                            complete_code["nomen_desc_nl"] = code_details.get(
                                "description_nl"
                            )
                        complete_codes.append(complete_code)
                    else:
                        # If can't fetch details, include just the code
                        complete_codes.append({"nomen_code": code_entry})
                except Exception as e:
                    logger.warning(
                        f"Could not fetch details for legacy code {code_entry}: {str(e)}"
                    )
                    complete_codes.append({"nomen_code": code_entry})
            else:
                logger.warning(
                    f"Skipping invalid code entry in combo {combo_id}: {code_entry}"
                )

        if not complete_codes:
            return APIResponse.error(
                message="No valid nomenclature codes found in combo",
                status_code=400,
                error_type="validation_error",
            )

        # Build export data structure
        export_data = {
            "export_info": {
                "version": "1.1",
                "exported_at": datetime.datetime.now().isoformat() + "Z",
                "exported_by": user.get("email", "unknown"),
            },
            "combo_data": {
                "combo_name": combo.combo_name,
                "combo_description": combo.combo_description or "",
                "specialty": combo.specialty,
                "combo_codes": complete_codes,
            },
        }

        # Generate filename
        safe_name = "".join(
            c for c in combo.combo_name if c.isalnum() or c in (" ", "-", "_")
        ).strip()
        safe_name = safe_name.replace(" ", "_")[:30]  # Limit length
        date_str = datetime.datetime.now().strftime("%Y%m%d")
        filename = f"billing_combo_{safe_name}_{date_str}.json"

        logger.info(
            f"Successfully exported combo '{combo.combo_name}' with {len(complete_codes)} codes"
        )

        return APIResponse.success(
            data=export_data,
            meta={
                "filename": filename,
                "combo_id": combo_id,
                "combo_name": combo.combo_name,
                "codes_count": len(complete_codes),
                "export_type": "complete_with_fees",
            },
            message=f"Successfully exported combo '{combo.combo_name}' with {len(complete_codes)} codes",
        )

    except Exception as e:
        logger.error(f"Error exporting billing combo {combo_id}: {str(e)}")
        logger.error(traceback.format_exc())
        return APIResponse.error(
            message=f"Failed to export combo: {str(e)}",
            status_code=500,
            error_type="export_error",
        )


@action("api/billing_combo/export_multiple", method=["POST"])
@action.uses(db, auth.user)
def export_multiple_billing_combos():
    """
    Export multiple billing combos in batch as a single JSON file with complete fee information.

    This endpoint accepts an array of combo IDs and generates a multi-combo
    export file containing the complete combo data including nomenclature codes,
    descriptions, and fees as they are stored in the combos.

    Request Body:
        {
            "combo_ids": [1, 2, 3, ...]
        }

    Returns:
        JSON response with exported combos data in multi-combo format:
        {
            "export_info": {
                "version": "1.1",
                "export_type": "multi_combo",
                "exported_at": "2025-01-09T10:30:00Z",
                "exported_by": "user@email.com",
                "combo_count": 3
            },
            "combos": [
                {
                    "combo_name": "Standard Consultation",
                    "combo_description": "Description...",
                    "specialty": "ophthalmology",
                    "combo_codes": [
                        {
                            "nomen_code": 105755,
                            "nomen_desc_fr": "Description in French",
                            "feecode": 123,
                            "fee": "45.50",
                            "secondary_nomen_code": 102030,
                            "secondary_nomen_desc_fr": "Secondary description",
                            "secondary_feecode": 456,
                            "secondary_fee": "12.30"
                        }
                    ]
                },
                ...
            ]
        }

    Raises:
        400: If no combo IDs provided or invalid format
        404: If some combos not found (partial failure)
        500: If export fails
        403: If user not authorized
    """
    try:
        user = auth.get_user()

        if not request.json or "combo_ids" not in request.json:
            return APIResponse.error(
                message="Request must contain 'combo_ids' array",
                status_code=400,
                error_type="validation_error",
            )

        combo_ids = request.json["combo_ids"]

        if not isinstance(combo_ids, list) or not combo_ids:
            return APIResponse.error(
                message="combo_ids must be a non-empty array",
                status_code=400,
                error_type="validation_error",
            )

        # Convert all IDs to integers and validate
        try:
            combo_ids = [int(id) for id in combo_ids]
        except (ValueError, TypeError):
            return APIResponse.error(
                message="All combo_ids must be valid integers",
                status_code=400,
                error_type="validation_error",
            )

        logger.info(
            f"Exporting multiple billing combos {combo_ids} for user {user.get('email', 'unknown')}"
        )
        logger.debug(f"Received combo_ids: {combo_ids} (type: {type(combo_ids)})")

        # Fetch all combos in one query
        combos = (
            db(
                (db.billing_combo.id.belongs(combo_ids))
                & (db.billing_combo.is_active == True)
            )
            .select()
            .as_list()
        )

        if not combos:
            return APIResponse.error(
                message="No valid combos found with the provided IDs",
                status_code=404,
                error_type="not_found",
            )

        logger.debug(
            f"Found {len(combos)} combos in database: {[c['id'] for c in combos]}"
        )

        # Track which combos were found vs requested
        found_ids = {combo["id"] for combo in combos}
        missing_ids = set(combo_ids) - found_ids

        if missing_ids:
            logger.warning(f"Some combos not found: {missing_ids}")

        exported_combos = []
        total_codes = 0

        for combo in combos:
            # Parse combo codes with enhanced parsing logic (same as single export)
            stored_codes = []
            logger.debug(
                f"Processing combo {combo['id']} ({combo['combo_name']}) with combo_codes: {combo['combo_codes'][:200]}..."
            )
            if combo["combo_codes"]:
                try:
                    # Try JSON parsing first
                    stored_codes = json.loads(combo["combo_codes"])
                    logger.debug(
                        f"Successfully parsed combo_codes as JSON for combo {combo['id']}"
                    )
                except json.JSONDecodeError as e:
                    logger.info(
                        f"JSON parsing failed for combo {combo['id']}: {str(e)}, attempting Python literal parsing"
                    )
                    try:
                        # Use ast.literal_eval for safe Python literal parsing
                        # This is much more robust than string replacement
                        stored_codes = ast.literal_eval(combo["combo_codes"])
                        logger.info(
                            f"Successfully parsed combo_codes as Python literal for combo {combo['id']}"
                        )
                    except (ValueError, SyntaxError, Exception) as e:
                        logger.error(
                            f"Failed to parse combo_codes for combo {combo['id']} ({combo['combo_name']}): {str(e)}"
                        )
                        logger.error(
                            f"Raw combo_codes that failed to parse: {combo['combo_codes']}"
                        )
                        stored_codes = []

            # Extract complete combo codes including fee information (v1.1 format)
            complete_codes = []
            logger.debug(
                f"Combo {combo['id']}: stored_codes type: {type(stored_codes)}, length: {len(stored_codes) if stored_codes else 0}"
            )
            for code_entry in stored_codes:
                if isinstance(code_entry, dict):
                    # New format with complete data including fees
                    nomen_code = code_entry.get("nomen_code")
                    logger.debug(
                        f"Combo {combo['id']}: processing code_entry {nomen_code}, type: {type(nomen_code)}"
                    )

                    if nomen_code is not None:
                        complete_code = {"nomen_code": nomen_code}

                        # Optional descriptive and fee fields
                        if code_entry.get("nomen_desc_fr"):
                            complete_code["nomen_desc_fr"] = code_entry.get(
                                "nomen_desc_fr"
                            )
                        if code_entry.get("nomen_desc_nl"):
                            complete_code["nomen_desc_nl"] = code_entry.get(
                                "nomen_desc_nl"
                            )

                        # Only include feecode if it's a valid value (not N/A)
                        feecode = code_entry.get("feecode")
                        if feecode and str(feecode).strip() not in (
                            "N/A",
                            "null",
                            "None",
                            "",
                        ):
                            complete_code["feecode"] = feecode

                        # Only include fee if it's a valid value (not N/A)
                        fee = code_entry.get("fee")
                        if fee and str(fee).strip() not in ("N/A", "null", "None", ""):
                            complete_code["fee"] = str(fee)

                        # Secondary code fields
                        secondary_code = code_entry.get("secondary_nomen_code")
                        if secondary_code is not None and str(
                            secondary_code
                        ).strip() not in ("", "None", "null"):
                            # Convert string secondary codes to integers if needed
                            try:
                                if isinstance(secondary_code, str):
                                    secondary_code = int(secondary_code)
                                complete_code["secondary_nomen_code"] = secondary_code

                                # Include secondary descriptive and fee fields
                                if code_entry.get("secondary_nomen_desc_fr"):
                                    complete_code["secondary_nomen_desc_fr"] = (
                                        code_entry.get("secondary_nomen_desc_fr")
                                    )
                                if code_entry.get("secondary_nomen_desc_nl"):
                                    complete_code["secondary_nomen_desc_nl"] = (
                                        code_entry.get("secondary_nomen_desc_nl")
                                    )

                                # Only include secondary feecode if it's a valid value (not N/A)
                                secondary_feecode = code_entry.get("secondary_feecode")
                                if secondary_feecode and str(
                                    secondary_feecode
                                ).strip() not in ("N/A", "null", "None", ""):
                                    complete_code["secondary_feecode"] = (
                                        secondary_feecode
                                    )

                                # Only include secondary fee if it's a valid value (not N/A)
                                secondary_fee = code_entry.get("secondary_fee")
                                if secondary_fee and str(secondary_fee).strip() not in (
                                    "N/A",
                                    "null",
                                    "None",
                                    "",
                                ):
                                    complete_code["secondary_fee"] = str(secondary_fee)

                                logger.debug(
                                    f"Combo {combo['id']}: added secondary code {secondary_code}"
                                )
                            except (ValueError, TypeError):
                                logger.warning(
                                    f"Combo {combo['id']}: invalid secondary code '{secondary_code}', skipping"
                                )

                        complete_codes.append(complete_code)
                        logger.debug(
                            f"Combo {combo['id']}: added complete_code: {complete_code}"
                        )
                    else:
                        logger.warning(
                            f"Combo {combo['id']}: code_entry missing nomen_code: {code_entry}"
                        )

                elif isinstance(code_entry, int):
                    # Legacy format - simple integer code (need to fetch fee data for backward compatibility)
                    logger.info(
                        f"Combo {combo['id']}: converting legacy integer code {code_entry} to complete format"
                    )
                    try:
                        nomenclature = NomenclatureClient()
                        code_details = nomenclature.get_code_details(code_entry)
                        if code_details:
                            complete_code = {
                                "nomen_code": code_entry,
                                "nomen_desc_fr": code_details.get("description_fr", ""),
                                "feecode": code_details.get("feecode"),
                                "fee": str(code_details.get("fee", "0.00")),
                            }
                            if code_details.get("description_nl"):
                                complete_code["nomen_desc_nl"] = code_details.get(
                                    "description_nl"
                                )
                            complete_codes.append(complete_code)
                        else:
                            # If can't fetch details, include just the code
                            complete_codes.append({"nomen_code": code_entry})
                    except Exception as e:
                        logger.warning(
                            f"Combo {combo['id']}: could not fetch details for legacy code {code_entry}: {str(e)}"
                        )
                        complete_codes.append({"nomen_code": code_entry})

                    logger.debug(
                        f"Combo {combo['id']}: added legacy integer code: {code_entry}"
                    )
                else:
                    logger.warning(
                        f"Combo {combo['id']}: skipping invalid code entry type {type(code_entry)}: {code_entry}"
                    )

            logger.debug(
                f"Combo {combo['id']}: final complete_codes count: {len(complete_codes)}"
            )
            if complete_codes:
                exported_combos.append(
                    {
                        "combo_name": combo["combo_name"],
                        "combo_description": combo["combo_description"] or "",
                        "specialty": combo["specialty"],
                        "combo_codes": complete_codes,
                    }
                )
                total_codes += len(complete_codes)
                logger.debug(
                    f"Combo {combo['id']} ({combo['combo_name']}) exported with {len(complete_codes)} codes"
                )
            else:
                logger.warning(
                    f"Combo {combo['id']} ({combo['combo_name']}) has no valid codes, skipping - combo_codes: {combo['combo_codes']}"
                )

        if not exported_combos:
            return APIResponse.error(
                message="No combos with valid codes found",
                status_code=400,
                error_type="validation_error",
            )

        # Build multi-combo export data structure
        export_data = {
            "export_info": {
                "version": "1.1",
                "export_type": "multi_combo",
                "exported_at": datetime.datetime.now().isoformat() + "Z",
                "exported_by": user.get("email", "unknown"),
                "combo_count": len(exported_combos),
            },
            "combos": exported_combos,
        }

        # Generate filename for multi-combo export
        date_str = datetime.datetime.now().strftime("%Y%m%d")
        filename = f"billing_combos_multi_{len(exported_combos)}_{date_str}.json"

        # Prepare response metadata
        meta = {
            "filename": filename,
            "total_combos_exported": len(exported_combos),
            "total_codes": total_codes,
            "requested_count": len(combo_ids),
            "export_type": "multi_combo",
        }

        # Add warning about missing combos if any
        if missing_ids:
            meta["missing_combo_ids"] = list(missing_ids)
            meta["missing_count"] = len(missing_ids)

        logger.info(
            f"Successfully exported {len(exported_combos)} combos with {total_codes} total codes"
        )

        success_message = f"Successfully exported {len(exported_combos)} combos with {total_codes} total codes"
        if missing_ids:
            success_message += f" (Warning: {len(missing_ids)} combos not found)"

        return APIResponse.success(data=export_data, meta=meta, message=success_message)

    except Exception as e:
        logger.error(f"Error exporting multiple billing combos: {str(e)}")
        logger.error(traceback.format_exc())
        return APIResponse.error(
            message=f"Failed to export combos: {str(e)}",
            status_code=500,
            error_type="export_error",
        )


# =============================================================================
# Billing Combo Usage Endpoints
# =============================================================================


@action("api/billing_combo_usage", method=["GET", "POST"])
@action("api/billing_combo_usage/<rec_id:int>", method=["GET", "PUT", "DELETE"])
@action.uses(db, auth.user)  # Add authentication requirement
def billing_combo_usage(rec_id: Optional[int] = None):
    """
    CRUD operations for billing combo usage records.

    GET /api/billing_combo_usage - List all usage records with optional filters
    GET /api/billing_combo_usage/123 - Get specific usage record
    POST /api/billing_combo_usage - Create new usage record
    PUT /api/billing_combo_usage/123 - Update usage record
    DELETE /api/billing_combo_usage/123 - Delete usage record

    Query parameters for GET:
    - id_worklist.eq=123: Filter by worklist ID
    - id_auth_user.eq=456: Filter by user ID
    - id_billing_combo.eq=789: Filter by combo ID

    Returns:
        JSON response with combo usage data
    """
    try:
        logger.info(
            f"Billing combo usage request - Method: {request.method}, ID: {rec_id}"
        )
        return handle_rest_api_request(
            "billing_combo_usage", str(rec_id) if rec_id else None
        )

    except Exception as e:
        logger.error(f"Error in billing_combo_usage endpoint: {str(e)}")
        return APIResponse.error(
            message=str(e), status_code=500, error_type="server_error"
        )


# =============================================================================
# Nomenclature Search Endpoints
# =============================================================================


@action("api/nomenclature/search", method=["GET"])
def nomenclature_search():
    """
    Search nomenclature codes via external API.

    Query parameters:
    - code: Search by code prefix (minimum 3 digits)
    - description: Search by description (French/Dutch)
    - feecode: Filter by fee code
    - limit: Number of results to return (default: 20, max: 100)
    - offset: Pagination offset (default: 0)

    Returns:
        JSON response with nomenclature search results
    """
    try:
        # Get search parameters
        code = request.query.get("code", "").strip()
        description = request.query.get("description", "").strip()
        feecode = request.query.get("feecode", "").strip()
        limit = min(int(request.query.get("limit", 20)), 100)
        offset = int(request.query.get("offset", 0))

        # Validate input
        if not code and not description:
            return APIResponse.error(
                message="Either 'code' or 'description' parameter is required",
                status_code=400,
                error_type="validation_error",
            )

        if code and len(code) < 3:
            return APIResponse.error(
                message="Code parameter must be at least 3 characters",
                status_code=400,
                error_type="validation_error",
            )

        # Search via nomenclature client
        nomenclature = NomenclatureClient()
        results = nomenclature.search(
            code_prefix=code if code else None,
            description=description if description else None,
            feecode=int(feecode) if feecode.isdigit() else None,
            limit=limit,
            offset=offset,
        )

        return APIResponse.success(
            data=results.get("items", []),
            meta={
                "total": results.get("total", 0),
                "limit": limit,
                "offset": offset,
                "has_more": results.get("has_more", False),
            },
        )

    except Exception as e:
        logger.error(f"Error in nomenclature search: {str(e)}")
        return APIResponse.error(
            message=str(e), status_code=500, error_type="server_error"
        )


@action("api/nomenclature/code/<nomen_code:int>", method=["GET"])
def nomenclature_code_details(nomen_code: int):
    """
    Get detailed information for a specific nomenclature code.

    Args:
        nomen_code: The nomenclature code to lookup

    Returns:
        JSON response with code details
    """
    try:
        logger.info(f"Getting details for nomenclature code {nomen_code}")

        nomenclature = NomenclatureClient()
        details = nomenclature.get_code_details(nomen_code)

        if not details:
            return APIResponse.error(
                message=f"Nomenclature code {nomen_code} not found",
                status_code=404,
                error_type="not_found",
            )

        return APIResponse.success(data=details)

    except Exception as e:
        logger.error(f"Error getting nomenclature code details: {str(e)}")
        return APIResponse.error(
            message=str(e), status_code=500, error_type="server_error"
        )


# =============================================================================
# Billing Combo Import Endpoints
# =============================================================================


def detect_import_format(json_data: Dict) -> Dict[str, str]:
    """
    Auto-detect the import format and version from JSON structure.

    Args:
        json_data (Dict): The parsed JSON data

    Returns:
        Dict[str, str]: {"format": "single"|"multi", "version": "1.0"|"1.1"}

    Raises:
        ValueError: If format cannot be determined
    """
    # Determine format type
    if "combo_data" in json_data:
        format_type = "single"
    elif "combos" in json_data:
        format_type = "multi"
    else:
        raise ValueError("Invalid import format: missing 'combo_data' or 'combos' key")

    # Determine version from export_info
    version = "1.0"  # Default to v1.0 for backward compatibility
    if "export_info" in json_data and "version" in json_data["export_info"]:
        version = json_data["export_info"]["version"]

    # Validate version
    if version not in ["1.0", "1.1"]:
        # Unknown version - assume latest format
        version = "1.1"

    return {"format": format_type, "version": version}


def generate_unique_combo_name(
    base_name: str, existing_names: Optional[set] = None
) -> str:
    """
    Generate a unique combo name by appending '(copy)' if conflicts exist.

    Args:
        base_name (str): The original combo name
        existing_names (set): Set of names to check against (for batch imports)

    Returns:
        str: Unique combo name
    """
    if existing_names is None:
        existing_names = set()

    # Check database for existing names
    def name_exists_in_db(name: str) -> bool:
        return (
            db(
                (db.billing_combo.combo_name == name)
                & (db.billing_combo.is_active == True)
            ).count()
            > 0
        )

    # Check if original name is available
    if not name_exists_in_db(base_name) and base_name not in existing_names:
        return base_name

    # Try "Name (copy)"
    copy_name = f"{base_name} (copy)"
    if not name_exists_in_db(copy_name) and copy_name not in existing_names:
        return copy_name

    # Try "Name (copy 2)", "Name (copy 3)", etc.
    counter = 2
    while True:
        numbered_name = f"{base_name} (copy {counter})"
        if not name_exists_in_db(numbered_name) and numbered_name not in existing_names:
            return numbered_name
        counter += 1


def validate_nomenclature_codes_batch(combo_codes_list: List[Dict]) -> Dict:
    """
    Batch validate nomenclature codes via NomenclatureClient API.

    Args:
        combo_codes_list (List[Dict]): List of combo codes to validate

    Returns:
        Dict: Validation results with valid/invalid codes
    """
    nomenclature = NomenclatureClient()
    validation_results = {"valid_codes": [], "invalid_codes": [], "errors": []}

    # Collect all unique codes to validate
    codes_to_validate = set()
    for code_entry in combo_codes_list:
        if isinstance(code_entry, dict):
            if "nomen_code" in code_entry:
                codes_to_validate.add(code_entry["nomen_code"])
            if "secondary_nomen_code" in code_entry:
                codes_to_validate.add(code_entry["secondary_nomen_code"])

    # Validate each unique code
    for code in codes_to_validate:
        try:
            code_details = nomenclature.get_code_details(code)
            if code_details is not None:
                validation_results["valid_codes"].append(code)
            else:
                validation_results["invalid_codes"].append(code)
                validation_results["errors"].append(
                    f"Nomenclature code {code} not found"
                )
        except Exception as e:
            validation_results["invalid_codes"].append(code)
            validation_results["errors"].append(
                f"Error validating code {code}: {str(e)}"
            )

    return validation_results


def validate_single_combo(combo_data: Dict, version: str = "1.0") -> Dict:
    """
    Validate a single combo's structure and business rules.

    Args:
        combo_data (Dict): Single combo data to validate

    Returns:
        Dict: Validation result with success/errors
    """
    validation_result = {"valid": True, "errors": [], "warnings": []}

    # Required fields validation
    required_fields = ["combo_name", "specialty", "combo_codes"]
    for field in required_fields:
        if field not in combo_data or not combo_data[field]:
            validation_result["valid"] = False
            validation_result["errors"].append(f"Missing required field: {field}")

    # Combo name validation
    combo_name = combo_data.get("combo_name", "")
    if len(combo_name) > 200:  # Assuming field length limit
        validation_result["valid"] = False
        validation_result["errors"].append("Combo name too long (max 200 characters)")

    # Specialty validation
    valid_specialties = ["ophthalmology", "general", "consultation"]
    specialty = combo_data.get("specialty", "")
    if specialty not in valid_specialties:
        validation_result["valid"] = False
        validation_result["errors"].append(
            f"Invalid specialty: {specialty}. Must be one of: {', '.join(valid_specialties)}"
        )

    # Combo codes validation
    combo_codes = combo_data.get("combo_codes", [])
    if not isinstance(combo_codes, list):
        validation_result["valid"] = False
        validation_result["errors"].append("combo_codes must be an array")
    elif len(combo_codes) == 0:
        validation_result["valid"] = False
        validation_result["errors"].append("combo_codes cannot be empty")
    elif len(combo_codes) > 20:  # Reasonable limit
        validation_result["warnings"].append(
            f"Many codes ({len(combo_codes)}), consider splitting combo"
        )

    # Validate individual codes structure
    for i, code_entry in enumerate(combo_codes):
        if not isinstance(code_entry, dict):
            validation_result["valid"] = False
            validation_result["errors"].append(f"Code entry {i+1} must be an object")
            continue

        if "nomen_code" not in code_entry:
            validation_result["valid"] = False
            validation_result["errors"].append(f"Code entry {i+1} missing 'nomen_code'")
            continue

        # Validate code is integer
        nomen_code = code_entry["nomen_code"]
        if not isinstance(nomen_code, int) or nomen_code <= 0:
            validation_result["valid"] = False
            validation_result["errors"].append(
                f"Code entry {i+1}: nomen_code must be a positive integer"
            )

        # Validate secondary code if present
        secondary_code = code_entry.get("secondary_nomen_code")
        if secondary_code is not None:
            if not isinstance(secondary_code, int) or secondary_code <= 0:
                validation_result["valid"] = False
                validation_result["errors"].append(
                    f"Code entry {i+1}: secondary_nomen_code must be a positive integer"
                )
            elif secondary_code == nomen_code:
                validation_result["valid"] = False
                validation_result["errors"].append(
                    f"Code entry {i+1}: secondary code cannot be same as main code"
                )

        # Validate fees if v1.1 format
        if version == "1.1":
            # Main fee validation
            fee = code_entry.get("fee")
            if fee is not None and str(fee).strip() not in ("", "N/A", "null", "None"):
                try:
                    fee_value = float(fee)
                    if fee_value < 0:
                        validation_result["valid"] = False
                        validation_result["errors"].append(
                            f"Code entry {i+1}: fee must be non-negative"
                        )
                    elif fee_value > 9999.99:
                        validation_result["warnings"].append(
                            f"Code entry {i+1}: unusually high fee ({fee_value})"
                        )
                except (ValueError, TypeError):
                    validation_result["valid"] = False
                    validation_result["errors"].append(
                        f"Code entry {i+1}: fee must be a valid number (got: {fee})"
                    )

            # Secondary fee validation
            secondary_fee = code_entry.get("secondary_fee")
            if secondary_fee is not None and str(secondary_fee).strip() not in (
                "",
                "N/A",
                "null",
                "None",
            ):
                try:
                    secondary_fee_value = float(secondary_fee)
                    if secondary_fee_value < 0:
                        validation_result["valid"] = False
                        validation_result["errors"].append(
                            f"Code entry {i+1}: secondary_fee must be non-negative"
                        )
                    elif secondary_fee_value > 9999.99:
                        validation_result["warnings"].append(
                            f"Code entry {i+1}: unusually high secondary fee ({secondary_fee_value})"
                        )
                except (ValueError, TypeError):
                    validation_result["valid"] = False
                    validation_result["errors"].append(
                        f"Code entry {i+1}: secondary_fee must be a valid number (got: {secondary_fee})"
                    )

            # Feecode validation - allow N/A values
            feecode = code_entry.get("feecode")
            if feecode is not None and str(feecode).strip() not in (
                "",
                "N/A",
                "null",
                "None",
            ):
                if not isinstance(feecode, int) or feecode <= 0:
                    validation_result["valid"] = False
                    validation_result["errors"].append(
                        f"Code entry {i+1}: feecode must be a positive integer (got: {feecode})"
                    )

            secondary_feecode = code_entry.get("secondary_feecode")
            if secondary_feecode is not None and str(secondary_feecode).strip() not in (
                "",
                "N/A",
                "null",
                "None",
            ):
                if not isinstance(secondary_feecode, int) or secondary_feecode <= 0:
                    validation_result["valid"] = False
                    validation_result["errors"].append(
                        f"Code entry {i+1}: secondary_feecode must be a positive integer (got: {secondary_feecode})"
                    )

    return validation_result


def validate_multi_combo(combos_data: List[Dict], version: str = "1.0") -> Dict:
    """
    Validate multiple combos structure and business rules.

    Args:
        combos_data (List[Dict]): List of combo data to validate

    Returns:
        Dict: Validation results for all combos
    """
    overall_result = {"valid": True, "combo_results": [], "global_errors": []}

    if not isinstance(combos_data, list):
        overall_result["valid"] = False
        overall_result["global_errors"].append("combos must be an array")
        return overall_result

    if len(combos_data) == 0:
        overall_result["valid"] = False
        overall_result["global_errors"].append("combos array cannot be empty")
        return overall_result

    if len(combos_data) > 50:  # Reasonable batch limit
        overall_result["global_errors"].append(
            f"Large batch ({len(combos_data)} combos), consider smaller batches"
        )

    # Track combo names for duplicate detection within batch
    combo_names_in_batch = set()

    # Validate each combo individually
    for i, combo_data in enumerate(combos_data):
        combo_result = validate_single_combo(combo_data, version)
        combo_result["index"] = i
        combo_result["combo_name"] = combo_data.get("combo_name", f"Combo {i+1}")

        # Check for duplicate names within batch
        combo_name = combo_data.get("combo_name", "")
        if combo_name in combo_names_in_batch:
            combo_result["valid"] = False
            combo_result["errors"].append("Duplicate combo name within import batch")
        else:
            combo_names_in_batch.add(combo_name)

        overall_result["combo_results"].append(combo_result)

        # Overall validity depends on all combos being valid
        if not combo_result["valid"]:
            overall_result["valid"] = False

    return overall_result


def process_single_combo_import(
    combo_data: Dict, final_name: str, version: str = "1.0"
) -> Dict:
    """
    Import a single combo into the database.

    Args:
        combo_data (Dict): Validated combo data
        final_name (str): Unique name for the combo

    Returns:
        Dict: Import result
    """
    try:
        user = auth.get_user()

        # Process combo codes based on version
        if version == "1.0":
            # v1.0: Code-only format - fetch current fees from NomenclatureClient
            enriched_codes = []
            nomenclature = NomenclatureClient()

            for code_entry in combo_data["combo_codes"]:
                enriched_code = code_entry.copy()

                # Fetch main code details
                main_code = code_entry.get("nomen_code")
                if main_code:
                    try:
                        code_details = nomenclature.get_code_details(main_code)
                        if code_details:
                            enriched_code.update(
                                {
                                    "nomen_desc_fr": code_details.get(
                                        "description_fr", ""
                                    ),
                                    "feecode": code_details.get("feecode"),
                                    "fee": str(code_details.get("fee", "0.00")),
                                }
                            )
                            if code_details.get("description_nl"):
                                enriched_code["nomen_desc_nl"] = code_details.get(
                                    "description_nl"
                                )
                    except Exception as e:
                        logger.warning(
                            f"Could not fetch details for code {main_code}: {str(e)}"
                        )

                # Fetch secondary code details if present
                secondary_code = code_entry.get("secondary_nomen_code")
                if secondary_code:
                    try:
                        secondary_details = nomenclature.get_code_details(
                            secondary_code
                        )
                        if secondary_details:
                            enriched_code.update(
                                {
                                    "secondary_nomen_desc_fr": secondary_details.get(
                                        "description_fr", ""
                                    ),
                                    "secondary_feecode": secondary_details.get(
                                        "feecode"
                                    ),
                                    "secondary_fee": str(
                                        secondary_details.get("fee", "0.00")
                                    ),
                                }
                            )
                            if secondary_details.get("description_nl"):
                                enriched_code["secondary_nomen_desc_nl"] = (
                                    secondary_details.get("description_nl")
                                )
                    except Exception as e:
                        logger.warning(
                            f"Could not fetch details for secondary code {secondary_code}: {str(e)}"
                        )

                enriched_codes.append(enriched_code)

            combo_codes_json = json.dumps(enriched_codes)
        else:
            # v1.1: Complete format - use provided fee data
            combo_codes_json = json.dumps(combo_data["combo_codes"])

        # Insert the combo
        combo_id = db.billing_combo.insert(
            combo_name=final_name,
            combo_description=combo_data.get("combo_description", ""),
            specialty=combo_data["specialty"],
            combo_codes=combo_codes_json,
            created_by=user.get("id"),
            is_active=True,
        )

        logger.info(
            f"Successfully imported combo '{final_name}' with ID {combo_id} (format v{version})"
        )

        return {
            "success": True,
            "combo_id": combo_id,
            "original_name": combo_data["combo_name"],
            "final_name": final_name,
            "codes_count": len(combo_data["combo_codes"]),
            "version": version,
        }

    except Exception as e:
        logger.error(f"Error importing combo '{final_name}': {str(e)}")
        return {
            "success": False,
            "original_name": combo_data.get("combo_name", "Unknown"),
            "final_name": final_name,
            "error": str(e),
        }


def process_multi_combo_import(combos_data: List[Dict], version: str = "1.0") -> Dict:
    """
    Import multiple combos into the database with conflict resolution.

    Args:
        combos_data (List[Dict]): List of validated combo data

    Returns:
        Dict: Batch import results
    """
    import_results = {
        "success": True,
        "imported_count": 0,
        "failed_count": 0,
        "results": [],
    }

    # Track names being imported to avoid conflicts within the batch
    names_in_batch = set()

    for combo_data in combos_data:
        original_name = combo_data["combo_name"]

        # Generate unique name considering both DB and current batch
        final_name = generate_unique_combo_name(original_name, names_in_batch)
        names_in_batch.add(final_name)

        # Import the combo
        result = process_single_combo_import(combo_data, final_name, version)
        result["status"] = "imported" if result["success"] else "failed"

        if result["success"]:
            import_results["imported_count"] += 1
            if final_name != original_name:
                result["message"] = "Name conflict resolved"
        else:
            import_results["failed_count"] += 1
            import_results["success"] = False

        import_results["results"].append(result)

    return import_results


@action("api/billing_combo/import", method=["POST"])
@action.uses(db, auth.user)
def billing_combo_import():
    """
    Import billing combo(s) with automatic format detection and conflict resolution.

    This endpoint accepts JSON files exported from the system and imports them
    with the following features:
    - Auto-detects single vs multi-combo format
    - Validates nomenclature codes via NomenclatureClient API
    - Automatically resolves naming conflicts by appending '(copy)'
    - Validates business rules and data integrity
    - Provides detailed import results

    Request:
        JSON body with 'import_data' containing exported combo data

    Returns:
        JSON response with import results:
        {
            "success": true,
            "format_detected": "multi",
            "imported_count": 2,
            "total_count": 3,
            "results": [
                {
                    "original_name": "Standard Consult",
                    "final_name": "Standard Consult (copy)",
                    "status": "imported",
                    "message": "Name conflict resolved"
                }
            ]
        }

    Raises:
        400: If file invalid or validation fails
        500: If import processing fails
        403: If user not authorized
    """
    try:
        user = auth.get_user()
        logger.info(f"Import request from user {user.get('email', 'unknown')}")

        # Get JSON data from request body
        try:
            request_data = request.json
            if not request_data or "import_data" not in request_data:
                return APIResponse.error(
                    message="No import data provided",
                    status_code=400,
                    error_type="validation_error",
                )

            json_data = request_data["import_data"]
        except Exception as e:
            return APIResponse.error(
                message=f"Error reading request data: {str(e)}",
                status_code=400,
                error_type="request_error",
            )

        # Auto-detect import format and version
        try:
            format_info = detect_import_format(json_data)
            format_detected = format_info["format"]
            version_detected = format_info["version"]
            logger.info(
                f"Detected import format: {format_detected} v{version_detected}"
            )
        except ValueError as e:
            return APIResponse.error(
                message=str(e), status_code=400, error_type="format_error"
            )

        # Process based on detected format
        if format_detected == "single":
            # Single combo import
            combo_data = json_data["combo_data"]

            # Validate combo structure
            validation_result = validate_single_combo(combo_data, version_detected)
            if not validation_result["valid"]:
                return APIResponse.error(
                    message="Combo validation failed",
                    details={"validation_errors": validation_result["errors"]},
                    status_code=400,
                    error_type="validation_error",
                )

            # Validate nomenclature codes (only for v1.0 - v1.1 may have codes not in current nomenclature)
            if version_detected == "1.0":
                nomenclature_validation = validate_nomenclature_codes_batch(
                    combo_data["combo_codes"]
                )
                if nomenclature_validation["invalid_codes"]:
                    return APIResponse.error(
                        message="Invalid nomenclature codes found",
                        details={
                            "invalid_codes": nomenclature_validation["invalid_codes"],
                            "errors": nomenclature_validation["errors"],
                        },
                        status_code=400,
                        error_type="nomenclature_error",
                    )

            # Generate unique name and import
            original_name = combo_data["combo_name"]
            final_name = generate_unique_combo_name(original_name)

            import_result = process_single_combo_import(
                combo_data, final_name, version_detected
            )

            if import_result["success"]:
                response_data = {
                    "format_detected": "single",
                    "version_detected": version_detected,
                    "imported_count": 1,
                    "total_count": 1,
                    "results": [
                        {
                            "original_name": original_name,
                            "final_name": final_name,
                            "status": "imported",
                            "combo_id": import_result["combo_id"],
                            "codes_count": import_result["codes_count"],
                            "version": version_detected,
                        }
                    ],
                }

                if final_name != original_name:
                    response_data["results"][0]["message"] = "Name conflict resolved"

                return APIResponse.success(
                    data=response_data,
                    message=f"Successfully imported combo '{final_name}'",
                )
            else:
                return APIResponse.error(
                    message=f"Failed to import combo: {import_result['error']}",
                    status_code=500,
                    error_type="import_error",
                )

        elif format_detected == "multi":
            # Multi-combo import
            combos_data = json_data["combos"]

            # Validate all combos structure
            validation_result = validate_multi_combo(combos_data, version_detected)
            if not validation_result["valid"]:
                invalid_combos = [
                    r for r in validation_result["combo_results"] if not r["valid"]
                ]
                logger.error(
                    f"Multi-combo validation failed. Global errors: {validation_result['global_errors']}"
                )
                logger.error(f"Invalid combos: {invalid_combos}")
                return APIResponse.error(
                    message="Some combos failed validation",
                    details={
                        "validation_errors": validation_result["global_errors"],
                        "invalid_combos": invalid_combos,
                    },
                    status_code=400,
                    error_type="validation_error",
                )

            # Validate nomenclature codes (only for v1.0 - v1.1 may have codes not in current nomenclature)
            if version_detected == "1.0":
                # Collect all codes for batch validation
                all_codes = []
                for combo_data in combos_data:
                    all_codes.extend(combo_data["combo_codes"])

                nomenclature_validation = validate_nomenclature_codes_batch(all_codes)
                if nomenclature_validation["invalid_codes"]:
                    return APIResponse.error(
                        message="Invalid nomenclature codes found",
                        details={
                            "invalid_codes": nomenclature_validation["invalid_codes"],
                            "errors": nomenclature_validation["errors"],
                        },
                        status_code=400,
                        error_type="nomenclature_error",
                    )

            # Import all combos
            import_results = process_multi_combo_import(combos_data, version_detected)

            response_data = {
                "format_detected": "multi",
                "version_detected": version_detected,
                "imported_count": import_results["imported_count"],
                "failed_count": import_results["failed_count"],
                "total_count": len(combos_data),
                "results": import_results["results"],
            }

            if import_results["success"]:
                message = f"Successfully imported {import_results['imported_count']} of {len(combos_data)} combos"
            else:
                message = f"Imported {import_results['imported_count']} of {len(combos_data)} combos with {import_results['failed_count']} failures"

            return APIResponse.success(data=response_data, message=message)

        else:
            return APIResponse.error(
                message=f"Unsupported format: {format_detected}",
                status_code=400,
                error_type="format_error",
            )

    except Exception as e:
        logger.error(f"Error in billing combo import: {str(e)}")
        logger.error(traceback.format_exc())
        return APIResponse.error(
            message=f"Import failed: {str(e)}",
            status_code=500,
            error_type="import_error",
        )
