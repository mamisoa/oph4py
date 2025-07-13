"""
Payment API endpoints for worklist transactions

This module provides API endpoints for processing payments,
managing transactions, and calculating billing amounts.
"""

import datetime
import json
import logging
from decimal import Decimal
from typing import Optional

from py4web import action, request
from py4web.core import Fixture

from ...common import auth, db, logger
from ..core.base import APIResponse
from ..core.nomenclature import NomenclatureClient

logger = logging.getLogger(__name__)

# Real Belgian healthcare feecodes (removed 0, keeping the rest)
VALID_FEECODES = [
    1300,
    1600,
    3300,
    3600,
    86,
    1306,
    1606,
    3306,
    3606,
    83,
    1320,
    1620,
    3320,
    3620,
]


@action("api/worklist/<worklist_id:int>/payment_summary", method=["GET"])
@action.uses(db)
def payment_summary(worklist_id: int):
    """
    Get payment summary for a specific worklist

    Returns comprehensive billing information, total fees,
    payments made, and remaining balance.

    Args:
        worklist_id: The worklist ID to get payment summary for

    Returns:
        dict: Payment summary with patient info, fees, and balance
    """
    try:
        logger.info(f"Payment summary request for worklist {worklist_id}")

        # Verify worklist exists and user has access
        worklist = db.worklist[worklist_id]
        if not worklist:
            return APIResponse.error(
                message="Worklist not found", status_code=404, error_type="not_found"
            )

        # Get patient information
        patient = db.auth_user[worklist.id_auth_user]

        # Calculate total fees from billing codes
        billing_rows = db(db.billing_codes.id_worklist == worklist_id).select()
        total_fee = Decimal("0.00")

        for billing in billing_rows:
            if billing.fee:
                total_fee += Decimal(str(billing.fee)) * (billing.quantity or 1)
            if billing.secondary_fee:
                total_fee += Decimal(str(billing.secondary_fee)) * (
                    billing.quantity or 1
                )

        # Calculate total paid from transactions
        transaction_rows = db(
            (db.worklist_transactions.id_worklist == worklist_id)
            & (db.worklist_transactions.is_active == True)
        ).select()

        total_paid = Decimal("0.00")
        for transaction in transaction_rows:
            total_paid += Decimal(str(transaction.total_amount))

        # Calculate remaining balance
        remaining_balance = total_fee - total_paid

        # Determine payment status
        if remaining_balance <= 0:
            payment_status = "complete" if remaining_balance == 0 else "overpaid"
        else:
            payment_status = "partial" if total_paid > 0 else "unpaid"

        result = {
            "worklist_id": worklist_id,
            "patient": {
                "id": patient.id,
                "first_name": patient.first_name,
                "last_name": patient.last_name,
                "email": patient.email,
            },
            "worklist": {
                "procedure": (
                    worklist.procedure.exam_name if worklist.procedure else None
                ),
                "requested_time": (
                    worklist.requested_time.isoformat()
                    if worklist.requested_time
                    else None
                ),
                "provider": (
                    f"{worklist.provider.first_name} {worklist.provider.last_name}"
                    if worklist.provider
                    else None
                ),
            },
            "total_fee": float(total_fee),
            "total_paid": float(total_paid),
            "remaining_balance": float(remaining_balance),
            "payment_status": payment_status,
        }

        return APIResponse.success(data=result)

    except Exception as e:
        logger.error(f"Error in payment_summary: {str(e)}")
        return APIResponse.error(
            message=f"Server error: {str(e)}",
            status_code=500,
            error_type="server_error",
        )


@action("api/worklist/<worklist_id:int>/billing_breakdown", method=["GET"])
@action.uses(db)
def billing_breakdown(worklist_id: int):
    """
    Get billing breakdown with fees and reimbursement calculations

    Query parameters:
    - feecode: Fee code for reimbursement calculation (Belgian healthcare feecodes)

    Uses nomen.c66.ovh API to get actual reimbursement amounts.
    Secondary codes have NO reimbursement regardless of feecode.
    """
    try:
        feecode = int(
            request.query.get("feecode", 1300)
        )  # Default to first valid feecode
        logger.info(
            f"Billing breakdown request for worklist {worklist_id}, feecode {feecode}"
        )

        # Verify worklist exists
        if not db.worklist[worklist_id]:
            return APIResponse.error(
                message="Worklist not found", status_code=404, error_type="not_found"
            )

        # Validate feecode is in valid list
        if feecode not in VALID_FEECODES:
            return APIResponse.error(
                message=f"Invalid feecode. Must be one of: {', '.join(map(str, VALID_FEECODES))}",
                status_code=400,
                error_type="validation_error",
            )

        # Get billing codes for the worklist
        billing_rows = db(db.billing_codes.id_worklist == worklist_id).select()

        # Initialize nomenclature client for API calls
        nomen_client = NomenclatureClient()

        breakdown = []
        for billing in billing_rows:
            # Start with basic billing info
            item = {
                "id": billing.id,
                "nomen_code": billing.nomen_code,
                "description": billing.nomen_desc_fr
                or billing.nomen_desc_nl
                or f"Code {billing.nomen_code}",
                "fee": float(billing.fee) if billing.fee else 0.00,
                "quantity": billing.quantity or 1,
                "laterality": billing.laterality,
            }

            # Get reimbursement from nomen API for main code
            reimbursement_amount = 0.00
            if billing.nomen_code and billing.fee:
                try:
                    # Search for the code with the specific feecode to get reimbursement
                    search_result = nomen_client.search(
                        code_prefix=str(billing.nomen_code), feecode=feecode, limit=1
                    )

                    if search_result.get("items"):
                        # Find exact match for the nomen_code
                        for result_item in search_result["items"]:
                            if result_item.get("nomen_code") == billing.nomen_code:
                                reimbursement_amount = float(
                                    result_item.get("fee", 0.00)
                                )
                                break

                        # If no exact match found, use the first result as fallback
                        if reimbursement_amount == 0.00 and search_result["items"]:
                            reimbursement_amount = float(
                                search_result["items"][0].get("fee", 0.00)
                            )

                except Exception as api_error:
                    logger.warning(
                        f"Failed to get reimbursement from nomen API for code {billing.nomen_code}: {api_error}"
                    )
                    # Fallback to 0 reimbursement if API fails
                    reimbursement_amount = 0.00

            # Calculate patient payment
            original_fee = float(billing.fee) if billing.fee else 0.00
            patient_pays = max(0.00, original_fee - reimbursement_amount)

            item.update(
                {
                    "reimbursement": reimbursement_amount,
                    "patient_pays": patient_pays,
                }
            )

            # Handle secondary code - NO reimbursement regardless of feecode
            if billing.secondary_nomen_code and billing.secondary_fee:
                secondary_fee = float(billing.secondary_fee)
                item.update(
                    {
                        "secondary_code": billing.secondary_nomen_code,
                        "secondary_description": billing.secondary_nomen_desc_fr
                        or billing.secondary_nomen_desc_nl,
                        "secondary_fee": secondary_fee,
                        "secondary_reimbursement": 0.00,  # NO reimbursement for secondary codes
                        "secondary_patient_pays": secondary_fee,  # Patient pays full amount
                    }
                )

            breakdown.append(item)

        return APIResponse.success(data=breakdown)

    except Exception as e:
        logger.error(f"Error in billing_breakdown: {str(e)}")
        return APIResponse.error(
            message=f"Server error: {str(e)}",
            status_code=500,
            error_type="server_error",
        )


@action("api/worklist/<worklist_id:int>/payment", method=["POST"])
@action.uses(db)
def process_payment(worklist_id: int):
    """
    Process a payment transaction for a worklist

    Accepts payment data and creates a transaction record.
    Updates payment status and remaining balance.
    """
    try:
        logger.info(f"Process payment request for worklist {worklist_id}")

        # Verify worklist exists
        worklist = db.worklist[worklist_id]
        if not worklist:
            return APIResponse.error(
                message="Worklist not found", status_code=404, error_type="not_found"
            )

        if not request.json:
            return APIResponse.error(
                message="Invalid JSON data",
                status_code=400,
                error_type="validation_error",
            )

        payment_data = request.json

        # Validate payment amounts
        amount_card = Decimal(str(payment_data.get("amount_card", 0)))
        amount_cash = Decimal(str(payment_data.get("amount_cash", 0)))
        amount_invoice = Decimal(str(payment_data.get("amount_invoice", 0)))
        total_amount = amount_card + amount_cash + amount_invoice

        if total_amount <= 0:
            return APIResponse.error(
                message="Payment amount must be greater than zero",
                status_code=400,
                error_type="validation_error",
            )

        feecode_used = payment_data.get("feecode_used", 0)
        notes = payment_data.get("notes", "")

        # Parse payment datetime or use current time
        payment_datetime_str = payment_data.get("payment_datetime")
        if payment_datetime_str:
            try:
                # Parse ISO format datetime from frontend
                payment_datetime = datetime.datetime.fromisoformat(
                    payment_datetime_str.replace("Z", "+00:00")
                )
            except ValueError:
                # Fallback to current time if parsing fails
                payment_datetime = datetime.datetime.now()
        else:
            payment_datetime = datetime.datetime.now()

        # Calculate current balance
        billing_rows = db(db.billing_codes.id_worklist == worklist_id).select()
        total_fee = Decimal("0.00")

        for billing in billing_rows:
            if billing.fee:
                total_fee += Decimal(str(billing.fee)) * (billing.quantity or 1)
            if billing.secondary_fee:
                total_fee += Decimal(str(billing.secondary_fee)) * (
                    billing.quantity or 1
                )

        transaction_rows = db(
            (db.worklist_transactions.id_worklist == worklist_id)
            & (db.worklist_transactions.is_active == True)
        ).select()

        total_paid = Decimal("0.00")
        for transaction in transaction_rows:
            total_paid += Decimal(str(transaction.total_amount))

        current_balance = total_fee - total_paid
        new_balance = current_balance - total_amount

        # Determine payment status
        if new_balance <= 0:
            payment_status = "complete" if new_balance == 0 else "overpaid"
        else:
            payment_status = "partial"

            # Create transaction record
        transaction_id = db.worklist_transactions.insert(
            id_auth_user=worklist.id_auth_user,
            id_worklist=worklist_id,
            transaction_date=payment_datetime,
            amount_card=float(amount_card),
            amount_cash=float(amount_cash),
            amount_invoice=float(amount_invoice),
            total_amount=float(total_amount),
            payment_status=payment_status,
            remaining_balance=float(new_balance),
            feecode_used=feecode_used,
            notes=notes,
            created_by=auth.current_user.get("id") if auth.current_user else None,
        )

        logger.info(f"Transaction {transaction_id} created successfully")

        result = {
            "success": True,
            "transaction_id": transaction_id,
            "total_amount": float(total_amount),
            "remaining_balance": float(new_balance),
            "payment_status": payment_status,
            "message": f"Payment of €{total_amount:.2f} processed successfully",
        }

        return APIResponse.success(data=result)

    except Exception as e:
        logger.error(f"Error in process_payment: {str(e)}")
        return APIResponse.error(
            message=f"Server error: {str(e)}",
            status_code=500,
            error_type="server_error",
        )


@action("api/worklist/<worklist_id:int>/transactions", method=["GET"])
@action.uses(db)
def transaction_history(worklist_id: int):
    """
    Get transaction history for a worklist with pagination support

    Query parameters:
        limit: Number of transactions per page (default: 10, max: 50)
        offset: Number of transactions to skip (default: 0)

    Returns both active and cancelled transactions with their status and pagination info.
    """
    try:
        logger.info(f"Transaction history request for worklist {worklist_id}")

        # Verify worklist exists
        if not db.worklist[worklist_id]:
            return APIResponse.error(
                message="Worklist not found", status_code=404, error_type="not_found"
            )

        # Get pagination parameters from query string
        limit = min(int(request.query.get("limit") or 10), 50)  # Max 50 per page
        offset = max(int(request.query.get("offset") or 0), 0)

        # Get total count first for pagination metadata
        total_count = db(db.worklist_transactions.id_worklist == worklist_id).count()

        # Get paginated transactions for the worklist (both active and cancelled)
        transactions = db(db.worklist_transactions.id_worklist == worklist_id).select(
            db.worklist_transactions.ALL,
            db.auth_user.first_name,
            db.auth_user.last_name,
            left=db.auth_user.on(
                db.worklist_transactions.created_by == db.auth_user.id
            ),
            orderby=~db.worklist_transactions.transaction_date,
            limitby=(offset, offset + limit),
        )

        history = []
        for row in transactions:
            transaction = row.worklist_transactions
            user = row.auth_user

            # Determine transaction status
            transaction_status = (
                "active" if transaction.is_active == True else "cancelled"
            )

            history.append(
                {
                    "id": transaction.id,
                    "transaction_date": (
                        transaction.transaction_date.isoformat()
                        if transaction.transaction_date
                        else None
                    ),
                    "amount_card": (
                        float(transaction.amount_card)
                        if transaction.amount_card
                        else 0.00
                    ),
                    "amount_cash": (
                        float(transaction.amount_cash)
                        if transaction.amount_cash
                        else 0.00
                    ),
                    "amount_invoice": (
                        float(transaction.amount_invoice)
                        if transaction.amount_invoice
                        else 0.00
                    ),
                    "total_amount": (
                        float(transaction.total_amount)
                        if transaction.total_amount
                        else 0.00
                    ),
                    "payment_status": transaction.payment_status,
                    "remaining_balance": (
                        float(transaction.remaining_balance)
                        if transaction.remaining_balance
                        else 0.00
                    ),
                    "feecode_used": transaction.feecode_used,
                    "notes": transaction.notes,
                    "processed_by": (
                        f"{user.first_name} {user.last_name}" if user else "Unknown"
                    ),
                    "transaction_status": transaction_status,
                    "is_active": transaction.is_active == True,
                    "can_cancel": transaction.is_active
                    == True,  # Can only cancel active transactions
                }
            )

        # Calculate pagination metadata
        has_more = (offset + limit) < total_count
        pagination = {
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": has_more,
            "current_page": (offset // limit) + 1,
            "total_pages": (total_count + limit - 1) // limit,  # Ceiling division
        }

        return APIResponse.success(
            data={"transactions": history, "pagination": pagination}
        )

    except Exception as e:
        logger.error(f"Error in transaction_history: {str(e)}")
        return APIResponse.error(
            message=f"Server error: {str(e)}",
            status_code=500,
            error_type="server_error",
        )


@action(
    "api/worklist/<worklist_id:int>/transactions/<transaction_id:int>/cancel",
    method=["PATCH"],
)
@action.uses(db)
def cancel_transaction(worklist_id: int, transaction_id: int):
    """
    Cancel a payment transaction

    Marks the transaction as inactive (is_active='F') without deleting it.
    Maintains audit trail while invalidating the payment.

    Args:
        worklist_id: The worklist ID
        transaction_id: The transaction ID to cancel

    Returns:
        dict: Updated transaction status and new balance information
    """
    try:
        logger.info(
            f"Cancel transaction request: worklist {worklist_id}, transaction {transaction_id}"
        )

        # Verify worklist exists
        worklist = db.worklist[worklist_id]
        if not worklist:
            return APIResponse.error(
                message="Worklist not found", status_code=404, error_type="not_found"
            )

        # Get the transaction to cancel
        transaction = db.worklist_transactions[transaction_id]
        if not transaction:
            return APIResponse.error(
                message="Transaction not found", status_code=404, error_type="not_found"
            )

        # Verify transaction belongs to this worklist
        if transaction.id_worklist != worklist_id:
            return APIResponse.error(
                message="Transaction does not belong to this worklist",
                status_code=400,
                error_type="validation_error",
            )

        # Check if transaction is already cancelled
        if transaction.is_active != True:
            return APIResponse.error(
                message="Transaction is already cancelled",
                status_code=400,
                error_type="validation_error",
            )

        # Get cancellation reason from request
        cancellation_data = request.json or {}
        cancellation_reason = cancellation_data.get("reason", "")

        # Cancel the transaction
        current_user_id = auth.current_user.get("id") if auth.current_user else None
        cancellation_note = f"[CANCELLED {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')} by user {current_user_id}]"
        if cancellation_reason:
            cancellation_note += f" Reason: {cancellation_reason}"

        # Add cancellation note to existing notes
        updated_notes = (
            f"{transaction.notes}\n{cancellation_note}"
            if transaction.notes
            else cancellation_note
        )

        # Update transaction to cancelled status
        db(db.worklist_transactions.id == transaction_id).update(
            is_active=False,
            notes=updated_notes,
            modified_on=datetime.datetime.now(),
            modified_by=current_user_id,
        )

        logger.info(f"Transaction {transaction_id} cancelled successfully")

        # Recalculate balance after cancellation
        billing_rows = db(db.billing_codes.id_worklist == worklist_id).select()
        total_fee = Decimal("0.00")

        for billing in billing_rows:
            if billing.fee:
                total_fee += Decimal(str(billing.fee)) * (billing.quantity or 1)
            if billing.secondary_fee:
                total_fee += Decimal(str(billing.secondary_fee)) * (
                    billing.quantity or 1
                )

        # Calculate new total paid (excluding cancelled transactions)
        active_transaction_rows = db(
            (db.worklist_transactions.id_worklist == worklist_id)
            & (db.worklist_transactions.is_active == True)
        ).select()

        total_paid = Decimal("0.00")
        for active_transaction in active_transaction_rows:
            total_paid += Decimal(str(active_transaction.total_amount))

        new_balance = total_fee - total_paid

        # Determine new payment status
        if new_balance <= 0:
            payment_status = "complete" if new_balance == 0 else "overpaid"
        else:
            payment_status = "partial" if total_paid > 0 else "unpaid"

        result = {
            "success": True,
            "transaction_id": transaction_id,
            "cancelled_amount": float(transaction.total_amount),
            "new_balance": float(new_balance),
            "new_payment_status": payment_status,
            "total_paid": float(total_paid),
            "total_fee": float(total_fee),
            "message": f"Transaction €{transaction.total_amount:.2f} cancelled successfully",
        }

        return APIResponse.success(data=result)

    except Exception as e:
        logger.error(f"Error in cancel_transaction: {str(e)}")
        return APIResponse.error(
            message=f"Server error: {str(e)}",
            status_code=500,
            error_type="server_error",
        )


@action("api/worklist/<worklist_id:int>/md_summary", method=["GET"])
@action("api/worklist/<worklist_id:int>/md_summary/<offset:int>", method=["GET"])
@action.uses(db)
def md_summary(worklist_id: int, offset: int = 0):
    """
    Get patient's consultation history summary for MD review

    Returns historical consultation data with pagination support.
    Default: Returns last 5 consultations
    With offset: Returns next 5 consultations for "view more" functionality

    Args:
        worklist_id: The worklist ID to get patient history for
        offset: Pagination offset (default: 0)

    Returns:
        dict: Consultation history with pagination info
    """
    try:
        logger.info(f"MD summary request for worklist {worklist_id}, offset {offset}")

        # Verify worklist exists and get patient ID
        current_wl = db.worklist[worklist_id]
        if not current_wl:
            return APIResponse.error(
                message="Worklist not found", status_code=404, error_type="not_found"
            )

        patient_id = current_wl.id_auth_user

        # Base query for patient's worklists
        query = db.worklist.id_auth_user == patient_id
        # Filter to only MD or GP modalities
        mode_ids = [
            m.id
            for m in db(db.modality.modality_name.belongs(["MD", "GP"])).select(
                db.modality.id
            )
        ]
        query &= db.worklist.modality_dest.belongs(mode_ids)

        # Get total count for pagination
        total_count = db(query).count()

        # Query to get consultation history without joining conclusions (to avoid duplicates)
        rows = db(query).select(
            db.worklist.requested_time.with_alias("requested_time"),
            db.worklist.id.with_alias("worklist_id"),
            db.procedure.exam_name.with_alias("procedure_name"),
            db.current_hx.description.with_alias("current_hx_desc"),
            db.followup.description.with_alias("followup_desc"),
            db.billing.description.with_alias("billing_desc"),
            left=[
                db.procedure.on(db.worklist.procedure == db.procedure.id),
                db.current_hx.on(db.worklist.id == db.current_hx.id_worklist),
                db.followup.on(db.worklist.id == db.followup.id_worklist),
                db.billing.on(db.worklist.id == db.billing.id_worklist),
            ],
            orderby=~db.worklist.requested_time,  # Most recent first
            limitby=(offset, offset + 5),  # Pagination: 5 records at a time
        )

        # Process each consultation record
        summary_data = []
        for row in rows:
            worklist_row_id = row.worklist_id

            # Get all conclusions for this worklist and aggregate them
            conclusions = db(db.ccx.id_worklist == worklist_row_id).select(
                db.ccx.description, orderby=db.ccx.id
            )

            # Combine all conclusions into a single string
            conclusion_texts = [
                c.description
                for c in conclusions
                if c.description and c.description.strip()
            ]
            conclusion_combined = (
                "; ".join(conclusion_texts) if conclusion_texts else "-"
            )

            # Get billing codes for this worklist and aggregate them
            billing_codes = db(db.billing_codes.id_worklist == worklist_row_id).select()

            # Aggregate billing codes info
            codes_summary = []
            total_billing = Decimal("0.00")

            for code in billing_codes:
                if code.nomen_code:
                    codes_summary.append(str(code.nomen_code))
                    if code.fee:
                        total_billing += Decimal(str(code.fee)) * (code.quantity or 1)
                    if code.secondary_fee:
                        total_billing += Decimal(str(code.secondary_fee)) * (
                            code.quantity or 1
                        )

            # Format billing codes as "CODE1, CODE2 (€total)"
            if codes_summary:
                billing_codes_text = (
                    f"{', '.join(codes_summary)} (€{total_billing:.2f})"
                )
            else:
                billing_codes_text = "-"

            # Build consultation record
            consultation_record = {
                "requested_time": (
                    row.requested_time.isoformat() if row.requested_time else None
                ),
                "worklist_id": worklist_row_id,
                "procedure": (row.procedure_name if row.procedure_name else "-"),
                "history": (row.current_hx_desc if row.current_hx_desc else "-"),
                "conclusion": conclusion_combined,
                "followup": (row.followup_desc if row.followup_desc else "-"),
                "billing_desc": (row.billing_desc if row.billing_desc else "-"),
                "billing_codes": billing_codes_text,
            }

            summary_data.append(consultation_record)

        # Check if more records exist
        has_more = (offset + 5) < total_count

        result = {
            "items": summary_data,
            "has_more": has_more,
            "total_count": total_count,
            "current_offset": offset,
            "limit": 5,
        }

        return APIResponse.success(data=result)

    except Exception as e:
        logger.error(f"Error in md_summary: {str(e)}")
        return APIResponse.error(
            message=f"Server error: {str(e)}",
            status_code=500,
            error_type="server_error",
        )


@action("api/worklist/<worklist_id:int>/md_summary_modal", method=["GET"])
@action.uses(db)
def md_summary_modal(worklist_id: int):
    """
    Get all consultation history for modal display

    Returns complete consultation history for modal "View More" functionality.
    Used when user wants to see all historical records beyond the initial 5.

    Args:
        worklist_id: The worklist ID to get patient history for

    Returns:
        dict: Complete consultation history for modal display
    """
    try:
        logger.info(f"MD summary modal request for worklist {worklist_id}")

        # Verify worklist exists and get patient ID
        current_wl = db.worklist[worklist_id]
        if not current_wl:
            return APIResponse.error(
                message="Worklist not found", status_code=404, error_type="not_found"
            )

        patient_id = current_wl.id_auth_user

        # Query for all patient's worklists (excluding current one to avoid duplication)
        query = (db.worklist.id_auth_user == patient_id) & (
            db.worklist.id != worklist_id
        )
        # Filter to only MD or GP modalities
        mode_ids = [
            m.id
            for m in db(db.modality.modality_name.belongs(["MD", "GP"])).select(
                db.modality.id
            )
        ]
        query &= db.worklist.modality_dest.belongs(mode_ids)

        # Get total count
        total_count = db(query).count()

        # Get all consultation records (no pagination for modal)
        rows = db(query).select(
            db.worklist.requested_time.with_alias("requested_time"),
            db.worklist.id.with_alias("worklist_id"),
            db.procedure.exam_name.with_alias("procedure_name"),
            db.current_hx.description.with_alias("current_hx_desc"),
            db.followup.description.with_alias("followup_desc"),
            db.billing.description.with_alias("billing_desc"),
            left=[
                db.procedure.on(db.worklist.procedure == db.procedure.id),
                db.current_hx.on(db.worklist.id == db.current_hx.id_worklist),
                db.followup.on(db.worklist.id == db.followup.id_worklist),
                db.billing.on(db.worklist.id == db.billing.id_worklist),
            ],
            orderby=~db.worklist.requested_time,  # Most recent first
            limitby=(0, 50),  # Reasonable limit for modal display
        )

        # Process consultation records (same logic as main endpoint)
        summary_data = []
        for row in rows:
            worklist_row_id = row.worklist_id

            # Get all conclusions for this worklist and aggregate them
            conclusions = db(db.ccx.id_worklist == worklist_row_id).select(
                db.ccx.description, orderby=db.ccx.id
            )

            # Combine all conclusions into a single string
            conclusion_texts = [
                c.description
                for c in conclusions
                if c.description and c.description.strip()
            ]
            conclusion_combined = (
                "; ".join(conclusion_texts) if conclusion_texts else "-"
            )

            # Get billing codes for this worklist
            billing_codes = db(db.billing_codes.id_worklist == worklist_row_id).select()

            # Aggregate billing codes
            codes_summary = []
            total_billing = Decimal("0.00")

            for code in billing_codes:
                if code.nomen_code:
                    codes_summary.append(str(code.nomen_code))
                    if code.fee:
                        total_billing += Decimal(str(code.fee)) * (code.quantity or 1)
                    if code.secondary_fee:
                        total_billing += Decimal(str(code.secondary_fee)) * (
                            code.quantity or 1
                        )

            # Format billing codes
            billing_codes_text = (
                f"{', '.join(codes_summary)} (€{total_billing:.2f})"
                if codes_summary
                else "-"
            )

            # Build consultation record
            consultation_record = {
                "requested_time": (
                    row.requested_time.isoformat() if row.requested_time else None
                ),
                "worklist_id": worklist_row_id,
                "procedure": (row.procedure_name if row.procedure_name else "-"),
                "history": (row.current_hx_desc if row.current_hx_desc else "-"),
                "conclusion": conclusion_combined,
                "followup": (row.followup_desc if row.followup_desc else "-"),
                "billing_desc": (row.billing_desc if row.billing_desc else "-"),
                "billing_codes": billing_codes_text,
            }

            summary_data.append(consultation_record)

        result = {
            "items": summary_data,
            "total_count": total_count,
            "limited_to": min(50, total_count),  # Inform about any limitation
        }

        return APIResponse.success(data=result)

    except Exception as e:
        logger.error(f"Error in md_summary_modal: {str(e)}")
        return APIResponse.error(
            message=f"Server error: {str(e)}",
            status_code=500,
            error_type="server_error",
        )


@action("api/patient/<patient_id:int>/md_summary", method=["GET"])
@action("api/patient/<patient_id:int>/md_summary/<offset:int>", method=["GET"])
@action.uses(db)
def patient_md_summary(patient_id: int, offset: int = 0):
    """
    Get patient's consultation history summary for summary view

    Returns historical consultation data with pagination support.
    Default: Returns last 10 consultations
    With offset: Returns next 10 consultations for "view more" functionality

    Args:
        patient_id: The patient ID to get consultation history for
        offset: Pagination offset (default: 0)

    Returns:
        dict: Consultation history with pagination info
    """
    try:
        logger.info(
            f"Patient MD summary request for patient {patient_id}, offset {offset}"
        )

        # Verify patient exists
        patient = db.auth_user[patient_id]
        if not patient:
            return APIResponse.error(
                message="Patient not found", status_code=404, error_type="not_found"
            )

        # Base query for patient's worklists
        query = db.worklist.id_auth_user == patient_id
        # Filter to only MD or GP modalities
        mode_ids = [
            m.id
            for m in db(db.modality.modality_name.belongs(["MD", "GP"])).select(
                db.modality.id
            )
        ]
        query &= db.worklist.modality_dest.belongs(mode_ids)

        # Get total count for pagination
        total_count = db(query).count()

        # Query to get consultation history without joining conclusions (to avoid duplicates)
        rows = db(query).select(
            db.worklist.requested_time.with_alias("requested_time"),
            db.worklist.id.with_alias("worklist_id"),
            db.procedure.exam_name.with_alias("procedure_name"),
            db.current_hx.description.with_alias("current_hx_desc"),
            db.followup.description.with_alias("followup_desc"),
            db.billing.description.with_alias("billing_desc"),
            left=[
                db.procedure.on(db.worklist.procedure == db.procedure.id),
                db.current_hx.on(db.worklist.id == db.current_hx.id_worklist),
                db.followup.on(db.worklist.id == db.followup.id_worklist),
                db.billing.on(db.worklist.id == db.billing.id_worklist),
            ],
            orderby=~db.worklist.requested_time,  # Most recent first
            limitby=(offset, offset + 10),  # Pagination: 10 records at a time
        )

        # Process each consultation record
        summary_data = []
        for row in rows:
            worklist_row_id = row.worklist_id

            # Get all conclusions for this worklist and aggregate them
            conclusions = db(db.ccx.id_worklist == worklist_row_id).select(
                db.ccx.description, orderby=db.ccx.id
            )

            # Combine all conclusions into a single string
            conclusion_texts = [
                c.description
                for c in conclusions
                if c.description and c.description.strip()
            ]
            conclusion_combined = (
                "; ".join(conclusion_texts) if conclusion_texts else "-"
            )

            # Get billing codes for this worklist and aggregate them
            billing_codes = db(db.billing_codes.id_worklist == worklist_row_id).select()

            # Aggregate billing codes info
            codes_summary = []
            total_billing = Decimal("0.00")

            for code in billing_codes:
                if code.nomen_code:
                    codes_summary.append(str(code.nomen_code))
                    if code.fee:
                        total_billing += Decimal(str(code.fee)) * (code.quantity or 1)
                    if code.secondary_fee:
                        total_billing += Decimal(str(code.secondary_fee)) * (
                            code.quantity or 1
                        )

            # Format billing codes as "CODE1, CODE2 (€total)"
            if codes_summary:
                billing_codes_text = (
                    f"{', '.join(codes_summary)} (€{total_billing:.2f})"
                )
            else:
                billing_codes_text = "-"

            # Build consultation record
            consultation_record = {
                "requested_time": (
                    row.requested_time.isoformat() if row.requested_time else None
                ),
                "worklist_id": worklist_row_id,
                "procedure": (row.procedure_name if row.procedure_name else "-"),
                "history": (row.current_hx_desc if row.current_hx_desc else "-"),
                "conclusion": conclusion_combined,
                "followup": (row.followup_desc if row.followup_desc else "-"),
                "billing_desc": (row.billing_desc if row.billing_desc else "-"),
                "billing_codes": billing_codes_text,
            }

            summary_data.append(consultation_record)

        # Check if more records exist
        has_more = (offset + 10) < total_count

        result = {
            "items": summary_data,
            "has_more": has_more,
            "total_count": total_count,
            "current_offset": offset,
            "limit": 10,
        }

        return APIResponse.success(data=result)

    except Exception as e:
        logger.error(f"Error in patient_md_summary: {str(e)}")
        return APIResponse.error(
            message=f"Server error: {str(e)}",
            status_code=500,
            error_type="server_error",
        )
