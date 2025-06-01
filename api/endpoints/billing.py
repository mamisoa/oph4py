"""
Billing API Endpoints

This module contains endpoints for billing operations including:
- CRUD operations for billing codes
- CRUD operations for billing combos
- CRUD operations for billing combo usage
- Integration with external nomenclature API
"""

import datetime
import json
import traceback
from typing import Dict, List, Optional

from py4web import action, request

from ...common import db, logger, session
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
    CRUD operations for billing codes.

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

    Returns:
        JSON response with billing codes data
    """
    try:
        logger.info(f"Billing codes request - Method: {request.method}, ID: {rec_id}")

        # For POST requests, validate and enrich data
        if request.method == "POST" and request.json:
            data = request.json.copy()

            # Validate required fields
            required_fields = ["id_auth_user", "id_worklist", "nomen_code"]
            missing_fields = [f for f in required_fields if f not in data]
            if missing_fields:
                return APIResponse.error(
                    message=f"Missing required fields: {', '.join(missing_fields)}",
                    status_code=400,
                    error_type="validation_error",
                )

            # Set defaults
            data.setdefault("quantity", 1)
            data.setdefault("laterality", "both")
            data.setdefault("status", "draft")
            data.setdefault("date_performed", datetime.date.today())

            # If nomenclature description is not provided, try to fetch it
            if not data.get("nomen_desc_fr") and not data.get("nomen_desc_nl"):
                try:
                    nomenclature = NomenclatureClient()
                    code_details = nomenclature.get_code_details(data["nomen_code"])
                    if code_details is not None:
                        data["nomen_desc_fr"] = code_details.get("description_fr")
                        data["nomen_desc_nl"] = code_details.get("description_nl")
                        data["fee"] = code_details.get("fee")
                        data["feecode"] = code_details.get("feecode")
                except Exception as e:
                    logger.warning(f"Could not fetch nomenclature details: {str(e)}")

            # Update request with enriched data
            request.json = data

        return handle_rest_api_request("billing_codes", str(rec_id) if rec_id else None)

    except Exception as e:
        logger.error(f"Error in billing_codes endpoint: {str(e)}")
        logger.error(traceback.format_exc())
        return APIResponse.error(
            message=str(e), status_code=500, error_type="server_error"
        )


@action("api/billing_codes/by_worklist/<worklist_id:int>", method=["GET"])
def billing_codes_by_worklist(worklist_id: int):
    """
    Get all billing codes for a specific worklist item.

    Args:
        worklist_id: The worklist ID to filter by

    Returns:
        JSON response with billing codes for the worklist
    """
    try:
        logger.info(f"Getting billing codes for worklist {worklist_id}")

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

        # Calculate totals
        total_fee = sum(float(code.fee or 0) * (code.quantity or 1) for code in codes)
        total_codes = len(codes)

        return APIResponse.success(
            data=[code.as_dict() for code in codes],
            meta={
                "total_codes": total_codes,
                "total_fee": total_fee,
                "worklist_id": worklist_id,
            },
        )

    except Exception as e:
        logger.error(f"Error getting billing codes by worklist: {str(e)}")
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
    Apply a billing combo to a worklist item.

    Expected JSON:
    {
        "id_worklist": 123,
        "id_auth_user": 456,
        "note": "Applied standard consultation combo"
    }

    Args:
        combo_id: The billing combo ID to apply

    Returns:
        JSON response with created billing codes and usage record
    """
    try:
        logger.info(f"Applying billing combo {combo_id}")

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

        # Parse combo codes
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

        try:
            # Create billing codes for each code in the combo
            for nomen_code in combo_codes:
                code_data = {
                    "id_auth_user": data["id_auth_user"],
                    "id_worklist": data["id_worklist"],
                    "nomen_code": nomen_code,
                    "quantity": 1,
                    "laterality": "both",
                    "status": "draft",
                    "date_performed": datetime.date.today(),
                }

                # Try to get nomenclature details
                try:
                    code_details = nomenclature.get_code_details(nomen_code)
                    if code_details is not None:
                        code_data["nomen_desc_fr"] = code_details.get("description_fr")
                        code_data["nomen_desc_nl"] = code_details.get("description_nl")
                        code_data["fee"] = code_details.get("fee")
                        code_data["feecode"] = code_details.get("feecode")
                except Exception as e:
                    logger.warning(
                        f"Could not fetch details for code {nomen_code}: {str(e)}"
                    )

                # Create billing code
                code_id = db.billing_codes.insert(**code_data)
                created_code = db(db.billing_codes.id == code_id).select().first()
                created_codes.append(created_code.as_dict())

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

            logger.info(
                f"Applied combo {combo_id}: created {len(created_codes)} billing codes"
            )

            return APIResponse.success(
                data={
                    "combo_usage_id": usage_id,
                    "created_codes": created_codes,
                    "combo_name": combo.combo_name,
                },
                message=f"Successfully applied combo '{combo.combo_name}' with {len(created_codes)} codes",
            )

        except Exception as e:
            # Rollback on error
            db.rollback()
            raise e

    except Exception as e:
        logger.error(f"Error applying billing combo: {str(e)}")
        return APIResponse.error(
            message=str(e), status_code=500, error_type="server_error"
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
        code = request.vars.get("code", "").strip()
        description = request.vars.get("description", "").strip()
        feecode = request.vars.get("feecode", "").strip()
        limit = min(int(request.vars.get("limit", 20)), 100)
        offset = int(request.vars.get("offset", 0))

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
