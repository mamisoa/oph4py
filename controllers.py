"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

import datetime

# grid
from functools import reduce

from dateutil.relativedelta import relativedelta
from py4web import (  # add response to throw http error 400
    URL,
    Field,
    abort,
    action,
    redirect,
    request,
    response,
)
from py4web.utils.form import (  # added import Field Form and FormStyleBulma to get form working
    Form,
    FormStyleBootstrap4,
    FormStyleBulma,
)
from py4web.utils.grid import Grid
from pydal.tools.tags import Tags
from pydal.validators import CRYPT  # to encrypt passwords
from yatl.helpers import CAT, OPTION, XML, A

from .common import (
    T,
    auth,
    authenticated,
    cache,
    db,
    flash,
    logger,
    session,
    unauthenticated,
)

# import settings
from .settings import (  # DB_OCTOPUS
    APP_NAME,
    DEFAULT_SENIOR,
    ENV_STATUS,
    LOCAL_URL,
    NEW_INSTALLATION,
    TIMEOFFSET,
)

# useful
from .useful import check_duplicate, dropdownSelect, getMembershipId


# @unauthenticated("index", "index.html")
@action("index")
@action.uses(session, auth.user, db, "index.html")
def index():
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    hosturl = LOCAL_URL
    user = auth.get_user()
    userMembership = (
        db(db.membership.id == user["membership"])
        .select(db.membership.membership)
        .first()["membership"]
    )
    if "NEW_INSTALLATION" in globals():
        if NEW_INSTALLATION == True:
            redirect(URL("isNew"))
    if "membership" in user:
        userMembership = (
            db(db.membership.id == user["membership"])
            .select(db.membership.membership)
            .first()["membership"]
        )
    message = T(
        "Hello {first_name}!".format(**user) if user else "Hello. You should sign in!"
    )
    db_admins_count = db(db.auth_user.membership == getMembershipId("Admin")).count()
    db_doctors_count = db(db.auth_user.membership == getMembershipId("Doctor")).count()
    db_nurses_count = db(db.auth_user.membership == getMembershipId("Nurse")).count()
    db_massistants_count = db(
        db.auth_user.membership == getMembershipId("Medical assistant")
    ).count()
    db_assistants_count = db(
        db.auth_user.membership == getMembershipId("Administrative")
    ).count()
    db_patients_count = db(
        db.auth_user.membership == getMembershipId("Patient")
    ).count()
    db_entries_count = db(db.auth_user).count()
    return locals()


@action("isNew")
@action.uses(session, auth.user, db, "test/isnew.html")
def isNew():
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    userMembership = None
    return locals()


@action("test", method=["POST", "GET"])  # route
@action("test/<membership>")
@action.uses(session, T, auth, db, flash, "test.html")
def test(membership=6):
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    hosturl = LOCAL_URL
    user = auth.get_user()
    userId = user["username"]
    flash.set("Hello World", sanitize=True)
    test = "Test OK"
    try:  # check if membership exists
        check_group = db(db.membership.id == membership).isempty()
    except ValueError:
        membership = 6
    else:
        if check_group is True:  # if does not exist
            membership = 6

    def group_icon(membership):
        dict_icon = {
            1: "fa-users-cog",
            2: "fa-user-md",
            3: "fa-user-nurse",
            4: "fa-user-nurse",
            5: "fa-user-edit",
            6: "fa-user",
        }
        return dict_icon[int(membership)]

    class_icon = group_icon(membership)
    group = (
        db(db.membership.id == membership).select().first()
    ).membership  # name of membership
    roleOptions = ""
    for role in db(db.membership.id > 0).select(db.membership.ALL):
        if role.membership == "Patient":  # make "Patient" as default option
            roleOptions = CAT(
                roleOptions,
                OPTION(
                    role.membership + " (level " + str(role.hierarchy) + ")",
                    _selected="selected",
                    _value=str(role.id),
                ),
            )
        else:
            roleOptions = CAT(
                roleOptions,
                OPTION(
                    role.membership + " (level " + str(role.hierarchy) + ")",
                    _value=str(role.id),
                ),
            )
    roleOptions = XML(roleOptions)
    genderOptions = dropdownSelect(db.gender, db.gender.fields[1], 1)
    return locals()


@action("facilities", method=["GET", "POST"])
@action.uses(
    session, auth.user, db, flash, "facilities.html"
)  # add auth.user and db to get
def facilities():
    env_status = ENV_STATUS
    user = auth.get_user()  # needed to transfer globals to view
    form = Form(
        [Field("facility_name"), Field("hosp_id")], formstyle=FormStyleBootstrap4
    )
    if form.accepted:
        db.facilities.insert(
            facility_name=form.vars["facility_name"], hosp_id=form.vars["hosp_id"]
        )
        flash.set("Facility row added", sanitize=True)
        db.commit()
        redirect(URL("index"))
    return dict(form=form, user=user)


@action("testtable", method=["GET", "POST"])
@action.uses(session, auth.user, db, flash, "testtable.html")
def testtable():
    env_status = ENV_STATUS
    user = auth.get_user()
    form = Form(
        [Field("test_name"), Field("test_id"), Field("test_gender")],
        formstyle=FormStyleBootstrap4,
    )
    form_key = form.formkey
    if form.accepted:
        db.testtable.insert(
            test_name=form.vars["test_name"],
            test_id=form.vars["test_id"],
            test_gender=form.vars["test_gender"],
        )
        db.commit()
        flash.set("Testtable row added", sanitize=True)
        redirect(URL("index"))
    return dict(form=form, user=user, form_key=form_key)


@action("companies", method=["POST", "GET"])
@action("companies/<path:path>", method=["POST", "GET"])
@action.uses(session, db, auth, "grid.html")
def companies(path=None):
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    grid = Grid(
        path,
        query=reduce(lambda a, b: (a & b), [db.auth_user.id > 0]),
        orderby=[db.auth_user.username],
        search_queries=[
            ["Search by Name", lambda val: db.auth_user.username.contains(val)]
        ],
    )
    return dict(grid=grid)


@action("listdir")
@action.uses(session, auth.user, db, flash, "listdir.html")
def listdir():
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    user = auth.get_user()
    hosturl = LOCAL_URL
    test = 5
    return locals()


@action("payment/<worklist_id:int>")
@action.uses(session, auth.user, db, "payment/payment_view.html")
def payment_view(worklist_id):
    """Display payment interface for worklist"""
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    hosturl = LOCAL_URL
    user = auth.get_user()

    # Verify worklist exists and user has access
    worklist = db.worklist[worklist_id]
    if not worklist:
        redirect(URL("index"))

    # Get patient information
    patient = db.auth_user[worklist.id_auth_user]

    return dict(
        worklist=worklist,
        patient=patient,
        worklist_id=worklist_id,
        user=user,
        env_status=env_status,
        timeOffset=timeOffset,
        app_name=app_name,
        hosturl=hosturl,
    )


@action("daily_transactions")
@action.uses(session, auth.user, db, "billing/daily_transactions.html")
def daily_transactions():
    """
    Display daily transactions interface with filtering capabilities

    Shows a comprehensive view of payment transactions with dynamic filtering
    by date and senior doctor, using bootstrap table for pagination and sorting.

    Returns:
        dict: Template variables including filter options and environment data
    """
    try:
        env_status = ENV_STATUS
        timeOffset = TIMEOFFSET
        app_name = APP_NAME
        hosturl = LOCAL_URL
        user = auth.get_user()

        # Generate senior options (following worklist pattern)
        seniorOptions = ""
        idMembershipDoctor = (
            db(db.membership.membership == "Doctor")
            .select(db.membership.id)
            .first()["id"]
        )

        for senior in db(db.auth_user.membership == idMembershipDoctor).select(
            db.auth_user.ALL, orderby=db.auth_user.last_name
        ):
            if senior.last_name == DEFAULT_SENIOR:  # make "House" as default option
                seniorOptions = CAT(
                    seniorOptions,
                    OPTION(
                        senior.last_name + "," + senior.first_name,
                        _selected="selected",
                        _value=str(senior.id),
                    ),
                )
            else:
                seniorOptions = CAT(
                    seniorOptions,
                    OPTION(
                        senior.last_name + "," + senior.first_name,
                        _value=str(senior.id),
                    ),
                )
        seniorOptions = XML(seniorOptions)

        # Get today's date for default display (but don't filter data here)
        today = datetime.date.today()

        # Provide initial summary for today (will be updated by JavaScript)
        start_of_day = datetime.datetime.combine(today, datetime.time.min)
        end_of_day = datetime.datetime.combine(today, datetime.time.max)

        # Query today's transactions for initial summary only
        # (Main data loading will be handled by bootstrap table API)
        transactions_today = db(
            (db.worklist_transactions.transaction_date >= start_of_day)
            & (db.worklist_transactions.transaction_date <= end_of_day)
            & (db.worklist_transactions.is_active == True)
        ).select(db.worklist_transactions.ALL)

        # Calculate initial summary statistics for today
        total_transactions = len(transactions_today)
        total_amount = sum(float(t.total_amount) for t in transactions_today)
        total_card = sum(float(t.amount_card or 0) for t in transactions_today)
        total_cash = sum(float(t.amount_cash or 0) for t in transactions_today)
        total_invoice = sum(float(t.amount_invoice or 0) for t in transactions_today)

        # Payment status breakdown for today
        status_counts = {}
        for t in transactions_today:
            status = t.payment_status
            status_counts[status] = status_counts.get(status, 0) + 1

        # Initial summary (will be updated dynamically by JavaScript)
        summary = {
            "date": today.strftime("%Y-%m-%d"),
            "total_transactions": total_transactions,
            "total_amount": total_amount,
            "total_card": total_card,
            "total_cash": total_cash,
            "total_invoice": total_invoice,
            "status_counts": status_counts,
        }

        return locals()

    except Exception as e:
        logger.error(f"Error in daily_transactions: {str(e)}")
        flash.set(f"Error loading daily transactions: {str(e)}", sanitize=True)

        # Provide minimal summary in case of error
        summary = {
            "date": datetime.date.today().strftime("%Y-%m-%d"),
            "total_transactions": 0,
            "total_amount": 0,
            "total_card": 0,
            "total_cash": 0,
            "total_invoice": 0,
            "status_counts": {},
        }

        return dict(
            env_status=ENV_STATUS,
            timeOffset=TIMEOFFSET,
            app_name=APP_NAME,
            hosturl=LOCAL_URL,
            user=auth.get_user(),
            seniorOptions="",
            summary=summary,
        )


@action("api/daily_transactions_filtered")
@action.uses(session, auth.user, db)
def api_daily_transactions_filtered():
    """
    Custom API endpoint for daily transactions with proper senior filtering

    This endpoint handles server-side filtering for date and senior doctor,
    avoiding issues with py4web RestAPI nested lookup limitations.

    PERFORMANCE OPTIMIZATION:
    - Uses single JOIN query instead of subquery + belongs() for senior filtering
    - Recommended database indexes for optimal performance:
      - CREATE INDEX idx_worklist_senior ON worklist(senior);
      - CREATE INDEX idx_worklist_transactions_date ON worklist_transactions(transaction_date);
      - CREATE INDEX idx_worklist_transactions_worklist ON worklist_transactions(id_worklist);
      - CREATE INDEX idx_auth_user_names ON auth_user(last_name, first_name);

    Query Parameters:
    - date_start: Start date (YYYY-MM-DD HH:MM:SS format)
    - date_end: End date (YYYY-MM-DD HH:MM:SS format)
    - senior_id: Senior doctor ID for filtering
    - offset: Pagination offset (default: 0)
    - limit: Results per page (default: 50)
    - search: Search term for patient names
    - order: Field to order by (default: transaction_date)
    - order_dir: Order direction - asc or desc (default: desc)

    Returns:
        JSON response compatible with bootstrap table format
    """
    import time

    start_time = time.time()

    try:
        # Get query parameters
        date_start = request.query.get("date_start")
        date_end = request.query.get("date_end")
        senior_id = request.query.get("senior_id")
        offset = int(request.query.get("offset", 0))
        limit = int(request.query.get("limit", 50))
        search = request.query.get("search", "").strip()
        order_field = request.query.get("order", "transaction_date")
        order_dir = request.query.get("order_dir", "desc")

        # Log the incoming request
        logger.info(f"Daily Transactions API Request:")
        logger.info(f"  - Date Range: {date_start} to {date_end}")
        logger.info(f"  - Senior ID: {senior_id}")
        logger.info(f"  - Search: '{search}'" if search else f"  - Search: None")
        logger.info(f"  - Pagination: offset={offset}, limit={limit}")
        logger.info(f"  - Order: {order_field} {order_dir}")

        # Build query step by step
        base_query = db.worklist_transactions.is_active == True

        # Date filtering
        if date_start:
            try:
                start_datetime = datetime.datetime.strptime(
                    date_start, "%Y-%m-%d %H:%M:%S"
                )
                base_query &= (
                    db.worklist_transactions.transaction_date >= start_datetime
                )
            except ValueError:
                pass

        if date_end:
            try:
                end_datetime = datetime.datetime.strptime(date_end, "%Y-%m-%d %H:%M:%S")
                base_query &= db.worklist_transactions.transaction_date <= end_datetime
            except ValueError:
                pass

        # Senior filtering - simple approach
        if senior_id:
            try:
                senior_id = int(senior_id)
                # Join with worklist only when needed for senior filtering
                base_query &= (
                    db.worklist_transactions.id_worklist == db.worklist.id
                ) & (db.worklist.senior == senior_id)
            except ValueError:
                pass

        # Build comprehensive query with all required joins
        # Always join with worklist to get laterality and procedure info
        final_query = (
            (db.worklist_transactions.id_worklist == db.worklist.id)
            & (db.worklist_transactions.id_auth_user == db.auth_user.id)
            & base_query
        )

        # Search filtering (patient names) - apply to the joined query
        if search:
            search_terms = [term.strip() for term in search.split(",")]
            if len(search_terms) >= 2:
                lastname, firstname = search_terms[0], search_terms[1]
                search_query = (db.auth_user.last_name.contains(lastname)) & (
                    db.auth_user.first_name.contains(firstname)
                )
            else:
                term = search_terms[0]
                search_query = (db.auth_user.last_name.contains(term)) | (
                    db.auth_user.first_name.contains(term)
                )
            final_query &= search_query

        # Count total results
        total_count = db(final_query).count()

        # ENHANCEMENT: Calculate summary totals for all filtered records (not just paginated ones)
        summary_query = db(final_query).select(
            db.worklist_transactions.amount_card.sum().with_alias("total_card"),
            db.worklist_transactions.amount_cash.sum().with_alias("total_cash"),
            db.worklist_transactions.amount_invoice.sum().with_alias("total_invoice"),
            db.worklist_transactions.total_amount.sum().with_alias("total_amount"),
            db.worklist_transactions.payment_status,
            db.worklist_transactions.payment_status.count().with_alias("status_count"),
            groupby=db.worklist_transactions.payment_status,
        )

        # Calculate aggregated summary totals
        summary_totals = {
            "total_amount_card": 0.0,
            "total_amount_cash": 0.0,
            "total_amount_invoice": 0.0,
            "total_amount": 0.0,
            "count_paid": 0,
            "count_pending": 0,
            "count_cancelled": 0,
            "count_partial": 0,
            "count_overpaid": 0,
            "count_refunded": 0,
            "count_total": total_count,
        }

        # Process summary query results
        for row in summary_query:
            # Add to totals (handle None values)
            summary_totals["total_amount_card"] += float(row.total_card or 0)
            summary_totals["total_amount_cash"] += float(row.total_cash or 0)
            summary_totals["total_amount_invoice"] += float(row.total_invoice or 0)
            summary_totals["total_amount"] += float(row.total_amount or 0)

            # Count payment statuses
            status = (row.worklist_transactions.payment_status or "unknown").lower()
            status_count = row.status_count or 0

            if status in ["complete", "paid"]:
                summary_totals["count_paid"] += status_count
            elif status in ["pending", "partial"]:
                summary_totals["count_pending"] += status_count
            elif status in ["cancelled", "void"]:
                summary_totals["count_cancelled"] += status_count
            elif status == "partial":
                summary_totals["count_partial"] += status_count
            elif status == "overpaid":
                summary_totals["count_overpaid"] += status_count
            elif status == "refunded":
                summary_totals["count_refunded"] += status_count

        # Log query performance metrics
        count_time = time.time()
        logger.info(f"Query Analysis:")
        logger.info(f"  - Total matching transactions: {total_count}")
        logger.info(f"  - Count query time: {(count_time - start_time):.3f}s")
        logger.info(f"  - Summary totals: €{summary_totals['total_amount']:.2f}")
        logger.info(f"  - Uses worklist join: Yes (always)")
        logger.info(f"  - Uses search filter: {'Yes' if search else 'No'}")

        # Build orderby
        if order_field == "transaction_date" or order_field == "transaction_time":
            orderby_field = db.worklist_transactions.transaction_date
        elif order_field == "patient_name":
            orderby_field = db.auth_user.last_name
        elif order_field == "total_amount":
            orderby_field = db.worklist_transactions.total_amount
        elif order_field == "payment_status":
            orderby_field = db.worklist_transactions.payment_status
        else:
            orderby_field = db.worklist_transactions.transaction_date

        orderby = ~orderby_field if order_dir.lower() == "desc" else orderby_field

        # Execute comprehensive query with all required lookups
        senior_user = db.auth_user.with_alias("senior_user")
        results = db(final_query).select(
            db.worklist_transactions.ALL,
            db.auth_user.id,
            db.auth_user.first_name,
            db.auth_user.last_name,
            db.auth_user.email,
            db.worklist.id,
            db.worklist.procedure,
            db.worklist.laterality,
            db.worklist.senior,
            db.procedure.id,
            db.procedure.exam_name,
            senior_user.id,
            senior_user.first_name,
            senior_user.last_name,
            left=[
                db.procedure.on(db.worklist.procedure == db.procedure.id),
                senior_user.on(db.worklist.senior == senior_user.id),
            ],
            orderby=orderby,
            limitby=(offset, offset + limit),
        )

        # Format results for bootstrap table with complete lookup data
        items = []
        for row in results:
            transaction = row.worklist_transactions
            patient = row.auth_user
            worklist = row.worklist
            procedure = row.procedure
            senior = row.senior_user

            # Build complete data structure expected by JavaScript
            items.append(
                {
                    "id": transaction.id,
                    "id_worklist": {
                        "id": worklist.id if worklist else transaction.id_worklist,
                        "laterality": worklist.laterality if worklist else None,
                        "procedure": (
                            {
                                "id": procedure.id if procedure else None,
                                "exam_name": procedure.exam_name if procedure else None,
                            }
                            if procedure
                            else None
                        ),
                        "senior": (
                            {
                                "id": senior.id if senior else None,
                                "first_name": senior.first_name if senior else None,
                                "last_name": senior.last_name if senior else None,
                            }
                            if senior
                            else None
                        ),
                    },
                    "id_auth_user": {
                        "id": patient.id,
                        "first_name": patient.first_name,
                        "last_name": patient.last_name,
                        "email": patient.email,
                    },
                    "transaction_date": (
                        transaction.transaction_date.isoformat()
                        if transaction.transaction_date
                        else None
                    ),
                    "amount_card": float(transaction.amount_card or 0),
                    "amount_cash": float(transaction.amount_cash or 0),
                    "amount_invoice": float(transaction.amount_invoice or 0),
                    "total_amount": float(transaction.total_amount or 0),
                    "payment_status": transaction.payment_status,
                    "remaining_balance": float(transaction.remaining_balance or 0),
                    "notes": transaction.notes,
                    "feecode_used": transaction.feecode_used,
                    "created_on": (
                        transaction.created_on.isoformat()
                        if transaction.created_on
                        else None
                    ),
                    "modified_on": (
                        transaction.modified_on.isoformat()
                        if transaction.modified_on
                        else None
                    ),
                }
            )

        # Log final performance metrics
        end_time = time.time()
        total_execution_time = end_time - start_time
        select_time = end_time - count_time

        logger.info(f"API Response Summary:")
        logger.info(f"  - Total execution time: {total_execution_time:.3f}s")
        logger.info(f"  - SELECT query time: {select_time:.3f}s")
        logger.info(f"  - Items returned: {len(items)}")
        logger.info(f"  - Items per page: {limit}")
        logger.info(f"  - Current page: {(offset // limit) + 1 if limit > 0 else 1}")
        logger.info(
            f"  - Total pages: {(total_count + limit - 1) // limit if limit > 0 else 1}"
        )

        # Log performance warning if query is slow
        if total_execution_time > 1.0:
            logger.warning(
                f"SLOW QUERY WARNING: Daily transactions query took {total_execution_time:.3f}s"
            )
            logger.warning(
                f"  - Consider adding database indexes or optimizing filters"
            )

        return {
            "items": items,
            "count": total_count,
            "status": "success",
            "api_version": "1.0",
            "summary": summary_totals,  # ENHANCEMENT: Include summary data for all filtered records
            "performance": {
                "execution_time": round(total_execution_time, 3),
                "items_returned": len(items),
                "total_items": total_count,
            },
        }

    except Exception as e:
        import traceback

        # Log the error with execution time
        error_time = time.time()
        execution_time = error_time - start_time

        logger.error(f"Daily Transactions API Error:")
        logger.error(f"  - Execution time before error: {execution_time:.3f}s")
        logger.error(f"  - Error message: {str(e)}")
        logger.error(
            f"  - Traceback: {traceback.format_exc() if hasattr(traceback, 'format_exc') else str(e)}"
        )

        return {
            "items": [],
            "count": 0,
            "status": "error",
            "message": str(e),
            "traceback": (
                traceback.format_exc() if hasattr(traceback, "format_exc") else str(e)
            ),
        }


def get_moving_average_days(period_months):
    """Get the number of days for moving average based on time period in months"""
    moving_avg_days = {
        3: 7,  # 3M: 7 days
        6: 15,  # 6M: 15 days
        12: 30,  # 1Y: 30 days
        24: 60,  # 2Y: 60 days
        60: 150,  # 5Y: 150 days
        84: 210,  # 7Y: 210 days
        120: 300,  # 10Y: 300 days
    }
    return moving_avg_days.get(period_months, 15)  # default to 15 days


def analyze_chart_trends(data, labels, ma_data, period, table):
    """Analyze chart trends and generate automated insights"""
    insights = []

    if not data or len(data) < 2:
        insights.append("📊 Insufficient data for trend analysis")
        return insights

    # Calculate trend direction using linear regression
    def calculate_trend():
        if len(data) < 3:
            return "stable", 0

        x_vals = list(range(len(data)))
        y_vals = data
        n = len(data)

        if n == 0 or sum(x * x for x in x_vals) == 0:
            return "stable", 0

        # Simple linear regression
        sum_x = sum(x_vals)
        sum_y = sum(y_vals)
        sum_xy = sum(x_vals[i] * y_vals[i] for i in range(n))
        sum_x2 = sum(x * x for x in x_vals)

        try:
            slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x)
            return (
                "increasing"
                if slope > 0.05
                else "decreasing" if slope < -0.05 else "stable"
            ), slope
        except ZeroDivisionError:
            return "stable", 0

    # Calculate volatility
    def calculate_volatility():
        if len(data) < 2:
            return "unknown", 0

        mean_val = sum(data) / len(data)
        if mean_val == 0:
            return "unknown", 0

        variance = sum((x - mean_val) ** 2 for x in data) / len(data)
        std_dev = variance**0.5
        cv = (std_dev / mean_val) * 100

        if cv < 15:
            return "low", cv
        elif cv < 30:
            return "moderate", cv
        else:
            return "high", cv

    # Find peaks and lows
    def find_peak_low_info():
        if len(data) < 2:
            return None

        max_val = max(data)
        min_val = min(data)
        max_idx = data.index(max_val)
        min_idx = data.index(min_val)

        return {
            "peak": {
                "value": max_val,
                "date": labels[max_idx] if max_idx < len(labels) else "N/A",
            },
            "low": {
                "value": min_val,
                "date": labels[min_idx] if min_idx < len(labels) else "N/A",
            },
        }

    # Calculate recent performance (last 25% vs first 25%)
    def calculate_recent_performance():
        if len(data) < 4:
            return 0

        quarter_size = max(1, len(data) // 4)
        early_avg = sum(data[:quarter_size]) / quarter_size
        recent_avg = sum(data[-quarter_size:]) / quarter_size

        if early_avg == 0:
            return 0

        return ((recent_avg - early_avg) / early_avg) * 100

    # Generate insights
    trend_direction, slope = calculate_trend()
    volatility_level, cv = calculate_volatility()
    peak_low_info = find_peak_low_info()
    recent_change = calculate_recent_performance()

    # Chart type specific naming
    entity_name = {
        "patients": "new patients",
        "worklists": "new worklists",
        "md_worklists": "MD worklists",
    }.get(table, table)

    period_text = {
        3: "3 months",
        6: "6 months",
        12: "1 year",
        24: "2 years",
        60: "5 years",
        84: "7 years",
        120: "10 years",
    }.get(period, f"{period} months")

    # Trend direction insight
    if trend_direction == "increasing":
        insights.append(
            f"📈 Growing trend: {entity_name} showing upward trajectory over {period_text}"
        )
    elif trend_direction == "decreasing":
        insights.append(
            f"📉 Declining trend: {entity_name} decreasing over {period_text}"
        )
    else:
        insights.append(
            f"➡️ Stable pattern: {entity_name} maintaining steady levels over {period_text}"
        )

    # Recent performance insight
    if abs(recent_change) > 10:
        if recent_change > 0:
            insights.append(
                f"🚀 Recent acceleration: {recent_change:.1f}% increase in latest quarter"
            )
        else:
            insights.append(
                f"🐌 Recent slowdown: {abs(recent_change):.1f}% decrease in latest quarter"
            )

    # Volatility insight
    if volatility_level == "low":
        insights.append(
            f"🎯 Stable pattern: Low volatility ({cv:.1f}%) indicates predictable {entity_name}"
        )
    elif volatility_level == "high":
        insights.append(
            f"⚡ High variability: Significant fluctuations ({cv:.1f}%) in {entity_name}"
        )

    # Peak/Low insight
    if peak_low_info and len(data) >= 7:  # Only for meaningful datasets
        peak_date = (
            peak_low_info["peak"]["date"][:10]
            if len(peak_low_info["peak"]["date"]) > 10
            else peak_low_info["peak"]["date"]
        )
        insights.append(
            f"📊 Peak activity: Highest count ({peak_low_info['peak']['value']}) on {peak_date}"
        )

    # Moving average insight
    if len(ma_data) >= 2:
        ma_start = ma_data[len(ma_data) // 4] if len(ma_data) >= 4 else ma_data[0]
        ma_end = ma_data[-1]
        if ma_start > 0:
            ma_change = ((ma_end - ma_start) / ma_start) * 100
            if abs(ma_change) > 5:
                if ma_change > 0:
                    insights.append(
                        f"📈 Moving average trend: {ma_change:.1f}% upward trajectory"
                    )
                else:
                    insights.append(
                        f"📉 Moving average trend: {abs(ma_change):.1f}% downward trajectory"
                    )

    return insights[:4]  # Limit to 4 insights to avoid clutter


@action("api/chart_data/<table>/<period:int>")
@action.uses(session, auth.user, db)
def chart_data(table, period):
    """
    API endpoint to provide chart data for dashboard
    Args:
        table: 'patients' or 'worklists'
        period: number of months (3, 6, 12, 24, 60, 84, 120)
    Returns:
        JSON data suitable for Chart.js consumption
    """

    # Validate inputs
    valid_tables = ["patients", "worklists", "md_worklists"]
    valid_periods = [3, 6, 12, 24, 60, 84, 120]  # Added 84 (7Y) and 120 (10Y)

    if table not in valid_tables:
        response.status = 400
        return dict(error="Invalid table parameter")

    if period not in valid_periods:
        response.status = 400
        return dict(error="Invalid period parameter")

    # Calculate date range
    end_date = datetime.datetime.now()
    start_date = end_date - relativedelta(months=period)

    # Get data based on table type
    if table == "patients":
        # Query for new patients (users with membership = Patient)
        patient_membership_id = getMembershipId("Patient")
        query = (db.auth_user.membership == patient_membership_id) & (
            db.auth_user.created_on >= start_date
        )

        # Select all records within date range
        rows = db(query).select(
            db.auth_user.created_on,
            orderby=db.auth_user.created_on,
        )

    elif table == "worklists":
        # Query for new worklists
        query = db.worklist.created_on >= start_date

        # Select all records within date range
        rows = db(query).select(
            db.worklist.created_on,
            orderby=db.worklist.created_on,
        )

    elif table == "md_worklists":
        # Query for new worklists with modality = "MD" (need to join with modality table)
        query = (
            (db.worklist.modality_dest == db.modality.id)
            & (db.modality.modality_name == "MD")
            & (db.worklist.created_on >= start_date)
        )

        # Select all records within date range
        rows = db(query).select(
            db.worklist.created_on,
            orderby=db.worklist.created_on,
        )

    # Group by date in Python and count occurrences
    from collections import defaultdict

    date_counts = defaultdict(int)

    for row in rows:
        # Extract date part from datetime using Python
        if table == "patients":
            created_date = row.created_on.date() if row.created_on else None
        elif table in ["worklists", "md_worklists"]:
            created_date = row.created_on.date() if row.created_on else None

        if created_date:
            date_counts[created_date] += 1

    # Sort dates and format data for Chart.js
    sorted_dates = sorted(date_counts.keys())
    labels = []
    data = []

    for date_obj in sorted_dates:
        labels.append(date_obj.strftime("%Y-%m-%d"))
        data.append(date_counts[date_obj])

    # Calculate moving average with dynamic window based on period
    def calculate_moving_average(data_points, window=7):
        """Calculate moving average with specified window size"""
        moving_avg = []
        for i in range(len(data_points)):
            start_idx = max(0, i - window + 1)
            end_idx = i + 1
            window_data = data_points[start_idx:end_idx]
            avg = sum(window_data) / len(window_data) if window_data else 0
            moving_avg.append(round(avg, 2))
        return moving_avg

    # Get dynamic moving average period based on time scale
    ma_window = get_moving_average_days(period)
    moving_average = calculate_moving_average(data, window=ma_window)

    # Prepare datasets for Chart.js (main data + moving average)
    datasets = [
        {
            "label": f"New {table.replace('_', ' ').title()}",
            "data": data,
            "type": "line",
            "fill": True,
            "tension": 0.1,
        },
        {
            "label": f"{ma_window}-day Moving Average",
            "data": moving_average,
            "type": "line",
            "fill": False,
            "tension": 0.4,
            "borderWidth": 3,
            "pointRadius": 0,
        },
    ]

    # Generate automated trend insights
    insights = analyze_chart_trends(data, labels, moving_average, period, table)

    # Return JSON response with multiple datasets and insights
    response.headers["Content-Type"] = "application/json"
    return dict(
        labels=labels,
        datasets=datasets,
        data=data,  # Keep for backward compatibility
        period=period,
        table=table,
        total_count=sum(data),
        insights=insights,  # New automated trend analysis
    )


# always commit your models to avoid problems later
