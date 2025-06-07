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


# always commit your models to avoid problems later
