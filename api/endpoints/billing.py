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

from ...common import auth, db, logger, session
from ...models import str_uuid
from ..core.base import APIResponse, handle_rest_api_request
from ..core.nomenclature import NomenclatureClient

# =============================================================================
# Billing Codes Endpoints
# =============================================================================


@action("api/billing_codes", method=["GET", "POST"])
@action("api/billing_codes/<rec_id:int>", method=["GET", "PUT", "DELETE"])
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
def billing_codes_by_worklist(worklist_id: int):
    """
    Get all billing codes for a specific worklist item with enhanced secondary code support.

    Args:
        worklist_id: The worklist ID to filter by

    Enhanced Features:
    - Secondary nomenclature code support
    - Total fee calculations including secondary fees
    - Enhanced response with computed fields

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

        # Get billing codes with related data
        codes = db(db.billing_codes.id_worklist == worklist_id).select(
            db.billing_codes.ALL,
            orderby=db.billing_codes.date_performed | db.billing_codes.id,
        )

        # Enhanced calculations including secondary fees
        enhanced_codes = []
        total_main_fee = 0
        total_secondary_fee = 0
        total_combined_fee = 0
        codes_with_secondary = 0

        for code in codes:
            code_dict = code.as_dict()

            # Enhance each record with computed fields
            enhance_billing_response(code_dict)
            enhanced_codes.append(code_dict)

            # Calculate running totals
            main_fee = float(code.fee or 0) * (code.quantity or 1)
            secondary_fee = float(code.secondary_fee or 0) * (code.quantity or 1)

            total_main_fee += main_fee
            total_secondary_fee += secondary_fee
            total_combined_fee += main_fee + secondary_fee

            if code.secondary_nomen_code:
                codes_with_secondary += 1

        logger.info(
            f"Worklist {worklist_id} summary: {len(codes)} codes, "
            f"{codes_with_secondary} with secondary, total: €{total_combined_fee:.2f}"
        )

        return APIResponse.success(
            data=enhanced_codes,
            meta={
                "total_codes": len(codes),
                "codes_with_secondary": codes_with_secondary,
                "total_main_fee": round(total_main_fee, 2),
                "total_secondary_fee": round(total_secondary_fee, 2),
                "total_combined_fee": round(total_combined_fee, 2),
                "main_fee_formatted": f"€{total_main_fee:.2f}",
                "secondary_fee_formatted": f"€{total_secondary_fee:.2f}",
                "total_fee_formatted": f"€{total_combined_fee:.2f}",
                "worklist_id": worklist_id,
            },
        )

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
def billing_combo(rec_id: Optional[int] = None):
    """
    CRUD operations for billing combos.

    GET /api/billing_combo - List all billing combos with optional filters
    GET /api/billing_combo/123 - Get specific billing combo
    POST /api/billing_combo - Create new billing combo
    PUT /api/billing_combo/123 - Update billing combo
    DELETE /api/billing_combo/123 - Delete billing combo

    Query parameters for GET:
    - specialty.eq=ophthalmology: Filter by specialty
    - is_active.eq=true: Filter by active status
    - combo_name.like=consultation: Search by combo name

    Returns:
        JSON response with billing combo data
    """
    try:
        logger.info(f"Billing combo request - Method: {request.method}, ID: {rec_id}")

        # Handle GET requests with custom query processing
        if request.method == "GET":
            # Get query parameters and filter out Bootstrap Table specific ones
            query_params = dict(request.GET)

            # Remove Bootstrap Table parameters that PyDAL RestAPI doesn't understand
            bootstrap_params = ["search", "sort", "order", "offset", "limit"]
            filtered_query = {
                k: v for k, v in query_params.items() if k not in bootstrap_params
            }

            # Handle search functionality manually if search parameter exists
            if "search" in query_params and query_params["search"]:
                search_term = query_params["search"]
                # Add search condition for combo_name
                filtered_query["combo_name.contains"] = search_term

            return handle_rest_api_request(
                "billing_combo", str(rec_id) if rec_id else None, filtered_query
            )

        # For POST/PUT requests, validate combo_codes format
        if request.method in ["POST", "PUT"] and request.json:
            data = request.json.copy()

            if "combo_codes" in data:
                # Ensure combo_codes is a valid JSON array
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

            request.json = data

        return handle_rest_api_request("billing_combo", str(rec_id) if rec_id else None)

    except Exception as e:
        logger.error(f"Error in billing_combo endpoint: {str(e)}")
        return APIResponse.error(
            message=str(e), status_code=500, error_type="server_error"
        )


@action("api/billing_combo/<combo_id:int>/apply", method=["POST"])
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
            combo_codes = json.loads(combo.combo_codes) if combo.combo_codes else []
        except json.JSONDecodeError:
            return APIResponse.error(
                message="Invalid combo_codes format in billing combo",
                status_code=500,
                error_type="server_error",
            )

        if not combo_codes:
            return APIResponse.error(
                message="Billing combo has no codes defined",
                status_code=400,
                error_type="validation_error",
            )

        # Start transaction
        db.commit()
        db._adapter.connection.begin()

        created_codes = []
        nomenclature = NomenclatureClient()
        total_main_fees = 0
        total_secondary_fees = 0
        codes_with_secondary = 0

        try:
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
                    logger.warning(
                        f"Skipping invalid combo code definition: {code_def}"
                    )
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
                    if code_details is not None:
                        code_data["nomen_desc_fr"] = code_details.get("description_fr")
                        code_data["nomen_desc_nl"] = code_details.get("description_nl")
                        code_data["fee"] = code_details.get("fee")
                        code_data["feecode"] = code_details.get("feecode")
                        total_main_fees += float(code_details.get("fee") or 0)
                except Exception as e:
                    logger.warning(
                        f"Could not fetch details for main code {nomen_code}: {str(e)}"
                    )

                # Handle secondary code if present
                if secondary_code:
                    try:
                        secondary_details = nomenclature.get_code_details(
                            secondary_code
                        )
                        if secondary_details is not None:
                            code_data["secondary_nomen_code"] = secondary_code
                            code_data["secondary_nomen_desc_fr"] = (
                                secondary_details.get("description_fr")
                            )
                            code_data["secondary_nomen_desc_nl"] = (
                                secondary_details.get("description_nl")
                            )
                            code_data["secondary_fee"] = secondary_details.get("fee")
                            code_data["secondary_feecode"] = secondary_details.get(
                                "feecode"
                            )
                            total_secondary_fees += float(
                                secondary_details.get("fee") or 0
                            )
                            codes_with_secondary += 1
                    except Exception as e:
                        logger.warning(
                            f"Could not fetch details for secondary code {secondary_code}: {str(e)}"
                        )

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

            # Commit transaction
            db.commit()

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
            # Rollback on error
            db.rollback()
            raise e

    except Exception as e:
        logger.error(f"Error applying enhanced billing combo: {str(e)}")
        return APIResponse.error(
            message=str(e), status_code=500, error_type="server_error"
        )


@action("api/billing_combo/<combo_id:int>/export", method=["GET"])
@action.uses(db, auth.user)
def export_billing_combo(combo_id: int):
    """
    Export a billing combo in simplified JSON format with only nomenclature codes.

    This endpoint generates a portable export file containing only the essential
    nomenclature codes. All other data (descriptions, fees, etc.) will be retrieved
    from the NomenclatureClient API during import to ensure current information.

    Args:
        combo_id (int): The billing combo ID to export

    Returns:
        JSON response with exported combo data in simplified format:
        {
            "export_info": {
                "version": "1.0",
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
                        "secondary_nomen_code": 102030  // optional
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

        # Extract only the nomenclature codes (simplified format)
        simplified_codes = []
        for code_entry in stored_codes:
            if isinstance(code_entry, dict):
                # New format with secondary code support
                simplified_code = {"nomen_code": code_entry.get("nomen_code")}

                # Include secondary code if present
                if code_entry.get("secondary_nomen_code"):
                    simplified_code["secondary_nomen_code"] = code_entry.get(
                        "secondary_nomen_code"
                    )

                simplified_codes.append(simplified_code)

            elif isinstance(code_entry, int):
                # Legacy format - simple integer code
                simplified_codes.append({"nomen_code": code_entry})
            else:
                logger.warning(
                    f"Skipping invalid code entry in combo {combo_id}: {code_entry}"
                )

        if not simplified_codes:
            return APIResponse.error(
                message="No valid nomenclature codes found in combo",
                status_code=400,
                error_type="validation_error",
            )

        # Build export data structure
        export_data = {
            "export_info": {
                "version": "1.0",
                "exported_at": datetime.datetime.now().isoformat() + "Z",
                "exported_by": user.get("email", "unknown"),
            },
            "combo_data": {
                "combo_name": combo.combo_name,
                "combo_description": combo.combo_description or "",
                "specialty": combo.specialty,
                "combo_codes": simplified_codes,
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
            f"Successfully exported combo '{combo.combo_name}' with {len(simplified_codes)} codes"
        )

        return APIResponse.success(
            data=export_data,
            meta={
                "filename": filename,
                "combo_id": combo_id,
                "combo_name": combo.combo_name,
                "codes_count": len(simplified_codes),
                "export_type": "simplified_codes_only",
            },
            message=f"Successfully exported combo '{combo.combo_name}' with {len(simplified_codes)} codes",
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
    Export multiple billing combos in batch as a single JSON file.

    This endpoint accepts an array of combo IDs and generates a multi-combo
    export file containing only the essential nomenclature codes. All other
    data (descriptions, fees, etc.) will be retrieved from the NomenclatureClient
    API during import to ensure current information.

    Request Body:
        {
            "combo_ids": [1, 2, 3, ...]
        }

    Returns:
        JSON response with exported combos data in multi-combo format:
        {
            "export_info": {
                "version": "1.0",
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
                            "secondary_nomen_code": 102030  // optional
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

            # Extract only the nomenclature codes (simplified format)
            simplified_codes = []
            logger.debug(
                f"Combo {combo['id']}: stored_codes type: {type(stored_codes)}, length: {len(stored_codes) if stored_codes else 0}"
            )
            for code_entry in stored_codes:
                if isinstance(code_entry, dict):
                    # New format with secondary code support
                    nomen_code = code_entry.get("nomen_code")
                    logger.debug(
                        f"Combo {combo['id']}: processing code_entry {nomen_code}, type: {type(nomen_code)}"
                    )

                    if nomen_code is not None:
                        simplified_code = {"nomen_code": nomen_code}

                        # Include secondary code if present
                        secondary_code = code_entry.get("secondary_nomen_code")
                        if secondary_code is not None and str(
                            secondary_code
                        ).strip() not in ("", "None", "null"):
                            # Convert string secondary codes to integers if needed
                            try:
                                if isinstance(secondary_code, str):
                                    secondary_code = int(secondary_code)
                                simplified_code["secondary_nomen_code"] = secondary_code
                                logger.debug(
                                    f"Combo {combo['id']}: added secondary code {secondary_code}"
                                )
                            except (ValueError, TypeError):
                                logger.warning(
                                    f"Combo {combo['id']}: invalid secondary code '{secondary_code}', skipping"
                                )

                        simplified_codes.append(simplified_code)
                        logger.debug(
                            f"Combo {combo['id']}: added simplified_code: {simplified_code}"
                        )
                    else:
                        logger.warning(
                            f"Combo {combo['id']}: code_entry missing nomen_code: {code_entry}"
                        )

                elif isinstance(code_entry, int):
                    # Legacy format - simple integer code
                    simplified_codes.append({"nomen_code": code_entry})
                    logger.debug(
                        f"Combo {combo['id']}: added legacy integer code: {code_entry}"
                    )
                else:
                    logger.warning(
                        f"Combo {combo['id']}: skipping invalid code entry type {type(code_entry)}: {code_entry}"
                    )

            logger.debug(
                f"Combo {combo['id']}: final simplified_codes count: {len(simplified_codes)}"
            )
            if simplified_codes:
                exported_combos.append(
                    {
                        "combo_name": combo["combo_name"],
                        "combo_description": combo["combo_description"] or "",
                        "specialty": combo["specialty"],
                        "combo_codes": simplified_codes,
                    }
                )
                total_codes += len(simplified_codes)
                logger.debug(
                    f"Combo {combo['id']} ({combo['combo_name']}) exported with {len(simplified_codes)} codes"
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
                "version": "1.0",
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
