"""
This is an optional file that defined app level settings such as:
- database settings
- session settings
- i18n settings
This file is provided as an example:
"""
NEW_INSTALLATION = False
# ENV_STATUS='TEST' otherwise ''
ENV_STATUS=''
import os
from py4web.core import required_folder

# timeoffset
import pytz
from datetime import datetime

def get_timeoffset():
    """
    Get the current time offset for Brussels in hours from UTC.
    Handles daylight saving time automatically.

    Returns:
        int: The time offset in hours.
    """
    brussels = pytz.timezone('Europe/Brussels')
    utc_now = datetime.now(pytz.utc)
    brussels_now = utc_now.astimezone(brussels)
    offset = brussels_now.utcoffset().total_seconds() // 3600
    return offset

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

DB_MIGRATE = True
DB_FAKE_MIGRATE = False  # maybe?

# if server is moved
#DB_MIGRATE = True
#DB_FAKE_MIGRATE = True

# location where static files are stored:
STATIC_FOLDER = required_folder(APP_FOLDER, "static")

# location where to store uploaded files:
UPLOAD_FOLDER = required_folder(APP_FOLDER, "uploads")
##
ASSETS_FOLDER = '/home/www-data/py4web/apps/'+APP_NAME+'/static/'

## MACHINES
MACHINES_FOLDER = '/oph4py/machines'
# VISIONIX
L80_FOLDER = '/oph4py/machines/l80/working_dir21/ClientDB'
VX100_FOLDER = '/oph4py/machines/vx100/ClientDB'
VX100_XML_FOLDER = '/xml'
# CV5000
LM_FOLDER = '/oph4py/machines/cv5000/lm'
RM_FOLDER = '/oph4py/machines/cv5000/rm'
TOPCON_DICT = { 'default' : '/cv-cornea', 'cv-iris' : '/cv-iris', 'cv-cornea' : '/cv-cornea', 'cv-crist' : '/cv-crist'  }
TOPCON_XML = required_folder(APP_FOLDER, "topcon/xml")

# EYESUITE
EYESUITE_FOLDER = '/oph4py/machines/eyesuite/'
EYESUITE_RESULTS_FOLDER = '/oph4py/machines/eyesuite/octopus/exports/'

## DATA
PATIENTS_FOLDER = '/oph4py/data/patients'

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
SESSION_SECRET_KEY = "" # replace this with a uuid
MEMCACHE_CLIENTS = ["127.0.0.1:11211"]
REDIS_SERVER = "localhost:6379"

# logger settings
LOGGERS = [
    "warning:stdout"
]  # syntax "severity:filename" filename can be stderr or stdout

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
LOCAL_BEID = 'https://yourdomain.com/beid/api/eid2'

# defaults members
DEFAULT_PROVIDER = ""
DEFAULT_SENIOR = ""

# external db
DB_OCTOPUS= "dbconnexion"
DBO_FOLDER= required_folder(APP_FOLDER, "databases/octopus")

# PACS
PACS = True
AET = {
    'MWL' : "WORKLIST",
    'PACS': "DCM4CHEE"
}
PACS_URL= "http://dcm4chee.org/dcm4chee-arc"
REALMS_URL="https://dcm4chee.org:8843"
KEYCLOAK_SECRET=""