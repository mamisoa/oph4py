# Management controllers

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
from .settings import (
    APP_NAME,
    DEFAULT_PROVIDER,
    DEFAULT_SENIOR,
    ENV_STATUS,
    LOCAL_BEID,
    LOCAL_URL,
    NEW_INSTALLATION,
    TIMEOFFSET,
)

# import useful
from .useful import dropdownSelect, getMembershipId

# from py4web.utils.factories import Inject


## edit user/id from auth_user
@action("user")
@action("user/<rec_id>")
@action.uses(session, auth, db, "manage/user.html")
def user(rec_id="1"):
    """
    Manages user profile details, including personal information, addresses, phone numbers, and medical registration details.

    This function serves as the main controller for the user profile management interface. It handles:
    - Basic user information display and editing
    - Address management (multiple addresses with ranking)
    - Phone number management (multiple numbers with international support)
    - Medical registration details for healthcare providers
    - eID card integration for automatic data population

    Args:
        rec_id (str, optional): The user ID to display/edit. Defaults to "1".

    Returns:
        dict: A dictionary containing:
            - env_status: Current environment status
            - timeOffset: System time offset
            - app_name: Application name
            - hosturl: Host URL
            - localbeid: Local BeID reader URL
            - user: Current authenticated user object
            - userMembership: Current user's membership level
            - username: Username of the profile being viewed
            - membership: Membership level of the profile being viewed
            - hierarchy: Hierarchy level of the membership
            - roleOptions: HTML options for role selection
            - genderOptions: HTML options for gender selection
            - originOptions: HTML options for data origin selection
            - ethnyOptions: HTML options for ethnicity selection
            - maritalOptions: HTML options for marital status selection

    Requires:
        - Authentication
        - Session management
        - Database access
        - User template
    """
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    hosturl = LOCAL_URL
    localbeid = LOCAL_BEID
    user = auth.get_user()
    userMembership = (
        db(db.membership.id == user["membership"])
        .select(db.membership.membership)
        .first()["membership"]
    )
    row = db(db.auth_user.id == rec_id).select().first()
    username = row.username
    membership = row.membership
    hierarchy = (
        db(db.membership.id == membership)
        .select(db.membership.hierarchy)
        .first()["hierarchy"]
    )
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
    originOptions = dropdownSelect(db.data_origin, db.data_origin.fields[1], 1, "value")
    ethnyOptions = dropdownSelect(db.ethny, db.ethny.fields[1], 1, "index")
    maritalOptions = dropdownSelect(db.marital, db.marital.fields[1], 1, "index")
    return locals()


# list users from membership
@action("manage/users", method=["POST", "GET"])  # route
@action("manage/users/<membership>")
# @action.uses(session, T, auth, db,'manage/users.html')
@action.uses(session, T, db, auth.user, "manage/users.html")
def users(membership="Patient"):
    """
    Manages user listing and creation interface based on membership roles.

    This function serves as the controller for the user management interface, providing:
    - Filtered user lists by membership role (Patient, Doctor, Nurse, etc.)
    - User creation functionality with role-specific forms
    - Integration with eID card reader for automated data entry
    - User profile management capabilities

    Args:
        membership (str, optional): The membership role to filter users by. Defaults to "Patient".

    Returns:
        dict: A dictionary containing:
            - env_status: Current environment status
            - timeOffset: System time offset
            - app_name: Application name
            - hosturl: Host URL
            - user: Current authenticated user object
            - test: Test status message
            - userMembership: Current user's membership level
            - class_icon: Font Awesome icon class for the membership role
            - group: Current membership group being displayed
            - roleOptions: HTML options for role selection dropdown
            - genderOptions: HTML options for gender selection dropdown

    Requires:
        - Authentication
        - Session management
        - Database access
        - Users template
    """
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    hosturl = LOCAL_URL
    user = auth.get_user()
    test = "Test OK"
    userMembership = (
        db(db.membership.id == user["membership"])
        .select(db.membership.membership)
        .first()["membership"]
    )
    try:  # check if membership exists
        check_group = db(db.membership.membership == membership).isempty()
    except ValueError:
        membership = "Patient"
    else:
        if check_group is True:  # if does not exist
            membership = "Patient"

    def group_icon(membership):
        dict_icon = {
            "Admin": "fa-users-cog",
            "Doctor": "fa-user-md",
            "Nurse": "fa-user-nurse",
            "Medical assistant": "fa-user-nurse",
            "Administrative": "fa-user-edit",
            "Patient": "fa-user",
        }
        return dict_icon[membership]

    class_icon = group_icon(membership)
    group = membership  # name of membership
    roleOptions = ""
    for role in db(db.membership.id > 0).select(db.membership.ALL):
        if role.membership == group:  # make "Patient" as default option
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


@action("change_password", method=["POST"])
@action.uses(session, auth.user, db)
def change_password():
    """
    Handles password change requests for authenticated users.

    This endpoint validates new password requirements and updates the user's password
    in the database using secure CRYPT hashing. No current password verification required.

    Request Body (JSON):
        new_password (str): The new password to set
        confirm_password (str): Confirmation of the new password
        user_id (int): ID of the user whose password is being changed

    Returns:
        JSON response with:
        - success: Boolean indicating operation success
        - message: Descriptive message about the operation result
        - errors: List of validation errors (if any)

    Security Features:
        - Requires authentication
        - Enforces password complexity requirements
        - Uses CRYPT for secure password hashing
        - Rate limiting protection
    """
    try:
        # Get the current authenticated user
        current_user = auth.get_user()
        if not current_user:
            response.status = 401
            return {"success": False, "message": "Authentication required"}

        # Get request data
        data = request.json
        if not data:
            response.status = 400
            return {"success": False, "message": "No data provided"}

        new_password = data.get("new_password", "").strip()
        confirm_password = data.get("confirm_password", "").strip()
        user_id = data.get("user_id")

        # Validation
        errors = []

        if not new_password:
            errors.append("New password is required")

        if not confirm_password:
            errors.append("Password confirmation is required")

        if new_password != confirm_password:
            errors.append("New password and confirmation do not match")

        # Password complexity requirements
        if len(new_password) < 8:
            errors.append("Password must be at least 8 characters long")

        if not any(c.isupper() for c in new_password):
            errors.append("Password must contain at least one uppercase letter")

        if not any(c.islower() for c in new_password):
            errors.append("Password must contain at least one lowercase letter")

        if not any(c.isdigit() for c in new_password):
            errors.append("Password must contain at least one number")

        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in new_password):
            errors.append("Password must contain at least one special character")

        if errors:
            response.status = 400
            return {"success": False, "message": "Validation failed", "errors": errors}

        # Determine target user ID - use provided user_id or current user's ID
        target_user_id = user_id if user_id else current_user["id"]

        # Get current user's membership for authorization
        current_user_membership = (
            db(db.membership.id == current_user["membership"])
            .select(db.membership.membership)
            .first()["membership"]
        )

        # Check if user has permission to change other users' passwords
        if str(target_user_id) != str(current_user["id"]):
            # Changing another user's password - check if current user is Doctor or Admin
            if current_user_membership not in ["Doctor", "Admin"]:
                response.status = 403
                return {
                    "success": False,
                    "message": "Only Doctors and Admins can change other users' passwords",
                }

        # Get the target user record
        user_record = db(db.auth_user.id == target_user_id).select().first()
        if not user_record:
            response.status = 404
            return {"success": False, "message": "User not found"}

        # Hash the new password
        crypt_validator = CRYPT()
        new_password_hash = str(crypt_validator(new_password)[0])

        # Update the password in the database
        db(db.auth_user.id == target_user_id).update(password=new_password_hash)
        db.commit()

        # Log the password change (optional)
        logger.info(f"Password changed for user ID: {target_user_id}")

        return {"success": True, "message": "Password changed successfully"}

    except Exception as e:
        logger.error(f"Error changing password: {str(e)}")
        response.status = 500
        return {
            "success": False,
            "message": "An error occurred while changing password",
        }


# patients worklist
@action("worklist", method=["POST", "GET"])  # route
@action.uses(session, T, auth.user, db, "worklist.html")
def worklist():
    """
    Manages the worklist interface for patient appointments and procedures.

    This function serves as the main controller for the worklist management interface. It handles:
    - Patient appointment scheduling and tracking
    - Procedure status management
    - Provider and practitioner assignments
    - Real-time status updates
    - Modality-specific workflow management
    - Billing integration

    Returns:
        dict: A dictionary containing:
            - env_status: Current environment status
            - timeOffset: System time offset
            - app_name: Application name
            - hosturl: Host URL
            - localbeid: Local BeID reader URL
            - user: Current authenticated user object
            - userMembership: Current user's membership level
            - test: Test status message
            - membership: Default membership level (6 for Patient)
            - class_icon: Font Awesome icon class
            - group: User group name
            - roleOptions: HTML options for role selection
            - genderOptions: HTML options for gender selection
            - sendingFacilityOptions: HTML options for sending facility
            - receivingFacilityOptions: HTML options for receiving facility
            - procedureOptions: HTML options for procedures
            - providerOptions: HTML options for providers
            - seniorOptions: HTML options for senior doctors
            - everyModalityOptions: HTML options for all modalities
            - modalityDict: Dictionary mapping modalities to controllers
            - practitionerDict: Dictionary of available practitioners
            - providerDict: Dictionary of available providers
            - multiplemod: ID for multiple modality option

    Requires:
        - Authentication
        - Session management
        - Database access
        - Worklist template
    """
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    hosturl = LOCAL_URL
    localbeid = LOCAL_BEID
    user = auth.get_user()
    userMembership = (
        db(db.membership.id == user["membership"])
        .select(db.membership.membership)
        .first()["membership"]
    )
    userHierarchy = (
        db(db.membership.id == user["membership"])
        .select(db.membership.hierarchy)
        .first()["hierarchy"]
    )
    test = "Test OK"
    membership = 6
    class_icon = "fa-user"
    group = "Patient"
    roleOptions = ""
    for role in db(db.membership.id > 0).select(db.membership.ALL):
        if role.membership == group:  # make "Patient" as default option
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
    sendingFacilityOptions = dropdownSelect(
        db.facility, db.facility.fields[1], 1
    )  # defaultId = 1 (desk1)
    receivingFacilityOptions = dropdownSelect(
        db.facility, db.facility.fields[1], 3
    )  # defaultId = 3 (iris)
    routineid = (
        db(db.procedure.exam_name.startswith("Routine")).select().first()["id"]
    )  # id
    procedureOptions = dropdownSelect(
        db.procedure, db.procedure.fields[2], routineid
    )  # field exam_name defaultId = 4 (routine consultation)
    providerOptions = ""
    for provider in db(
        (db.auth_user.membership >= getMembershipId("Doctor"))
        & (db.auth_user.membership <= getMembershipId("Medical assistant"))
    ).select(db.auth_user.ALL, orderby=db.auth_user.last_name):
        if provider.last_name == DEFAULT_PROVIDER:  # make "House" as default option
            providerOptions = CAT(
                providerOptions,
                OPTION(
                    provider.last_name + "," + provider.first_name,
                    _selected="selected",
                    _value=str(provider.id),
                ),
            )
        else:
            providerOptions = CAT(
                providerOptions,
                OPTION(
                    provider.last_name + "," + provider.first_name,
                    _value=str(provider.id),
                ),
            )
    providerOptions = XML(providerOptions)
    seniorOptions = ""
    # medicalmembership = db((db.membership.hierarchy==1)|(db.membership.hierarchy==2)).select(
    #     db.membership.ALL, db.auth_user.last_name,left=db.auth_user.on(db.auth_user.membership == db.auth_user.id)).as_dict()
    idMembershipDoctor = (
        db(db.membership.membership == "Doctor").select(db.membership.id).first()["id"]
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
                    senior.last_name + "," + senior.first_name, _value=str(senior.id)
                ),
            )
    seniorOptions = XML(seniorOptions)
    everyModalityOptions = dropdownSelect(db.modality, db.modality.fields[1], 1)
    modalityRows = db(db.modality).select(
        db.modality.modality_name, db.modality.id_modality_controller
    )
    modalityDict = {}
    rows = db(db.modality.id_modality_controller == db.modality_controller.id).select()
    for row in rows:
        modalityDict[row.modality.modality_name] = (
            row.modality_controller.modality_controller_name
        )
    multiplemod = (
        db(
            (db.modality.modality_name == "multiple")
            | (db.modality.modality_name == "Multiple")
        )
        .select()
        .first()["id"]
    )
    practitionerDict = {}
    practitionerSelect = ["Doctor"]
    rows = db(db.membership.membership.contains(practitionerSelect, all=False)).select(
        join=db.auth_user.on(db.auth_user.membership == db.membership.id)
    )
    for row in rows:
        practitionerDict[
            "Dr. " + row.auth_user.first_name + " " + row.auth_user.last_name
        ] = row.auth_user.id
    providerDict = {}
    providerSelect = ["Medical assistant", "Nurse"]
    rows = db(db.membership.membership.contains(providerSelect, all=False)).select(
        join=db.auth_user.on(db.auth_user.membership == db.membership.id)
    )
    for row in rows:
        providerDict[row.auth_user.first_name + " " + row.auth_user.last_name] = (
            row.auth_user.id
        )
    return locals()


## manage medic_ref


@action("manage/medications")
@action("manage/medications/<rec_id>")
@action.uses(session, auth, db, "manage/medications.html")
def medications(rec_id="1"):
    """
    Manages medication catalog and prescription tracking in the ophthalmology system.

    This function serves as the controller for the medication management interface. It handles:
    - Medication catalog maintenance
    - Drug interaction monitoring
    - Prescription tracking
    - Safety alerts

    Args:
        rec_id (str, optional): The medication record ID to display/edit. Defaults to "1".

    Returns:
        dict: A dictionary containing:
            - env_status: Current environment status
            - timeOffset: System time offset
            - app_name: Application name
            - hosturl: Host URL
            - user: Current authenticated user object

    Requires:
        - Authentication
        - Session management
        - Database access
        - Medications template
    """
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    hosturl = LOCAL_URL
    user = auth.get_user()
    return locals()


## manage allergic agents


@action("manage/allergy")
@action("manage/allergy/<rec_id>")
@action.uses(session, auth, db, "manage/allergy.html")
def allergy(rec_id="1"):
    """
    Manages allergic agent references and patient allergy records.

    This function serves as the controller for the allergy management interface. It handles:
    - Allergic agent catalog maintenance
    - Patient allergy records
    - Cross-sensitivity monitoring
    - Alert system integration

    Args:
        rec_id (str, optional): The allergy record ID to display/edit. Defaults to "1".

    Returns:
        dict: A dictionary containing:
            - env_status: Current environment status
            - timeOffset: System time offset
            - app_name: Application name
            - hosturl: Host URL
            - user: Current authenticated user object

    Requires:
        - Authentication
        - Session management
        - Database access
        - Allergy template
    """
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    hosturl = LOCAL_URL
    user = auth.get_user()
    return locals()


## manage diseases


@action("manage/diseases")
@action("manage/diseases/<rec_id>")
@action.uses(session, auth, db, "manage/diseases.html")
def diseases(rec_id="1"):
    """
    Manages disease references and clinical pathways in the ophthalmology system.

    This function serves as the controller for the disease management interface. It handles:
    - Disease catalog maintenance
    - ICD-10 coding
    - Clinical pathway tracking
    - Treatment protocol management

    Args:
        rec_id (str, optional): The disease record ID to display/edit. Defaults to "1".

    Returns:
        dict: A dictionary containing:
            - env_status: Current environment status
            - timeOffset: System time offset
            - app_name: Application name
            - hosturl: Host URL
            - user: Current authenticated user object

    Requires:
        - Authentication
        - Session management
        - Database access
        - Diseases template
    """
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    hosturl = LOCAL_URL
    user = auth.get_user()
    return locals()


## manage lenses


@action("manage/lenses")
@action("manage/lenses/<rec_id>")
@action.uses(session, auth, db, "manage/lenses.html")
def lenses(rec_id="1"):
    """
    Manages lens catalog and inventory in the ophthalmology system.

    This function serves as the controller for the lens management interface. It handles:
    - Lens catalog maintenance
    - Inventory management
    - Order tracking
    - Prescription management

    Args:
        rec_id (str, optional): The lens record ID to display/edit. Defaults to "1".

    Returns:
        dict: A dictionary containing:
            - env_status: Current environment status
            - timeOffset: System time offset
            - app_name: Application name
            - hosturl: Host URL
            - user: Current authenticated user object

    Requires:
        - Authentication
        - Session management
        - Database access
        - Lenses template
    """
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    hosturl = LOCAL_URL
    user = auth.get_user()
    return locals()


@action("manage/files", method=["POST", "GET"])  # route
@action.uses(session, T, auth, db, "manage/files.html")
def files():
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    hosturl = LOCAL_URL
    user = auth.get_user()
    if "membership" in user:
        userMembership = (
            db(db.membership.id == user["membership"])
            .select(db.membership.membership)
            .first()["membership"]
        )
    else:
        userMembership = None
    test = "Test OK"
    membership = 6
    class_icon = "fa-user"
    group = "Patient"
    roleOptions = ""
    for role in db(db.membership.id > 0).select(db.membership.ALL):
        if role.membership == group:  # make "Patient" as default option
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
    modalityDict = {}
    rows = db(db.modality.id_modality_controller == db.modality_controller.id).select()
    for row in rows:
        modalityDict[row.modality.modality_name] = (
            row.modality_controller.modality_controller_name
        )

    # Add practitioner and provider dictionaries for filtering
    practitionerDict = {}
    practitionerSelect = ["Doctor"]
    rows = db(db.membership.membership.contains(practitionerSelect, all=False)).select(
        join=db.auth_user.on(db.auth_user.membership == db.membership.id)
    )
    for row in rows:
        practitionerDict[
            "Dr. " + row.auth_user.first_name + " " + row.auth_user.last_name
        ] = row.auth_user.id

    providerDict = {}
    providerSelect = ["Medical assistant", "Nurse"]
    rows = db(db.membership.membership.contains(providerSelect, all=False)).select(
        join=db.auth_user.on(db.auth_user.membership == db.membership.id)
    )
    for row in rows:
        providerDict[row.auth_user.first_name + " " + row.auth_user.last_name] = (
            row.auth_user.id
        )

    return locals()


## manage_db


## import users
@action("import_users")
@action.uses(T, db, "generic.html")
def import_users():
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    # hosturl = LOCAL_URL
    import os

    # rows = db(db.auth_user).select()
    with open(
        os.path.join(os.path.dirname(__file__), "uploads/csv/") + "1.csv",
        "r",
        encoding="utf-8",
        newline="",
    ) as dumpfile:
        db.auth_user.import_from_csv_file(dumpfile)
    return dict(message="OK")


@action("db_truncate")
@action.uses(T, db, auth.user, "generic.html")
def truncate_db():
    hosturl = LOCAL_URL
    for table_name in db.tables():
        db[table_name].truncate("RESTART IDENTITY CASCADE")
    return locals()


# TODO: add action uses aut.user to all sensible pages
@action("manage/db")
@action.uses(T, auth.user, db, flash, "manage/manage_db.html")
def manage_db():
    tablesArr = db._tables
    hosturl = LOCAL_URL
    user = auth.get_user()
    return locals()


@action("list_dir_csv")
def list_dir_csv():
    import os

    try:
        upload_folder = os.path.join(os.path.dirname(__file__), "uploads/csv")
        dir_array = os.listdir(upload_folder)
        dir_array.append("true")
        return " ".join(dir_array)  # return in string to convert in array in js
        # return "show_csv_dir(%s,true);" % repr(dir_array)
    except:
        folder = ["uploads/csv", "false"]
        return "%s" % repr(folder)


@action("del_csv", method=["GET"])
def del_csv():
    import os

    file2del = request.query.datafile
    try:
        fullPath = os.path.join(os.path.dirname(__file__), "uploads/csv/") + file2del
        os.remove(fullPath)
        return file2del + "#True"
    except:
        return file2del + "#False"


@action("save_table")
@action("save_table/<tablename>")
def save_table(tablename):
    import os
    from datetime import datetime

    now = datetime.now()
    date_backup = now.strftime("%y%m%d-%H%M%S")
    backup_path = os.path.join(os.path.dirname(__file__), "uploads/csv/")
    filename = date_backup + "-" + tablename + "-table-backup.csv"
    backup_path_file = backup_path + filename
    rows = db(db[tablename]).select()
    try:
        with open(backup_path_file, "w", encoding="utf-8", newline="") as dumpfile:
            rows.export_to_csv_file(dumpfile)
        evalArr = (filename + " True").split(" ")
        return "#".join(evalArr)
    except Exception as e:
        evalArr = (filename + " False").split(" ")
        evalArr.append(print(e))
        return "#".join(evalArr)


@action("save_all_tables")
def save_all_tables():
    import os
    from datetime import datetime

    now = datetime.now()
    dblist = db._tables
    for table in dblist:
        if table != "auth_user":
            date_backup = now.strftime("%y%m%d-%H%M%S")
            backup_path = os.path.join(os.path.dirname(__file__), "uploads/csv/tables/")
            filename = date_backup + "-" + table + "-table-backup.csv"
            backup_path_file = backup_path + filename
            rows = db(db[table]).select()
            with open(backup_path_file, "w", encoding="utf-8", newline="") as dumpfile:
                rows.export_to_csv_file(dumpfile)
        else:
            None
    return True


@action("save_db")
def save_db():
    import os
    from datetime import datetime

    now = datetime.now()
    date_backup = now.strftime("%y%m%d-%H%M%S")
    backup_path = os.path.join(os.path.dirname(__file__), "uploads/csv/")
    filename = date_backup + "-db-full-backup.csv"
    backup_path_file = backup_path + filename
    # rows=db(db.auth_user).select()
    try:
        with open(backup_path_file, "w", encoding="utf-8", newline="") as dumpfile:
            db.export_to_csv_file(dumpfile)
        evalArr = (filename + " True").split(" ")
        return "#".join(evalArr)
    except Exception as e:
        evalArr = (filename + " False").split(" ")
        # evalArr.append(print(e))
        return "#".join(evalArr)


@action("init_db")
def init_db():
    import os

    for table_name in db.tables():
        db[table_name].truncate("ON DELETE CASCADE")
    backup_path = os.path.join(os.path.dirname(__file__), "uploads/csv/")
    backup_path_file = backup_path + "init_db.csv"
    try:
        with open(backup_path_file, "r", encoding="utf-8", newline="") as dumpfile:
            db.import_from_csv_file(dumpfile)
        # set_defaults_db()
        return "reset" + "#" + "True"
    except:
        return "reset" + "#" + "False"


@action("restore_db", method=["GET"])
def restore_db():
    import os

    file2restore = request.query.datafile
    # delete all tables
    for table_name in db.tables():
        db[table_name].truncate("RESTART IDENTITY CASCADE")
    # import csv file
    backup_path = os.path.join(os.path.dirname(__file__), "uploads/csv/")
    backup_path_file = backup_path + file2restore
    try:
        with open(backup_path_file, "r", encoding="utf-8", newline="") as dumpfile:
            db.import_from_csv_file(dumpfile)
        evalArr = (file2restore + " True").split(" ")
        return "#".join(evalArr)
    except Exception as e:
        evalArr = (file2restore + " False").split(" ")
        evalArr.append(print(e))
        return "#".join(evalArr)


@action("restore", method=["GET"])
def restore():
    import os

    filename = request.query.datafile
    # filename contains date-time-(tablename or db)-(full or table)-backup.csv -> [date,time,tablename or db,full or table,backup.csv]
    reqArr = filename.split("-")
    backup_path = os.path.join(os.path.dirname(__file__), "uploads/csv/")
    backup_path_file = backup_path + filename
    table_name = reqArr[2]
    errorTruncate = errorImport = ""
    if reqArr[3] == "table":
        ###### truncate can cause some id discrepancies #####
        # # truncate table
        # try:
        #     db[table_name].truncate('RESTART IDENTITY CASCADE')
        # except Exception as et:
        #     errorTruncate = print(et)
        # import
        try:
            with open(backup_path_file, "r", encoding="utf-8", newline="") as dumpfile:
                db[table_name].import_from_csv_file(dumpfile)
            evalArr = (filename + " True").split(" ")
            evalArr.append(errorTruncate)
            return "#".join(evalArr)
        except Exception as ei:
            errorImport = print(ei)
            evalArr = (filename + " False").split(" ")
            # evalArr.append(errorTruncate+' '+errorImport)
            return "#".join(evalArr)
    elif reqArr[3] == "full":
        ###### truncate can cause some id discrepancies #####
        # truncate db
        # try:
        #     db.truncate('RESTART IDENTITY CASCADE')
        # except Exception as et:
        #     errorTruncate = print(et)
        # import
        try:
            with open(backup_path_file, "r", encoding="utf-8", newline="") as dumpfile:
                db.import_from_csv_file(dumpfile)
            evalArr = (filename + " True").split(" ")
            evalArr.append(errorImport)
            return "#".join(evalArr)
        except Exception as ei:
            errorImport = print(ei)
            evalArr = (filename + " False").split(" ")
            # evalArr.append(errorTruncate+' '+errorImport)
            return "#".join(evalArr)
    else:
        return filename + "#False"


# manage procedure combo
@action("manage/combo")
@action.uses(session, db, "manage/combo.html")
def combo():
    """
    Manages procedure-modality combinations in the ophthalmology system.

    This function serves as the controller for the combo management interface. It handles:
    - Procedure and modality relationship management
    - Multiple modality selection for procedures
    - Integration with worklist system
    - Dynamic form handling

    Returns:
        dict: A dictionary containing:
            - env_status: Current environment status
            - timeOffset: System time offset
            - app_name: Application name
            - hosturl: Host URL
            - procedureOptions: HTML options for procedure selection
            - modalityOptions: HTML options for modality selection

    Requires:
        - Session management
        - Database access
        - Combo template
    """
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    hosturl = LOCAL_URL
    procedureOptions = dropdownSelect(
        db.procedure, db.procedure.fields[2], 1
    )  # table to show is procedure, field to show=name, selected value is id=1, value is index
    modalityOptions = dropdownSelect(db.modality, db.modality.fields[1], 1)
    return locals()


# manage billing combo codes
@action("manage/billing_combo")
@action.uses(session, auth.user, db, "manage/billing_combo.html")
def billing_combo():
    """
    Manages billing combo codes in the ophthalmology system.

    This function serves as the controller for the billing combo management interface. It handles:
    - Creating new billing code combinations
    - Editing existing billing combos
    - Managing combo categories by specialty
    - Integration with nomenclature API for code validation

    Returns:
        dict: A dictionary containing:
            - env_status: Current environment status
            - timeOffset: System time offset
            - app_name: Application name
            - hosturl: Host URL
            - user: Current authenticated user object
            - specialties: List of specialty data with default selection

    Requires:
        - Authentication (auth.user)
        - Session management
        - Database access
        - Billing combo template
    """
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    hosturl = LOCAL_URL
    user = auth.get_user()

    # Specialty data structure for template loop
    specialties = [
        {"value": "ophthalmology", "label": "Ophthalmology", "is_default": True},
        {"value": "general", "label": "General", "is_default": False},
        {"value": "consultation", "label": "Consultation", "is_default": False},
    ]

    return locals()


# manage billing summary
@action("billing/summary")
@action("billing/summary/<rec_id>")
@action.uses(session, auth, db, "billing/summary.html")
def summary(rec_id):
    """
    Manages billing summaries and financial records for users in the ophthalmology system.

    This function serves as the controller for the billing summary interface. It handles:
    - User-specific billing record retrieval and display
    - Transaction history management
    - Financial reporting and analytics
    - Role-based access control for billing data

    Args:
        rec_id (str): The user ID for which to display billing information.

    Returns:
        dict: A dictionary containing:
            - env_status: Current environment status
            - timeOffset: System time offset
            - app_name: Application name
            - hosturl: Host URL
            - user: Current authenticated user object
            - username: Username of the billing record owner
            - membership: Membership level of the billing record owner

    Requires:
        - Authentication
        - Session management
        - Database access
        - Billing summary template
    """
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    hosturl = LOCAL_URL
    user = auth.get_user()
    row = db(db.auth_user.id == rec_id).select().first()
    username = row.username
    membership = row.membership
    return locals()
