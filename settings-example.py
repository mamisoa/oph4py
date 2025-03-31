"""
This is an optional file that defined app level settings such as:
- database settings
- session settings
- i18n settings
This file is provided as an example:
"""

NEW_INSTALLATION = False
# ENV_STATUS='TEST' otherwise ''
ENV_STATUS = ""

import os
from datetime import datetime

# timeoffset
import pytz
from py4web.core import required_folder


def get_timeoffset() -> int:
    """
    Get the current time offset for Brussels in hours from UTC.
    Handles daylight saving time automatically.

    Returns:
        int: The time offset in hours from UTC (positive for ahead, negative for behind).
              For example, +1 for CET (winter), +2 for CEST (summer).

    Raises:
        pytz.exceptions.UnknownTimeZoneError: If 'Europe/Brussels' timezone is not recognized.
    """
    try:
        # Create timezone objects
        brussels_tz = pytz.timezone("Europe/Brussels")
        utc_tz = pytz.UTC

        # Get current time with proper timezone info
        now = datetime.now(utc_tz)

        # Convert UTC time to Brussels time
        brussels_time = now.astimezone(brussels_tz)

        # Calculate the offset in hours - verify not None before calling total_seconds()
        utc_offset = brussels_time.utcoffset()
        if utc_offset is None:
            raise ValueError("Failed to get UTC offset, result was None")

        offset_seconds = utc_offset.total_seconds()
        offset_hours = int(offset_seconds // 3600)

        return offset_hours
    except Exception as e:
        # Fallback to default offset values if any error occurs
        import traceback

        print(f"Error calculating time offset: {str(e)}")
        print(traceback.format_exc())

        # Default to standard CET/CEST based on current month
        current_month = datetime.now().month
        # Summer time (CEST) from March to October
        if 3 <= current_month <= 10:
            return 2  # CEST
        else:
            return 1  # CET


# Set the time offset for the application
TIMEOFFSET = get_timeoffset()

# TIMEOFFSET = 1 # winter
# TIMEOFFSET = 2 # summer

# db settings
APP_FOLDER = os.path.dirname(__file__)
APP_NAME = os.path.split(APP_FOLDER)[-1]
# DB_FOLDER:    Sets the place where migration files will be created
#               and is the store location for SQLite databases
DB_FOLDER = required_folder(APP_FOLDER, "databases")

DB_URI = "your_db_connexion"
DB_POOL_SIZE = 8

# DB MIGRATION
FAKE_MIGRATE = False
if FAKE_MIGRATE is False:
    DB_MIGRATE = True
    DB_FAKE_MIGRATE = False  # maybe?
else:
    # if server is moved
    DB_MIGRATE = True
    DB_FAKE_MIGRATE = True

# location where static files are stored:
STATIC_FOLDER = required_folder(APP_FOLDER, "static")

# location where to store uploaded files:
UPLOAD_FOLDER = required_folder(APP_FOLDER, "uploads")
##
ASSETS_FOLDER = "/home/www-data/py4web/apps/" + APP_NAME + "/static/"

## MACHINES
MACHINES_FOLDER = "/oph4py/machines"
# VISIONIX
L80_FOLDER = "/oph4py/machines/l80/working_dir21/ClientDB"
VX100_FOLDER = "/oph4py/machines/vx100/ClientDB"
VX100_XML_FOLDER = "/xml"
# CV5000
LM_FOLDER = "/oph4py/machines/cv5000/lm"
RM_FOLDER = "/oph4py/machines/cv5000/rm"
TOPCON_DICT = {
    "default": "/cv-cornea",
    "cv-iris": "/cv-iris",
    "cv-cornea": "/cv-cornea",
    "cv-crist": "/cv-crist",
}
TOPCON_XML = required_folder(APP_FOLDER, "topcon/xml")

# EYESUITE
EYESUITE_FOLDER = "/oph4py/machines/eyesuite/"
EYESUITE_RESULTS_FOLDER = "/oph4py/machines/eyesuite/octopus/exports/"

## DATA
PATIENTS_FOLDER = "/oph4py/data/patients"

# send email on regstration
VERIFY_EMAIL = False

# account requires to be approved ?
REQUIRES_APPROVAL = False

# ALLOWED_ACTIONS:
# ["all"]
# ["login", "logout", "request_reset_password", "reset_password", "change_password", "change_email", "update_profile"]
# if you add "login", add also "logout"
ALLOWED_ACTIONS = ["all"]

# email settings
SMTP_SSL = False
SMTP_SERVER = "smtp.gmail.com:587"
SMTP_SENDER = "youremail"
SMTP_LOGIN = "yourlogin"
SMTP_TLS = True
COMPANY_LOGO = "yourlogo"


# session settings
SESSION_TYPE = "cookies"
SESSION_SECRET_KEY = ""  # replace this with a uuid
MEMCACHE_CLIENTS = ["127.0.0.1:11211"]
REDIS_SERVER = "localhost:6379"

# logger settings
LOGGERS = [
    "debug:stdout",  # debug messages to stdout
    "info:stdout",  # info messages to stdout
    "warning:stdout",  # warning messages to stdout
    "error:stderr",  # error messages to stderr
    "debug:debug.log",  # debug messages to debug.log file
]

# single sign on Google (will be used if provided)
OAUTH2GOOGLE_CLIENT_ID = None
OAUTH2GOOGLE_CLIENT_SECRET = None

# single sign on Okta (will be used if provided. Please also add your tenant
# name to py4web/utils/auth_plugins/oauth2okta.py. You can replace the XXX
# instances with your tenant name.)
OAUTH2OKTA_CLIENT_ID = None
OAUTH2OKTA_CLIENT_SECRET = None

# single sign on Google (will be used if provided)
OAUTH2FACEBOOK_CLIENT_ID = None
OAUTH2FACEBOOK_CLIENT_SECRET = None

# enable PAM
USE_PAM = False

# enable LDAP
USE_LDAP = False
LDAP_SETTINGS = {
    "mode": "ad",
    "server": "my.domain.controller",
    "base_dn": "ou=Users,dc=domain,dc=com",
}

# i18n settings
T_FOLDER = required_folder(APP_FOLDER, "translations")

# Celery settings
USE_CELERY = False
CELERY_BROKER = "redis://localhost:6379/0"

# try import private settings
try:
    from .settings_private import *
except (ImportError, ModuleNotFoundError):
    pass

LOCAL_URL = "https://yourdomain.com"
LOCAL_BEID = "https://yourdomain.com/beid/api/eid2"

# defaults members
DEFAULT_PROVIDER = ""
DEFAULT_SENIOR = ""

# external db
DB_OCTOPUS = "dbconnexion"
DBO_FOLDER = required_folder(APP_FOLDER, "databases/octopus")

# PACS
PACS = True
AET = {"MWL": "WORKLIST", "PACS": "DCM4CHEE"}
PACS_URL = "http://your.pacs.server:8080/dcm4chee-arc"
REALMS_URL = "https://your.pacs.server:8843"
KEYCLOAK_SECRET = "your_keycloak_secret"

# Supplements
SUPPLEMENT_RATIO = 1.50
