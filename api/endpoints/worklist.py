"""
Worklist API Endpoints

This module contains endpoints for worklist operations including batch creation and transaction management.
"""

import datetime
import json
import traceback

from py4web import action, request

from ...common import db, logger, session
from ...models import str_uuid
from ..core.base import APIResponse


@action("api/worklist/batch", method=["POST"])
def worklist_batch():
    """
    Batch endpoint for atomic worklist operations.
    Handles multiple worklist items in a single transaction.

    Expected JSON format:
    {
        "items": [
            {
                "id_auth_user": int,
                "sending_app": str,
                "sending_facility": int,
                "receiving_app": str,
                "receiving_facility": int,
                "message_unique_id": str,
                "procedure": int,
                "provider": int,
                "senior": int,
                "requested_time": datetime,
                "modality_dest": int,
                "laterality": str,
                "status_flag": str
            },
            ...
        ],
        "transaction_id": str  # Optional, for tracking
    }

    Returns:
        JSON response with status and created/updated items
    """
    try:
        data = request.json
        logger.info(f"Batch worklist request received: {json.dumps(data, indent=2)}")

        if not data or not isinstance(data.get("items"), list):
            logger.error("Invalid request format - no items array")
            return APIResponse.error(
                message="Invalid request format. Expected 'items' array.",
                status_code=400,
                error_type="validation_error",
            )

        # Ensure we have a transaction_id
        transaction_id = data.get("transaction_id")
        if not transaction_id:
            transaction_id = str_uuid()
            data["transaction_id"] = transaction_id
            logger.info(f"Generated transaction_id: {transaction_id}")

        # Start transaction
        db.commit()  # Commit any pending transactions
        db._adapter.connection.begin()

        created_items = []
        audit_entries = []

        # Create initial audit entry for this transaction
        try:
            audit_id = db.transaction_audit.insert(
                transaction_id=transaction_id,
                operation="batch_create",
                table_name="worklist",
                status="in_progress",
            )
            logger.info(
                f"Created audit entry with ID: {audit_id} for transaction: {transaction_id}"
            )
        except Exception as e:
            logger.error(f"Failed to create audit entry: {str(e)}")
            # Continue even if audit creation fails

        # Validate all items before processing
        patient_id = None
        logger.info(f"Validating {len(data['items'])} worklist items")

        for idx, item in enumerate(data["items"]):
            logger.info(f"Validating item {idx+1}: {json.dumps(item, indent=2)}")

            # Ensure all items are for the same patient
            if patient_id is None:
                patient_id = item.get("id_auth_user")
                logger.info(f"First item patient ID: {patient_id}")
            elif patient_id != item.get("id_auth_user"):
                logger.error(
                    f"Inconsistent patient IDs: {patient_id} vs {item.get('id_auth_user')}"
                )
                raise ValueError("All items in batch must be for the same patient")

            # Validate required fields
            required_fields = [
                "id_auth_user",
                "procedure",
                "provider",
                "senior",
                "requested_time",
                "modality_dest",
                "laterality",
                "status_flag",
            ]
            missing_fields = [f for f in required_fields if f not in item]
            if missing_fields:
                logger.error(
                    f"Missing required fields in item {idx+1}: {', '.join(missing_fields)}"
                )
                raise ValueError(
                    f"Missing required fields: {', '.join(missing_fields)}"
                )

            # Validate field values
            if "laterality" in item and item.get("laterality") not in [
                "both",
                "right",
                "left",
                "none",
            ]:
                logger.error(
                    f"Invalid laterality value in item {idx+1}: {item.get('laterality')}"
                )
                raise ValueError(f"Invalid laterality value: {item.get('laterality')}")

            if "status_flag" in item and item.get("status_flag") not in [
                "requested",
                "processing",
                "done",
                "cancelled",
            ]:
                logger.error(
                    f"Invalid status_flag value in item {idx+1}: {item.get('status_flag')}"
                )
                raise ValueError(
                    f"Invalid status_flag value: {item.get('status_flag')}"
                )

        # Process all items
        logger.info("All items validated, now processing")
        for idx, item in enumerate(data["items"]):
            # Set default values if not provided
            item.setdefault("sending_app", "Oph4Py")
            item.setdefault("sending_facility", 1)
            item.setdefault("receiving_app", "Receiving App")
            item.setdefault("receiving_facility", 1)
            item.setdefault("message_unique_id", str_uuid())
            item.setdefault("counter", 0)

            # Add transaction_id to each item
            item["transaction_id"] = transaction_id

            # Remove any fields that aren't in the worklist table
            item_fields = {k: v for k, v in item.items() if k in db.worklist.fields}

            # Create worklist item
            logger.info(
                f"Inserting item {idx+1} with fields: {json.dumps(item_fields, indent=2)}"
            )
            item_id = db.worklist.insert(**item_fields)
            created_item = db(db.worklist.id == item_id).select().first()
            logger.info(f"Item {idx+1} created with ID: {item_id}")
            created_items.append(created_item)

            # Create individual audit entry for this item
            try:
                audit_entries.append(
                    db.transaction_audit.insert(
                        transaction_id=transaction_id,
                        operation="create",
                        table_name="worklist",
                        record_id=item_id,
                        status="complete",
                    )
                )
            except Exception as e:
                logger.error(f"Failed to create item audit entry: {str(e)}")
                # Continue even if audit creation fails

        # If we got here, all operations succeeded
        logger.info(
            f"All {len(created_items)} items created successfully, committing transaction"
        )
        db.commit()

        # Update the main audit entry to mark as complete
        try:
            db(db.transaction_audit.id == audit_id).update(status="complete")
            db.commit()
        except Exception as e:
            logger.error(f"Failed to update audit entry status: {str(e)}")
            # Don't fail the operation if just the audit update fails

        # Create individual item dictionaries with proper datetime handling
        item_dicts = []
        for item in created_items:
            # Convert to dict and handle datetime conversion
            item_dict = {k: v for k, v in item.as_dict().items()}
            # Convert any datetime objects to strings
            for key, value in item_dict.items():
                if isinstance(value, datetime.datetime):
                    item_dict[key] = value.strftime("%Y-%m-%d %H:%M:%S")
                elif isinstance(value, datetime.date):
                    item_dict[key] = value.strftime("%Y-%m-%d")
            item_dicts.append(item_dict)

        # Create response with the expected format
        response_data = {
            "status": "success",
            "message": "Batch operation completed successfully",
            "items": item_dicts,
            "transaction_id": transaction_id,
        }

        logger.info(
            f"Returning success response for batch operation with {len(item_dicts)} items"
        )
        return json.dumps(response_data)

    except ValueError as e:
        logger.error(f"Validation error in batch operation: {str(e)}")
        # Record failure in audit if we have a transaction_id
        if "transaction_id" in locals() and "audit_id" in locals():
            try:
                db(db.transaction_audit.id == audit_id).update(
                    status="failed", error_message=str(e)
                )
                db.commit()
            except Exception as audit_err:
                logger.error(f"Failed to update audit for error: {str(audit_err)}")

        db.rollback()
        return APIResponse.error(
            message=str(e), status_code=400, error_type="validation_error"
        )
    except Exception as e:
        logger.error(f"Unexpected error in batch operation: {str(e)}")
        logger.error(traceback.format_exc())

        # Record failure in audit if we have a transaction_id
        if "transaction_id" in locals() and "audit_id" in locals():
            try:
                db(db.transaction_audit.id == audit_id).update(
                    status="failed", error_message=str(e)
                )
                db.commit()
            except Exception as audit_err:
                logger.error(f"Failed to update audit for error: {str(audit_err)}")

        db.rollback()
        return APIResponse.error(
            message=f"Internal server error: {str(e)}",
            status_code=500,
            error_type="server_error",
            details=(
                {"traceback": traceback.format_exc()} if "dev_" in request.url else None
            ),
        )


@action("api/worklist/transaction/<transaction_id>", method=["GET"])
def get_transaction_status(transaction_id):
    """
    Get the status of a transaction by ID.
    Returns detailed information about the transaction and related items.
    """
    try:
        # Get all audit records for this transaction
        audit_records = (
            db(db.transaction_audit.transaction_id == transaction_id).select().as_list()
        )

        # Get all worklist items for this transaction
        worklist_items = (
            db(db.worklist.transaction_id == transaction_id).select().as_list()
        )

        # Convert datetime objects to strings in worklist items
        for item in worklist_items:
            for key, value in item.items():
                if isinstance(value, datetime.datetime):
                    item[key] = value.strftime("%Y-%m-%d %H:%M:%S")
                elif isinstance(value, datetime.date):
                    item[key] = value.strftime("%Y-%m-%d")

        # Convert datetime objects to strings in audit records
        for record in audit_records:
            for key, value in record.items():
                if isinstance(value, datetime.datetime):
                    record[key] = value.strftime("%Y-%m-%d %H:%M:%S")
                elif isinstance(value, datetime.date):
                    record[key] = value.strftime("%Y-%m-%d")

        # Determine overall transaction status
        overall_status = "complete"
        if any(record["status"] == "failed" for record in audit_records):
            overall_status = "failed"
        elif any(record["status"] == "in_progress" for record in audit_records):
            overall_status = "in_progress"
        elif any(record["status"] == "partial" for record in audit_records):
            overall_status = "partial"

        response_data = {
            "transaction_id": transaction_id,
            "status": overall_status,
            "item_count": len(worklist_items),
            "audit_records": audit_records,
            "worklist_items": worklist_items,
        }

        return json.dumps(response_data)
    except Exception as e:
        logger.error(f"Error retrieving transaction {transaction_id}: {str(e)}")
        logger.error(traceback.format_exc())
        return APIResponse.error(
            message=f"Error retrieving transaction: {str(e)}",
            error_type="server_error",
            status_code=500,
        )


@action("api/worklist/transaction/<transaction_id>/retry", method=["POST"])
def retry_failed_transaction(transaction_id):
    """
    Retry a failed transaction.
    This endpoint is used to recover from partial or failed transactions.
    """
    try:
        # Check if transaction exists and has failed items
        audit_records = db(
            (db.transaction_audit.transaction_id == transaction_id)
            & (db.transaction_audit.status.belongs(["failed", "partial"]))
        ).select()

        if not audit_records:
            return APIResponse.error(
                message=f"No failed operations found for transaction {transaction_id}",
                error_type="not_found",
                status_code=404,
            )

        # Start transaction
        db.commit()  # Commit any pending transactions
        db._adapter.connection.begin()

        # Get the main audit record
        main_audit = (
            db(
                (db.transaction_audit.transaction_id == transaction_id)
                & (db.transaction_audit.operation == "batch_create")
            )
            .select()
            .first()
        )

        if main_audit:
            # Update retry count
            retry_count = main_audit.retry_count + 1
            db(db.transaction_audit.id == main_audit.id).update(
                retry_count=retry_count, status="in_progress"
            )

        # Process each failed item
        recovered_items = []
        failed_items = []

        for audit in audit_records:
            if (
                audit.operation != "batch_create"
                and audit.record_id
                and audit.status in ["failed", "partial"]
            ):
                try:
                    # Update the audit status
                    db(db.transaction_audit.id == audit.id).update(
                        status="in_progress", retry_count=audit.retry_count + 1
                    )

                    # Get the worklist item to retry
                    worklist_item = (
                        db(db.worklist.id == audit.record_id).select().first()
                    )

                    if worklist_item:
                        # Perform recovery logic here
                        # This may involve re-sending to external systems, updating status, etc.
                        db(db.worklist.id == audit.record_id).update(
                            status_flag="requested"
                        )

                        # Mark as recovered
                        db(db.transaction_audit.id == audit.id).update(
                            status="complete"
                        )
                        recovered_items.append(audit.record_id)
                    else:
                        # Item doesn't exist, mark as failed
                        db(db.transaction_audit.id == audit.id).update(
                            status="failed",
                            error_message="Worklist item not found during recovery",
                        )
                        failed_items.append(audit.record_id)

                except Exception as item_error:
                    logger.error(
                        f"Error recovering item {audit.record_id}: {str(item_error)}"
                    )
                    db(db.transaction_audit.id == audit.id).update(
                        status="failed", error_message=str(item_error)
                    )
                    failed_items.append(audit.record_id)

        # Update the main audit record based on results
        if main_audit:
            if failed_items:
                new_status = "partial" if recovered_items else "failed"
            else:
                new_status = "complete"

            db(db.transaction_audit.id == main_audit.id).update(status=new_status)

        # Commit the transaction
        db.commit()

        return APIResponse.success(
            message=f"Recovery complete: {len(recovered_items)} items recovered, {len(failed_items)} items failed",
            data={
                "transaction_id": transaction_id,
                "recovered_items": recovered_items,
                "failed_items": failed_items,
            },
        )

    except Exception as e:
        logger.error(f"Error during transaction recovery: {str(e)}")
        logger.error(traceback.format_exc())
        db.rollback()
        return APIResponse.error(
            message=f"Recovery failed: {str(e)}",
            error_type="server_error",
            status_code=500,
        )
